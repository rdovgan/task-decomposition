# Functional Requirements - Task Decomposition Tool

## FR-1: Create Tasks
**Description**: Users can create new tasks with title, description, assignee, and metadata.

**Requirements**:
- System shall allow users to create tasks with the following fields:
  - Title (required, max 200 characters)
  - Description (optional, markdown-supported, max 5000 characters)
  - Assignee (optional, must be valid user in system)
  - Status (default: TODO, options: TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED)
  - Priority (default: MEDIUM, options: CRITICAL, HIGH, MEDIUM, LOW)
  - Story Points (optional, integer 1-13)
  - Estimated Hours (optional, decimal, max 999)
  - Start Date (optional)
  - Due Date (optional)
- Task must be linked to an existing Epic
- System shall validate all required fields before creation
- System shall assign unique task ID
- System shall timestamp task creation

**User Roles**: PROJECT_MANAGER, ADMIN, DEVELOPER, QA, DESIGNER

---

## FR-2: Edit Tasks
**Description**: Users can edit all task fields.

**Requirements**:
- System shall allow users to edit all task fields except ID and creation timestamps
- System shall maintain edit history (updatedAt timestamp)
- System shall validate all fields on update
- System shall prevent editing tasks with status DONE or CANCELLED (requires admin override)
- System shall notify task assignee if task is edited by someone else

**User Roles**: PROJECT_MANAGER, ADMIN (all fields), DEVELOPER, QA, DESIGNER (own tasks only)

---

## FR-3: Delete Tasks
**Description**: Users can delete tasks with confirmation.

**Requirements**:
- System shall require explicit confirmation before deletion
- System shall prevent deletion if task has dependent tasks (must delete dependents first)
- System shall cascade-delete: dependencies, links, and comments
- System shall log deletion with user who performed action
- System shall allow ADMIN to force-delete tasks with dependents (with warning)

**User Roles**: PROJECT_MANAGER, ADMIN

---

## FR-4: Filter Task List
**Description**: Task list supports filtering by status, assignee, and priority.

**Requirements**:
- System shall provide filters for:
  - Status (multi-select)
  - Assignee (multi-select)
  - Priority (multi-select)
  - Epic (single-select)
- System shall apply filters in real-time
- System shall display number of tasks matching filters
- System shall allow users to save filter combinations as presets
- System shall support combining multiple filters with AND logic

**User Roles**: All authenticated users

---

## FR-5: Full-Text Search
**Description**: Task list supports full-text search across task fields.

**Requirements**:
- System shall search across: title, description, comments
- System shall display search results with highlighted matches
- System shall support partial matches (e.g., "auth" matches "authentication")
- System shall return results ranked by relevance
- System shall update results as user types (debounced, 300ms)
- System shall support search operators (AND, OR, NOT, quotes for exact phrase)

**User Roles**: All authenticated users

---

## FR-6: Display Tasks in Epic Context
**Description**: Tasks display in epic context with parent hierarchy.

**Requirements**:
- System shall display parent Epic name and link to Epic detail page
- System shall show task position within Epic (e.g., "Task 3 of 12")
- System shall display Epic status and progress bar (complete/total tasks)
- System shall show sibling tasks (other tasks in same Epic)
- Breadcrumb navigation: Project → Epic → Task

**User Roles**: All authenticated users

---

## FR-7: Link Task Dependencies
**Description**: Users can link tasks as dependent on each other.

**Requirements**:
- System shall allow users to create dependency links between tasks
- System shall support dependency types: BLOCKS, RELATED_TO, DUPLICATES
- System shall prevent self-dependencies (task depending on itself)
- System shall allow multiple dependencies per task
- System shall display dependencies on task detail page:
  - Blocking: tasks that must complete before this task can start
  - Blocked by: tasks that are blocked by this task
- System shall allow dependency deletion

**User Roles**: PROJECT_MANAGER, ADMIN, DEVELOPER, QA

