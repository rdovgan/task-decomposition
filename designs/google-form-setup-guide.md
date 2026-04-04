# Google Forms Setup Guide - Beta Feedback Survey

**Created:** April 3, 2026  
**Status:** Ready for Implementation  
**Platform:** Google Forms  
**Survey:** Weekly Beta Tester Feedback (15 minutes)

---

## Quick Setup Instructions

### Step 1: Create Google Form
1. Go to https://forms.google.com
2. Click "Blank" to create new form
3. Title: "Weekly Beta Tester Feedback - Task Decomposition Tool"
4. Description: "Help us improve! This 15-minute weekly survey collects feedback on your experience with the Task Decomposition Tool."

### Step 2: Add Questions (in order)

#### Section 1: Overall Satisfaction (2 minutes)

**Question 1:** Overall satisfaction rating
- Type: Linear scale
- Title: "How would you rate your overall experience with the Task Decomposition Tool this week?"
- Scale: 1 to 5
- Labels: 1 = Very Dissatisfied, 5 = Very Satisfied
- Required: Yes

**Question 2:** NPS Score
- Type: Linear scale  
- Title: "How likely are you to recommend the Task Decomposition Tool to a colleague?"
- Scale: 0 to 10
- Labels: 0 = Not at all likely, 10 = Extremely likely
- Required: Yes

**Question 3:** NPS Reason
- Type: Paragraph
- Title: "What's the primary reason for your score?"
- Required: No

#### Section 2: Feature Usage (5 minutes)

**Question 4:** Features used
- Type: Checkboxes
- Title: "Which features did you use this week? (Select all that apply)"
- Options:
  - Task Creation
  - AI Task Decomposition
  - Epic Management
  - Task Assignment
  - Dependency Graph Visualization
  - My Tasks Dashboard
  - User Management
- Required: No
- Add "Other" option

**Question 5:** Feature usage frequency
- Type: Multiple choice grid
- Title: "How frequently did you use each of the following features?"
- Rows: Task Creation, AI Task Decomposition, Epic Management, Dependency Graph, My Tasks Dashboard
- Columns: Daily, 2-3x/week, Once, Never
- Required: No

**Question 6:** AI usefulness
- Type: Multiple choice
- Title: "How useful did you find the AI Task Decomposition feature this week?"
- Options:
  - Very Useful
  - Somewhat Useful
  - Neutral
  - Not Very Useful
  - Not at All Useful
  - Did not use
- Required: No

**Question 7:** AI accuracy
- Type: Multiple choice
- Title: "How accurate was the AI's task decomposition? (If you used it)"
- Options:
  - Excellent - Almost perfect
  - Good - Minor adjustments needed
  - Fair - Moderate changes needed
  - Poor - Significant rework required
  - Did not use
- Required: No

#### Section 3: Time Savings & Productivity (2 minutes)

**Question 8:** Time saved
- Type: Multiple choice
- Title: "How much time did you save on average per task using the AI decomposition feature?"
- Options:
  - 1-5 minutes per task
  - 6-10 minutes per task
  - 11-15 minutes per task
  - 16-20 minutes per task
  - More than 20 minutes per task
  - Did not use / No time saved
- Required: Yes

**Question 9:** Productivity change
- Type: Multiple choice
- Title: "Compared to your previous workflow, how has your productivity changed?"
- Options:
  - Significantly Improved
  - Slightly Improved
  - No Change
  - Slightly Decreased
  - Significantly Decreased
- Required: Yes

#### Section 4: Bugs & Issues (2 minutes)

**Question 10:** Bug count
- Type: Multiple choice
- Title: "How many bugs did you encounter this week?"
- Options:
  - None
  - 1-2 minor bugs
  - 3-5 minor bugs
  - 1-2 major bugs
  - 3+ major bugs
- Required: No

**Question 11:** Most frustrating bug
- Type: Paragraph
- Title: "What was the most frustrating bug or issue you experienced this week?"
- Description: Maximum 500 characters
- Character limit: 500
- Required: No

#### Section 5: Pain Points & Improvements (3 minutes)

**Question 12:** Biggest challenge
- Type: Paragraph
- Title: "What was the biggest challenge or frustration you experienced this week?"
- Character limit: 500
- Required: No

**Question 13:** Feature request
- Type: Paragraph
- Title: "What feature would have the biggest positive impact on your workflow?"
- Character limit: 500
- Required: No

**Question 14:** Confusing elements
- Type: Paragraph
- Title: "Is there anything you found confusing or difficult to understand?"
- Character limit: 500
- Required: No

