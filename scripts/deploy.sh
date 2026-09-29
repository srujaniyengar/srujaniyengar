#!/usr/bin/env sh
# Build and push the site to srujaniyengar.github.io (the repo GitHub serves at the root).
# Usage: npm run deploy   (from a clone that sits next to ../srujaniyengar.github.io)
set -eu
cd "$(dirname "$0")/.."
npm run build
sha=$(git rev-parse --short HEAD)
cd ../srujaniyengar.github.io
rm -rf assets index.html favicon.svg
cp -r ../srujaniyengar/dist/. .
touch .nojekyll
git add -A
git -c user.name=srujaniyengar -c user.email=srujanparthasarathyiyengar@gmail.com \
  commit -qm "Deploy srujaniyengar/srujaniyengar@$sha"
git push
