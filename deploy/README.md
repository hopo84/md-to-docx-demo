# Deploy 目录说明

本目录包含所有 Docker 容器化部署相关的文件和文档。

## 📁 文件说明

### Docker 配置文件

- **`Dockerfile`** - Docker 镜像构建配置
- **`docker-compose.yml`** - Docker Compose 编排配置
- **`.dockerignore`** - Docker 构建时忽略的文件

### 便捷脚本

- **`docker-convert.sh`** - Linux/Mac 一键转换脚本
- **`docker-convert.ps1`** - Windows PowerShell 转换脚本
- **`quick-test.sh`** - 自动化测试脚本

### 文档

- **`DOCKER_DEPLOY.md`** - 详细部署指南（~400行）
- **`QUICKSTART.md`** - 5分钟快速开始教程
- **`DOCKER_CHECKLIST.md`** - 部署检查清单
- **`DEPLOYMENT_SUMMARY.md`** - 完整部署总结

### 测试文件

- **`example-test.md`** - 功能测试用的示例 Markdown 文件

---

## 🚀 快速开始

### 在项目根目录执行

```bash
# 使用便捷脚本（推荐）
./docker-convert.sh example-test.md

# 或使用 Make 命令
make docker-test

# 或手动构建和运行
docker build -f deploy/Dockerfile -t md-to-docx:latest .
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

### 在 deploy 目录执行

```bash
cd deploy

# 使用本地脚本
./docker-convert.sh example-test.md

# 或使用 Docker Compose
docker-compose build
docker-compose run --rm md-to-docx

# 运行测试
./quick-test.sh
```

---

## 📖 文档使用指南

1. **新手用户** → 阅读 `QUICKSTART.md`
2. **详细部署** → 阅读 `DOCKER_DEPLOY.md`
3. **问题排查** → 查看 `DOCKER_CHECKLIST.md`
4. **完整概览** → 查看 `DEPLOYMENT_SUMMARY.md`

---

## ⚙️ 路径说明

本目录下的配置文件使用**相对于项目根目录**的路径：

- `Dockerfile` 的 COPY 命令引用 `../` 的源文件
- `docker-compose.yml` 的 context 设为 `..` （项目根目录）
- `docker-compose.yml` 的 volumes 挂载 `../input` 和 `../output`
- 脚本需要在项目根目录执行（或者使用根目录的便捷脚本）

---

## 🔄 与根目录的关系

项目根目录提供了便捷脚本：

- `/docker-convert.sh` → 调用 `/deploy/docker-convert.sh`
- `/docker-convert.ps1` → 调用 `/deploy/docker-convert.ps1`
- `/Makefile` → 使用 `-f deploy/Dockerfile` 构建

**推荐在项目根目录使用这些便捷工具。**

---

## 📞 获取帮助

查看各个文档获取详细信息，或运行：

```bash
# 查看脚本帮助
./docker-convert.sh --help

# 查看 Make 命令
cd .. && make help

# 运行完整测试
./quick-test.sh
```
