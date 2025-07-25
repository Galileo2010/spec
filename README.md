# 智能规范助手平台 (Spec Assistant Platform)

面向开发团队的智能规范管理平台，作为 AI 编程助手的前置工具。

## 功能特性

- 🤖 **AI 驱动的规范生成** - 使用 mastra.ai 自动生成需求、设计和任务文档
- 📝 **Plate.js 富文本编辑** - 专业的结构化文档编辑体验
- 🎨 **现代化界面** - 基于 shadcn/ui 的美观用户界面
- 🔐 **用户管理** - 完整的身份验证和项目权限控制
- 📊 **项目管理** - 多项目支持和协作功能
- ⚡ **高性能** - 基于 Bun 运行时的快速响应

## 技术栈

### 前端
- React 18 + TypeScript
- Plate.js (富文本编辑器)
- shadcn/ui + Tailwind CSS
- React Router + Zustand
- Vite

### 后端
- Bun 运行时
- Hono.js Web 框架
- SQLite 数据库
- mastra.ai AI 框架
- JWT 身份验证

## 快速开始

### 环境要求
- Bun >= 1.0.0
- Node.js >= 18.0.0

### 安装依赖
```bash
bun install
```

### 开发模式
```bash
# 启动后端服务 (端口 3001)
bun run dev

# 启动前端服务 (端口 3000)
bun run dev:frontend
```

### 构建生产版本
```bash
bun run build
```

### Docker 部署
```bash
# 构建镜像
bun run docker:build

# 运行容器
bun run docker:run

# 或使用 docker-compose
docker-compose up -d
```

## 项目结构

```
spec-assistant-platform/
├── frontend/          # React 前端应用
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── pages/         # 页面组件
│   │   ├── contexts/      # React 上下文
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── lib/           # 工具库
│   │   └── types/         # 类型定义
│   └── package.json
├── backend/           # Bun 后端服务
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   ├── db/            # 数据库相关
│   │   └── types/         # 类型定义
│   └── package.json
├── shared/            # 共享类型和工具
│   ├── src/
│   │   ├── types.ts       # 共享类型定义
│   │   └── utils.ts       # 共享工具函数
│   └── package.json
└── package.json       # 根项目配置
```

## 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits 规范

### 测试
```bash
# 运行测试
bun test

# 监听模式
bun run test:watch
```

### 数据库
```bash
# 运行数据库迁移
bun run db:migrate

# 填充测试数据
bun run db:seed
```

## API 文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 规范文档
- `GET /api/projects/:id/specs` - 获取规范文档
- `PUT /api/projects/:id/specs/:type` - 更新规范文档
- `POST /api/projects/:id/generate` - AI 生成规范

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。