---

## FR-8: Prevent Circular Dependencies
**Description**: System prevents circular dependency chains.

**Requirements**:
- System shall detect circular dependencies before creating link
- System shall display error message showing the circular path
- System shall prevent creation of circular dependency
- System shall run circular dependency check on graph:
  - Before dependency creation
  - When task is moved to different Epic
  - When Epic parent hierarchy changes

**Example Circular Dependency**:
- Task A depends on Task B
- Task B depends on Task C
- Task C depends on Task A (BLOCKED: would create cycle)

---

## FR-9: Visualize Dependency Chains
**Description**: Users can visualize dependency chains and critical path.

**Requirements**:
- System shall provide dependency visualization on Epic detail page
- System shall display:
  - Tasks as nodes
  - Dependencies as directed edges (arrows)
  - Critical path highlighted in red
  - Task status color-coding
- System shall support:
  - Zoom and pan
  - Click task to view details
  - Filter by dependency type
- System shall calculate and display critical path (longest path to completion)

**User Roles**: All authenticated users

---

## FR-10: Notify on Blocking Task Completion
**Description**: Users are notified if a blocking task is completed.

**Requirements**:
- System shall identify all tasks blocked by completed task
- System shall send notification to assignees of newly unblocked tasks
- System shall include in notification:
  - Which blocking task completed
  - Link to newly unblocked task
- Notification channels: in-app notification (required), email (optional)
- System shall batch notifications if multiple blockers complete simultaneously

**User Roles**: Assignees of blocked tasks

---

## FR-11: Add Comments to Tasks
**Description**: Users can add comments to tasks for discussion and clarification.

**Requirements**:
- System shall allow users to post comments on tasks
- System shall require comment content (non-empty)
- System shall support markdown formatting in comments
- System shall timestamp comments (createdAt, updatedAt)
- System shall display comments in reverse chronological order (newest first)
- System shall show comment author (name, role)
- System shall allow @-mentions of other users (triggers notification)

**User Roles**: All authenticated users

---

## FR-12: Display Comment Metadata
**Description**: Comments show author, timestamp, and edit history.

**Requirements**:
- System shall display for each comment:
  - Author name and avatar
  - Creation timestamp (relative time: "2 hours ago")
  - Last edited timestamp (if edited)
- System shall show "edited" indicator if comment was updated
- System shall allow hovering over relative time to see absolute timestamp

**User Roles**: All authenticated users

---

## FR-13: Edit Own Comments
**Description**: Users can edit their own comments.

**Requirements**:
- System shall allow users to edit only their own comments
- System shall maintain edit history (updatedAt timestamp)
- System shall display "edited" indicator on edited comments
- System shall prevent editing after 24 hours (configurable)
- System shall log edit history (who edited, when)

**User Roles**: All authenticated users (own comments only), ADMIN (any comment)

---

## FR-14: Markdown Formatting in Comments
**Description**: Comments support markdown formatting.

