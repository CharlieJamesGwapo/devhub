# AI Commit Message Generator - Quick Start Guide

## What's New?

DevHub now includes an **AI Commit Message Generator** that automatically generates meaningful commit messages from your code diffs using OpenAI's GPT-4 Turbo.

## Where to Find It

The generator is integrated into the **GitHub Dashboard** and appears at the bottom of the page, below the Issues section.

Or visit the standalone page: `/commit-generator`

## How to Use (3 Steps)

### Step 1: Get Your Diff
```bash
# Stage changes and get diff
git diff --staged

# Or get all changes
git diff

# Copy the output to clipboard
```

### Step 2: Open Generator
Navigate to GitHub Dashboard and scroll to the bottom, or go to `/commit-generator` page.

### Step 3: Generate
1. Paste your diff into the textarea
2. (Optional) Add context like a JIRA ticket ID
3. Select your style: Conventional, Descriptive, or Concise
4. Click "Generate Commit Messages"
5. Copy your favorite suggestion

## Features

- **3 Suggestions**: Get 3 different message variations
- **Smart Analysis**: Understands what changed in your code
- **Multiple Styles**: Choose how detailed your messages should be
- **Copy Button**: One-click copying
- **Type Detection**: Automatically identifies commit type (feat, fix, etc.)

## Commit Styles Explained

| Style | Use Case | Example |
|-------|----------|---------|
| **Conventional** | Follow conventional commits standard | `feat: add user authentication` |
| **Descriptive** | Detailed explanations | `Add user authentication system with JWT support and secure token storage` |
| **Concise** | Brief and to the point | `Add auth system` |

## Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style changes
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Tests
- **chore**: Build/dependency changes

## Tips

✅ **Do:**
- Include meaningful diffs
- Add context (e.g., "JIRA-123: User login feature")
- Use conventional style for public projects
- Copy the exact message AI generates

❌ **Don't:**
- Paste entire file contents
- Use vague diffs
- Ignore the AI suggestions completely
- Modify the message format significantly

## Example Workflow

```bash
# 1. Make changes and stage them
git add src/auth.ts src/login.tsx

# 2. Get the diff
git diff --staged > diff.txt

# 3. Copy diff to AI generator
# (Open DevHub, paste diff)

# 4. Generator suggests:
#   - feat(auth): implement user authentication
#   - feat(login): add login functionality with JWT
#   - feat: add authentication and login system

# 5. Copy chosen message
# 6. Commit
git commit -m "feat(auth): implement user authentication"
```

## Environment Setup

Make sure your `.env` file has:
```env
OPENAI_API_KEY=sk-...
```

## Troubleshooting

**Error: "OpenAI API key not configured"**
- Add `OPENAI_API_KEY` to `.env`
- Restart dev server: `npm run dev`

**Error: "Failed to generate"**
- Check diff is valid (use `git diff --cached`)
- Ensure diff isn't too large (>10000 chars)
- Try adding more context

**Slow generation?**
- Large diffs take longer
- Check your OpenAI API quota
- Try breaking into smaller commits

## Files Modified/Created

```
components/AICommitGenerator.tsx          ← New component
app/api/ai/generate-commit-message/       ← New API endpoint
components/GitHubDashboard.tsx            ← Updated (integrated generator)
pages/commit-generator.tsx                ← Demo page
AI_COMMIT_GENERATOR.md                    ← Full documentation
IMPLEMENTATION_SUMMARY.md                 ← Technical details
QUICK_START_COMMIT_GENERATOR.md          ← This file
```

## Questions?

See `AI_COMMIT_GENERATOR.md` for full documentation or `IMPLEMENTATION_SUMMARY.md` for technical details.

---

**Ready to use!** Head to the GitHub Dashboard and scroll down to try it out.
