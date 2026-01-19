# Docker 容器化部署指南

本文档详细介绍如何使用 Docker 容器化部署 md-to-docx 项目。

## 📋 目录

1. [前置要求](#前置要求)
2. [构建 Docker 镜像](#构建-docker-镜像)
3. [运行容器](#运行容器)
4. [使用示例](#使用示例)
5. [常见问题](#常见问题)

---

## 🔧 前置要求

确保你的系统已安装：

- **Docker**: 版本 20.10 或更高
- **Docker Compose** (可选): 版本 2.0 或更高

### 验证安装

```bash
docker --version
docker-compose --version  # 如果使用 Docker Compose
```

---

## 🏗️ 构建 Docker 镜像

### 方法一：使用 Docker 命令

在项目根目录下执行：

```bash
# 构建镜像
docker build -t md-to-docx:latest .

# 查看构建好的镜像
docker images | grep md-to-docx
```

### 方法二：使用 Docker Compose（推荐）

创建 `docker-compose.yml` 文件（见下方完整配置），然后执行：

```bash
docker-compose build
```

---

## 🚀 运行容器

### 基本运行方式

#### 1. 直接运行（转换单个文件）

```bash
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

**参数说明：**
- `--rm`: 容器停止后自动删除
- `-v "$(pwd)/input:/app/input"`: 挂载本地 input 目录到容器
- `-v "$(pwd)/output:/app/output"`: 挂载本地 output 目录到容器
- `node dist/index.js -f input.md`: 要转换的文件名

#### 2. 转换指定文件

```bash
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f my-document.md
```

#### 3. 交互式运行（进入容器）

```bash
docker run -it --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  /bin/sh
```

进入容器后可以执行多次转换：

```bash
node dist/index.js -f file1.md
node dist/index.js -f file2.md
```

---

## 📝 使用示例

### 示例 1：准备和转换 Markdown 文件

```bash
# 1. 创建必要的目录
mkdir -p input output

# 2. 将要转换的 Markdown 文件放入 input 目录
cp your-file.md input/

# 3. 运行转换
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f your-file.md

# 4. 查看生成的文件
ls -lh output/
```

### 示例 2：批量转换多个文件

创建一个批处理脚本 `batch-convert.sh`：

```bash
#!/bin/bash

# 获取 input 目录下所有 .md 文件
for file in input/*.md; do
  filename=$(basename "$file")
  echo "正在转换: $filename"
  
  docker run --rm \
    -v "$(pwd)/input:/app/input" \
    -v "$(pwd)/output:/app/output" \
    md-to-docx:latest \
    node dist/index.js -f "$filename"
  
  echo "完成: $filename"
  echo "---"
done

echo "所有文件转换完成！"
```

运行批处理脚本：

```bash
chmod +x batch-convert.sh
./batch-convert.sh
```

---

## 🐳 Docker Compose 配置（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  md-to-docx:
    build:
      context: .
      dockerfile: Dockerfile
    image: md-to-docx:latest
    container_name: md-to-docx-converter
    volumes:
      - ./input:/app/input
      - ./output:/app/output
    # 默认转换 input.md
    command: ["node", "dist/index.js", "-f", "input.md"]
```

### 使用 Docker Compose

```bash
# 构建镜像
docker-compose build

# 运行转换（使用默认配置）
docker-compose run --rm md-to-docx

# 转换指定文件
docker-compose run --rm md-to-docx node dist/index.js -f custom.md

# 进入容器交互式操作
docker-compose run --rm md-to-docx /bin/sh
```

---

## 🔍 常见问题

### 1. 权限问题

**问题**: 生成的文件无法访问或删除

**解决方案**:

```bash
# Linux/Mac 用户
sudo chown -R $USER:$USER output/

# 或者在运行容器时指定用户ID
docker run --rm \
  -u $(id -u):$(id -g) \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

### 2. 找不到输入文件

**问题**: `错误: 文件 "input/xxx.md" 不存在！`

**解决方案**:
- 确保文件在本地 `input/` 目录下
- 检查文件名是否正确（区分大小写）
- 确保目录挂载正确

```bash
# 检查 input 目录内容
ls -la input/

# 确保文件存在
test -f input/your-file.md && echo "文件存在" || echo "文件不存在"
```

### 3. Windows 路径问题

**问题**: Windows 用户挂载目录失败

**解决方案**: 使用 PowerShell 或 CMD 的路径格式

**PowerShell**:

```powershell
docker run --rm `
  -v "${PWD}/input:/app/input" `
  -v "${PWD}/output:/app/output" `
  md-to-docx:latest `
  node dist/index.js -f input.md
```

**CMD**:

```cmd
docker run --rm ^
  -v "%cd%/input:/app/input" ^
  -v "%cd%/output:/app/output" ^
  md-to-docx:latest ^
  node dist/index.js -f input.md
```

### 4. 镜像体积优化

如果需要进一步减小镜像体积：

```dockerfile
# 使用多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/input /app/output && chmod 777 /app/input /app/output
CMD ["node", "dist/index.js", "-f", "input.md"]
```

### 5. 图片下载失败

**问题**: Markdown 中的网络图片无法下载

**解决方案**: 确保容器有网络访问权限

```bash
# 测试网络连接
docker run --rm md-to-docx:latest ping -c 3 www.google.com

# 如果网络受限，可以使用代理
docker run --rm \
  -e HTTP_PROXY=http://proxy.example.com:8080 \
  -e HTTPS_PROXY=http://proxy.example.com:8080 \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

---

## 📦 清理和维护

### 清理未使用的容器和镜像

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 完全清理（谨慎使用）
docker system prune -a
```

### 更新镜像

```bash
# 重新构建镜像
docker build -t md-to-docx:latest .

# 或使用 Docker Compose
docker-compose build --no-cache
```

---

## 🎯 快速开始（完整流程）

```bash
# 1. 克隆或进入项目目录
cd md-to-docx-demo

# 2. 构建镜像
docker build -t md-to-docx:latest .

# 3. 准备输入文件
mkdir -p input output
echo "# Hello Docker" > input/test.md

# 4. 运行转换
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f test.md

# 5. 查看结果
ls -lh output/
```

---

## 📞 技术支持

如遇到其他问题，请检查：

1. Docker 日志: `docker logs <container_id>`
2. 容器内部状态: `docker exec -it <container_id> /bin/sh`
3. 文件权限: `ls -la input/ output/`

---

## 📄 许可证

MIT License
