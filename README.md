# 海龟汤逻辑推理游戏

一个基于 React + Next.js 构建的多人在线海龟汤逻辑推理游戏，支持 1-4 名玩家参与，由 AI 担任主持人进行"是/不是"问答。

## 🎮 游戏特色

- **多人游戏**: 支持 1-4 名玩家在线参与
- **AI 主持人**: 由 AI 智能判断玩家问题并给出"是/不是/无关/接近"等回复
- **血量系统**: 每名玩家 5 点血量，提问和猜测消耗血量
- **实时通信**: 基于 Socket.IO 的实时多人游戏体验
- **线索系统**: 玩家猜中的关键线索会以卡片形式展示
- **限时挑战**: 可设置 15-60 分钟的游戏时间限制
- **现代 UI**: 美观的响应式界面设计

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 🎯 游戏玩法

### 基本规则

1. **创建/加入房间**: 房主创建游戏房间，其他玩家通过房间号加入
2. **准备阶段**: 所有玩家准备就绪后，房主可以开始游戏
3. **提问阶段**: 玩家轮流向 AI 主持人提问，只能问"是/不是"类型的问题
4. **AI 回答**: AI 会回答"是"、"不是"、"无关"或"你已经接近了"
5. **血量消耗**: 每次提问消耗 1 点血量，血量归零则无法继续提问
6. **猜测答案**: 玩家可以随时尝试猜测完整故事，猜错也消耗血量
7. **请求提示**: 可以消耗血量获取 AI 提示
8. **游戏结束**: 有人猜对答案、所有人血量耗尽或时间到

### 游戏界面

- **主页**: 创建游戏或加入现有游戏
- **游戏大厅**: 显示玩家列表、准备状态和游戏设置
- **游戏界面**: 三栏布局
  - 左侧：玩家状态和血量显示
  - 中间：实时聊天对话区域
  - 右侧：游戏操作（提问、猜测、提示）

## 🛠️ 技术栈

### 前端
- **Next.js 14**: React 全栈框架
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Socket.IO Client**: 实时通信
- **Lucide React**: 图标库

### 后端
- **Next.js API Routes**: 后端 API 接口
- **Socket.IO**: 实时双向通信
- **内存存储**: 游戏状态管理（可扩展为数据库）

### AI 服务
- **模拟 AI**: 基于关键词匹配的智能问答系统
- **可扩展**: 支持集成 OpenAI GPT 等真实 AI 服务

## 📁 项目结构

```
海龟汤/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页
│   ├── lobby/[roomId]/    # 游戏大厅
│   ├── game/[roomId]/     # 游戏界面
│   └── result/[roomId]/   # 游戏结果
├── pages/api/             # API 路由
│   ├── create-room.ts     # 创建房间
│   ├── join-room.ts       # 加入房间
│   └── socket.ts          # Socket.IO 处理
├── lib/                   # 工具库
│   ├── gameStore.ts       # 游戏状态管理
│   └── aiService.ts       # AI 服务
├── types/                 # TypeScript 类型定义
│   └── game.ts           # 游戏相关类型
└── package.json          # 项目配置
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# OpenAI API (可选，用于真实 AI 服务)
OPENAI_API_KEY=your_openai_api_key

# 游戏配置
NEXT_PUBLIC_MAX_PLAYERS=4
NEXT_PUBLIC_DEFAULT_TIME_LIMIT=30
NEXT_PUBLIC_DEFAULT_HEALTH=5
```

### 自定义配置

可以在 `lib/gameStore.ts` 中修改：
- 游戏故事库
- 血量系统
- 时间限制
- 玩家数量限制

## 🎨 自定义主题

项目使用 Tailwind CSS，可以在 `tailwind.config.js` 中自定义：
- 颜色主题
- 字体设置
- 响应式断点

## 🚀 部署

### Vercel (推荐)

```bash
npm install -g vercel
vercel
```

### 其他平台

项目支持部署到任何支持 Node.js 的平台：
- Netlify
- Railway
- Heroku
- 自建服务器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Socket.IO](https://socket.io/) - 实时通信
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库

---

享受推理的乐趣！🎉 // 触发 Vercel 自动部署
