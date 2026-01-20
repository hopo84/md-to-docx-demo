# Docker 转换脚本（根目录便捷调用）

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
& ".\deploy\docker-convert.ps1" @args
