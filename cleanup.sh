#!/bin/bash
# Cleanup script for freeing up disk space in your project

set -e

# 1. Remove old demo/archive files (if not needed)
rm -rf ~/server-ui/archive/demo-site

# 2. Remove old logs (if any)
rm -rf ~/server-ui/logs/*

# 3. Remove unused images/fonts (edit these lines if you want to keep any)
rm -f ~/server-ui/public/Minimalist\ Logo\ Suite\ for\ Clouded\ Basement.png
rm -f ~/server-ui/public/hero\ personal\ portfolio.jpg
rm -f ~/server-ui/public/fonts/Supercharge3D-GO79P.otf

# 4. Prune pnpm cache
cd ~/server-ui/react-homepage
pnpm store prune || true
pnpm cache clean --all || true

# 5. System package cleanup
sudo apt autoremove -y
sudo apt clean

# 6. Show disk usage after cleanup
du -h --max-depth=1 ~/server-ui
