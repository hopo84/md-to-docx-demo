#!/bin/bash
# Docker 转换脚本（根目录便捷调用）

cd "$(dirname "$0")"
exec ./deploy/docker-convert.sh "$@"
