# Bug Report Template

**Use this template for quick bug reporting in Slack or email**

---

## Slack Bug Report Format

**Post in #task-tool-beta channel:**

```
🐛 **BUG REPORT**

**Title:** [One-line summary - e.g., "Can't assign tasks to users"]

**Severity:** 🔥 Critical | 🔴 High | 🟡 Medium | 🟢 Low

**Steps to Reproduce:**
1. [What did you do?]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen?]

**Actual Behavior:**
[What actually happened?]

**Workaround:**
[Is there a way to work around it? If yes, explain]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge + version]
- User: [@mention]
- Time: [When did this happen?]

**Screenshots/Error Messages:**
[Paste or attach here]
```

---

## Email Bug Report Format

**Send to:** Product Manager (via Slack DM or #task-tool-beta)
**Subject:** 🐛 Bug: [One-line summary]
**Response Time:** Within 24 hours

```
Hi Team,

I found a bug in the Task Decomposition Tool.

TITLE: [One-line summary]

SEVERITY: 🔥 Critical / 🔴 High / 🟡 Medium / 🟢 Low

STEPS TO REPRODUCE:
1. [What did you do?]
2. [Step 2]
3. [Step 3]

EXPECTED BEHAVIOR:
[What should happen?]

ACTUAL BEHAVIOR:
[What actually happened?]

WORKAROUND:
[Is there a way to work around it?]

ENVIRONMENT:
- Browser: [Chrome/Firefox/Safari/Edge + version]
- User: [Your name]
- Time: [When did this happen?]

SCREENSHOTS/ERROR MESSAGES:
[Attach or paste here]

Thanks,
[Your name]
```

---

## Severity Guide

### 🔥 Critical (P0)
- **Definition:** Blocks all users, data loss, security issue
- **Response Time:** Within 1 hour
- **Fix Target:** Same day
- **Examples:**
  - Application crashes on startup
  - Data corruption or loss
  - Security vulnerability
  - Authentication completely broken

### 🔴 High (P1)
- **Definition:** Major feature broken, affects >50% of users
- **Response Time:** Within 4 hours
- **Fix Target:** Within 2 days
- **Examples:**
  - Can't create tasks
  - AI decomposition completely broken
  - Can't assign tasks
  - Major UI element not rendering

### 🟡 Medium (P2)
- **Definition:** Feature degraded, affects <50% of users, workaround exists
- **Response Time:** Within 24 hours
- **Fix Target:** Within 1 week
- **Examples:**
  - Minor UI bug (layout issue)
  - Feature works but is slow
  - Error message unclear
  - Edge case doesn't work

### 🟢 Low (P3)
- **Definition:** Cosmetic issue, minor inconvenience
- **Response Time:** Within 48 hours
- **Fix Target:** Backlog / Next sprint
- **Examples:**
  - Typos in text
  - Minor styling issue
  - Nice-to-have improvement
  - Inconsistent spacing

---

## Good Bug Report Examples

### ✅ Good Bug Report
```
🐛 BUG REPORT

Title: Can't assign tasks to users

Severity: 🔴 High

Steps to Reproduce:
1. Click "Tasks" in the left sidebar
2. Open task "TAX-123: Fix authentication bug"
3. Click "Assignee" dropdown
4. Select user "Jane Smith"
5. Click "Save"

Expected Behavior:
Task should be assigned to Jane Smith and show her name in the assignee field.

Actual Behavior:
Dropdown closes but assignee field remains empty. Error message: "Failed to update task" appears in red.

Workaround:
None - can't assign tasks at all.

Environment:
- Browser: Chrome 120.0.6099.109
- User: @john-doe
- Time: 2:15 PM PT, 2024-04-03

Screenshots:
[Screenshot showing error message]
```

### ❌ Bad Bug Report
```
It's broken. Can't use it.
```

---

## Quick Copy-Paste Templates

### For UI Bugs
```
🐛 **UI Bug**
**Where:** [Page/Feature]
**Issue:** [What's wrong with the display?]
**Expected:** [What should it look like?]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Screenshot:** [Attach]
```

### For Performance Issues
```
🐛 **Performance Issue**
**Feature:** [What's slow?]
**Expected Time:** [How fast should it be?]
**Actual Time:** [How long is it taking?]
**Steps:** [How to trigger it]
**Browser:** [Chrome/Firefox/Safari/Edge]
```

### For Error Messages
```
🐛 **Error Message**
**What were you doing:** [Action]
**Error:** [Copy exact text]
**Expected:** [What should happen]
**Frequency:** [Always / Sometimes / Once]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Screenshot:** [Attach]
```

### For Data Issues
```
🐛 **Data Issue**
**What data is wrong:** [Description]
**What should it be:** [Correct value]
**How did this happen:** [Steps]
**Impact:** [What's affected?]
**User:** [@mention]
```

---

## Beta Tester Instructions

### When to Report Bugs
- **Immediately:** Critical and High severity bugs
- **Same day:** Medium severity bugs
- **End of week:** Low severity bugs

### Where to Report Bugs
1. **First choice:** #task-tool-beta Slack channel
2. **Alternative:** Email [pm-email@company.com]
3. **For sensitive issues:** DM PM directly

### What Happens After You Report
1. **Acknowledgment:** Within 1 hour (P0/P1) or 4 hours (P2/P3)
2. **Triage:** Team reviews and assigns severity
3. **Update:** You'll get status updates in #task-tool-beta
4. **Fix:** Deployed based on severity target
5. **Verify:** Tester confirms fix works

### Don't Be Afraid to Report
- ❌ Don't worry about "wasting our time"
- ❌ Don't assume someone else reported it
- ❌ Don't think it's "probably just you"
- ✅ DO report everything - even small bugs help us improve!
- ✅ DO include screenshots when possible
- ✅ DO be as specific as you can

---

## PM Response Template

**When responding to bug reports in #task-tool-beta:**

```
Thanks @reporter for the report!

**Status:** 🔍 Investigating
**Severity:** [Confirm/adjust severity]
**Owner:** [@assignee]
**Target Fix:** [Date]

**Next Steps:**
- [ ] Reproduce the bug
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Deploy to beta
- [ ] @reporter to verify

We'll keep you updated here in #task-tool-beta.
```

---

## Bug Tracking Workflow

```
Report → Acknowledge → Triage → Assign → Fix → Deploy → Verify → Close
   ↓        ↓           ↓        ↓      ↓       ↓        ↓        ↓
 Slack    1hr      4hrs    24hrs   [varies]  [varies]  tester   Done
```

**SLA Targets:**
- Acknowledgment: 1 hour (P0/P1), 4 hours (P2/P3)
- First Update: 4 hours (P0/P1), 24 hours (P2/P3)
- Fix Deployed: Same day (P0), 2 days (P1), 1 week (P2), Backlog (P3)
