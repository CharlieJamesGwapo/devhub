# DevHub - Developer Collaboration Platform

A comprehensive developer collaboration platform with AI-powered tools, real-time features, infrastructure management, and team collaboration capabilities.

## Features (15 Total)

### AI-Powered Features
1. **AI Code Explainer** - Analyze and explain code snippets using OpenAI
2. **AI Commit Message Generator** - Automatically generate meaningful commit messages
3. **AI Documentation Writer** - Generate documentation for your code
4. **AI Error Analyzer** - Analyze and suggest fixes for errors
5. **AI SQL Generator** - Generate SQL queries from natural language

### Infrastructure & Deployment
6. **Kubernetes Dashboard** - View and manage Kubernetes clusters, namespaces, deployments, and pods
7. **Docker Manager** - View and manage Docker containers and images
8. **Deployments Manager** - Manage and monitor deployments across environments
9. **Logs Viewer** - Real-time logs from applications and infrastructure

### Development Tools
10. **Database Explorer** - Query and explore database schemas
11. **SQL Playground** - Interactive SQL query builder and executor
12. **API Tester** - Test API endpoints with request/response formatting
13. **GitHub Dashboard** - View GitHub repositories, issues, and pull requests
14. **Code Snippets Manager** - Save and organize code snippets
15. **Team Collaboration** - Real-time team messaging and collaboration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL, MySQL (via Prisma ORM)
- **Infrastructure**: Kubernetes, Docker
- **AI**: OpenAI API
- **Authentication**: NextAuth.js
- **APIs**: Octokit (GitHub), Docker API, Kubernetes API

## Prerequisites

- Node.js 18.0 or later
- npm or yarn
- PostgreSQL or MySQL database
- Docker (optional, for Docker features)
- Kubernetes cluster access (optional, for K8s features)
- OpenAI API key for AI features
- GitHub API token for GitHub features

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/devhub.git
cd devhub
npm install
```

### 2. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Update the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devhub"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"

# AI & APIs
OPENAI_API_KEY="sk-..."
GITHUB_TOKEN="ghp_..."
GITHUB_REPO_OWNER="your-username"
GITHUB_REPO_NAME="your-repo"

# Optional: Infrastructure
KUBERNETES_CONFIG_PATH="/path/to/kubeconfig"
DOCKER_HOST="unix:///var/run/docker.sock"

# Real-time
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running with Socket.io

For full real-time functionality, use the custom Next.js server:

```bash
npm run dev
```

The Socket.io server is automatically initialized on the Next.js server.

## API Endpoints

### AI Features
- `POST /api/ai/generate-commit-message` - Generate commit messages
- `POST /api/explain-code` - Explain code
- `POST /api/generate-docs` - Generate documentation
- `POST /api/generate-sql` - Generate SQL queries
- `POST /api/ai/analyze-error` - Analyze errors

### Docker
- `GET /api/docker/images` - List Docker images
- `GET /api/docker/containers` - List Docker containers
- `POST /api/docker/containers/[id]/start` - Start container
- `POST /api/docker/containers/[id]/stop` - Stop container
- `GET /api/docker/logs/[id]` - Get container logs
- `GET /api/docker/stats/[id]` - Get container stats

### Kubernetes
- `GET /api/kubernetes/cluster-status` - Get cluster status
- `GET /api/kubernetes/namespaces` - List namespaces
- `GET /api/kubernetes/deployments` - List deployments
- `GET /api/kubernetes/pods` - List pods
- `GET /api/kubernetes/pods/[namespace]/[name]/logs` - Get pod logs
- `POST /api/kubernetes/deployments/[namespace]/[name]/restart` - Restart deployment

### Database
- `GET /api/query` - Execute database queries
- `POST /api/query` - Execute database queries with parameters

### Logs
- `GET /api/logs` - Get application logs

## Architecture

```
devhub/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── ai/              # AI features
│   │   ├── docker/          # Docker integration
│   │   ├── kubernetes/      # Kubernetes integration
│   │   └── ...
│   ├── dashboard/           # Main dashboard
│   ├── database/            # Database explorer
│   ├── docker/              # Docker manager page
│   ├── kubernetes/          # Kubernetes dashboard page
│   ├── logs/                # Logs viewer
│   └── ...
├── components/              # React components
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── K8sViewer.tsx
│   ├── DockerManager.tsx
│   ├── AICommitGenerator.tsx
│   └── ...
├── lib/                     # Utility functions
│   ├── socket.ts            # Socket.io setup
│   ├── socket-handler.ts    # Socket.io utilities
│   └── ...
├── prisma/                  # Database schema
└── public/                  # Static assets
```

## Real-time Features

DevHub uses Socket.io for real-time features:

- **Live Logs**: Stream logs in real-time
- **Team Collaboration**: Real-time messaging and presence
- **Notifications**: Push notifications for events
- **Live Updates**: Auto-refresh for deployments and container status

### Socket.io Events

- `connection` - Client connected
- `disconnect` - Client disconnected
- `log` - New log entry
- `logs:batch` - Batch of logs
- `request-logs` - Request stored logs

## Building for Production

```bash
npm run build
npm run start
```

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Environment Configuration

### Required Variables
- `DATABASE_URL` - PostgreSQL or MySQL connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js
- `OPENAI_API_KEY` - OpenAI API key

### Optional Variables
- `GITHUB_TOKEN` - GitHub API token
- `KUBERNETES_CONFIG_PATH` - Path to kubeconfig
- `DOCKER_HOST` - Docker daemon socket path
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io URL (default: http://localhost:3000)

## Error Handling

DevHub includes comprehensive error handling:

- **API Errors**: All routes include try-catch blocks with meaningful error messages
- **Loading States**: Suspense boundaries for async operations
- **User Feedback**: Toast notifications for user actions
- **Logging**: All errors are logged to the logs viewer

## Performance

- **Code Splitting**: Automatic code splitting via Next.js
- **Image Optimization**: Next.js Image component usage
- **Caching**: Server-side caching for expensive operations
- **Real-time Updates**: Socket.io for efficient updates

## Security

- **Authentication**: NextAuth.js with secret-based sessions
- **Authorization**: API route protection
- **CORS**: Configured for Socket.io
- **Environment Variables**: Sensitive data stored in .env.local
- **Database**: Prisma ORM for SQL injection prevention

## Troubleshooting

### Socket.io Connection Issues
- Ensure `NEXT_PUBLIC_SOCKET_URL` matches your server URL
- Check CORS configuration in `lib/socket.ts`
- Verify no firewall blocking port 3000

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database server is running
- Run migrations: `npx prisma migrate dev`

### API Route Errors
- Check environment variables are set
- Review API response in browser network tab
- Check server logs for detailed error messages

### Docker/Kubernetes Connection Issues
- Verify Docker daemon is running
- Check kubeconfig path and permissions
- Ensure appropriate API credentials

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with meaningful message
5. Push and create a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Slack integration
- [ ] Webhook support
- [ ] Advanced analytics
- [ ] Team permission levels
- [ ] API documentation generator
- [ ] Performance monitoring
- [ ] Automated alerts
- [ ] Custom workflows

---

**DevHub v1.0.0** - Built with ❤️ for developers
