-- Plantry 数据库初始化数据和示例查询
-- 请在执行 schema.sql 后运行此文件

-- 插入示例用户数据
INSERT INTO users (telegram_id, username, first_name, last_name, email, timezone, language_code) VALUES
(123456789, 'alice_wang', '王', '小丽', 'alice@example.com', 'Asia/Shanghai', 'zh-CN'),
(987654321, 'bob_chen', '陈', '大明', 'bob@example.com', 'Asia/Shanghai', 'zh-CN'),
(555666777, 'charlie_li', '李', '强', 'charlie@example.com', 'Asia/Shanghai', 'zh-CN'),
(111222333, 'diana_zhang', '张', '梅', 'diana@example.com', 'Asia/Shanghai', 'zh-CN');

-- 插入示例团队数据
INSERT INTO teams (name, description, owner_id, telegram_chat_id, telegram_chat_type) VALUES
('前端开发团队', '负责Web前端和移动端UI开发', (SELECT id FROM users WHERE username = 'alice_wang'), -1001234567890, 'supergroup'),
('后端开发团队', '负责API和服务端开发', (SELECT id FROM users WHERE username = 'bob_chen'), -1001234567891, 'supergroup'),
('产品设计团队', '负责产品设计和用户体验', (SELECT id FROM users WHERE username = 'diana_zhang'), -1001234567892, 'supergroup');

-- 插入团队成员关系
INSERT INTO team_members (team_id, user_id, role) VALUES
-- 前端团队
((SELECT id FROM teams WHERE name = '前端开发团队'), (SELECT id FROM users WHERE username = 'alice_wang'), 'admin'),
((SELECT id FROM teams WHERE name = '前端开发团队'), (SELECT id FROM users WHERE username = 'charlie_li'), 'member'),
((SELECT id FROM teams WHERE name = '前端开发团队'), (SELECT id FROM users WHERE username = 'diana_zhang'), 'member'),

-- 后端团队
((SELECT id FROM teams WHERE name = '后端开发团队'), (SELECT id FROM users WHERE username = 'bob_chen'), 'admin'),
((SELECT id FROM teams WHERE name = '后端开发团队'), (SELECT id FROM users WHERE username = 'alice_wang'), 'member'),
((SELECT id FROM teams WHERE name = '后端开发团队'), (SELECT id FROM users WHERE username = 'charlie_li'), 'member'),

-- 产品团队
((SELECT id FROM teams WHERE name = '产品设计团队'), (SELECT id FROM users WHERE username = 'diana_zhang'), 'admin'),
((SELECT id FROM teams WHERE name = '产品设计团队'), (SELECT id FROM users WHERE username = 'alice_wang'), 'member');

-- 插入示例项目
INSERT INTO projects (team_id, name, description, color, is_default, created_by) VALUES
((SELECT id FROM teams WHERE name = '前端开发团队'), 'Plantry Web应用', 'Plantry的Web端界面开发', '#3498db', true, (SELECT id FROM users WHERE username = 'alice_wang')),
((SELECT id FROM teams WHERE name = '前端开发团队'), '移动端UI组件', '可复用的移动端UI组件库', '#e74c3c', false, (SELECT id FROM users WHERE username = 'alice_wang')),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'API服务', '核心API和微服务开发', '#2ecc71', true, (SELECT id FROM users WHERE username = 'bob_chen')),
((SELECT id FROM teams WHERE name = '产品设计团队'), '用户体验优化', '提升产品整体用户体验', '#f39c12', true, (SELECT id FROM users WHERE username = 'diana_zhang'));

