#!/bin/sh

PACKAGE_FILE="./package.json"

if [ ! -f "$PACKAGE_FILE" ]; then
  echo "❌ package.json not found!"
  exit 1
fi

# Format ngày hiện tại: YYYY.MM.DD
TODAY=$(date +"%Y.%m.%d")

# Lấy version hiện tại trong package.json
CURRENT_VERSION=$(jq -r '.buildVersion' "$PACKAGE_FILE")

# Lấy ngày và số build từ version hiện tại
CURRENT_DATE=$(echo "$CURRENT_VERSION" | cut -d '-' -f 1)
CURRENT_BUILD=$(echo "$CURRENT_VERSION" | cut -d '-' -f 2)

BUILD_NUM=$(printf "%03d" $((10#$CURRENT_BUILD + 1)))

# if [ "$CURRENT_DATE" = "$TODAY" ]; then
#   # Nếu cùng ngày, tăng số build
#   BUILD_NUM=$(printf "%03d" $((10#$CURRENT_BUILD + 1)))
# else
#   # Ngày mới, reset build về 001
#   BUILD_NUM="001"
# fi

# Tạo version mới
NEW_VERSION="$TODAY-$BUILD_NUM"

# Ghi lại vào package.json
jq ".buildVersion = \"$NEW_VERSION\"" "$PACKAGE_FILE" > "$PACKAGE_FILE.tmp" && mv "$PACKAGE_FILE.tmp" "$PACKAGE_FILE"

echo "✅ Version updated: $CURRENT_VERSION → $NEW_VERSION"
