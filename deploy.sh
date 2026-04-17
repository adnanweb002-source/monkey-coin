#!/bin/bash

set -e  # stop on error

echo "🚀 Building app..."
npm install
npm run build

echo "📦 Copying build to server path..."

TARGET_DIR="/var/www/panel"

rm -rf $TARGET_DIR/*
mkdir -p $TARGET_DIR
cp -r dist/* $TARGET_DIR

echo "🔄 Reloading Caddy..."
sudo systemctl reload caddy

echo "✅ Deployment complete!"