-- 插入示例标签
INSERT INTO tags (team_id, name, color, description, created_by) VALUES
((SELECT id FROM teams WHERE name = '前端开发团队'), 'urgent', '#e74c3c', '紧急任务', (SELECT id FROM users WHERE username = 'alice_wang')),
((SELECT id FROM teams WHERE name = '前端开发团队'), 'bug', '#f39c12', '缺陷修复', (SELECT id FROM users WHERE username = 'alice_wang')),
((SELECT id FROM teams WHERE name = '前端开发团队'), 'feature', '#3498db', '新功能开发', (SELECT id FROM users WHERE username = 'alice_wang')),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'api', '#9b59b6', 'API相关', (SELECT id FROM users WHERE username = 'bob_chen')),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'database', '#34495e', '数据库相关', (SELECT id FROM users WHERE username = 'bob_chen')),
((SELECT id FROM teams WHERE name = '产品设计团队'), 'design', '#e67e22', '设计相关', (SELECT id FROM users WHERE username = 'diana_zhang'));

-- 插入示例任务
INSERT INTO tasks (team_id, project_id, title, description, status, priority, assignee_id, creator_id, due_date, telegram_message_id, ai_extracted, ai_confidence) VALUES
-- 前端团队任务
((SELECT id FROM teams WHERE name = '前端开发团队'), 
 (SELECT id FROM projects WHERE name = 'Plantry Web应用'), 
 '实现任务看板界面', 
 '开发Seed → Sprout → Blossom → Done的养成看板界面，支持拖拽操作', 
 'sprout', 'high', 
 (SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM users WHERE username = 'alice_wang'), 
 '2024-12-25 18:00:00+08', 
 123456, false, NULL),

((SELECT id FROM teams WHERE name = '前端开发团队'), 
 (SELECT id FROM projects WHERE name = 'Plantry Web应用'), 
 '优化移动端响应式设计', 
 '确保看板在移动设备上的用户体验', 
 'seed', 'medium', 
 (SELECT id FROM users WHERE username = 'diana_zhang'), 
 (SELECT id FROM users WHERE username = 'alice_wang'), 
 '2024-12-30 18:00:00+08', 
 123457, true, 0.85),

-- 后端团队任务
((SELECT id FROM teams WHERE name = '后端开发团队'), 
 (SELECT id FROM projects WHERE name = 'API服务'), 
 '实现任务CRUD API', 
 '开发任务的创建、读取、更新、删除API接口', 
 'blossom', 'high', 
 (SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM users WHERE username = 'bob_chen'), 
 '2024-12-22 18:00:00+08', 
 123458, false, NULL),

((SELECT id FROM teams WHERE name = '后端开发团队'), 
 (SELECT id FROM projects WHERE name = 'API服务'), 
 '集成Telegram Bot API', 
 '实现与Telegram Bot的消息监听和回复功能', 
 'sprout', 'urgent', 
 (SELECT id FROM users WHERE username = 'bob_chen'), 
 (SELECT id FROM users WHERE username = 'bob_chen'), 
 '2024-12-20 18:00:00+08', 
 123459, true, 0.92),

-- 产品团队任务
((SELECT id FROM teams WHERE name = '产品设计团队'), 
 (SELECT id FROM projects WHERE name = '用户体验优化'), 
 '设计AI任务抽取确认界面', 
 '设计用户确认AI抽取任务的交互流程和界面', 
 'done', 'medium', 
 (SELECT id FROM users WHERE username = 'diana_zhang'), 
 (SELECT id FROM users WHERE username = 'diana_zhang'), 
 '2024-12-15 18:00:00+08', 
 123460, false, NULL);

-- 为任务添加标签关联
INSERT INTO task_tags (task_id, tag_id) VALUES
((SELECT id FROM tasks WHERE title = '实现任务看板界面'), (SELECT id FROM tags WHERE name = 'feature')),
((SELECT id FROM tasks WHERE title = '优化移动端响应式设计'), (SELECT id FROM tags WHERE name = 'feature')),
((SELECT id FROM tasks WHERE title = '实现任务CRUD API'), (SELECT id FROM tags WHERE name = 'api')),
((SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), (SELECT id FROM tags WHERE name = 'api')),
((SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), (SELECT id FROM tags WHERE name = 'urgent')),
((SELECT id FROM tasks WHERE title = '设计AI任务抽取确认界面'), (SELECT id FROM tags WHERE name = 'design'));

