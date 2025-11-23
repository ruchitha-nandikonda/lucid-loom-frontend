#!/bin/bash

echo "=========================================="
echo "OpenAI API Key Setup for Lucid Loom"
echo "=========================================="
echo ""
echo "This script will help you add your OpenAI API key to the .env file."
echo ""
read -p "Enter your OpenAI API key (starts with sk-): " api_key

if [ -z "$api_key" ]; then
    echo "Error: No API key provided"
    exit 1
fi

ENV_FILE="dream-backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

# Update the OPENAI_API_KEY in .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" "$ENV_FILE"
else
    # Linux
    sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" "$ENV_FILE"
fi

echo ""
echo "✓ API key updated in $ENV_FILE"
echo ""
echo "Next steps:"
echo "1. Restart your backend server (if it's running)"
echo "2. Try creating a new dream!"
echo ""
