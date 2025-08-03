# 安装指南

## 环境要求

在运行此项目之前，您需要安装以下软件：

### 1. 安装 Node.js

#### macOS (使用 Homebrew)
```bash
# 安装 Homebrew (如果还没有安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

#### macOS (使用官方安装包)
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载并安装最新的 LTS 版本

#### 验证安装
```bash
node --version
npm --version
```

### 2. 安装项目依赖

在项目根目录下运行：

```bash
# 安装依赖
npm install

# 或者使用 yarn (如果已安装)
yarn install
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或者使用 yarn
yarn dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

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
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目说明
```

## 游戏功能

### 已实现的功能

✅ **主页**: 创建游戏和加入游戏界面
✅ **游戏大厅**: 玩家列表、准备状态、房主控制
✅ **游戏界面**: 三栏布局的实时游戏体验
✅ **实时通信**: 基于 Socket.IO 的多人游戏
✅ **AI 主持人**: 智能问答系统
✅ **血量系统**: 5 点血量，提问消耗血量
✅ **猜测功能**: 尝试猜测完整故事
✅ **提示系统**: 消耗血量获取 AI 提示
✅ **游戏结果**: 显示完整故事和游戏统计
✅ **响应式设计**: 支持桌面和移动设备

### 技术特点

- **Next.js 14**: 最新的 React 全栈框架
- **TypeScript**: 类型安全的开发体验
- **Tailwind CSS**: 现代化的样式系统
- **Socket.IO**: 实时双向通信
- **模块化设计**: 清晰的代码结构
- **可扩展架构**: 易于添加新功能

## 游戏玩法

1. **创建房间**: 房主设置游戏参数并创建房间
2. **加入游戏**: 其他玩家通过房间号加入
3. **准备阶段**: 所有玩家准备就绪
4. **开始游戏**: 房主开始游戏
5. **轮流提问**: 玩家轮流向 AI 提问
6. **AI 回答**: 获得"是/不是/无关/接近"回复
7. **血量管理**: 每次操作消耗血量
8. **猜测答案**: 随时尝试猜测完整故事
9. **游戏结束**: 猜对答案或血量耗尽

## 下一步计划

- [ ] 集成真实的 OpenAI API
- [ ] 添加更多游戏故事
- [ ] 实现数据库持久化
- [ ] 添加用户认证系统
- [ ] 增加游戏统计和分析
- [ ] 优化移动端体验
- [ ] 添加音效和动画

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :3000
   # 杀死进程
   kill -9 <PID>
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存
   npm cache clean --force
   # 重新安装
   npm install
   ```

3. **TypeScript 错误**
   ```bash
   # 重新生成类型定义
   npm run build
   ```

## 支持

如果您遇到任何问题，请：

1. 检查 Node.js 版本 (推荐 18+)
2. 确保所有依赖已正确安装
3. 查看控制台错误信息
4. 参考 Next.js 官方文档

---

享受推理的乐趣！🎉 