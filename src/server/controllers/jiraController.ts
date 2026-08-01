import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { encrypt, decrypt } from "../lib/encryption";
import { str } from "../lib/express";
import * as jiraClient from "../lib/jiraClient";
import { JiraApiError, JiraCredentials } from "../lib/jiraClient";

async function getCredentialsOrThrow(userId: string): Promise<JiraCredentials> {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings?.jiraSiteUrl || !settings.jiraEmail || !settings.jiraApiToken) {
    throw new ApiError(400, "Jira is not connected. Add your Jira credentials in Settings first.");
  }

  return {
    siteUrl: settings.jiraSiteUrl,
    email: settings.jiraEmail,
    apiToken: decrypt(settings.jiraApiToken),
  };
}

/**
 * Get Jira connection status
 */
export const getJiraConnection = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const settings = await prisma.userSettings.findUnique({ where: { userId } });

  res.json({
    data: {
      connected: !!(settings?.jiraSiteUrl && settings?.jiraEmail && settings?.jiraApiToken),
      siteUrl: settings?.jiraSiteUrl ?? null,
      email: settings?.jiraEmail ?? null,
    },
  });
});

/**
 * Save (and validate) Jira connection credentials
 */
export const updateJiraConnection = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { siteUrl, email, apiToken } = req.body;

  try {
    await jiraClient.verifyCredentials({ siteUrl, email, apiToken });
  } catch (error) {
    if (error instanceof JiraApiError) {
      throw new ApiError(error.statusCode === 401 || error.statusCode === 403 ? 401 : 400, error.message);
    }
    throw new ApiError(400, "Could not connect to Jira with the provided credentials");
  }

  const encryptedToken = encrypt(apiToken);

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, jiraSiteUrl: siteUrl, jiraEmail: email, jiraApiToken: encryptedToken },
    update: { jiraSiteUrl: siteUrl, jiraEmail: email, jiraApiToken: encryptedToken },
  });

  res.json({
    data: {
      connected: true,
      siteUrl: settings.jiraSiteUrl,
      email: settings.jiraEmail,
    },
  });
});

/**
 * Remove Jira connection
 */
export const deleteJiraConnection = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  await prisma.userSettings.update({
    where: { userId },
    data: { jiraSiteUrl: null, jiraEmail: null, jiraApiToken: null },
  });

  res.status(204).send();
});

/**
 * List Jira projects visible to the connected account
 */
export const listJiraProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const credentials = await getCredentialsOrThrow(userId);

  try {
    const projects = await jiraClient.listProjects(credentials);
    res.json({ data: projects });
  } catch (error) {
    if (error instanceof JiraApiError) throw new ApiError(error.statusCode, error.message);
    throw error;
  }
});

/**
 * List issue types available for a Jira project
 */
export const listJiraIssueTypes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const projectKey = str(req.params.projectKey)!;
  const credentials = await getCredentialsOrThrow(userId);

  try {
    const issueTypes = await jiraClient.listIssueTypes(credentials, projectKey);
    res.json({ data: issueTypes });
  } catch (error) {
    if (error instanceof JiraApiError) throw new ApiError(error.statusCode, error.message);
    throw error;
  }
});

/**
 * Bulk-create Jira issues from decomposed tasks, grouped under a wrapping
 * Epic. Creates the Epic first (using the description supplied for the
 * decomposition), then creates each task as a child issue linked to it via
 * the `parent` field. When a task carries a `taskId` (i.e. it already
 * exists in this app), also link the created issue back to it via a
 * TaskLink so it shows up in the task's link list.
 *
 * If the Epic can't be created (e.g. the project doesn't support epics),
 * tasks are still created, just without the parent link, and the epic
 * failure is surfaced so the UI can warn the user.
 */
export const createJiraIssues = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { projectKey, issueTypeName, epicTitle, epicDescription, tasks } = req.body;
  const credentials = await getCredentialsOrThrow(userId);

  let epicResult: { success: boolean; issueKey?: string; issueUrl?: string; error?: string };
  try {
    const epic = await jiraClient.createIssue(credentials, {
      projectKey,
      issueTypeName: "Epic",
      summary: epicTitle,
      description: epicDescription,
    });
    epicResult = { success: true, issueKey: epic.key, issueUrl: epic.url };
  } catch (error) {
    epicResult = {
      success: false,
      error: error instanceof JiraApiError ? error.message : "Failed to create epic",
    };
  }

  const results = await Promise.all(
    tasks.map(async (task: any) => {
      try {
        const description = task.storyPoints
          ? `${task.description || ""}\n\nStory points: ${task.storyPoints}`.trim()
          : task.description;

        const issue = await jiraClient.createIssue(credentials, {
          projectKey,
          issueTypeName,
          summary: task.title,
          description,
          priorityName: task.priority ? jiraClient.priorityNameFor(task.priority) : undefined,
          parentKey: epicResult.success ? epicResult.issueKey : undefined,
        });

        if (task.taskId) {
          await prisma.taskLink.create({
            data: {
              taskId: task.taskId,
              linkType: "JIRA",
              url: issue.url,
              title: issue.key,
            },
          });
        }

        return {
          taskId: task.taskId,
          title: task.title,
          success: true,
          issueKey: issue.key,
          issueUrl: issue.url,
        };
      } catch (error) {
        return {
          taskId: task.taskId,
          title: task.title,
          success: false,
          error: error instanceof JiraApiError ? error.message : "Failed to create Jira issue",
        };
      }
    })
  );

  res.json({ data: { epic: epicResult, tasks: results } });
});
