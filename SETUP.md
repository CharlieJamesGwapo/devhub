# DevHub Next.js 15 Setup

A modern developer collaboration platform with real-time messaging and team workspace management.

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication
- **Socket.io** - Real-time messaging
- **OpenAI SDK** - AI integration

## Project Structure

```
devhub/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── dashboard/         # Dashboard page
│   ├── messages/          # Messages page
│   ├── team/             # Team management
│   └── settings/         # Settings page
├── components/           # React components
│   ├── DashboardLayout
│   ├── Sidebar
│   └── Header
├── lib/                 # Utility functions
├── prisma/             # Database schema
├── public/             # Static assets
├── pages/api/          # API routes
└── Configuration files (tsconfig.json, next.config.ts, etc.)
```

## Quick Start

### 1. Install Dependencies
```bash
cd ~/devhub
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
# Update environment variables
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb devhub

# Initialize Prisma
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

✓ Dashboard with analytics  
✓ Responsive sidebar navigation  
✓ Header with search  
✓ Messages page with channels  
✓ Team management  
✓ Settings page  
✓ Tailwind CSS styling  
✓ TypeScript support  
✓ Prisma database models  
✓ NextAuth.js authentication  
✓ Socket.io real-time support  
✓ OpenAI integration  

## Database Models

- User - User accounts
- Account - OAuth accounts
- Session - Session management
- Workspace - Team workspaces
- Channel - Message channels
- Message - Chat messages

## Next Steps

1. Configure NextAuth.js (GitHub/Google OAuth)
2. Implement Socket.io server
3. Add OpenAI API endpoints
4. Create API routes
5. Deploy to Vercel

## Git Repository

Initialized with git. Make commits to track changes.
