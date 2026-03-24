#!/bin/bash

# Tizzle Backend Setup Script
# This script helps you setup the development environment

set -e

echo "🚀 Tizzle Backend Setup"
echo "======================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be >= 20. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker -v | cut -d' ' -f3 | tr -d ',') detected"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not found (optional)"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📝 Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env with your configuration"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
if [ "$DOCKER_AVAILABLE" = true ]; then
    read -p "🐳 Start PostgreSQL and Redis with Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting services..."
        docker-compose up -d postgres redis
        echo "✅ PostgreSQL and Redis started"
        echo "Waiting for services to be ready..."
        sleep 5
    fi
fi

echo ""
read -p "🗄️  Run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generating migrations..."
    npm run db:generate
    echo "Running migrations..."
    npm run db:migrate
    echo "✅ Database migrations completed"
fi

echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Start development server: npm run start:dev"
echo "3. Visit http://localhost:3000/docs for API documentation"
echo ""
echo "Useful commands:"
echo "  npm run start:dev    - Start development server"
echo "  npm run db:studio    - Open database GUI"
echo "  npm run lint         - Lint code"
echo "  npm run test         - Run tests"
echo ""
echo "Happy coding! 🎉"
