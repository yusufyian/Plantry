// 数据库配置
export const DATABASE_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'plantry',
  username: 'yuyan',
  password: '',
  ssl: false
}

// API基础配置
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.plantry.com/api' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 表名常量
export const TABLES = {
  USERS: 'users',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'team_members',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TAGS: 'tags',
  TASK_TAGS: 'task_tags',
  TASK_COMMENTS: 'task_comments',
  TASK_ATTACHMENTS: 'task_attachments',
  TASK_DEPENDENCIES: 'task_dependencies',
  TASK_EXTRACTION_LOGS: 'task_extraction_logs',
  NOTIFICATIONS: 'notifications',
  USER_SETTINGS: 'user_settings',
  TEAM_SETTINGS: 'team_settings',
  DAILY_DIGESTS: 'daily_digests',
  WORK_SESSIONS: 'work_sessions',
  AUDIT_LOGS: 'audit_logs'
}

// 枚举类型
export const ENUMS = {
  TASK_STATUS: {
    SEED: 'seed',
    SPROUT: 'sprout', 
    BLOSSOM: 'blossom',
    DONE: 'done'
  },
  TASK_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  USER_ROLE: {
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer'
  },
  NOTIFICATION_TYPE: {
    REMINDER: 'reminder',
    MENTION: 'mention',
    DEADLINE: 'deadline',
    COMPLETION: 'completion',
    ASSIGNMENT: 'assignment'
  },
  EXTRACTION_CONFIDENCE: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  }
} 