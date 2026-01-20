# Markdown → DOCX Demo

将 Markdown 文件转换为 Word 文档（.docx）的工具，支持本地运行和 Docker 容器化部署。

## 📦 功能特性

- ✅ 支持标准 Markdown 语法
- ✅ 支持 GFM（GitHub Flavored Markdown）
- ✅ 支持表格、列表、代码块等
- ✅ 支持图片（本地和网络图片）
- ✅ 支持容器化部署
- ✅ 批量转换功能

---

## 🚀 快速开始

### 方式一：本地运行

#### 1. 安装依赖
```bash
npm install
```

#### 2. 构建项目
```bash
npm run build
```

#### 3. 运行转换
```bash
# 转换默认文件（input.md）
npm start

# 转换指定文件
npm start -- -f your-file.md
```

生成的文件在 `output/` 目录下，可直接用 Word 打开。

---

### 方式二：Docker 容器化部署 🐳（推荐）

#### 快速使用（一键转换脚本）

**Linux/Mac 用户：**

```bash
# 转换单个文件
./docker-convert.sh input.md

# 首次使用（构建镜像）
./docker-convert.sh -b input.md

# 批量转换所有文件
./docker-convert.sh -a
```

**Windows 用户（PowerShell）：**

```powershell
# 转换单个文件
.\docker-convert.ps1 -FileName input.md

# 首次使用（构建镜像）
.\docker-convert.ps1 -Build -FileName input.md

# 批量转换所有文件
.\docker-convert.ps1 -All
```

#### 手动使用 Docker

**1. 构建镜像**

```bash
docker build -f deploy/Dockerfile -t md-to-docx:latest .
```

**2. 运行转换**

```bash
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

**3. 使用 Docker Compose**

```bash
# 进入 deploy 目录
cd deploy

# 构建
docker-compose build

# 运行（转换 input.md）
docker-compose run --rm md-to-docx

# 转换指定文件
docker-compose run --rm md-to-docx node dist/index.js -f custom.md
```

**4. 使用 Make 命令（推荐）**

```bash
make help           # 查看所有可用命令
make docker-build   # 构建镜像
make docker-run FILE=input.md  # 转换文件
make docker-test    # 快速测试
```

---

## 📖 详细文档

### Docker 部署完整指南

查看 [deploy/DOCKER_DEPLOY.md](./deploy/DOCKER_DEPLOY.md) 获取：
- 详细的部署步骤
- 常见问题解决方案
- 批量转换示例
- 高级配置选项

### 快速开始指南

查看 [deploy/QUICKSTART.md](./deploy/QUICKSTART.md) 获取：
- 5 分钟快速上手教程
- 常见问题速查
- 完整测试流程

---

## 📂 目录结构

```
md-to-docx-demo/
├── input/              # 输入目录（放置 .md 文件）
├── output/             # 输出目录（生成的 .docx 文件）
├── src/                # 源代码
│   └── index.ts
├── dist/               # 编译后的代码
├── deploy/             # Docker 部署相关文件
│   ├── Dockerfile                # Docker 镜像配置
│   ├── docker-compose.yml        # Docker Compose 配置
│   ├── .dockerignore             # Docker 构建忽略
│   ├── docker-convert.sh         # Linux/Mac 转换脚本
│   ├── docker-convert.ps1        # Windows 转换脚本
│   ├── quick-test.sh             # 自动化测试脚本
│   ├── example-test.md           # 测试文件
│   ├── DOCKER_DEPLOY.md          # 详细部署文档
│   ├── QUICKSTART.md             # 快速开始文档
│   ├── DOCKER_CHECKLIST.md       # 部署检查清单
│   └── DEPLOYMENT_SUMMARY.md     # 部署总结
├── docker-convert.sh   # 根目录便捷脚本（调用 deploy/）
├── docker-convert.ps1  # 根目录便捷脚本（调用 deploy/）
├── Makefile            # Make 命令集合
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 使用示例

### 示例 1：转换简单的 Markdown

```bash
# 创建测试文件
echo "# Hello World" > input/test.md

# 本地转换
npm start -- -f test.md

# 或使用 Docker
./docker-convert.sh test.md
```

### 示例 2：批量转换多个文件

将多个 `.md` 文件放入 `input/` 目录，然后：

```bash
# 使用脚本批量转换
./docker-convert.sh -a

# 或手动循环
for file in input/*.md; do
  npm start -- -f $(basename "$file")
done
```

---

## 📋 支持的 Markdown 语法

- **标题**: `# H1` ~ `###### H6`
- **粗体**: `**bold**`
- **斜体**: `*italic*`
- **删除线**: `~~strikethrough~~`
- **代码**: `` `inline code` ``
- **代码块**: ` ```language ... ``` `
- **链接**: `[text](url)`
- **图片**: `![alt](url)`
- **列表**: `-` 或 `1.`
- **表格**: GitHub 风格表格
- **引用**: `> quote`
- **分隔线**: `---`

---

## ⚙️ 高级配置

### 自定义输入输出目录（Docker）

```bash
docker run --rm \
  -v "/path/to/your/input:/app/input" \
  -v "/path/to/your/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f your-file.md
```

### 网络代理（处理网络图片）

```bash
docker run --rm \
  -e HTTP_PROXY=http://proxy.example.com:8080 \
  -e HTTPS_PROXY=http://proxy.example.com:8080 \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

---

## 🐛 常见问题

### Q: 生成的文件权限问题？

**A**: 使用指定用户运行容器

```bash
docker run --rm \
  -u $(id -u):$(id -g) \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f input.md
```

### Q: 找不到输入文件？

**A**: 确保文件在 `input/` 目录下，且文件名正确（区分大小写）

```bash
ls -la input/
```

### Q: 网络图片无法下载？

**A**: 检查网络连接，或使用本地图片

---

## 📄 许可证

MIT License

---

## 🙋 技术支持

- 详细部署文档：[deploy/DOCKER_DEPLOY.md](./deploy/DOCKER_DEPLOY.md)
- 快速开始：[deploy/QUICKSTART.md](./deploy/QUICKSTART.md)
- 问题反馈：提交 Issue