-- 插入示例任务评论
INSERT INTO task_comments (task_id, user_id, content, telegram_message_id) VALUES
((SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 (SELECT id FROM users WHERE username = 'alice_wang'), 
 '已经完成了基础的看板布局，接下来实现拖拽功能', 123461),

((SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), 
 (SELECT id FROM users WHERE username = 'charlie_li'), 
 '建议使用Long Polling方式，成本较低且易于部署', 123462),

((SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), 
 (SELECT id FROM users WHERE username = 'bob_chen'), 
 '好的，我会先实现基础的消息监听功能', 123463);

-- 插入示例AI任务抽取日志
INSERT INTO task_extraction_logs (team_id, telegram_message_id, original_message, extracted_data, confidence_score, confidence_level, is_confirmed, confirmed_by, task_id) VALUES
((SELECT id FROM teams WHERE name = '前端开发团队'), 
 123457, 
 '@diana_zhang 记得优化移动端响应式设计，下周五前完成', 
 '{"assignee": "diana_zhang", "action": "优化移动端响应式设计", "deadline": "2024-12-30", "priority": "medium"}', 
 0.85, 'high', true, 
 (SELECT id FROM users WHERE username = 'alice_wang'),
 (SELECT id FROM tasks WHERE title = '优化移动端响应式设计')),

((SELECT id FROM teams WHERE name = '后端开发团队'), 
 123459, 
 '紧急！@bob 需要尽快集成Telegram Bot API，这周内完成', 
 '{"assignee": "bob_chen", "action": "集成Telegram Bot API", "deadline": "2024-12-20", "priority": "urgent"}', 
 0.92, 'high', true, 
 (SELECT id FROM users WHERE username = 'bob_chen'),
 (SELECT id FROM tasks WHERE title = '集成Telegram Bot API'));

-- 插入示例通知
INSERT INTO notifications (user_id, task_id, type, title, content, scheduled_at) VALUES
((SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 'deadline', '任务即将到期', '您的任务"实现任务看板界面"将在24小时内到期', 
 '2024-12-24 18:00:00+08'),

((SELECT id FROM users WHERE username = 'bob_chen'), 
 (SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), 
 'deadline', '紧急任务到期提醒', '您的紧急任务"集成Telegram Bot API"将在今天到期', 
 '2024-12-20 09:00:00+08');

-- 插入团队设置
INSERT INTO team_settings (team_id, setting_key, setting_value) VALUES
((SELECT id FROM teams WHERE name = '前端开发团队'), 'digest_time', '"18:00"'),
((SELECT id FROM teams WHERE name = '前端开发团队'), 'ai_confidence_threshold', '0.8'),
((SELECT id FROM teams WHERE name = '前端开发团队'), 'silent_hours', '{"start": "22:00", "end": "08:00"}'),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'digest_time', '"17:30"'),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'ai_confidence_threshold', '0.75'),
((SELECT id FROM teams WHERE name = '后端开发团队'), 'silent_hours', '{"start": "23:00", "end": "09:00"}');

-- 插入用户设置
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
((SELECT id FROM users WHERE username = 'alice_wang'), 'notification_enabled', 'true'),
((SELECT id FROM users WHERE username = 'alice_wang'), 'digest_format', '"markdown"'),
((SELECT id FROM users WHERE username = 'bob_chen'), 'notification_enabled', 'true'),
((SELECT id FROM users WHERE username = 'bob_chen'), 'digest_format', '"text"');

