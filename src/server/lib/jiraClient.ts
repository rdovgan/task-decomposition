export interface JiraCredentials {
  siteUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
}

export interface CreateJiraIssueInput {
  projectKey: string;
  issueTypeName: string;
  summary: string;
  description?: string;
  priorityName?: string;
  parentKey?: string;
}

export interface CreateJiraIssueResult {
  key: string;
  url: string;
}

export class JiraApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "JiraApiError";
  }
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, "");
}

function authHeader(email: string, apiToken: string): string {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
}

async function jiraFetch(
  { siteUrl, email, apiToken }: JiraCredentials,
  path: string,
  init: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${normalizeSiteUrl(siteUrl)}/rest/api/3${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(email, apiToken),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = `Jira request failed with status ${response.status}`;
    try {
      const body = await response.json();
      const messages = body.errorMessages?.join(", ");
      const fieldErrors = body.errors ? Object.values(body.errors).join(", ") : undefined;
      message = messages || fieldErrors || message;
    } catch {
      // Response body wasn't JSON; fall back to the generic message
    }
    throw new JiraApiError(message, response.status);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function verifyCredentials(credentials: JiraCredentials): Promise<void> {
  await jiraFetch(credentials, "/myself");
}

export async function listProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
  const data = await jiraFetch(credentials, "/project/search?maxResults=50");
  return (data.values || []).map((p: any) => ({ id: p.id, key: p.key, name: p.name }));
}

export async function listIssueTypes(
  credentials: JiraCredentials,
  projectKey: string
): Promise<JiraIssueType[]> {
  const data = await jiraFetch(
    credentials,
    `/issue/createmeta?projectKeys=${encodeURIComponent(projectKey)}&expand=projects.issuetypes`
  );
  const project = data.projects?.[0];
  const issueTypes = project?.issuetypes || [];
  return issueTypes
    .filter((it: any) => !it.subtask)
    .map((it: any) => ({ id: it.id, name: it.name }));
}

const PRIORITY_MAP: Record<string, string> = {
  CRITICAL: "Highest",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Converts plain text into Atlassian Document Format, preserving blank-line-separated
// paragraphs and single line breaks (raw "\n" inside a single ADF text node is not
// rendered as a line break by Jira, so it must be modeled explicitly).
function textToADF(text: string) {
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0);

  return {
    type: "doc",
    version: 1,
    content: paragraphs.map(paragraph => {
      const lines = paragraph.split("\n");
      const content: any[] = [];
      lines.forEach((line, i) => {
        if (i > 0) content.push({ type: "hardBreak" });
        if (line) content.push({ type: "text", text: line });
      });
      return { type: "paragraph", content };
    }),
  };
}

export async function createIssue(
  credentials: JiraCredentials,
  input: CreateJiraIssueInput
): Promise<CreateJiraIssueResult> {
  const buildBody = (includePriority: boolean) => ({
    fields: {
      project: { key: input.projectKey },
      issuetype: { name: input.issueTypeName },
      summary: input.summary,
      ...(input.description && { description: textToADF(input.description) }),
      ...(includePriority && input.priorityName && { priority: { name: input.priorityName } }),
      ...(input.parentKey && { parent: { key: input.parentKey } }),
    },
  });

  let data: any;
  try {
    data = await jiraFetch(credentials, "/issue", {
      method: "POST",
      body: JSON.stringify(buildBody(true)),
    });
  } catch (err) {
    // Some Jira sites use a different priority scheme; retry once without it.
    if (err instanceof JiraApiError && input.priorityName) {
      data = await jiraFetch(credentials, "/issue", {
        method: "POST",
        body: JSON.stringify(buildBody(false)),
      });
    } else {
      throw err;
    }
  }

  return {
    key: data.key,
    url: `${normalizeSiteUrl(credentials.siteUrl)}/browse/${data.key}`,
  };
}

export function priorityNameFor(priority: string): string | undefined {
  return PRIORITY_MAP[priority];
}
