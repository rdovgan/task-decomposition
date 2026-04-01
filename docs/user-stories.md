# User Stories - Task Decomposition Tool

## Task CRUD Operations

### US-TASK-001: Create Task from Epic
**As a** Project Manager,
**I want** to create a new task directly from an Epic detail page,
**So that** I can quickly add work items without navigating away.

**Acceptance Criteria**:
- Given I am viewing an Epic detail page
- When I click "Add Task" button
- Then a modal form appears with fields: title, description, assignee, priority, story points, estimated hours, start date, due date
- And title field is auto-focused
- When I fill required fields and click "Create"
- Then the task is created and added to the Epic's task list
- And the modal closes
- And a success notification appears

---

### US-TASK-002: Edit Task Details
**As a** Developer,
**I want** to edit task details to update requirements or estimates,
**So that** the task reflects accurate information.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click "Edit" button
- Then the task form opens pre-populated with current values
- And I can modify any field except ID and creation timestamps
- When I click "Save"
- Then the task is updated
- And the "updatedAt" timestamp changes
- And a success notification appears

---

### US-TASK-003: Delete Task with Confirmation
**As a** Project Manager,
**I want** to delete a task that is no longer needed,
**So that** the task list stays clean and focused.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click "Delete" button
- Then a confirmation modal appears asking "Are you sure you want to delete this task?"
- And the modal shows the task title
- When I confirm deletion
- Then the task is deleted
- And I am redirected to the Epic detail page
- And the task no longer appears in the task list

**Edge Case**: If task has dependent tasks, show error: "Cannot delete task with 3 dependent tasks. Delete dependents first."

---

### US-TASK-004: Bulk Create Tasks from AI Breakdown
**As a** Project Manager,
**I want** to create multiple tasks from AI suggestions with one click,
**So that** I can quickly populate an Epic with tasks.

**Acceptance Criteria**:
- Given I am viewing an Epic detail page
- When I click "Break down with AI" button
- Then AI generates 3-8 task suggestions (as drafts)
- And I can edit, remove, or reorder suggestions
- When I click "Create All Tasks"
- Then all draft tasks are created as real tasks
- And the task list updates with all new tasks
- And a success notification appears: "Created 6 tasks"

---

### US-TASK-005: Duplicate Task for Template
**As a** Project Manager,
**I want** to duplicate an existing task,
**So that** I can quickly create similar tasks without re-entering data.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click "Duplicate" button
- Then a new task is created with:
  - Same title (prefixed with "Copy of ")
  - Same description
  - Same priority, story points, estimated hours
  - No assignee (cleared)
  - Status: TODO
- And I am redirected to the new task detail page
- And I can edit the duplicated task

---

## Dependency Management

### US-DEP-001: Link Tasks as Dependent
**As a** Tech Lead,
**I want** to link tasks to show dependencies,
**So that** the team understands task relationships.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click "Add Dependency" button
- Then a search modal appears to find tasks
- When I select a task and dependency type (BLOCKS, RELATED_TO, DUPLICATES)
- Then the dependency link is created
- And the task detail page shows:
  - "Blocking: Task A (blocks this task)"
  - "Blocked by: Task B, Task C (this task blocks them)"

---

### US-DEP-002: View Dependency Graph
**As a** Project Manager,
**I want** to visualize task dependencies as a graph,
**So that** I can identify the critical path and potential bottlenecks.

**Acceptance Criteria**:
- Given I am viewing an Epic detail page
- When I click "Dependency Graph" tab
- Then a graph visualization shows:
  - Tasks as nodes (labeled with title)
  - Dependencies as arrows (BLOCKS: solid, RELATED_TO: dashed)
  - Critical path highlighted in red
  - Task status color-coded (TODO: gray, IN_PROGRESS: blue, DONE: green, BLOCKED: red)
- When I hover over a node
- Then the node expands to show task details
- When I click a node
- Then I am redirected to that task's detail page

---

### US-DEP-003: Receive Notification When Unblocked
**As a** Developer,
**I want** to be notified when a blocking task is completed,
**So that** I can start working on my task immediately.

