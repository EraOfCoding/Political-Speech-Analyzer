#!/bin/bash

echo "🚀 Political Speech Analyzer - Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Minimum version: 18.0.0"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take 2-3 minutes..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
else
    echo ""
    echo "❌ Failed to install dependencies"
    echo "Please check the error messages above"
    exit 1
fi

# Check if .env.local exists and has API key
if [ -f .env.local ]; then
    if grep -q "your_openai_api_key_here" .env.local; then
        echo "⚠️  WARNING: Please add your OpenAI API key to .env.local"
        echo ""
        echo "Steps:"
        echo "1. Open .env.local in a text editor"
        echo "2. Replace 'your_openai_api_key_here' with your actual API key"
        echo "3. Get your API key from: https://platform.openai.com/api-keys"
        echo ""
    else
        echo "✅ OpenAI API key configured"
        echo ""
    fi
else
    echo "❌ .env.local file not found"
    exit 1
fi

echo "🎉 Setup Complete!"
echo ""
echo "To start the app:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Need help? Read QUICKSTART.md"
