-- Plantry 数据库结构设计 (PostgreSQL)
-- 基于 Telegram 的AI驱动项目管理系统

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 枚举类型定义
CREATE TYPE task_status AS ENUM ('seed', 'sprout', 'blossom', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('reminder', 'mention', 'deadline', 'completion', 'assignment');
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE extraction_confidence AS ENUM ('high', 'medium', 'low');

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'UTC',
    language_code VARCHAR(10) DEFAULT 'zh-CN',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 团队表
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    telegram_chat_id BIGINT UNIQUE,
    telegram_chat_type VARCHAR(50), -- 'group', 'supergroup', 'channel'
    bot_token VARCHAR(500), -- 加密存储
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 团队成员表
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- 项目表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3498db', -- 十六进制颜色
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#95a5a6',
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, name)
);

-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'seed',
    priority task_priority DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER, -- 预估工时（小时）
    actual_hours INTEGER, -- 实际工时（小时）
    position INTEGER DEFAULT 0, -- 在看板中的位置
    telegram_message_id BIGINT, -- 关联的Telegram消息ID
    telegram_thread_id BIGINT, -- Telegram消息线程ID
    ai_extracted BOOLEAN DEFAULT false, -- 是否由AI抽取
    ai_confidence DECIMAL(3,2), -- AI抽取置信度 0-1
    metadata JSONB DEFAULT '{}', -- 扩展字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任务标签关联表
CREATE TABLE task_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, tag_id)
);

-- 任务评论表
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    telegram_message_id BIGINT, -- 关联Telegram消息
    is_system_comment BOOLEAN DEFAULT false, -- 系统自动评论
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任务附件表
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT, -- 文件大小（字节）
    file_type VARCHAR(100), -- MIME类型
    file_path TEXT NOT NULL, -- 存储路径
    telegram_file_id VARCHAR(500), -- Telegram文件ID
    is_encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任务依赖关系表
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predecessor_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    successor_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(predecessor_id, successor_id),
    CHECK (predecessor_id != successor_id)
);

-- AI任务抽取日志表
CREATE TABLE task_extraction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    telegram_message_id BIGINT NOT NULL,
    original_message TEXT NOT NULL,
    extracted_data JSONB, -- 抽取的结构化数据
    confidence_score DECIMAL(3,2), -- 置信度分数
    confidence_level extraction_confidence,
    is_confirmed BOOLEAN, -- 用户是否确认
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    task_id UUID REFERENCES tasks(id), -- 最终创建的任务ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE, -- 计划发送时间
    sent_at TIMESTAMP WITH TIME ZONE, -- 实际发送时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户设置表
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id, setting_key)
);

-- 团队设置表
CREATE TABLE team_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, setting_key)
);

-- 每日汇总表
CREATE TABLE daily_digests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    digest_date DATE NOT NULL,
    total_tasks_created INTEGER DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0,
    total_tasks_overdue INTEGER DEFAULT 0,
    digest_content JSONB, -- 汇总内容
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, digest_date)
);