**Acceptance Criteria**:
- Given my task is blocked by Task A
- When Task A status changes to DONE
- Then I receive an in-app notification: "Task 'Implement auth' is complete. Your task 'Build login UI' is now unblocked."
- And the notification includes a link to my task
- And my task's "BLOCKED" status remains (I must change it manually)
- When I click the notification
- Then I am redirected to my task detail page

---

## Comments and Collaboration

### US-COMM-001: Add Comment to Task
**As a** Developer,
**I want** to add a comment to ask a question or provide an update,
**So that** the team can collaborate within the task context.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I type in the comment textarea and click "Post"
- Then the comment appears in the comment thread (newest first)
- And the comment shows:
  - My name and avatar
  - The comment content (markdown-rendered)
  - Timestamp: "Just now"
- And the textarea clears for next comment
- And the task assignee receives a notification (if I am not the assignee)

---

### US-COMM-002: Edit Own Comment
**As a** QA Engineer,
**I want** to edit my comment to fix typos or add information,
**So that** the comment thread remains accurate.

**Acceptance Criteria**:
- Given I posted a comment on a task
- When I click the "Edit" button on my comment (within 24 hours)
- Then the comment content becomes editable in the textarea
- And the original markdown is loaded (not rendered)
- When I modify the content and click "Save"
- Then the comment is updated
- And an "edited" indicator appears next to the timestamp
- And the timestamp updates to "edited 2 minutes ago"

---

### US-COMM-003: @Mention Team Member in Comment
**As a** Project Manager,
**I want** to @mention a team member in a comment,
**So that** they receive a notification and can respond.

**Acceptance Criteria**:
- Given I am typing a comment
- When I type "@" followed by a team member's name
- Then an autocomplete dropdown shows matching users
- When I select a user from the dropdown
- Then the @mention is inserted (e.g., "@alex")
- And the mention is highlighted in blue when rendered
- When I post the comment
- Then the mentioned user receives a notification: "Sarah mentioned you in task 'Build login UI'"
- And the notification includes a link to the comment

---

## AI Task Decomposition

### US-AI-001: Generate AI Task Breakdown
**As a** Project Manager,
**I want** to use AI to automatically break down an Epic into tasks,
**So that** I can save time and ensure comprehensive coverage.

**Acceptance Criteria**:
- Given I am viewing an Epic detail page
- When I click "Break down with AI" button
- Then a loading spinner appears: "AI is analyzing your Epic..."
- And the Epic title and description are sent to the AI API
- When the AI response is received (within 5 seconds)
- Then 3-8 suggested tasks appear as a list
- And each suggestion shows:
  - Title
  - Description (if provided)
  - Estimated hours
  - Story points
- And all suggestions are in "draft" mode (not yet saved)
- And I can edit, remove, or reorder suggestions
- And a "Create All Tasks" button is available

**Error Handling**: If AI API fails, show error: "AI breakdown failed. Please try again or create tasks manually." with a "Retry" button.

---

### US-AI-002: Edit and Adjust AI Suggestions
**As a** Tech Lead,
**I want** to edit AI-suggested tasks before saving them,
**So that** I can correct inaccuracies and add technical context.

**Acceptance Criteria**:
- Given AI has suggested tasks for an Epic
- When I click "Edit" on a suggested task
- Then the task fields become editable inline
- And I can modify: title, description, estimated hours, story points
- When I click "Remove" on a suggested task
- Then the task is removed from the suggestions list
- When I click "Add Manual Task"
- Then a blank task form appears in the suggestions list
- When I drag tasks to reorder them
- Then the task order updates visually
- When I click "Create All Tasks"
- Then all remaining suggestions are created as real tasks

---

## Filtering and Search

### US-FILTER-001: Filter Tasks by Status
**As a** Developer,
**I want** to filter my assigned tasks by status,
**So that** I can focus on tasks I need to work on.

