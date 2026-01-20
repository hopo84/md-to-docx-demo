#!/bin/bash

# Docker 部署快速测试脚本
# 此脚本会验证所有 Docker 相关功能

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印标题
print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# 打印成功消息
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 打印错误消息
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 打印警告消息
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 打印信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查命令是否存在
check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 已安装"
        return 0
    else
        print_error "$1 未安装"
        return 1
    fi
}

# 主测试流程
main() {
    print_header "Docker 部署快速测试"
    
    # 1. 环境检查
    print_header "1. 环境检查"
    check_command docker || exit 1
    check_command docker-compose || print_warning "docker-compose 未安装（可选）"
    
    # 检查 Docker 服务
    if docker ps &> /dev/null; then
        print_success "Docker 服务运行正常"
    else
        print_error "Docker 服务未运行"
        exit 1
    fi
    
    # 2. 文件检查
    print_header "2. 文件完整性检查"
    
    required_files=(
        "Dockerfile"
        "docker-compose.yml"
        ".dockerignore"
        "docker-convert.sh"
        "docker-convert.ps1"
        "DOCKER_DEPLOY.md"
        "QUICKSTART.md"
        "DOCKER_CHECKLIST.md"
        "example-test.md"
        "Makefile"
    )
    
    all_files_exist=true
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file 存在"
        else
            print_error "$file 不存在"
            all_files_exist=false
        fi
    done
    
    if [ "$all_files_exist" = false ]; then
        print_error "某些文件缺失，请检查部署"
        exit 1
    fi
    
    # 3. 准备测试环境
    print_header "3. 准备测试环境"
    
    mkdir -p input output
    print_success "创建 input 和 output 目录"
    
    # 创建测试文件
    cat > input/quick-test.md << 'EOF'
# Docker 快速测试

## 测试内容

这是一个自动化测试文档。

### 功能列表

- ✅ Docker 构建
- ✅ 文件转换
- ✅ 输出验证

### 测试表格

| 项目 | 状态 |
|------|------|
| 环境 | ✅ |
| 构建 | 测试中 |
| 转换 | 测试中 |

**如果你看到这个文件，说明转换成功！** 🎉
EOF
    
    print_success "创建测试文件: input/quick-test.md"
    
    # 4. 构建 Docker 镜像
    print_header "4. 构建 Docker 镜像"
    print_info "开始构建镜像（可能需要几分钟）..."
    
    if docker build -f deploy/Dockerfile -t md-to-docx:latest . > /tmp/docker-build.log 2>&1; then
        print_success "Docker 镜像构建成功"
    else
        print_error "Docker 镜像构建失败"
        echo "查看日志: cat /tmp/docker-build.log"
        exit 1
    fi
    
    # 检查镜像
    if docker images | grep -q "md-to-docx"; then
        image_size=$(docker images md-to-docx:latest --format "{{.Size}}")
        print_success "镜像已创建，大小: $image_size"
    else
        print_error "未找到镜像"
        exit 1
    fi
    
    # 5. 运行转换测试
    print_header "5. 运行转换测试"
    print_info "正在转换测试文件..."
    
    if docker run --rm \
        -v "$(pwd)/input:/app/input" \
        -v "$(pwd)/output:/app/output" \
        md-to-docx:latest \
        node dist/index.js -f quick-test.md > /tmp/docker-run.log 2>&1; then
        print_success "转换执行成功"
    else
        print_error "转换执行失败"
        echo "查看日志: cat /tmp/docker-run.log"
        exit 1
    fi
    
    # 6. 验证输出
    print_header "6. 验证输出"
    
    output_count=$(ls -1 output/*.docx 2>/dev/null | wc -l)
    if [ "$output_count" -gt 0 ]; then
        print_success "找到 $output_count 个输出文件"
        echo ""
        print_info "输出文件列表:"
        ls -lh output/*.docx | tail -n 5
    else
        print_error "未找到输出文件"
        exit 1
    fi
    
    # 7. 测试便捷脚本
    print_header "7. 测试便捷脚本"
    
    if [ -x "docker-convert.sh" ]; then
        print_success "docker-convert.sh 可执行"
    else
        print_warning "docker-convert.sh 没有执行权限"
        chmod +x docker-convert.sh
        print_success "已添加执行权限"
    fi
    
    # 8. 测试 Make 命令
    print_header "8. 测试 Make 命令"
    
    if check_command make; then
        print_info "可用的 Make 命令:"
        make help 2>/dev/null || echo "  运行 'make help' 查看所有命令"
    fi
    
    # 9. 完成总结
    print_header "✅ 测试完成！"
    
    echo ""
    echo "测试总结:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Docker 环境正常"
    print_success "所有文件完整"
    print_success "镜像构建成功"
    print_success "转换功能正常"
    print_success "输出文件已生成"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_info "下一步:"
    echo "  1. 查看生成的文件: ls -lh output/"
    echo "  2. 转换你的文件: ./docker-convert.sh your-file.md"
    echo "  3. 批量转换: ./docker-convert.sh -a"
    echo "  4. 查看详细文档: cat DOCKER_DEPLOY.md"
    echo ""
    
    print_success "部署验证成功！🎉"
}

# 运行主程序
main "$@"
