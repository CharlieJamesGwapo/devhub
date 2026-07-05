# AI Commit Message Generator

## Overview

The AI Commit Message Generator is an intelligent feature integrated into the GitHub Dashboard that automatically generates meaningful commit messages based on code diffs using OpenAI's GPT-4 Turbo model.

## Features

- **Smart Analysis**: Analyzes git diffs to understand what changed
- **Multiple Suggestions**: Generates 3 commit message variations to choose from
- **Conventional Commits**: Supports conventional commits format (feat, fix, docs, etc.)
- **Flexible Styles**: Choose between conventional, descriptive, or concise commit messages
- **Copy to Clipboard**: One-click copying of generated messages
- **Context Aware**: Optional context field for additional information (JIRA tickets, feature names, etc.)

## Setup

### 1. Environment Variables

Make sure your `.env` file includes:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Component Location

- **Component**: `/components/AICommitGenerator.tsx`
- **API Endpoint**: `/app/api/ai/generate-commit-message/route.ts`
- **Integration**: `/components/GitHubDashboard.tsx`

## Usage

### In the GitHub Dashboard

1. Navigate to the GitHub Dashboard
2. Scroll down to the "AI Commit Message Generator" section
3. Paste your git diff (use `git diff` or `git diff --staged`)
4. (Optional) Add context like a JIRA ticket ID or feature name
5. Select your preferred commit style:
   - **Conventional**: Follows conventional commits format
   - **Descriptive**: Provides detailed descriptions
   - **Concise**: Keeps messages brief and focused
6. Click "Generate Commit Messages"
7. Review the suggestions and copy the one you prefer

### Programmatic Usage

```tsx
import AICommitGenerator from '@/components/AICommitGenerator'

function MyComponent() {
  const handleSelectMessage = (message: CommitMessage) => {
    console.log('Selected:', message.title)
    // Handle the selected message
  }

  return (
    <AICommitGenerator
      onSelectMessage={handleSelectMessage}
      placeholder="Paste git diff..."
    />
  )
}
```

## API Endpoint

### POST `/api/ai/generate-commit-message`

**Request Body:**
```json
{
  "diff": "git diff output",
  "context": "optional context string",
  "style": "conventional|descriptive|concise",
  "maxMessages": 3
}
```

**Response:**
```json
{
  "messages": [
    {
      "title": "feat: add AI commit message generator",
      "body": "Integrated OpenAI GPT-4 to automatically generate meaningful commit messages from code diffs",
      "type": "feat"
    }
  ]
}
```

## Commit Message Types

The generator categorizes commits into these types:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, etc.

## Configuration

### Max Tokens

The API is configured to use:
- Model: `gpt-4-turbo`
- Max tokens: 1024

To adjust these values, edit `/app/api/ai/generate-commit-message/route.ts`

### Diff Size Limit

Large diffs (>5000 characters) are automatically truncated to prevent excessive token usage. To change this limit:

```typescript
const truncatedDiff = diff.length > 5000 ? diff.substring(0, 5000) + '\n...(truncated)' : diff
```

## Error Handling

The component handles the following errors gracefully:

- Missing OpenAI API key
- Missing diff input
- API failures
- JSON parsing errors
- Network errors

All errors are displayed to the user with clear messages.

## Dependencies

- `openai`: For API calls to OpenAI
- `lucide-react`: For icons (Copy, Loader, AlertCircle, Check)
- `react`: For component state management
- Next.js: For API routes and server-client communication

## Performance Tips

1. **Trim large diffs**: If your diff is very large, the generator will truncate it to 5000 characters
2. **Add context**: Including context helps the AI generate better messages
3. **Choose appropriate style**: Descriptive style takes more tokens; use concise for faster generation

## Troubleshooting

### "OpenAI API key not configured"
- Check that `OPENAI_API_KEY` is set in your `.env` file
- Restart the development server after updating environment variables

### "Failed to parse commit message response"
- This indicates the OpenAI response was unexpected
- Check the browser console for the raw response
- Try adjusting the diff or adding more context

### Slow generation
- Large diffs take longer to process
- Consider breaking up large commits into smaller ones
- Check your OpenAI API rate limits

## Future Enhancements

- Support for multiple AI models
- Commit message templates
- Integration with Git hooks for automatic message generation
- Customizable commit type taxonomies
- Message history and caching
- Batch processing for multiple commits

## License

Part of DevHub - Developer Collaboration Platform
