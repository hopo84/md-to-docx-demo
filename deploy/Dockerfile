# 使用 Node.js 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 安装 TypeScript 编译依赖（构建时需要）
COPY package.json package-lock.json ./
RUN npm ci

# 复制 TypeScript 配置文件
COPY tsconfig.json ./

# 复制源代码
COPY src ./src

# 编译 TypeScript
RUN npm run build

# 清理开发依赖，只保留生产依赖
RUN npm prune --production

# 创建 input 和 output 目录
RUN mkdir -p /app/input /app/output

# 设置目录权限
RUN chmod 777 /app/input /app/output

# 设置环境变量
ENV NODE_ENV=production

# 设置默认命令
CMD ["node", "dist/index.js", "-f", "input.md"]