**Requirements**:
- System shall support GitHub-flavored markdown:
  - Headers (#, ##, ###)
  - Bold (**text**), italic (*text*)
  - Code blocks (```) and inline code (`)
  - Links ([text](url))
  - Lists (ordered and unordered)
  - Blockquotes (> text)
- System shall sanitize markdown to prevent XSS
- System shall preview markdown before submission
- System shall render markdown in display mode

**User Roles**: All authenticated users

---

## FR-15: Trigger AI Task Breakdown
**Description**: Users can trigger AI-powered task breakdown.

**Requirements**:
- System shall provide "Break down with AI" button on Epic detail page
- System shall send Epic title and description to AI API
- System shall display loading state during AI processing
- System shall handle AI API failures gracefully (retry, timeout, error message)
- System shall allow manual breakdown if AI fails

**User Roles**: PROJECT_MANAGER, ADMIN

---

## FR-16: AI Suggests 3-8 Subtasks
**Description**: AI suggests between 3 and 8 subtasks based on Epic description.

**Requirements**:
- System shall request AI to generate 3-8 tasks (configurable)
- System shall display AI suggestions as draft tasks (not saved yet)
- System shall show each suggestion with:
  - Title (required)
  - Description (if provided by AI)
  - Estimated hours (if provided by AI)
  - Story points (if provided by AI)
- System shall allow user to regenerate suggestions

**User Roles**: PROJECT_MANAGER, ADMIN

---

## FR-17: Edit AI Suggestions Before Saving
**Description**: Users can edit AI suggestions before saving as tasks.

**Requirements**:
- System shall allow inline editing of all AI-suggested fields
- System shall allow users to:
  - Edit task titles and descriptions
  - Adjust estimates and story points
  - Remove unwanted suggestions
  - Add manual tasks
  - Reorder tasks
- System shall provide "Save All Tasks" button to create all suggested tasks
- System shall validate all tasks before saving

**User Roles**: PROJECT_MANAGER, ADMIN

---

## FR-18: AI Provides Time Estimates
**Description**: AI provides time estimates for suggested tasks.

**Requirements**:
- System shall request AI to provide estimated hours for each task
- System shall display estimates in "Xh" format (e.g., "2h", "0.5h")
- System shall allow users to adjust estimates before saving
- System shall display total estimated hours for all suggested tasks
- System shall flag estimates > 8h for review (suggest splitting)

**User Roles**: PROJECT_MANAGER, ADMIN

---

## Priority Levels

The system supports four priority levels with specific semantics:

| Priority | Description | Use Case |
|----------|-------------|----------|
| **CRITICAL** | Blocks release or major functionality | Security issues, data loss, production outages |
| **HIGH** | Important for current sprint/goal | Main feature work, committed deadlines |
| **MEDIUM** | Normal priority | Most tasks, default value |
| **LOW** | Nice-to-have, can defer | Polish, optimizations, tech debt |

---

## Status Workflows

### Task Status State Machine

```
TODO → IN_PROGRESS → IN_REVIEW → DONE
                ↓               ↑
             BLOCKED ──────────┘
                ↓
             CANCELLED
```

**Status Transition Rules**:
- TODO → IN_PROGRESS: When assignee starts work
- IN_PROGRESS → IN_REVIEW: When work is complete, ready for review
- IN_REVIEW → DONE: When approved (by PROJECT_MANAGER, ADMIN, or TECH_LEAD)
- IN_REVIEW → IN_PROGRESS: When changes are requested
- IN_PROGRESS → BLOCKED: When waiting on dependency or external factor
- BLOCKED → IN_PROGRESS: When blocker is resolved
- Any status → CANCELLED: When task is no longer needed (PROJECT_MANAGER or ADMIN only)

---

## Data Validation Rules

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| Title | Required, 1-200 characters | "Title is required and must be under 200 characters" |
| Description | Optional, max 5000 characters | "Description must be under 5000 characters" |
| Story Points | Optional, integer 1-13 | "Story points must be between 1 and 13" |
| Estimated Hours | Optional, decimal 0-999 | "Estimated hours must be between 0 and 999" |
| Due Date | Must be after start date (if both set) | "Due date must be after start date" |
| Assignee | Must be valid user in system | "Invalid assignee" |

---

## API Endpoints Reference

### Task Management
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (with filters and pagination)
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dependencies
- `GET /api/tasks/:id/dependencies` - Get task dependencies
- `POST /api/tasks/:id/dependencies` - Create dependency
- `DELETE /api/dependencies/:id` - Delete dependency

### Comments
- `GET /api/tasks/:id/comments` - List task comments
- `POST /api/tasks/:id/comments` - Add comment
- `PATCH /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment

### AI Breakdown
- `POST /api/epics/:id/breakdown` - Trigger AI task breakdown
- `POST /api/epics/:id/breakdown/regenerate` - Regenerate AI suggestions
