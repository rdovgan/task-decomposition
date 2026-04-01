# Edge Cases - Task Decomposition Tool

This document describes how the system handles edge cases and error scenarios.

---

## EC-1: Deleting a Task with Dependents

### Scenario
User attempts to delete a task that has other tasks depending on it.

### Example
- Task A blocks Task B
- User tries to delete Task A

### Handling
**Prevention**:
- System checks for dependent tasks before deletion
- If dependents exist, deletion is blocked with error:
  ```
  Cannot delete "Implement auth" - 3 tasks depend on it:
  - Build login UI (blocks)
  - Build registration UI (blocks)
  - Write auth tests (blocks)
  
  Please delete dependent tasks first, or reassign their dependencies.
  ```

**Admin Override**:
- ADMIN role can force-delete with confirmation:
  ```
  ⚠️ Force delete will also delete 3 dependent tasks. Are you sure?
  ```
- Cascade deletion deletes all dependents recursively

**UI Behavior**:
- "Delete" button is disabled if task has dependents
- Tooltip shows: "Task has 3 dependents - delete them first"
- ADMIN sees "Force Delete" button with warning icon

---

## EC-2: Circular Dependency Detection

### Scenario
User attempts to create a dependency that would create a circular chain.

### Example
- Task A depends on Task B
- Task B depends on Task C
- User tries to make Task C depend on Task A (would create A → B → C → A)

### Handling
**Detection Algorithm**:
- Graph traversal (DFS) from the dependent task through all existing dependencies
- Check if path leads back to the task being depended upon
- Run detection before creating dependency

**Error Message**:
```
Cannot create dependency: this would create a circular dependency.

Circular path:
Build login UI → Implement auth → Design auth system → Build login UI

Dependencies in this cycle:
- Build login UI BLOCKED BY Implement auth
- Implement auth BLOCKED BY Design auth system
- Design auth system BLOCKED BY Build login UI (proposed)

Please break the cycle by removing an existing dependency or choosing a different task.
```

**UI Behavior**:
- Dependency creation modal shows error inline
- "Create Dependency" button disabled until cycle is resolved
- Visual indicator shows the circular path in red on dependency graph

---

## EC-3: Concurrent Task Edits

### Scenario
Two users edit the same task simultaneously.

