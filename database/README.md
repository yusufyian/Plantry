# Plantry 数据库设计文档

## 概述

这是基于 Plantry 产品方案设计的 PostgreSQL 数据库结构，支持 Telegram 场景下的 AI 驱动项目管理系统。

## 文件说明

- `schema.sql` - 完整的数据库结构定义
- `init_data.sql` - 示例数据和常用查询
- `README.md` - 本说明文档

## 核心特性

### 🌱 养成式看板系统
- **Seed (种子)** - 想法和未排期任务
- **Sprout (发芽)** - 开始执行的任务  
- **Blossom (开花)** - 待验收任务
- **Done (完成)** - 已完成任务

### 🤖 AI 任务抽取
- 支持从 Telegram 消息中自动提取任务信息
- 置信度评分和人工确认机制
- 学习反馈优化抽取准确率

### 👥 团队协作管理
- 多团队支持，每个团队对应一个 Telegram 群组
- 角色权限管理 (admin/member/viewer)
- 项目分组和标签系统

### 📊 数据分析与报告
- 工作时间统计
- 团队效率分析
- 每日汇总报告
- 审计日志追踪

## 数据库部署

### 1. 环境要求

- PostgreSQL 13+
- 启用扩展：`uuid-ossp`、`pg_trgm`

### 2. 初始化步骤

```bash
# 1. 创建数据库
createdb plantry

# 2. 执行结构创建
psql -d plantry -f schema.sql

# 3. 插入示例数据（可选）
psql -d plantry -f init_data.sql
```

### 3. 环境变量配置

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/plantry"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="plantry"
export DB_USER="your_username"
export DB_PASSWORD="your_password"
```

## 核心表结构

### 用户和团队管理

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户基本信息 | `telegram_id`, `username`, `email` |
| `teams` | 团队信息 | `telegram_chat_id`, `owner_id` |
| `team_members` | 团队成员关系 | `team_id`, `user_id`, `role` |

### 任务管理核心

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tasks` | 任务主表 | `status`, `priority`, `assignee_id`, `due_date` |
| `projects` | 项目分组 | `team_id`, `name`, `color` |
| `tags` | 标签系统 | `team_id`, `name`, `color` |
| `task_tags` | 任务标签关联 | `task_id`, `tag_id` |

### AI 和协作

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `task_extraction_logs` | AI抽取日志 | `confidence_score`, `is_confirmed` |
| `task_comments` | 任务评论 | `task_id`, `user_id`, `content` |
| `task_attachments` | 任务附件 | `task_id`, `file_path`, `telegram_file_id` |
| `notifications` | 通知系统 | `user_id`, `type`, `scheduled_at` |

## 主要视图

### `task_details`
提供任务的完整信息视图，包含：
- 任务基本信息
- 负责人和创建者信息
- 项目和团队信息
- 是否过期状态
- 评论、附件、子任务数量
- 关联的标签列表

### `team_statistics`
团队统计信息视图，包含：
- 团队成员数量
- 任务总数和完成数
- 过期任务数量
- 项目数量

## 核心函数

### `get_task_hierarchy(task_uuid)`
递归查询任务的层级结构，返回任务树。

### `calculate_task_completion_percentage(task_uuid)`
计算任务完成百分比（考虑子任务）。

### `update_updated_at_column()`
自动更新记录的 `updated_at` 字段。

## 索引优化

### 主要索引
- 用户 Telegram ID 索引
- 团队聊天 ID 索引
- 任务状态和截止日期索引
- 全文搜索索引（中文支持）

### 性能优化建议
1. 定期清理过期的审计日志
2. 对大量数据的表考虑分区
3. 监控慢查询并优化
4. 定期更新表统计信息

## 常用查询示例

### 查询团队待办任务
```sql
SELECT * FROM task_details 
WHERE team_name = '前端开发团队' 
  AND status != 'done' 
ORDER BY priority DESC, due_date;
```

### 查询即将到期的任务
```sql
SELECT * FROM task_details 
WHERE due_date BETWEEN CURRENT_TIMESTAMP 
  AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
  AND status != 'done';
```

### 查询AI抽取待确认的任务
```sql
SELECT t.*, tel.confidence_score, tel.original_message 
FROM tasks t 
JOIN task_extraction_logs tel ON t.id = tel.task_id 
WHERE tel.confidence_score < 0.8 
  AND tel.is_confirmed IS NULL;
```

### 查询用户工作时间统计
```sql
SELECT u.username, 
       SUM(ws.duration_minutes) / 60.0 as total_hours,
       COUNT(DISTINCT ws.task_id) as tasks_worked_on
FROM work_sessions ws
JOIN users u ON ws.user_id = u.id
WHERE ws.start_time >= date_trunc('week', CURRENT_TIMESTAMP)
GROUP BY u.id, u.username
ORDER BY total_hours DESC;
```

## 数据安全

### 敏感信息处理
- `bot_token` 字段应加密存储
- 文件路径和 Telegram 文件 ID 敏感信息
- 用户个人信息遵循 GDPR 等隐私法规

### 备份策略
```bash
# 定期备份
pg_dump plantry > backup_$(date +%Y%m%d_%H%M%S).sql

# 增量备份
pg_basebackup -D /backup/base -Ft -z -P
```

### 审计日志
系统自动记录所有重要操作到 `audit_logs` 表，包括：
- 用户操作记录
- 数据变更历史
- IP 地址和用户代理
- 操作时间戳

## 扩展性考虑

### 水平扩展
- 支持读写分离
- 可按团队 ID 进行分片
- 缓存层集成 (Redis)

### 数据分区
```sql
-- 按年份分区审计日志（示例）
CREATE TABLE audit_logs_y2024 PARTITION OF audit_logs 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 集成支持
- 预留 `metadata` JSONB 字段支持扩展
- 标准化的 API 接口设计
- Webhook 通知机制

## 监控和维护

### 性能监控
- 定期检查慢查询日志
- 监控连接池状态
- 关注索引使用情况

### 定期维护
- 清理过期通知
- 压缩历史数据
- 更新表统计信息
- 检查数据完整性

## 版本升级

### 数据迁移
在进行结构变更时，建议：
1. 创建迁移脚本
2. 在测试环境验证
3. 备份生产数据
4. 执行迁移
5. 验证数据完整性

### 向后兼容
- API 接口保持向后兼容
- 数据库字段添加而非修改
- 保留必要的数据转换逻辑

---

## 联系和支持

如有问题，请联系开发团队或查看项目文档。

**设计原则**：简洁、高效、可扩展、安全
**更新时间**：2024年12月 