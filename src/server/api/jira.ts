import { Router } from "express";
import * as jiraController from "../controllers/jiraController";
import { validate } from "../middleware/validation";
import { jiraConnectionSchema, createJiraIssuesSchema } from "../lib/validations";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

// Connection management
router.get("/", jiraController.getJiraConnection);
router.put("/", validate(jiraConnectionSchema), jiraController.updateJiraConnection);
router.delete("/", jiraController.deleteJiraConnection);

// Metadata lookups for the "send to Jira" UI
router.get("/projects", jiraController.listJiraProjects);
router.get("/projects/:projectKey/issue-types", jiraController.listJiraIssueTypes);

// Bulk issue creation
router.post("/issues", validate(createJiraIssuesSchema), jiraController.createJiraIssues);

export default router;
