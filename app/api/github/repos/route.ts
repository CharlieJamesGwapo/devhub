import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: NextRequest) {
  try {
    const owner = process.env.GITHUB_REPO_OWNER || ''
    const repo = process.env.GITHUB_REPO_NAME || ''

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub credentials not configured' },
        { status: 400 }
      )
    }

    // Get repository information
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    })

    // Get recent issues
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 10,
    })

    // Get recent pull requests
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 10,
    })

    return NextResponse.json({
      repository: {
        name: repoData.name,
        description: repoData.description,
        url: repoData.html_url,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        updatedAt: repoData.updated_at,
      },
      issues: issues.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      })),
      pullRequests: prs.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
      })),
    })
  } catch (error: any) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}
