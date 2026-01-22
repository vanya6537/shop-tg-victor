#!/bin/bash
# Science Show Webapp - Installation Script

echo "🚀 Installing Science Show Webapp dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm run preview  - Preview production build"
echo ""
echo "Starting development server..."
npm run dev
