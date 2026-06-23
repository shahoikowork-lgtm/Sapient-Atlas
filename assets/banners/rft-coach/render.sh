#!/bin/zsh
node build.js
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --force-device-scale-factor=2 --allow-file-access-from-files \
  --virtual-time-budget=3500 --window-size=1080,1350 \
  --screenshot="out/poster@2x.png" "file://$PWD/slides/poster.html" 2>/dev/null
sips -z 1350 1080 out/poster@2x.png --out out/poster-1080x1350.png >/dev/null 2>&1
echo "ok -> out/poster-1080x1350.png ($(sips -g pixelWidth -g pixelHeight out/poster-1080x1350.png 2>/dev/null | tail -2 | tr '\n' ' '))"
