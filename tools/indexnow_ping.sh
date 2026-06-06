#!/bin/bash
# IndexNow ping — notifies Bing (feeds ChatGPT search + Copilot) of updated URLs.
# Usage: ./tools/indexnow_ping.sh https://entuned.co/blog/some-post.html [more URLs...]
# Key file hosted at https://entuned.co/a90a24496d14307cb0567d7dc9281578.txt
KEY="a90a24496d14307cb0567d7dc9281578"
URLS=$(printf '"%s",' "$@" | sed 's/,$//')
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"entuned.co\",\"key\":\"$KEY\",\"keyLocation\":\"https://entuned.co/a90a24496d14307cb0567d7dc9281578.txt\",\"urlList\":[$URLS]}"
echo ""
