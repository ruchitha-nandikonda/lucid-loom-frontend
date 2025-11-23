#!/bin/bash

# One-Command API Key Setup for Lucid Loom
# Just run: ./ONE_COMMAND_SETUP.sh

clear
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🔑 Lucid Loom - OpenAI API Key Setup                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "This will help you set up your OpenAI API key in 2 minutes."
echo ""

# Check if .env exists
ENV_FILE="dream-backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    mkdir -p dream-backend
    cat > "$ENV_FILE" << EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo "✅ Created .env file"
    echo ""
fi

# Check current key
CURRENT_KEY=$(grep "OPENAI_API_KEY" "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')

if [ "$CURRENT_KEY" = "your_openai_api_key_here" ] || [ -z "$CURRENT_KEY" ]; then
    echo "⚠️  API Key Status: NOT CONFIGURED"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 1: Get Your API Key"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Open this link in your browser:"
    echo "   👉 https://platform.openai.com/api-keys"
    echo ""
    echo "2. Sign in (or create account)"
    echo ""
    echo "3. Click 'Create new secret key'"
    echo ""
    echo "4. Copy the key (it starts with 'sk-')"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 2: Enter Your Key"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Paste your OpenAI API key here: " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo ""
        echo "❌ No key entered. Exiting."
        exit 1
    fi
    
    # Validate key format
    if [[ ! "$API_KEY" =~ ^sk- ]]; then
        echo ""
        echo "⚠️  Warning: API key should start with 'sk-'"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$API_KEY|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$API_KEY|" "$ENV_FILE"
    fi
    
    echo ""
    echo "✅ API key saved to .env file!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "STEP 3: Restart Backend"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  IMPORTANT: You need to restart your backend server!"
    echo ""
    echo "1. Find the terminal running: uvicorn main:app --reload"
    echo "2. Press Ctrl+C to stop it"
    echo "3. Start it again:"
    echo ""
    echo "   cd dream-backend"
    echo "   source venv/bin/activate"
    echo "   uvicorn main:app --reload"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Setup Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "After restarting the backend:"
    echo "  → Refresh your browser"
    echo "  → Try 'Transform Your Dream' again"
    echo "  → It should work! 🎉"
    echo ""
    
else
    echo "✅ API Key Status: CONFIGURED"
    echo ""
    KEY_PREVIEW="${CURRENT_KEY:0:10}...${CURRENT_KEY: -4}"
    echo "Key: $KEY_PREVIEW"
    echo ""
    echo "If you're still seeing errors:"
    echo "  1. Make sure you restarted the backend after setting the key"
    echo "  2. Check that the key is valid in your OpenAI account"
    echo "  3. Verify you have credits/quota available"
    echo ""
fi

