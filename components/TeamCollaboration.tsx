'use client'

import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  Users,
  MessageCircle,
  Clock,
  Briefcase,
  Shield,
  Plus,
  Send,
  Trash2,
  Edit2,
  ChevronDown,
  RefreshCw,
  User,
  AlertCircle,
  Check,
} from 'lucide-react'

interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'developer' | 'viewer'
  avatar?: string
  joinedAt: string
  status: 'online' | 'offline' | 'away'
}

interface Comment {
  id: string
  authorId: string
  author: string
  content: string
  timestamp: string
  edited?: boolean
  replies?: Comment[]
}

interface ActivityEvent {
  id: string
  type: 'member_joined' | 'member_left' | 'comment_added' | 'member_role_changed' | 'workspace_created'
  actor: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface Workspace {
  id: string
  name: string
  description: string
  createdAt: string
  memberCount: number
  members: WorkspaceMember[]
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-300',
  manager: 'bg-blue-100 text-blue-800 border-blue-300',
  developer: 'bg-green-100 text-green-800 border-green-300',
  viewer: 'bg-gray-100 text-gray-800 border-gray-300',
}

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
}

export default function TeamCollaboration() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('')
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([])
  const [newComment, setNewComment] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState('user-' + Math.random().toString(36).substr(2, 9))
  const [currentUserName, setCurrentUserName] = useState('Current User')
  const socketRef = useRef<Socket | null>(null)
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    setConnectionStatus('connecting')
    socketRef.current = io(window.location.origin, {
      path: '/api/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      setConnectionStatus('connected')
      // Request initial data
      socketRef.current?.emit('request-collaboration-data', (data: any) => {
        if (data?.workspaces) setWorkspaces(data.workspaces)
        if (data?.comments) setComments(data.comments)
        if (data?.activity) setActivityFeed(data.activity)
      })
    })

    // Real-time updates
    socketRef.current.on('member:joined', (member: WorkspaceMember) => {
      setMembers((prev) => [...prev, member])
      addActivityEvent({
        type: 'member_joined',
        actor: member.name,
        description: `${member.name} joined the workspace`,
      })
    })

    socketRef.current.on('member:left', (memberId: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      addActivityEvent({
        type: 'member_left',
        actor: 'System',
        description: 'A member left the workspace',
      })
    })

    socketRef.current.on('member:role-changed', (data: { memberId: string; newRole: string; changedBy: string }) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === data.memberId ? { ...m, role: data.newRole as any } : m))
      )
      addActivityEvent({
        type: 'member_role_changed',
        actor: data.changedBy,
        description: `Role changed to ${data.newRole}`,
      })
    })

    socketRef.current.on('comment:added', (comment: Comment) => {
      setComments((prev) => [comment, ...prev])
      addActivityEvent({
        type: 'comment_added',
        actor: comment.author,
        description: `${comment.author} added a comment`,
      })
    })

    socketRef.current.on('member:status-changed', (data: { memberId: string; status: string }) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === data.memberId ? { ...m, status: data.status as any } : m))
      )
    })

    socketRef.current.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    // Initialize with demo data
    initializeDemoData()

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const initializeDemoData = () => {
    const demoWorkspaces: Workspace[] = [
      {
        id: 'ws-1',
        name: 'Main Project',
        description: 'Primary development workspace',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        memberCount: 5,
        members: [],
      },
      {
        id: 'ws-2',
        name: 'DevOps Team',
        description: 'Infrastructure and deployment',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        memberCount: 3,
        members: [],
      },
      {
        id: 'ws-3',
        name: 'Design Review',
        description: 'UI/UX collaboration space',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        memberCount: 4,
        members: [],
      },
    ]

    setWorkspaces(demoWorkspaces)
    setSelectedWorkspace(demoWorkspaces[0].id)

    const demoMembers: WorkspaceMember[] = [
      {
        id: 'member-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'admin',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'online',
      },
      {
        id: 'member-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'developer',
        joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'online',
      },
      {
        id: 'member-3',
        name: 'Carol Williams',
        email: 'carol@example.com',
        role: 'manager',
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'away',
      },
      {
        id: 'member-4',
        name: 'David Lee',
        email: 'david@example.com',
        role: 'developer',
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'offline',
      },
      {
        id: 'member-5',
        name: 'Eve Brown',
        email: 'eve@example.com',
        role: 'viewer',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'online',
      },
    ]

    setMembers(demoMembers)

    const demoComments: Comment[] = [
      {
        id: 'comment-1',
        authorId: 'member-1',
        author: 'Alice Johnson',
        content: 'Great progress on the authentication module. The API integration looks solid.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [],
      },
      {
        id: 'comment-2',
        authorId: 'member-2',
        author: 'Bob Smith',
        content: 'Thanks! I optimized the database queries as suggested. Performance improved by 40%.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: [],
      },
      {
        id: 'comment-3',
        authorId: 'member-3',
        author: 'Carol Williams',
        content: 'Schedule review meeting for next Wednesday. Please confirm attendance.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        replies: [],
      },
    ]

    setComments(demoComments)

    const demoActivity: ActivityEvent[] = [
      {
        id: 'activity-1',
        type: 'member_joined',
        actor: 'Eve Brown',
        description: 'Eve Brown joined the workspace',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-2',
        type: 'member_role_changed',
        actor: 'Alice Johnson',
        description: 'David Lee role changed to developer',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-3',
        type: 'comment_added',
        actor: 'Bob Smith',
        description: 'Bob Smith added a comment on the project',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-4',
        type: 'workspace_created',
        actor: 'Alice Johnson',
        description: 'Main Project workspace was created',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setActivityFeed(demoActivity)
  }

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event,
    }
    setActivityFeed((prev) => [newEvent, ...prev])
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUserId,
      author: currentUserName,
      content: newComment,
      timestamp: new Date().toISOString(),
      replies: [],
    }

    socketRef.current?.emit('comment:add', comment)
    setComments((prev) => [comment, ...prev])
    setNewComment('')
    addActivityEvent({
      type: 'comment_added',
      actor: currentUserName,
      description: `${currentUserName} added a comment`,
    })
  }

  const handleChangeRole = (memberId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole as any } : m))
    )
    socketRef.current?.emit('member:change-role', { memberId, newRole, changedBy: currentUserName })
    addActivityEvent({
      type: 'member_role_changed',
      actor: currentUserName,
      description: `Changed role to ${newRole}`,
    })
    setEditingMemberId(null)
  }

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    socketRef.current?.emit('comment:delete', commentId)
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    socketRef.current?.emit('member:remove', memberId)
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
      case 'member_left':
        return <Users size={16} className="text-blue-600" />
      case 'comment_added':
        return <MessageCircle size={16} className="text-green-600" />
      case 'member_role_changed':
        return <Shield size={16} className="text-purple-600" />
      case 'workspace_created':
        return <Briefcase size={16} className="text-orange-600" />
      default:
        return <Clock size={16} className="text-gray-600" />
    }
  }

  const currentWorkspace = workspaces.find((w) => w.id === selectedWorkspace)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              Team Collaboration
            </h1>
            <p className="text-gray-600 mt-2">
              Workspace management, member coordination, and real-time communication
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-600' : 'bg-gray-600'
                }`}
              />
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase size={24} className="text-orange-600" />
            Workspaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setSelectedWorkspace(ws.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedWorkspace === ws.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                }`}
              >
                <h3 className="font-bold text-gray-900 mb-2">{ws.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{ws.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{ws.memberCount} members</span>
                  <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {currentWorkspace && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members Section */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={24} className="text-green-600" />
                Members ({members.length})
              </h2>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            STATUS_COLORS[member.status]
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      {editingMemberId === member.id ? (
                        <select
                          value={selectedRole || member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="developer">Developer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded border ${ROLE_COLORS[member.role]}`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (editingMemberId === member.id) {
                            setEditingMemberId(null)
                          } else {
                            setEditingMemberId(member.id)
                            setSelectedRole(member.role)
                          }
                        }}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      Joined {formatTimeAgo(member.joinedAt)}
                    </p>

                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="w-full text-xs bg-red-50 text-red-600 hover:bg-red-100 py-1 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments & Activity Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle size={24} className="text-green-600" />
                  Comments
                </h2>

                {/* Comment Input */}
                <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts or updates..."
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors font-medium text-sm"
                  >
                    <Send size={16} />
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div ref={commentsContainerRef} className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No comments yet. Be the first to share!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {comment.author.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {comment.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(comment.timestamp)}
                              </p>
                            </div>
                          </div>
                          {comment.authorId === currentUserId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        {comment.edited && (
                          <p className="text-xs text-gray-400 mt-2 italic">edited</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-purple-600" />
                  Activity Feed
                </h2>
                <div className="space-y-4">
                  {activityFeed.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    activityFeed.map((activity) => (
                      <div
                        key={activity.id}
                        className="border-l-4 border-gray-200 pl-4 py-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">{activity.actor}</span>
                              <span className="text-gray-600"> {activity.description}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
