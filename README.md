# 海龟汤逻辑推理游戏

一个基于 React + Next.js 的多人在线逻辑推理游戏。

## 功能特性

- 🎮 支持 1-4 名玩家在线游戏
- 🤖 AI 主持人进行"是/不是"问答
- 💬 实时聊天和游戏状态同步
- ❤️ 血量系统和游戏机制
- 🎯 线索收集和推理展示
- ⏰ 时间限制和游戏结束条件

## 技术栈

- **前端**: React, Next.js 14, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Socket.IO
- **部署**: Vercel

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/bwang106/turtle-soup.git
cd turtle-soup
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 游戏玩法

1. **创建或加入房间** - 输入房间号和玩家名称
2. **等待其他玩家** - 在游戏大厅等待所有玩家准备就绪
3. **开始游戏** - 房主可以开始游戏
4. **提问和推理** - 向 AI 主持人提问"是/不是"问题
5. **收集线索** - 根据 AI 回答收集线索
6. **猜测答案** - 尝试猜测完整的故事
7. **游戏结束** - 有人猜对或时间耗尽

## 部署

项目已配置为自动部署到 Vercel。每次推送到 main 分支都会触发自动部署。

// 触发 Vercel 自动部署