**Acceptance Criteria**:
- Given I am viewing my task dashboard
- When I click the "Status" filter dropdown
- Then a multi-select list appears: TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED
- When I select "IN_PROGRESS" and "BLOCKED"
- Then the task list shows only tasks with those statuses
- And a filter badge appears: "Status: IN_PROGRESS, BLOCKED (3 tasks)"
- When I click the "X" on the filter badge
- Then the status filter is cleared
- And all tasks are shown again

---

### US-FILTER-002: Search Tasks by Keyword
**As a** Project Manager,
**I want** to search for tasks by keyword,
**So that** I can quickly find specific tasks across the project.

**Acceptance Criteria**:
- Given I am viewing the task list page
- When I type "authentication" in the search bar
- Then the task list updates (after 300ms debounce) to show matching tasks
- And tasks are ranked by relevance:
  - Title matches first
  - Description matches second
  - Comment matches third
- And the search term is highlighted in results
- And a "Clear search" button appears in the search bar
- When I click "Clear search"
- Then the full task list is restored

---

## Time Tracking and Status Updates

### US-TIME-001: Log Time on Task
**As a** Developer,
**I want** to log actual hours spent on a task,
**So that** we can improve future estimates.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click "Log Time" button
- Then a form appears with:
  - "Hours spent" input (decimal, max 999)
  - "Date" picker (defaults to today)
  - "Notes" textarea (optional)
- When I enter "2.5" hours and click "Save"
- Then the actual hours are added to the task
- And the task's "actualHours" field updates
- And a time log entry appears on the task: "Alex logged 2.5h on 2026-04-01"
- And the task's "remaining hours" are calculated (estimated - actual)

---

### US-TIME-002: Update Task Status
**As a** Developer,
**I want** to change task status as I progress through work,
**So that** the team knows the current state of the task.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click the status dropdown
- Then a list of valid status transitions appears:
  - Current: TODO → Available: IN_PROGRESS, CANCELLED
  - Current: IN_PROGRESS → Available: IN_REVIEW, BLOCKED
  - Current: IN_REVIEW → Available: DONE, IN_PROGRESS
  - Current: BLOCKED → Available: IN_PROGRESS
- When I select "IN_PROGRESS"
- Then the task status changes
- And the "updatedAt" timestamp updates
- And a status update appears in the comment thread: "Alex changed status from TODO to IN_PROGRESS"
- And the task assignee receives a notification (if I am not the assignee)

---

## Task Assignment and Notifications

### US-ASSIGN-001: Assign Task to Team Member
**As a** Project Manager,
**I want** to assign a task to a team member,
**So that** they know they are responsible for it.

**Acceptance Criteria**:
- Given I am viewing a task detail page
- When I click the "Assignee" field
- Then a dropdown of all users appears
- When I select a user
- Then the task is assigned to that user
- And the assigned user receives a notification: "Sarah assigned you to task 'Build login UI'"
- And the notification includes a link to the task
- And the task's "assignee" field shows the user's name and avatar

---

### US-ASSIGN-002: Receive Notification for Task Assignment
**As a** Developer,
**I want** to receive a notification when a task is assigned to me,
**So that** I can review and start working on it.

**Acceptance Criteria**:
- Given a task is assigned to me
- When I am logged in
- Then I receive an in-app notification: "Sarah assigned you to task 'Build login UI'"
- And the notification shows:
  - Task title
  - Epic name (parent)
  - Priority
  - "View Task" button
- When I click "View Task"
- Then I am redirected to the task detail page
- And the notification is marked as read
- And the task appears in my "Assigned to Me" dashboard

---

## Summary

**Total User Stories**: 16

**Coverage by Feature Area**:
- Task CRUD operations: 5 stories
- Dependency management: 3 stories
- Comments and collaboration: 3 stories
- AI task decomposition: 2 stories
- Filtering and search: 2 stories
- Time tracking: 1 story

**All stories follow the format**:
```
As a <role>,
I want <feature>,
So that <benefit>.

Acceptance Criteria:
- Given <context>
- When <action>
- Then <outcome>
```

**Roles represented**: Project Manager (5), Developer (6), Tech Lead (2), QA Engineer (2), All authenticated users (1)
