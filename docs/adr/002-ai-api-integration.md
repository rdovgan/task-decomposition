# ADR-002: AI API Integration Pattern

## Status
**Accepted** (2026-04-01)

## Context
The Task Decomposition Tool uses AI (Claude API) to break down high-level tasks into subtasks. We need to decide how to integrate AI services safely, reliably, and cost-effectively.

## Decision

### Architecture: Service Layer Pattern
We will use a **dedicated service layer** for AI interactions:

```typescript
class TaskDecompositionService {
  private client: Anthropic;

  async decompose(request: DecompositionRequest): Promise<DecompositionResponse> {
    // 1. Build prompt with context
    // 2. Call Claude API
    // 3. Parse and validate response
    // 4. Return structured suggestions
  }
}
```

### API Integration Approach
1. **Direct SDK usage**: Use `@anthropic-ai/sdk` for type safety
2. **Structured output**: Request JSON format for predictable parsing
3. **Timeout handling**: 30-second timeout for API calls
4. **Error wrapping**: Convert API errors to user-friendly messages

### Prompt Strategy
- **Context-first**: Include project → epic → task hierarchy
- **Explicit instructions**: Clear requirements for output format
- **Examples**: Show expected JSON structure in prompt
- **Constraints**: Specify subtask count, time estimates, dependencies

### Response Handling
```typescript
// Parse JSON from markdown code blocks
const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);

// Validate structure
if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
  throw new Error('Invalid response format');
}

// Sanitize and validate each field
const subtasks = parsed.subtasks.map(st => ({
  title: st.title || `Subtask ${index + 1}`,
  estimatedHours: Number(st.estimatedHours) || 2,
  priority: validatePriority(st.priority),
  // ...
}));
```

### Error Handling
1. **Rate limits**: User-friendly message to retry later
2. **Auth failures**: Clear message to check API key
3. **Timeout**: Graceful degradation with manual entry option
4. **Parse errors**: Fallback to raw response display
5. **Validation errors**: Default values for missing fields

### Cost Management
1. **Token limits**: Max 4096 tokens for response
2. **Model selection**: Configurable model (default: claude-sonnet-4-6)
3. **Caching**: Consider caching similar decomposition requests
4. **Usage tracking**: Log API call counts and costs

## Consequences

### Positive
- Clean separation: AI logic isolated from controllers
- Testable: Service can be mocked in tests
- Maintainable: Easy to update prompt or switch models
- Type-safe: End-to-end TypeScript types
- Reliable: Structured output reduces parsing errors

### Negative
- Additional service layer adds complexity
- Network dependency introduces latency
- API costs scale with usage
- Requires error handling for network failures

### Alternatives Considered
1. **API calls in controllers**: Rejected - hard to test, mixes concerns
2. **Third-party AI gateway**: Rejected - vendor lock-in, additional cost
3. **Local model**: Rejected - insufficient hardware, lower quality
4. **Prompt in database**: Rejected - version control issues, complexity

## Implementation Notes

### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6  # Optional, default provided
```

### API Usage
```typescript
// In controller
const suggestions = await taskDecompositionService.decompose({
  task: { title, description },
  epic: { title, description },
  project: { name, description }
});

// User reviews and approves/rejects/edit suggestions
// Then create tasks from approved suggestions
```

### Future Enhancements
1. **Streaming responses**: Show subtasks as they're generated
2. **Few-shot examples**: Include past decompositions in prompt
3. **Fine-tuning**: Custom model for domain-specific decompositions
4. **Multi-model comparison**: Get suggestions from multiple models
5. **Feedback loop**: Learn from user edits to improve prompts
6. **Cost tracking**: Display estimated API cost per decomposition

## Security Considerations
- API key stored in environment variables, never in code
- No PII sent to AI (sanitized task descriptions)
- Rate limiting to prevent abuse
- Audit logging for all AI API calls

## Performance
- Timeout: 30 seconds
- Typical response time: 3-8 seconds
- Retry logic: Exponential backoff for rate limits
- Fallback: Allow manual subtask entry if AI fails
