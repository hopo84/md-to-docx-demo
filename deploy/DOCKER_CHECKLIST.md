# Docker 部署清单 ✅

本文档列出了所有 Docker 相关文件及其用途。

## 📁 已创建的文件

### 核心配置文件

| 文件 | 用途 | 说明 |
|------|------|------|
| `Dockerfile` | Docker 镜像配置 | 定义如何构建应用镜像 |
| `docker-compose.yml` | Docker Compose 配置 | 简化 Docker 运行命令 |
| `.dockerignore` | Docker 构建忽略 | 加速构建，减小镜像体积 |

### 便捷脚本

| 文件 | 平台 | 用途 |
|------|------|------|
| `docker-convert.sh` | Linux/Mac | 一键转换脚本 |
| `docker-convert.ps1` | Windows | PowerShell 转换脚本 |
| `Makefile` | 通用 | Make 命令集合 |

### 文档文件

| 文件 | 内容 |
|------|------|
| `README.md` | 项目主文档（已更新） |
| `DOCKER_DEPLOY.md` | 详细部署指南 |
| `QUICKSTART.md` | 5 分钟快速开始 |
| `DOCKER_CHECKLIST.md` | 本文件 |

### 测试文件

| 文件 | 用途 |
|------|------|
| `example-test.md` | 完整功能测试文档 |
| `input/.gitkeep` | 保留 input 目录 |
| `output/.gitkeep` | 保留 output 目录 |

---

## 🚀 快速验证部署

### 1. 检查文件完整性

```bash
# 检查所有必需文件是否存在
ls -1 Dockerfile docker-compose.yml .dockerignore \
     docker-convert.sh docker-convert.ps1 \
     DOCKER_DEPLOY.md QUICKSTART.md \
     example-test.md Makefile

# 应该显示所有文件，无错误
```

### 2. 验证 Docker 环境

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker 是否运行
docker ps
```

### 3. 快速测试（3 种方式）

#### 方式 A：使用便捷脚本（最快）

```bash
# Linux/Mac
chmod +x docker-convert.sh
./docker-convert.sh -b example-test.md

# Windows PowerShell
.\docker-convert.ps1 -Build -FileName example-test.md
```

#### 方式 B：使用 Make 命令

```bash
make docker-test
```

#### 方式 C：手动命令

```bash
# 1. 构建镜像
docker build -t md-to-docx:latest .

# 2. 复制测试文件
cp example-test.md input/

# 3. 运行转换
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f example-test.md

# 4. 检查结果
ls -lh output/
```

---

## 📋 部署前检查清单

在生产环境部署前，请确认：

- [ ] **Docker 已安装** - `docker --version` 显示版本号
- [ ] **Docker 服务运行中** - `docker ps` 无错误
- [ ] **项目文件完整** - 所有上述文件存在
- [ ] **目录权限正确** - input 和 output 目录可读写
- [ ] **镜像构建成功** - `docker build` 无错误
- [ ] **测试转换成功** - 生成的 .docx 文件可打开
- [ ] **网络连接正常** - 如需处理网络图片
- [ ] **磁盘空间充足** - 至少 500MB 可用空间

---

## 🎯 使用场景对照表

### 场景 1：首次使用

```bash
# 推荐：使用快速开始指南
cat QUICKSTART.md
```

### 场景 2：日常单文件转换

```bash
# 最快方式
./docker-convert.sh your-file.md

# 或使用 Make
make docker-run FILE=your-file.md
```

### 场景 3：批量转换多个文件

```bash
# 使用脚本批量转换
./docker-convert.sh -a

# 或使用 Make（需自定义）
for file in input/*.md; do
  make docker-run FILE=$(basename "$file")
done
```

### 场景 4：持续集成 (CI/CD)

```bash
# Dockerfile 和 docker-compose.yml 可直接用于 CI/CD
# 示例 GitHub Actions:
# - docker build -t md-to-docx .
# - docker run --rm -v ./input:/app/input -v ./output:/app/output md-to-docx
```

### 场景 5：服务器长期运行

```bash
# 使用 Docker Compose
docker-compose up -d

# 执行转换
docker-compose exec md-to-docx node dist/index.js -f file.md
```

---

## 🔧 故障排查步骤

如果遇到问题，按以下顺序检查：

### 1. Docker 相关

```bash
# 检查 Docker 服务
docker info

# 检查镜像
docker images | grep md-to-docx

# 查看容器日志
docker logs <container_id>
```

### 2. 文件相关

```bash
# 检查文件是否存在
ls -la input/

# 检查权限
ls -ld input/ output/

# 测试文件读写
touch input/test.txt && rm input/test.txt
```

### 3. 网络相关

```bash
# 测试容器网络
docker run --rm md-to-docx:latest ping -c 3 8.8.8.8

# 测试 DNS
docker run --rm md-to-docx:latest nslookup google.com
```

### 4. 重置环境

```bash
# 完全清理并重建
make docker-clean
make clean
make docker-build
make docker-test
```

---

## 📚 文档索引

根据需求选择合适的文档：

| 需求 | 文档 |
|------|------|
| 快速开始（5分钟） | [QUICKSTART.md](./QUICKSTART.md) |
| 详细部署步骤 | [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) |
| 项目概览 | [README.md](./README.md) |
| 命令速查 | [Makefile](./Makefile) - `make help` |
| 功能测试 | [example-test.md](./example-test.md) |

---

## 🌟 最佳实践

### 开发环境

```bash
# 使用本地 npm（更快的迭代）
npm install
npm run build
npm start -- -f test.md
```

### 生产环境

```bash
# 使用 Docker（环境一致）
docker-compose up -d
docker-compose exec md-to-docx node dist/index.js -f file.md
```

### 自动化任务

```bash
# 使用便捷脚本批量处理
./docker-convert.sh -a
```

---

## 🎓 进阶配置

### 1. 自定义镜像标签

```bash
# 构建特定版本
docker build -t md-to-docx:v1.0.0 .

# 使用特定版本
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:v1.0.0 \
  node dist/index.js -f file.md
```

### 2. 多阶段构建优化

当前 Dockerfile 已使用基本优化。如需进一步减小体积，参考 `DOCKER_DEPLOY.md` 中的多阶段构建示例。

### 3. 资源限制

```bash
# 限制容器资源使用
docker run --rm \
  --memory="512m" \
  --cpus="1.0" \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f file.md
```

### 4. 健康检查

在 `docker-compose.yml` 中添加：

```yaml
healthcheck:
  test: ["CMD", "node", "--version"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## ✅ 验收标准

部署成功的标志：

1. ✅ 所有命令执行无错误
2. ✅ 镜像大小合理（< 500MB）
3. ✅ 转换速度可接受（< 5 秒/文件）
4. ✅ 生成的 .docx 文件格式正确
5. ✅ 批量转换功能正常
6. ✅ 日志输出清晰易读

---

## 📞 支持资源

- **快速问题**：查看 `QUICKSTART.md` 常见问题部分
- **详细问题**：查看 `DOCKER_DEPLOY.md` 常见问题章节
- **代码问题**：检查 `src/index.ts` 源码
- **配置问题**：检查 `Dockerfile` 和 `docker-compose.yml`

---

## 🎉 部署完成

如果你能看到这里并且所有检查都通过，恭喜你已经成功完成 Docker 部署！

**下一步**：
1. 将你的 Markdown 文件放入 `input/` 目录
2. 运行 `./docker-convert.sh -a` 批量转换
3. 在 `output/` 目录查看生成的 Word 文档

祝使用愉快！🚀
