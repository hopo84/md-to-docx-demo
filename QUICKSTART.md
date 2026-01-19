# 🚀 快速开始指南

## Docker 部署 - 5 分钟快速上手

### 第 1 步：确认环境

```bash
# 检查 Docker 是否安装
docker --version

# 如果未安装，请访问 https://www.docker.com/get-started
```

### 第 2 步：准备项目

```bash
# 进入项目目录
cd md-to-docx-demo

# 创建必要的目录
mkdir -p input output
```

### 第 3 步：准备测试文件

将以下内容保存为 `input/test.md`：

```markdown
# 测试文档

## 这是一个测试标题

这是一段普通文本，支持 **粗体**、*斜体* 和 `代码`。

### 列表示例

- 项目 1
- 项目 2
- 项目 3

### 表格示例

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |

### 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> 这是一段引用文本
```

### 第 4 步：构建镜像（首次使用）

```bash
docker build -t md-to-docx:latest .
```

预计耗时：1-3 分钟

### 第 5 步：运行转换

#### 方式 A：使用便捷脚本（推荐）

**Linux/Mac:**
```bash
# 添加执行权限（首次）
chmod +x docker-convert.sh

# 运行转换
./docker-convert.sh test.md
```

**Windows PowerShell:**
```powershell
.\docker-convert.ps1 -FileName test.md
```

#### 方式 B：手动运行 Docker 命令

**Linux/Mac:**
```bash
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f test.md
```

**Windows PowerShell:**
```powershell
docker run --rm `
  -v "${PWD}/input:/app/input" `
  -v "${PWD}/output:/app/output" `
  md-to-docx:latest `
  node dist/index.js -f test.md
```

**Windows CMD:**
```cmd
docker run --rm ^
  -v "%cd%/input:/app/input" ^
  -v "%cd%/output:/app/output" ^
  md-to-docx:latest ^
  node dist/index.js -f test.md
```

#### 方式 C：使用 Docker Compose

```bash
# 首次构建
docker-compose build

# 运行转换
docker-compose run --rm md-to-docx node dist/index.js -f test.md
```

### 第 6 步：查看结果

```bash
# 列出生成的文件
ls -lh output/

# 应该看到类似：output_test_1737123456.docx
```

用 Microsoft Word、WPS 或其他支持 .docx 的软件打开文件。

---

## 🎯 完整示例：一键测试

**Linux/Mac - 完整测试流程：**

```bash
#!/bin/bash

# 1. 创建测试文件
mkdir -p input output
cat > input/demo.md << 'EOF'
# Docker 测试文档

## 功能测试

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- `行内代码`

### 表格
| 功能 | 状态 |
|------|------|
| 构建 | ✅ |
| 运行 | ✅ |
| 转换 | ✅ |

### 代码块
\`\`\`python
def hello():
    print("Hello Docker!")
\`\`\`

> 引用块测试成功！
EOF

# 2. 构建镜像
docker build -t md-to-docx:latest .

# 3. 运行转换
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f demo.md

# 4. 显示结果
echo "✅ 转换完成！查看 output/ 目录"
ls -lh output/
```

保存为 `quick-test.sh`，然后：

```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## 🔄 批量转换示例

如果你有多个 Markdown 文件要转换：

```bash
# 准备多个测试文件
echo "# 文件 1" > input/file1.md
echo "# 文件 2" > input/file2.md
echo "# 文件 3" > input/file3.md

# 批量转换
./docker-convert.sh -a

# 或手动循环
for file in input/*.md; do
  filename=$(basename "$file")
  docker run --rm \
    -v "$(pwd)/input:/app/input" \
    -v "$(pwd)/output:/app/output" \
    md-to-docx:latest \
    node dist/index.js -f "$filename"
done
```

---

## ⚠️ 常见问题速查

### 问题 1：权限被拒绝

**症状**: `Permission denied` 错误

**解决**:
```bash
# Linux/Mac
sudo chown -R $USER:$USER output/

# 或使用用户权限运行
docker run --rm \
  -u $(id -u):$(id -g) \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f test.md
```

### 问题 2：找不到文件

**症状**: `错误: 文件 "input/xxx.md" 不存在！`

**解决**:
```bash
# 检查文件是否存在
ls -la input/

# 确保文件名正确（区分大小写）
# 错误: TEST.md
# 正确: test.md
```

### 问题 3：镜像构建失败

**症状**: Docker build 失败

**解决**:
```bash
# 清理缓存重新构建
docker build --no-cache -t md-to-docx:latest .

# 检查 Dockerfile 是否存在
ls -la Dockerfile
```

### 问题 4：容器无法启动

**症状**: `docker: Error response from daemon`

**解决**:
```bash
# 检查 Docker 服务是否运行
docker ps

# 重启 Docker 服务
# Linux
sudo systemctl restart docker

# Mac/Windows
# 通过 Docker Desktop 重启
```

---

## 🎓 进阶使用

### 1. 自定义输出目录

```bash
docker run --rm \
  -v "$(pwd)/input:/app/input" \
  -v "$HOME/Documents/converted:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f test.md
```

### 2. 处理网络图片

如果 Markdown 包含网络图片：

```markdown
![示例图片](https://example.com/image.jpg)
```

确保容器有网络访问（默认已启用）。

### 3. 使用代理

```bash
docker run --rm \
  -e HTTP_PROXY=http://proxy:8080 \
  -e HTTPS_PROXY=http://proxy:8080 \
  -v "$(pwd)/input:/app/input" \
  -v "$(pwd)/output:/app/output" \
  md-to-docx:latest \
  node dist/index.js -f test.md
```

---

## 📚 下一步

- 查看完整文档：[README.md](./README.md)
- 详细部署指南：[DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)
- 了解源码：`src/index.ts`

---

## ✅ 测试清单

- [ ] Docker 已安装并运行
- [ ] 项目目录准备完成
- [ ] 测试文件已创建
- [ ] Docker 镜像构建成功
- [ ] 首次转换成功
- [ ] 输出文件可以打开
- [ ] 批量转换功能正常

完成以上清单，说明你已经成功掌握了 Docker 部署方式！🎉
