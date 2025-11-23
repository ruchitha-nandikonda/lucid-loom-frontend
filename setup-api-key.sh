#!/bin/bash

# Lucid Loom - OpenAI API Key Setup Script

echo "🔑 Lucid Loom - OpenAI API Key Setup"
echo "======================================"
echo ""

# Check if .env file exists
ENV_FILE="dream-backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file..."
    touch "$ENV_FILE"
    echo "SECRET_KEY=$(openssl rand -hex 32)" >> "$ENV_FILE"
    echo "ALGORITHM=HS256" >> "$ENV_FILE"
    echo "ACCESS_TOKEN_EXPIRE_MINUTES=60" >> "$ENV_FILE"
    echo "OPENAI_API_KEY=your_openai_api_key_here" >> "$ENV_FILE"
    echo "✅ Created .env file"
    echo ""
fi

# Check current API key status
CURRENT_KEY=$(grep "OPENAI_API_KEY" "$ENV_FILE" | cut -d '=' -f2)

if [ "$CURRENT_KEY" = "your_openai_api_key_here" ] || [ -z "$CURRENT_KEY" ]; then
    echo "⚠️  OpenAI API key is not configured"
    echo ""
    echo "To set up your API key:"
    echo ""
    echo "1. Get your API key from: https://platform.openai.com/api-keys"
    echo "2. Sign in or create an account"
    echo "3. Click 'Create new secret key'"
    echo "4. Copy the key (it starts with 'sk-')"
    echo ""
    read -p "Do you want to enter your API key now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your OpenAI API key (sk-...): " API_KEY
        if [ ! -z "$API_KEY" ]; then
            # Update .env file
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$API_KEY|" "$ENV_FILE"
            else
                # Linux
                sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$API_KEY|" "$ENV_FILE"
            fi
            echo ""
            echo "✅ API key updated in .env file"
            echo ""
            echo "⚠️  IMPORTANT: Restart your backend server for changes to take effect!"
            echo "   If using uvicorn: Stop (Ctrl+C) and restart"
            echo "   If using Docker: docker-compose restart backend"
        else
            echo "❌ No API key entered"
        fi
    else
        echo ""
        echo "To set it manually:"
        echo "1. Edit: $ENV_FILE"
        echo "2. Replace: OPENAI_API_KEY=your_openai_api_key_here"
        echo "3. With: OPENAI_API_KEY=sk-your-actual-key-here"
        echo "4. Restart backend server"
    fi
else
    echo "✅ OpenAI API key is configured"
    echo "   Key: ${CURRENT_KEY:0:10}...${CURRENT_KEY: -4}"
    echo ""
    echo "If you're still seeing errors, make sure:"
    echo "1. The backend server has been restarted after setting the key"
    echo "2. The key is valid and has DALL-E access"
    echo "3. You have credits/quota in your OpenAI account"
fi

echo ""
echo "📚 For more help, see: SETUP_OPENAI.md"

