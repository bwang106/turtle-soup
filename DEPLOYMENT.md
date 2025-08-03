# 部署指南 - fnnstrategy.de

## 🚀 部署选项

### 选项 1: Vercel 部署（推荐）

#### 步骤 1: 准备代码
```bash
# 确保代码已提交到 Git
git add .
git commit -m "准备部署到 fnnstrategy.de"
git push origin main
```

#### 步骤 2: 部署到 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入您的 Git 仓库
5. 配置项目：
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

#### 步骤 3: 配置域名
1. 在 Vercel 项目设置中找到 "Domains"
2. 添加您的域名：`fnnstrategy.de`
3. 按照 Vercel 的指示配置 DNS 记录

### 选项 2: Docker 部署

#### 步骤 1: 构建 Docker 镜像
```bash
# 构建镜像
docker build -t turtle-soup-game .

# 运行容器
docker run -p 3000:3000 turtle-soup-game
```

#### 步骤 2: 使用 Docker Compose
```bash
# 创建 docker-compose.yml
version: '3.8'
services:
  turtle-soup-game:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_DOMAIN=fnnstrategy.de
    restart: unless-stopped
```

### 选项 3: 传统服务器部署

#### 步骤 1: 服务器准备
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2
```

#### 步骤 2: 部署应用
```bash
# 克隆代码
git clone <your-repo-url>
cd turtle-soup-game

# 安装依赖
npm install

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start npm --name "turtle-soup-game" -- start
pm2 save
pm2 startup
```

#### 步骤 3: 配置 Nginx
```nginx
server {
    listen 80;
    server_name fnnstrategy.de www.fnnstrategy.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 环境配置

### 生产环境变量
创建 `.env.production` 文件：
```env
NODE_ENV=production
NEXT_PUBLIC_DOMAIN=fnnstrategy.de
NEXT_PUBLIC_MAX_PLAYERS=4
NEXT_PUBLIC_DEFAULT_TIME_LIMIT=30
NEXT_PUBLIC_DEFAULT_HEALTH=5
```

### SSL 证书配置
使用 Let's Encrypt 免费 SSL 证书：
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d fnnstrategy.de -d www.fnnstrategy.de
```

## 📊 监控和维护

### 使用 PM2 监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs turtle-soup-game

# 重启应用
pm2 restart turtle-soup-game
```

### 使用 Nginx 监控
```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

## 🔄 自动部署

### GitHub Actions 配置
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      run: |
        # 这里添加您的部署脚本
        echo "部署到 fnnstrategy.de"
```

## 🚨 故障排除

### 常见问题
1. **Socket.IO 连接失败**
   - 检查防火墙设置
   - 确保 WebSocket 代理配置正确

2. **内存不足**
   - 增加服务器内存
   - 使用 PM2 集群模式

3. **域名解析问题**
   - 检查 DNS 记录
   - 等待 DNS 传播（最多 48 小时）

### 性能优化
1. **启用 Gzip 压缩**
2. **配置 CDN**
3. **使用 Redis 缓存**
4. **数据库优化**

## 📞 支持

如果遇到部署问题，请检查：
1. 服务器日志
2. 应用日志
3. 网络连接
4. 域名配置

---

**祝您部署顺利！🎉** 