**Question 15:** What works well
- Type: Paragraph
- Title: "What's working well that you want us to keep doing?"
- Character limit: 500
- Required: No

#### Section 6: Additional Comments (1 minute)

**Question 16:** Other feedback
- Type: Paragraph
- Title: "Any other feedback, suggestions, or concerns?"
- Character limit: 500
- Required: No

### Step 3: Configure Form Settings

1. **Settings → General:**
   - ✅ Collect email addresses
   - ✅ Send respondents a copy of their responses
   - ❌ Allow response editing
   - ❌ See summary charts

2. **Settings → Presentation:**
   - ✅ Show progress bar
   - ❌ Shuffle question order
   - ✅ Link to another form (for next week's survey)

3. **Settings → Responses:**
   - ✅ Accept responses
   - ❌ Limit to 1 response
   - ❌ Change expiration date

### Step 4: Confirmation Message

**Settings → Presentation → Confirmation Message:**

```
Thank you for your feedback! Your input helps us improve the Task Decomposition Tool.

We'll share a summary of weekly feedback and our action items every Friday during the feedback session.

Next Steps:
- Join us for the weekly feedback session: [Link to calendar invite]
- Post bugs in real-time: #task-tool-beta
- Questions? Contact: PM
```

### Step 5: Connect to Google Sheets

1. Click "Responses" tab
2. Click green Sheets icon (Link to Sheets)
3. Create new spreadsheet: "Beta Feedback Survey Responses"
4. Sheet will automatically collect all responses

### Step 6: Set Up Notifications

1. In the linked Google Sheet:
   - Click "Tools" → "Notification rules"
   - Set up notification for: "A user submits a form"
   - Notify: "Email me right away"
   - This allows PM to monitor response rates

### Step 7: Test Form

1. Click "Send" (top right)
2. Send test link to yourself
3. Complete survey as a beta tester would
4. Verify all questions work properly
5. Check that responses appear in Google Sheets

### Step 8: Create Shareable Link

1. Click "Send" (top right)
2. Click "Link" tab
3. Shorten URL: https://goo.gl/
4. Copy link for beta tester onboarding

---

## Weekly Schedule Setup

### Google Forms Schedule
1. Go to Google Forms
2. Click "Schedule" in top menu
3. Set recurring schedule:
   - **Frequency:** Weekly
   - **Day:** Friday
   - **Time:** 2:00 PM PT
   - **Message:** "Weekly Beta Tester Survey is ready! Please complete by end of day Friday."

### Slack Integration
1. Add form link to #task-tool-beta channel
2. Pin message for easy access
3. Set weekly reminder: Mondays at 9 AM PT
4. Reminder message: "Don't forget to complete your weekly survey if you haven't already!"

---

## Success Criteria Checklist

- [ ] Google Form created with all 16 questions
- [ ] Automatic data export to Sheets configured
- [ ] Form tested and working correctly
- [ ] Shareable link created and tested
- [ ] Link ready for beta tester onboarding (Day 10)
- [ ] Weekly schedule configured (Fridays at 2 PM PT)
- [ ] Slack channel integration ready
- [ ] Response notifications set up

---

## Integration Points

### Beta Tester Onboarding
Add to onboarding document:
```
Weekly Feedback Survey
- Link: [Google Form Link]
- Time: 15 minutes
- When: Every Friday at 2 PM PT
- Purpose: Help us improve the tool
```

### Weekly Feedback Session
Before each Friday feedback session:
1. Export latest responses from Google Sheets
2. Create summary: NPS, feature usage, top issues
3. Prepare action items for team discussion
4. Share anonymized summary with beta testers

### CEO Updates
Use data from Google Sheets for executive digest:
- NPS trend (week-over-week)
- Feature adoption rates
- Bug frequency
- Time savings reported
- Top feature requests

---

## Next Steps

1. **Immediate (Today):**
   - Create Google Form using this guide
   - Test all functionality
   - Create shareable link

2. **Before Day 10:**
   - Add link to beta tester onboarding materials
   - Set up weekly schedule
   - Configure Slack integration

3. **Week 1 (Beta Launch):**
   - Send first survey on Friday
   - Monitor response rates
   - Prepare for first feedback session (Week 3)

---

## Questions or Issues?

Contact: PM  
Slack: #task-tool-beta  
Email: [PM Email]

---

**File Location:** `/designs/google-form-setup-guide.md`  
**Related Documents:**
- `designs/beta-feedback-weekly-survey.md` (Survey questions)
- `designs/beta-feedback-session-agenda.md` (Feedback sessions)
- `designs/beta-weekly-progress-template.md` (Weekly updates)