#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 Updating Shveraa Server Code...      "
echo "=========================================="

TARGET_DIR="/home/mani/public_html/server"

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Target directory $TARGET_DIR does not exist!"
    exit 1
fi

TMP_DIR=$(mktemp -d)
echo "📥 Cloning latest code from GitHub..."
git clone --depth 1 https://github.com/ShvInfotech/shveraa.git "$TMP_DIR"

echo "📦 Syncing server files..."
cp -r "$TMP_DIR"/server/config "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/controllers "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/helper "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/middleware "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/models "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/routes "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/services "$TARGET_DIR"/
cp -r "$TMP_DIR"/server/webhooks "$TARGET_DIR"/
cp "$TMP_DIR"/server/server.js "$TARGET_DIR"/
cp "$TMP_DIR"/server/package.json "$TARGET_DIR"/

rm -rf "$TMP_DIR"

echo "📦 Checking and installing dependencies..."
cd "$TARGET_DIR" && npm install --omit=dev

echo "🔄 Restarting shveraa-api PM2 process..."
pm2 restart shveraa-api

echo "=========================================="
echo "  ✅ Server updated & restarted successfully! "
echo "=========================================="
