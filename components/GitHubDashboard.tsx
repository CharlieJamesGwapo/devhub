'use client'

import { useEffect, useState } from 'react'
import { Octokit } from '@octokit/rest'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import AICommitGenerator from './AICommitGenerator'

interface Repository {
  id: number
  name: string
  description: string | null
  url: string
  stars: number
  forks: number
  language: string | null
}

interface CommitData {
  date: string
  count: number
}

interface PullRequest {
  id: number
  title: string
  number: number
  state: string
  created_at: string
  url: string
  user: {
    login: string
  }
}

interface Issue {
  id: number
  title: string
  number: number
  state: string
  created_at: string
  url: string
  user: {
    login: string
  }
}

interface GitHubDashboardProps {
  owner: string
  token?: string
}

export default function GitHubDashboard({ owner, token }: GitHubDashboardProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [commitActivity, setCommitActivity] = useState<CommitData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalStars: 0,
    totalForks: 0,
    openPRs: 0,
    openIssues: 0,
  })

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true)
        setError(null)

        const octokit = new Octokit({
          auth: token || process.env.NEXT_PUBLIC_GITHUB_TOKEN,
        })

        // Fetch repositories
        const reposResponse = await octokit.repos.listForUser({
          username: owner,
          sort: 'updated',
          per_page: 10,
        })

        const repos: Repository[] = reposResponse.data.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
        }))

        setRepositories(repos)

        // Fetch pull requests across all repos
        const prsResponse = await octokit.search.issuesAndPullRequests({
          q: `is:pr author:${owner}`,
          sort: 'updated',
          per_page: 10,
        })

        const prs: PullRequest[] = prsResponse.data.items
          .filter((item: any) => item.pull_request)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            number: item.number,
            state: item.state,
            created_at: item.created_at,
            url: item.html_url,
            user: { login: item.user.login },
          }))

        setPullRequests(prs)

        // Fetch issues across all repos
        const issuesResponse = await octokit.search.issuesAndPullRequests({
          q: `is:issue author:${owner}`,
          sort: 'updated',
          per_page: 10,
        })

        const issuesList: Issue[] = issuesResponse.data.items
          .filter((item: any) => !item.pull_request)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            number: item.number,
            state: item.state,
            created_at: item.created_at,
            url: item.html_url,
            user: { login: item.user.login },
          }))

        setIssues(issuesList)

        // Fetch commit activity for the most recent repo
        if (repos.length > 0) {
          try {
            const commitsResponse = await octokit.repos.getCommitActivityStats({
              owner,
              repo: repos[0].name,
            })

            if (commitsResponse.data && Array.isArray(commitsResponse.data)) {
              const last7Days = commitsResponse.data
                .slice(-7)
                .map((week: any, index: number) => ({
                  date: `Day ${index + 1}`,
                  count: week.total || 0,
                }))

              setCommitActivity(last7Days)
            }
          } catch (err) {
            // Commit activity data may not be available for some repos
            console.log('Could not fetch commit activity')
          }
        }

        // Calculate stats
        const openPRCount = prs.filter((pr) => pr.state === 'open').length
        const openIssueCount = issuesList.filter(
          (issue) => issue.state === 'open'
        ).length
        const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0)
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0)

        setStats({
          totalRepos: repos.length,
          totalStars,
          totalForks,
          openPRs: openPRCount,
          openIssues: openIssueCount,
        })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch GitHub data'
        )
        console.error('Error fetching GitHub data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [owner, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading GitHub data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  const COLORS = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
  ]

  const languageStats = repositories
    .filter((repo) => repo.language)
    .reduce(
      (acc, repo) => {
        const existing = acc.find((item) => item.name === repo.language)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ name: repo.language!, value: 1 })
        }
        return acc
      },
      [] as { name: string; value: number }[]
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GitHub Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of {owner}&apos;s GitHub activity and repositories
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Repositories" value={stats.totalRepos} icon="📦" />
        <StatCard title="Total Stars" value={stats.totalStars} icon="⭐" />
        <StatCard title="Total Forks" value={stats.totalForks} icon="🍴" />
        <StatCard title="Open PRs" value={stats.openPRs} icon="🔀" />
        <StatCard title="Open Issues" value={stats.openIssues} icon="❗" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commit Activity Chart */}
        {commitActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Commit Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={commitActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  name="Commits"
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Language Distribution */}
        {languageStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Language Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Repositories Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Repositories
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {repositories.length > 0 ? (
            repositories.map((repo) => (
              <div key={repo.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
                    >
                      {repo.name}
                    </a>
                    {repo.description && (
                      <p className="text-gray-600 mt-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {repo.language && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-gray-500">No repositories found</div>
          )}
        </div>
      </div>

      {/* Pull Requests Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Pull Requests
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pullRequests.length > 0 ? (
            pullRequests.map((pr) => (
              <div key={pr.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      #{pr.number} {pr.title}
                    </a>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span
                        className={`inline-block px-2 py-1 rounded text-white ${
                          pr.state === 'open'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {pr.state}
                      </span>
                      <span>by {pr.user.login}</span>
                      <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-gray-500">No pull requests found</div>
          )}
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <div key={issue.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      #{issue.number} {issue.title}
                    </a>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span
                        className={`inline-block px-2 py-1 rounded text-white ${
                          issue.state === 'open'
                            ? 'bg-yellow-500'
                            : 'bg-purple-500'
                        }`}
                      >
                        {issue.state}
                      </span>
                      <span>by {issue.user.login}</span>
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-gray-500">No issues found</div>
          )}
        </div>
      </div>

      {/* AI Commit Generator Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <AICommitGenerator
          placeholder="Paste your git diff here..."
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: string
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