-- 工作时间记录表
CREATE TABLE work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- 工作时长（分钟）
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'assign', etc.
    resource_type VARCHAR(100) NOT NULL, -- 'task', 'project', 'team', etc.
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_telegram_chat_id ON teams(telegram_chat_id);
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_telegram_message_id ON tasks(telegram_message_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_extraction_logs_team_message ON task_extraction_logs(team_id, telegram_message_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_work_sessions_user_task ON work_sessions(user_id, task_id);

-- 全文搜索索引
CREATE INDEX idx_tasks_title_gin ON tasks USING gin(to_tsvector('chinese', title));
CREATE INDEX idx_tasks_description_gin ON tasks USING gin(to_tsvector('chinese', description));
CREATE INDEX idx_task_comments_content_gin ON task_comments USING gin(to_tsvector('chinese', content));

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_settings_updated_at BEFORE UPDATE ON team_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：任务详情视图
CREATE VIEW task_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.completed_at,
    t.estimated_hours,
    t.actual_hours,
    t.ai_extracted,
    t.ai_confidence,
    t.created_at,
    t.updated_at,
    u_assignee.username as assignee_username,
    u_assignee.first_name as assignee_first_name,
    u_assignee.last_name as assignee_last_name,
    u_creator.username as creator_username,
    u_creator.first_name as creator_first_name,
    u_creator.last_name as creator_last_name,
    p.name as project_name,
    p.color as project_color,
    team.name as team_name,
    CASE 
        WHEN t.due_date IS NOT NULL AND t.due_date < CURRENT_TIMESTAMP AND t.status != 'done' 
        THEN true 
        ELSE false 
    END as is_overdue,
    (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count,
    (SELECT COUNT(*) FROM task_attachments ta WHERE ta.task_id = t.id) as attachment_count,
    (SELECT COUNT(*) FROM tasks subtasks WHERE subtasks.parent_task_id = t.id) as subtask_count,
    (SELECT array_agg(tags.name) FROM task_tags tt JOIN tags ON tt.tag_id = tags.id WHERE tt.task_id = t.id) as tag_names
FROM tasks t
    LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
    LEFT JOIN users u_creator ON t.creator_id = u_creator.id
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN teams team ON t.team_id = team.id;

-- 创建视图：团队统计视图
CREATE VIEW team_statistics AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(DISTINCT tm.user_id) as member_count,
    COUNT(DISTINCT tasks.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN tasks.status = 'done' THEN tasks.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN tasks.due_date < CURRENT_TIMESTAMP AND tasks.status != 'done' THEN tasks.id END) as overdue_tasks,
    COUNT(DISTINCT p.id) as project_count
FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN tasks ON t.id = tasks.team_id
    LEFT JOIN projects p ON t.id = p.team_id AND p.is_active = true
GROUP BY t.id, t.name;

-- 插入默认数据
INSERT INTO team_settings (team_id, setting_key, setting_value) 
SELECT id, 'digest_time', '"18:00"'::jsonb FROM teams;

INSERT INTO team_settings (team_id, setting_key, setting_value) 
SELECT id, 'ai_confidence_threshold', '0.8'::jsonb FROM teams;

INSERT INTO team_settings (team_id, setting_key, setting_value) 
SELECT id, 'silent_hours', '{"start": "22:00", "end": "08:00"}'::jsonb FROM teams;

-- 添加约束检查
ALTER TABLE tasks ADD CONSTRAINT check_confidence_range 
    CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1));

ALTER TABLE task_extraction_logs ADD CONSTRAINT check_confidence_score_range 
    CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- 添加分区（可选，适用于大数据量场景）
-- CREATE TABLE audit_logs_y2024 PARTITION OF audit_logs 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 创建函数：获取任务层级
CREATE OR REPLACE FUNCTION get_task_hierarchy(task_uuid UUID)
RETURNS TABLE(id UUID, title VARCHAR, level INTEGER) AS $$
WITH RECURSIVE task_tree AS (
    -- 基础情况：查找根任务
    SELECT t.id, t.title, t.parent_task_id, 0 as level
    FROM tasks t
    WHERE t.id = task_uuid
    
    UNION ALL
    
    -- 递归情况：查找子任务
    SELECT t.id, t.title, t.parent_task_id, tt.level + 1
    FROM tasks t
    INNER JOIN task_tree tt ON t.parent_task_id = tt.id
)
SELECT task_tree.id, task_tree.title, task_tree.level
FROM task_tree
ORDER BY level;
$$ LANGUAGE SQL;

-- 创建函数：计算任务完成百分比
CREATE OR REPLACE FUNCTION calculate_task_completion_percentage(task_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_subtasks INTEGER;
    completed_subtasks INTEGER;
BEGIN
    -- 计算子任务总数
    SELECT COUNT(*) INTO total_subtasks
    FROM tasks
    WHERE parent_task_id = task_uuid;
    
    -- 如果没有子任务，根据当前任务状态返回
    IF total_subtasks = 0 THEN
        SELECT CASE 
            WHEN status = 'done' THEN 100.00
            WHEN status = 'blossom' THEN 90.00
            WHEN status = 'sprout' THEN 50.00
            ELSE 0.00
        END INTO completed_subtasks
        FROM tasks WHERE id = task_uuid;
        RETURN completed_subtasks;
    END IF;
    
    -- 计算已完成的子任务数
    SELECT COUNT(*) INTO completed_subtasks
    FROM tasks
    WHERE parent_task_id = task_uuid AND status = 'done';
    
    -- 返回完成百分比
    RETURN ROUND((completed_subtasks::DECIMAL / total_subtasks * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON TABLE users IS '用户表，存储所有用户基本信息';
COMMENT ON TABLE teams IS '团队表，对应Telegram群组';
COMMENT ON TABLE tasks IS '任务表，核心业务实体';
COMMENT ON TABLE task_extraction_logs IS 'AI任务抽取日志，用于训练和审计';
COMMENT ON COLUMN tasks.status IS '任务状态：seed(想法) -> sprout(进行中) -> blossom(待验收) -> done(完成)';
COMMENT ON COLUMN tasks.ai_confidence IS 'AI抽取的置信度，范围0-1';
COMMENT ON VIEW task_details IS '任务详情视图，包含关联的用户、项目、标签等信息'; 