### Example
- Alex opens task detail page at 10:00 AM
- Sarah opens same task detail page at 10:01 AM
- Alex edits description and saves at 10:02 AM
- Sarah edits description and saves at 10:03 AM (overwrites Alex's changes)

### Handling
**Optimistic Concurrency Control**:
- Each task has `version` integer (increments on each update)
- Update request includes expected version
- If versions don't match, update is rejected

**Error Message**:
```
This task was modified by another user.
Last edited by: Alex (2 minutes ago)

Your changes:
[Show diff of user's unsaved changes]

Options:
- [Discard my changes] - Reload latest version
- [Overwrite] - Force save (will overwrite Alex's changes)
- [Merge] - Manually merge changes
```

**UI Behavior**:
- If another user edits while you're viewing, show banner:
  ```
  ⚠️ Alex edited this task 1 minute ago. Refresh to see changes.
  ```
- Banner includes "Refresh" button
- On save, if conflict occurred, show conflict resolution modal

---

## EC-4: AI API Failures

### Scenario
AI task breakdown API fails or times out.

### Failure Modes
1. **Timeout**: AI API takes > 10 seconds
2. **Rate Limiting**: AI API returns 429 Too Many Requests
3. **Service Unavailable**: AI API returns 500/503
4. **Invalid Response**: AI API returns malformed/unexpected data

### Handling

**Timeout**:
```
⚠️ AI breakdown is taking longer than expected.
The AI is still processing, but this is unusual.

Options:
- [Keep waiting] - Continue waiting for response
- [Cancel] - Cancel and try again later
```
- Show timeout modal after 10 seconds
- Allow user to cancel or keep waiting
- If user cancels, fallback to manual breakdown

**Rate Limiting**:
```
⚠️ Too many AI requests. Please wait before trying again.
You can try again in 2 minutes.

In the meantime:
- [Create tasks manually]
- [View previous AI suggestions]
```
- Show countdown timer until rate limit resets
- Provide alternative actions

**Service Unavailable**:
```
⚠️ AI service is temporarily unavailable.
Our team has been notified.

Options:
- [Retry now] - Try again
- [Create tasks manually] - Skip AI for now
```
- Log error to monitoring system
- Allow retry with exponential backoff

**Invalid Response**:
```
⚠️ AI returned unexpected data. This is a bug on our end.
Our team has been notified and will fix it soon.

Please [create tasks manually] or [try again].
```
- Log full response for debugging
- Alert engineering team

**Fallback Strategy**:
- Always provide "Create tasks manually" option
- Store Epic description so user can paste into manual form
- Consider offering template tasks based on similar Epics

---

## EC-5: Large Task Lists (1000+ Tasks)

### Scenario
Epic or project has thousands of tasks, causing performance issues.

### Example
- Epic has 2,500 tasks
- Loading task list takes 30+ seconds
- Browser becomes unresponsive

### Handling

**Pagination**:
- Default page size: 50 tasks
- Infinite scroll with "Load more" button
- Show total count: "Showing 1-50 of 2,500 tasks"

**Virtual Scrolling** (for large lists):
- Render only visible tasks (viewport + buffer)
- Recycle DOM elements as user scrolls
- Maintain scroll position in URL hash

**Lazy Loading**:
- Load task details on-demand (when user clicks task)
- Initial list shows: title, status, assignee, priority
- Full description, comments, dependencies loaded on click

**Performance Optimization**:
- Database indexes on: `epicId`, `status`, `assigneeId`, `priority`
- Cached queries for common filters
- Debounced search (300ms)
- Server-side filtering and sorting

**UI Indicators**:
- Show skeleton loaders while fetching
- Display loading progress for large operations:
  ```
  Loading 2,500 tasks... ████░░░░░░ 40% (1,000/2,500)
  ```

**Error Handling**:
- If query takes > 5 seconds, show:
  ```
  ⚠️ This list is very large. Try applying filters to reduce results.
  ```

---

## EC-6: Orphaned Tasks (Epic Deleted)

### Scenario
Epic is deleted, leaving tasks with no parent.

### Example
- Epic "Authentication" has 10 tasks
- User deletes Epic (accidentally or intentionally)
- Tasks are now orphaned (their `epicId` points to deleted Epic)

### Handling

**Prevention**:
- When deleting Epic, show warning:
  ```
  ⚠️ This Epic contains 10 tasks.
  Deleting the Epic will also delete all tasks.

  Options:
  - [Cancel] - Don't delete
  - [Move tasks to another Epic] - Choose destination Epic
  - [Delete all] - Delete Epic and all tasks
  ```

**Cascade Deletion**:
- Default behavior: cascade-delete all tasks
- SQL: `ON DELETE CASCADE` in Prisma schema

**Recovery** (if Epic is already deleted):
- Option 1: Soft-delete Epic (mark as deleted, don't actually delete)
  - Tasks remain accessible
  - UI shows: "This Epic was deleted. Tasks are archived."
- Option 2: Create "Orphaned Tasks" pseudo-Epic
  - Move orphaned tasks to this Epic
  - Allow users to reassign to real Epics

**Admin Tools**:
- Admin dashboard shows orphaned tasks
- Bulk action: "Reassign to Epic" for orphaned tasks

---

## EC-7: Task Assigned to Deleted User

### Scenario
Task is assigned to a user who is later deleted from the system.

### Handling

**Database Behavior**:
- Prisma: `onDelete: SetNull` for `assigneeId` field
- When user is deleted, task's `assigneeId` becomes `NULL`

**UI Behavior**:
- Task detail page shows:
  ```
  Assignee: Deleted User (formerly Alex)
  ```
- Badge shows: "Unassigned" with warning icon
- Comment: "User 'Alex' was deleted. Task is now unassigned."

**Notification**:
- PROJECT_MANAGER receives notification:
  ```
  Task "Build login UI" was unassigned because user Alex was deleted.
  Please reassign this task.
  ```

---

## EC-8: Invalid Task Status Transitions

### Scenario
User attempts invalid status transition (e.g., TODO → DONE without IN_PROGRESS).

### Handling

**State Machine Enforcement**:
- Only allow valid transitions (see [Functional Requirements](functional-requirements.md#status-workflows))
- Client-side: disable invalid options in dropdown
- Server-side: reject invalid transitions with 400 error

**Error Message**:
```
Invalid status transition: TODO → DONE
Valid transitions from TODO:
- IN_PROGRESS
- CANCELLED
```

**UI Behavior**:
- Status dropdown shows only valid options
- Invalid options are grayed out or hidden
- Hover shows tooltip: "Must complete IN_PROGRESS first"

---

## EC-9: Task Due Date in the Past

### Scenario
Task due date has passed, but task is not complete.

### Handling

**UI Indicators**:
- Task list shows overdue badge:
  ```
  🔴 Overdue by 3 days
  ```
- Task detail page shows warning:
  ```
  ⚠️ This task was due on March 29, 2026 (3 days ago).
  ```

**Notifications**:
- Assignee receives daily notification for overdue tasks:
  ```
  You have 3 overdue tasks:
  - Build login UI (3 days overdue)
  - Implement auth (5 days overdue)
  - Write tests (1 day overdue)
  ```
- PROJECT_MANAGER receives weekly summary of team's overdue tasks

**Actions**:
- Quick actions on overdue tasks:
  - "Update due date"
  - "Mark as blocked"
  - "Reassign to another user"

---

## EC-10: AI Suggests Too Many or Too Few Tasks

### Scenario
AI returns 2 tasks (too few) or 15 tasks (too many) instead of 3-8.

### Handling

**Too Few (< 3 tasks)**:
```
⚠️ AI suggested only 2 tasks for this Epic.
This might be incomplete coverage.

Options:
- [Accept and create] - Create 2 tasks anyway
- [Regenerate] - Ask AI to try again
- [Add manually] - Add more tasks yourself
```

**Too Many (> 8 tasks)**:
```
⚠️ AI suggested 15 tasks for this Epic.
This might be too granular.

Options:
- [Review all] - See all 15 suggestions
- [Regenerate] - Ask AI for fewer tasks
- [Select and create] - Choose which tasks to create
```

**UI Behavior**:
- Show warning before user accepts suggestions
- Provide options to adjust granularity
- Allow user to merge or split tasks before saving

---

## EC-11: Database Connection Lost

### Scenario
Application loses connection to database while user is working.

### Handling

**Detection**:
- API calls fail with network error
- WebSocket connection closes (if using realtime subscriptions)

**UI Behavior**:
- Show banner: "⚠️ Connection lost. Reconnecting..."
- Disable all forms and buttons
- Show retry spinner

**Recovery**:
- Automatically reconnect with exponential backoff
- On reconnect:
  - Show success: "✓ Reconnected"
  - Refresh current page data
  - Re-enable forms
- If reconnect fails after 3 attempts:
  ```
  ⚠️ Cannot connect to server.
  Check your internet connection.

  [Retry] [Reload page]
  ```

**Offline Support** (future):
- Cache unsaved changes in localStorage
- Show "Working offline" banner
- Sync changes when connection restored

---

## EC-12: Markdown Rendering Security

### Scenario
User attempts to inject malicious code via markdown in comments/descriptions.

### Example
User posts comment with:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

### Handling

**Sanitization**:
- Use markdown-it with DOMPurify
- Strip all `<script>` tags and event handlers
- Allow only safe HTML: `<p>`, `<br>`, `<strong>`, `<em>`, `<code>`, `<pre>`, `<a>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<h1>-<h6>`

**Escaping**:
- Escape user input before rendering
- Use Content Security Policy (CSP) headers

**Testing**:
- Include XSS tests in test suite
- Test cases: `<script>`, `onerror=`, `javascript:`, `data:`

---

## Error Codes Reference

| Code | Description | HTTP Status | User Message |
|------|-------------|-------------|--------------|
| `CIRCULAR_DEPENDENCY` | Cannot create circular dependency | 400 | "This would create a circular dependency" |
| `TASK_HAS_DEPENDENTS` | Cannot delete task with dependents | 400 | "Task has 3 dependents" |
| `CONCURRENT_EDIT` | Task was modified by another user | 409 | "This task was modified by another user" |
| `AI_TIMEOUT` | AI API request timed out | 504 | "AI request timed out" |
| `AI_RATE_LIMITED` | Too many AI requests | 429 | "Too many AI requests" |
| `INVALID_STATUS_TRANSITION` | Invalid task status transition | 400 | "Invalid status transition" |
| `ORPHANED_TASK` | Task has no parent Epic | 404 | "Task's Epic was deleted" |
| `ASSIGNEE_NOT_FOUND` | Task assigned to deleted user | 404 | "Assignee no longer exists" |

---

## Monitoring and Alerting

For each edge case, log to monitoring system:

- **Errors**: EC-2, EC-3, EC-4, EC-11, EC-12 → Alert to engineering
- **Warnings**: EC-1, EC-9, EC-10 → Log for review
- **Metrics**: EC-5 (large lists) → Track performance degradation

Alert thresholds:
- > 10 circular dependency errors/hour → Investigate dependency logic
- > 5 concurrent edit conflicts/hour → Review conflict resolution UX
- > 20 AI timeouts/hour → Check AI API status
- > 100 tasks with 1000+ items → Review pagination strategy
