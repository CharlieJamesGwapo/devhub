import DashboardLayout from '@/components/DashboardLayout'
import GitHubDashboard from '@/components/GitHubDashboard'

export default function GitHubDashboardPage() {
  const githubOwner = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'torvalds'
  const githubToken = process.env.GITHUB_TOKEN

  return (
    <DashboardLayout>
      <GitHubDashboard owner={githubOwner} token={githubToken} />
    </DashboardLayout>
  )
}
