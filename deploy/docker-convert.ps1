# Markdown 转 DOCX - Docker 便捷转换脚本 (Windows PowerShell)

param(
    [switch]$Help,
    [switch]$Build,
    [switch]$All,
    [string]$FileName
)

# 打印帮助信息
function Print-Help {
    Write-Host "用法: .\docker-convert.ps1 [选项] -FileName <文件名>"
    Write-Host ""
    Write-Host "选项:"
    Write-Host "  -Help               显示帮助信息"
    Write-Host "  -Build              先构建 Docker 镜像"
    Write-Host "  -All                转换 input 目录下的所有 .md 文件"
    Write-Host "  -FileName <名称>    要转换的文件名"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\docker-convert.ps1 -FileName input.md          # 转换单个文件"
    Write-Host "  .\docker-convert.ps1 -Build -FileName input.md   # 构建镜像后转换"
    Write-Host "  .\docker-convert.ps1 -All                        # 转换所有文件"
    exit 0
}

# 检查 Docker 是否安装
function Check-Docker {
    try {
        docker --version | Out-Null
    } catch {
        Write-Host "错误: 未检测到 Docker，请先安装 Docker" -ForegroundColor Red
        exit 1
    }
}

# 构建 Docker 镜像
function Build-Image {
    Write-Host "正在构建 Docker 镜像..." -ForegroundColor Yellow
    docker build -f deploy/Dockerfile -t md-to-docx:latest .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 镜像构建成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 镜像构建失败" -ForegroundColor Red
        exit 1
    }
}

# 检查镜像是否存在
function Check-Image {
    $imageExists = docker images | Select-String "md-to-docx"
    if (-not $imageExists) {
        Write-Host "未找到镜像，开始构建..." -ForegroundColor Yellow
        Build-Image
    }
}

# 创建必要的目录
function Setup-Dirs {
    if (-not (Test-Path "input")) { New-Item -ItemType Directory -Path "input" | Out-Null }
    if (-not (Test-Path "output")) { New-Item -ItemType Directory -Path "output" | Out-Null }
}

# 转换单个文件
function Convert-File {
    param([string]$filename)
    
    $filepath = Join-Path "input" $filename
    if (-not (Test-Path $filepath)) {
        Write-Host "错误: 文件 '$filepath' 不存在" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "正在转换: $filename" -ForegroundColor Yellow
    
    docker run --rm `
        -v "${PWD}/input:/app/input" `
        -v "${PWD}/output:/app/output" `
        md-to-docx:latest `
        node dist/index.js -f $filename
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 转换完成: $filename" -ForegroundColor Green
    } else {
        Write-Host "❌ 转换失败: $filename" -ForegroundColor Red
        exit 1
    }
}

# 转换所有文件
function Convert-All {
    $files = Get-ChildItem -Path "input" -Filter "*.md"
    $count = 0
    $success = 0
    $failed = 0
    
    foreach ($file in $files) {
        $filename = $file.Name
        $count++
        Write-Host "[$count] 正在转换: $filename" -ForegroundColor Yellow
        
        docker run --rm `
            -v "${PWD}/input:/app/input" `
            -v "${PWD}/output:/app/output" `
            md-to-docx:latest `
            node dist/index.js -f $filename
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 完成: $filename" -ForegroundColor Green
            $success++
        } else {
            Write-Host "❌ 失败: $filename" -ForegroundColor Red
            $failed++
        }
        Write-Host "---"
    }
    
    if ($count -eq 0) {
        Write-Host "input 目录下没有找到 .md 文件" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "转换完成！" -ForegroundColor Green
        Write-Host "总计: $count 个文件"
        Write-Host "成功: $success 个" -ForegroundColor Green
        Write-Host "失败: $failed 个" -ForegroundColor Red
    }
}

# 主程序
function Main {
    if ($Help) {
        Print-Help
    }
    
    Check-Docker
    Setup-Dirs
    
    # 如果指定了构建，先构建镜像
    if ($Build) {
        Build-Image
    } else {
        Check-Image
    }
    
    # 执行转换
    if ($All) {
        Convert-All
    } elseif ([string]::IsNullOrEmpty($FileName)) {
        Write-Host "错误: 请指定要转换的文件名" -ForegroundColor Red
        Write-Host ""
        Print-Help
    } else {
        Convert-File $FileName
    }
}

# 运行主程序
Main
