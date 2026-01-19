#!/bin/bash

# Markdown 转 DOCX - Docker 便捷转换脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印帮助信息
print_help() {
    echo "用法: ./docker-convert.sh [选项] <文件名>"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -b, --build         先构建 Docker 镜像"
    echo "  -a, --all           转换 input 目录下的所有 .md 文件"
    echo ""
    echo "示例:"
    echo "  ./docker-convert.sh input.md          # 转换单个文件"
    echo "  ./docker-convert.sh -b input.md       # 构建镜像后转换"
    echo "  ./docker-convert.sh -a                # 转换所有文件"
    exit 0
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未检测到 Docker，请先安装 Docker${NC}"
        exit 1
    fi
}

# 构建 Docker 镜像
build_image() {
    echo -e "${YELLOW}正在构建 Docker 镜像...${NC}"
    docker build -t md-to-docx:latest .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 镜像构建成功${NC}"
    else
        echo -e "${RED}❌ 镜像构建失败${NC}"
        exit 1
    fi
}

# 检查镜像是否存在
check_image() {
    if ! docker images | grep -q "md-to-docx"; then
        echo -e "${YELLOW}未找到镜像，开始构建...${NC}"
        build_image
    fi
}

# 创建必要的目录
setup_dirs() {
    mkdir -p input output
}

# 转换单个文件
convert_file() {
    local filename=$1
    local filepath="input/$filename"
    
    if [ ! -f "$filepath" ]; then
        echo -e "${RED}错误: 文件 '$filepath' 不存在${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}正在转换: $filename${NC}"
    
    docker run --rm \
        -v "$(pwd)/input:/app/input" \
        -v "$(pwd)/output:/app/output" \
        md-to-docx:latest \
        node dist/index.js -f "$filename"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 转换完成: $filename${NC}"
    else
        echo -e "${RED}❌ 转换失败: $filename${NC}"
        exit 1
    fi
}

# 转换所有文件
convert_all() {
    local count=0
    local success=0
    local failed=0
    
    for file in input/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -e "${YELLOW}[$((count+1))] 正在转换: $filename${NC}"
            
            docker run --rm \
                -v "$(pwd)/input:/app/input" \
                -v "$(pwd)/output:/app/output" \
                md-to-docx:latest \
                node dist/index.js -f "$filename"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 完成: $filename${NC}"
                ((success++))
            else
                echo -e "${RED}❌ 失败: $filename${NC}"
                ((failed++))
            fi
            ((count++))
            echo "---"
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo -e "${YELLOW}input 目录下没有找到 .md 文件${NC}"
    else
        echo ""
        echo -e "${GREEN}转换完成！${NC}"
        echo -e "总计: $count 个文件"
        echo -e "成功: ${GREEN}$success${NC} 个"
        echo -e "失败: ${RED}$failed${NC} 个"
    fi
}

# 主程序
main() {
    check_docker
    setup_dirs
    
    local should_build=0
    local convert_all_files=0
    local filename=""
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                print_help
                ;;
            -b|--build)
                should_build=1
                shift
                ;;
            -a|--all)
                convert_all_files=1
                shift
                ;;
            *)
                filename=$1
                shift
                ;;
        esac
    done
    
    # 如果指定了构建，先构建镜像
    if [ $should_build -eq 1 ]; then
        build_image
    else
        check_image
    fi
    
    # 执行转换
    if [ $convert_all_files -eq 1 ]; then
        convert_all
    elif [ -z "$filename" ]; then
        echo -e "${RED}错误: 请指定要转换的文件名${NC}"
        echo ""
        print_help
    else
        convert_file "$filename"
    fi
}

# 运行主程序
main "$@"