-- 插入示例工作时间记录
INSERT INTO work_sessions (user_id, task_id, start_time, end_time, duration_minutes, description) VALUES
((SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 '2024-12-18 09:00:00+08', '2024-12-18 12:00:00+08', 180, 
 '完成了看板的基础布局和样式'),

((SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 '2024-12-18 14:00:00+08', '2024-12-18 17:30:00+08', 210, 
 '实现了卡片拖拽功能的核心逻辑'),

((SELECT id FROM users WHERE username = 'bob_chen'), 
 (SELECT id FROM tasks WHERE title = '集成Telegram Bot API'), 
 '2024-12-19 10:00:00+08', '2024-12-19 15:00:00+08', 300, 
 '研究Telegram Bot API文档和Long Polling实现');

-- 插入审计日志示例
INSERT INTO audit_logs (user_id, team_id, action, resource_type, resource_id, old_data, new_data, ip_address) VALUES
((SELECT id FROM users WHERE username = 'alice_wang'), 
 (SELECT id FROM teams WHERE name = '前端开发团队'), 
 'create', 'task', 
 (SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 NULL, 
 '{"title": "实现任务看板界面", "status": "seed", "priority": "high"}', 
 '192.168.1.100'),

((SELECT id FROM users WHERE username = 'charlie_li'), 
 (SELECT id FROM teams WHERE name = '前端开发团队'), 
 'update', 'task', 
 (SELECT id FROM tasks WHERE title = '实现任务看板界面'), 
 '{"status": "seed"}', 
 '{"status": "sprout"}', 
 '192.168.1.101');

-- 常用查询示例

-- 1. 查询团队的所有任务及其详细信息
-- SELECT * FROM task_details WHERE team_name = '前端开发团队' ORDER BY created_at DESC;

-- 2. 查询即将到期的任务（未来24小时内）
-- SELECT td.* FROM task_details td 
-- WHERE td.due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours' 
-- AND td.status != 'done' 
-- ORDER BY td.due_date;

-- 3. 查询过期的任务
-- SELECT td.* FROM task_details td WHERE td.is_overdue = true ORDER BY td.due_date;

-- 4. 查询某用户的所有待办任务
-- SELECT td.* FROM task_details td 
-- WHERE td.assignee_username = 'charlie_li' AND td.status != 'done' 
-- ORDER BY td.priority DESC, td.due_date;

-- 5. 查询AI抽取置信度较低的任务（需要人工确认）
-- SELECT t.*, tel.confidence_score, tel.original_message 
-- FROM tasks t 
-- JOIN task_extraction_logs tel ON t.id = tel.task_id 
-- WHERE tel.confidence_score < 0.8 AND tel.is_confirmed IS NULL;

-- 6. 查询团队效率统计
-- SELECT * FROM team_statistics;

-- 7. 查询某个任务的完成进度（包含子任务）
-- SELECT title, calculate_task_completion_percentage(id) as completion_percentage 
-- FROM tasks WHERE title = '实现任务看板界面';

-- 8. 查询任务的层级结构
-- SELECT * FROM get_task_hierarchy((SELECT id FROM tasks WHERE title = '实现任务看板界面'));

-- 9. 查询用户的工作时间统计（本周）
-- SELECT u.username, 
--        SUM(ws.duration_minutes) / 60.0 as total_hours,
--        COUNT(DISTINCT ws.task_id) as tasks_worked_on
-- FROM work_sessions ws
-- JOIN users u ON ws.user_id = u.id
-- WHERE ws.start_time >= date_trunc('week', CURRENT_TIMESTAMP)
-- GROUP BY u.id, u.username
-- ORDER BY total_hours DESC;

-- 10. 查询每日新增和完成的任务数量（近7天）
-- SELECT date_trunc('day', created_at) as day,
--        COUNT(*) as created_tasks,
--        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks
-- FROM tasks 
-- WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
-- GROUP BY date_trunc('day', created_at)
-- ORDER BY day;

COMMENT ON TABLE daily_digests IS '每日汇总数据，用于生成团队工作报告';
COMMENT ON TABLE work_sessions IS '工作时间记录，用于效率分析和时间统计';
COMMENT ON TABLE audit_logs IS '审计日志，记录所有重要操作用于安全审计和问题追踪'; 