.PHONY: help build run clean docker-build docker-run docker-clean test

# 默认目标
help:
	@echo "可用命令:"
	@echo "  make build         - 编译 TypeScript"
	@echo "  make run           - 运行本地转换（默认 input.md）"
	@echo "  make clean         - 清理编译文件"
	@echo "  make docker-build  - 构建 Docker 镜像"
	@echo "  make docker-run    - 运行 Docker 转换"
	@echo "  make docker-test   - Docker 快速测试"
	@echo "  make docker-clean  - 清理 Docker 镜像"
	@echo "  make test          - 运行完整测试"
	@echo ""
	@echo "环境变量:"
	@echo "  FILE=xxx.md        - 指定要转换的文件（默认 input.md）"
	@echo ""
	@echo "示例:"
	@echo "  make run FILE=test.md"
	@echo "  make docker-run FILE=example.md"

# 本地构建
build:
	@echo "正在编译 TypeScript..."
	npm run build
	@echo "✅ 编译完成"

# 本地运行
run: build
	@echo "正在转换文件: $(or $(FILE),input.md)"
	npm start -- -f $(or $(FILE),input.md)

# 清理编译文件
clean:
	@echo "正在清理..."
	rm -rf dist
	rm -rf output/*
	@echo "✅ 清理完成"

# 构建 Docker 镜像
docker-build:
	@echo "正在构建 Docker 镜像..."
	docker build -t md-to-docx:latest .
	@echo "✅ Docker 镜像构建完成"

# 运行 Docker 转换
docker-run:
	@echo "正在使用 Docker 转换: $(or $(FILE),input.md)"
	docker run --rm \
		-v "$(PWD)/input:/app/input" \
		-v "$(PWD)/output:/app/output" \
		md-to-docx:latest \
		node dist/index.js -f $(or $(FILE),input.md)
	@echo "✅ 转换完成，查看 output/ 目录"

# Docker 快速测试
docker-test: docker-build
	@echo "创建测试文件..."
	@mkdir -p input output
	@echo "# Docker 测试\n\n这是一个测试文档。\n\n- 项目 1\n- 项目 2\n\n**测试成功！**" > input/docker-test.md
	@echo "运行转换..."
	@make docker-run FILE=docker-test.md
	@echo "✅ 测试完成！查看 output/ 目录"

# 清理 Docker 资源
docker-clean:
	@echo "正在清理 Docker 资源..."
	docker rmi md-to-docx:latest 2>/dev/null || true
	docker system prune -f
	@echo "✅ Docker 资源清理完成"

# 完整测试
test:
	@echo "运行完整测试..."
	@mkdir -p input output
	@cp example-test.md input/
	@make docker-build
	@make docker-run FILE=example-test.md
	@echo "✅ 完整测试完成！"
	@ls -lh output/

# Docker Compose 相关
compose-build:
	docker-compose build

compose-run:
	docker-compose run --rm md-to-docx node dist/index.js -f $(or $(FILE),input.md)

# 安装依赖
install:
	npm install
	@echo "✅ 依赖安装完成"

# 初始化项目
init: install build
	@mkdir -p input output
	@echo "✅ 项目初始化完成"
