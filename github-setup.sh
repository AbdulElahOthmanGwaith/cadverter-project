#!/bin/bash

# CADverter GitHub Deployment Script
# This script helps you push your project to GitHub

echo "🔧 CADverter GitHub Setup Script"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git config user.email "your-email@example.com"
    git config user.name "Your Name"
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📝 Available commands:"
echo "   1. Push to GitHub"
echo "   2. Create new release"
echo "   3. View git status"
echo "   4. Update README"
echo "   5. Exit"
echo ""

read -p "Choose an option (1-5): " option

case $option in
    1)
        echo ""
        echo "🚀 Pushing to GitHub..."
        echo "Please enter your GitHub repository URL:"
        read repo_url
        
        if [ -z "$repo_url" ]; then
            echo "❌ Repository URL is required"
            exit 1
        fi
        
        git remote add origin "$repo_url" 2>/dev/null || echo "Remote 'origin' already exists"
        git branch -M main
        git push -u origin main
        echo "✅ Successfully pushed to GitHub!"
        ;;
        
    2)
        echo ""
        echo "📦 Creating release..."
        read -p "Enter version number (e.g., 2.0.0): " version
        
        if [ -z "$version" ]; then
            version="1.0.0"
        fi
        
        git tag -a "v$version" -m "Version $version"
        echo "✅ Created tag v$version"
        echo "💡 To push the tag to GitHub, run: git push origin v$version"
        ;;
        
    3)
        echo ""
        git status
        echo ""
        git log --oneline -5
        ;;
        
    4)
        echo ""
        echo "📝 Updating README with latest changes..."
        read -p "Enter new feature to add: " feature
        read -p "Enter description: " description
        
        if [ -n "$feature" ]; then
            sed -i "s/## المميزات/## الم-features\n\n✨ **$feature** - $description/" README.md
            echo "✅ Updated README.md"
            git add README.md
            git commit -m "Update README: Added $feature"
        fi
        ;;
        
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Operation completed successfully!"
