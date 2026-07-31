import { Router } from "express";
import * as jiraController from "../controllers/jiraController";
import { validate } from "../middleware/validation";
import { jiraConnectionSchema, createJiraIssuesSchema } from "../lib/validations";

const router = Router();

// Connection management (all routes require userId parameter)
router.get("/:userId", jiraController.getJiraConnection);
router.put("/:userId", validate(jiraConnectionSchema), jiraController.updateJiraConnection);
router.delete("/:userId", jiraController.deleteJiraConnection);

// Metadata lookups for the "send to Jira" UI
router.get("/:userId/projects", jiraController.listJiraProjects);
router.get("/:userId/projects/:projectKey/issue-types", jiraController.listJiraIssueTypes);

// Bulk issue creation
router.post("/:userId/issues", validate(createJiraIssuesSchema), jiraController.createJiraIssues);

export default router;
