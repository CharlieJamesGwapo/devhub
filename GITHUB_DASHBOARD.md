# GitHub Dashboard Component

## Overview
The `GitHubDashboard.tsx` component is a React component that displays a comprehensive overview of GitHub user activity and repositories. It uses the Octokit API to fetch data and Recharts for visualization.

## Features
- **Repository Overview**: Lists user's repositories with stars, forks, and language info
- **Commit Activity**: Line chart showing commit activity over the last 7 days
- **Pull Requests**: List of recent pull requests with state and creation date
- **Issues**: List of recent issues with state and creation date
- **Language Distribution**: Pie chart showing the distribution of programming languages
- **Statistics Cards**: Quick stats for total repos, stars, forks, and open PRs/issues

## Component Props
```typescript
interface GitHubDashboardProps {
  owner: string        // GitHub username (required)
  token?: string       // GitHub API token (optional, can use env variable)
}
```

## Usage
```tsx
import GitHubDashboard from '@/components/GitHubDashboard'

export default function Page() {
  return <GitHubDashboard owner="octocat" token="ghp_..." />
}
```

## Environment Variables
Set these in your `.env.local` file:
- `NEXT_PUBLIC_GITHUB_OWNER`: Default GitHub username to display
- `GITHUB_TOKEN`: GitHub API authentication token (recommended for higher rate limits)

## Installation
The component requires these npm packages:
```bash
npm install @octokit/rest recharts
```

These are already installed in the project.

## API Integration
The component uses Octokit to make GitHub API calls:
- `repos.listForUser()`: Fetch user repositories
- `search.issuesAndPullRequests()`: Search for user's PRs and issues
- `repos.getCommitActivityStats()`: Fetch commit activity data

## Rate Limiting
GitHub API has rate limits:
- Authenticated requests: 5,000 requests per hour
- Unauthenticated requests: 60 requests per hour

Always use a GitHub token for production use to avoid hitting rate limits.

## Styling
The component uses Tailwind CSS for styling and is responsive across different screen sizes.

## Loading States
- Loading state: Shows "Loading GitHub data..." message
- Error state: Shows error message if API call fails
- Empty states: Shows appropriate messages when no data is available

## Component Location
- **File**: `/Users/a1234/devhub/components/GitHubDashboard.tsx`
- **Page Route**: `/github-dashboard` (available at `/app/github-dashboard/page.tsx`)
