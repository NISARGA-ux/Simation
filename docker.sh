#!/bin/bash
# deploy.sh — run from project root
# Builds frontend and copies into backend/dist for single-service deploy on Render

set -e

echo "═══════════════════════════════════════════"
echo "  ZENITH CORTEX — BUILD & PREP FOR DEPLOY"
echo "═══════════════════════════════════════════"

# Build frontend
echo ""
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy dist to backend
echo ""
echo "📋 Copying dist to backend..."
rm -rf backend/dist
cp -r frontend/dist backend/dist

echo ""
echo "✅ Done! backend/dist is ready."
echo ""
echo "To deploy on Render:"
echo "  1. Push to GitHub"
echo "  2. Create a Web Service on Render"
echo "  3. Set Docker as runtime"
echo "  4. Set Dockerfile path: ./backend/Dockerfile"
echo "  5. Set Docker context: ./backend"
echo "  6. Add env vars: GROQ_API_KEY, TAVILY_API_KEY, SERPAPI_API_KEY"
echo "  7. Deploy!"
echo ""
echo "Your app will be at: https://your-service.onrender.com"
echo "═══════════════════════════════════════════"