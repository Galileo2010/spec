#!/bin/bash

# 智能规范助手平台开发启动脚本

echo "🚀 启动智能规范助手平台开发环境..."

# 检查 Bun 是否安装
if ! command -v bun &> /dev/null; then
    echo "❌ Bun 未安装，请先安装 Bun: https://bun.sh"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
bun install

# 初始化数据库
echo "🗄️ 初始化数据库..."
cd backend && bun run db:migrate && cd ..

# 创建环境文件（如果不存在）
if [ ! -f backend/.env ]; then
    echo "📝 创建环境配置文件..."
    cp backend/.env.example backend/.env
    echo "⚠️  请编辑 backend/.env 文件配置您的环境变量"
fi

# 启动开发服务器
echo "🔥 启动开发服务器..."
echo "后端服务: http://localhost:3001"
echo "前端服务: http://localhost:3000"

# 并行启动前后端服务
bun run dev &
BACKEND_PID=$!

bun run dev:frontend &
FRONTEND_PID=$!

# 等待用户中断
echo "按 Ctrl+C 停止服务器..."
wait

# 清理进程
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null