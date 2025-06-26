# Plantry - AI驱动的团队项目管理工具

让想法在团队中生根发芽 🌱

## 项目简介

Plantry 是一个基于 Vue 3 的现代化项目管理工具，专为使用 Telegram 进行沟通的轻量团队设计。通过 AI 技术自动从对话中识别任务，提供无摩擦的项目管理体验。

## 核心功能

- 🤖 **AI 任务抽取**: 自动从 Telegram 消息中识别任务
- 📥 **智能任务箱**: 待确认任务的统一管理
- 🌱 **Grow Board**: Seed → Sprout → Blossom → Done 的养成看板
- 📊 **效率分析**: 团队工作效率的可视化分析
- 📱 **响应式设计**: 完美适配 PC 和移动设备
- 🔒 **数据安全**: 端到端加密，支持私有部署

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI框架**: Tailwind CSS
- **图标库**: Heroicons
- **构建工具**: Vite
- **拖拽功能**: Vue Draggable Plus
- **日期处理**: Day.js
- **图表库**: Chart.js + Vue Chart.js

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   ├── tasks/          # 任务相关组件
│   └── inbox/          # 任务箱相关组件
├── views/              # 页面组件
│   ├── auth/           # 认证页面
│   ├── Home.vue        # 首页
│   ├── Board.vue       # 看板页面
│   ├── Inbox.vue       # 任务确认箱
│   └── ...
├── stores/             # Pinia 状态管理
├── router/             # 路由配置
└── style.css           # 全局样式
```

## 主要功能模块

### 1. 用户认证
- 登录/注册功能
- JWT Token 管理
- 路由守卫

### 2. Grow Board 看板
- 四阶段任务流程：Seed → Sprout → Blossom → Done
- 拖拽式任务管理
- 任务详情和编辑
- 看板/列表视图切换

### 3. 智能任务箱
- AI 任务识别结果展示
- 置信度可视化
- 批量确认/忽略
- 任务编辑功能

### 4. 效率分析
- 团队工作统计
- 任务完成趋势
- 个人效率报告

## 演示账户

为了方便体验，提供以下演示账户：

- **邮箱**: demo@plantry.com
- **密码**: demo123

## 设计特色

### 响应式设计
- 移动优先的设计理念
- 适配各种屏幕尺寸
- 触摸友好的交互

### 现代化UI
- 毛玻璃效果
- 渐变背景
- 流畅动画
- 直观的视觉反馈

### 用户体验
- 零学习成本
- 智能化操作提示
- 实时状态反馈
- 无刷新页面切换

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

- 项目主页: [GitHub](https://github.com/your-username/plantry)
- 问题反馈: [Issues](https://github.com/your-username/plantry/issues)
- 邮箱: support@plantry.com

---

**Plantry** - 让想法在团队中生根发芽 🌱