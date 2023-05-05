-include .env

BUILD := $(shell git rev-parse --short HEAD 2> /dev/null)
PROJECTNAME := $(shell basename "$(PWD)")

ELECTRONBASE := $(shell pwd)/electron
ELECTRONBIN := $(ELECTRONBASE)/node_modules/.bin
VERSION := $(shell cat electron/package.json | jq -r '.version' | sed 's/^v//')


## electron-dev: Start Electron in development mode
.PHONY: electron-dev
electron-dev:
	@cd electron && $(ELECTRONBIN)/electron build/index.js

## electron-compile: Compile Electron code
.PHONY: electron-compile
electron-compile:
	@cd electron && $(ELECTRONBIN)/esbuild src/main.ts --bundle --outfile=build/index.js --format=cjs --target=es6 --platform=node  --external:electron --external:electron-updater --external:electron-devtools-installer --external:electron-log

## electron-compile-watch: Compile & watch Electron code
.PHONY: electron-compile-watch
electron-compile-watch:
	@cd electron && $(ELECTRONBIN)/esbuild src/main.ts --bundle --outfile=build/index.js --format=cjs --watch --target=es6 --platform=node --external:electron --external:electron-updater --external:electron-devtools-installer --external:electron-log

## tray-compile-watch: Compile & watch Electron Tray Window code
.PHONY: tray-compile-watch
tray-compile-watch:
	@cd electron && $(ELECTRONBIN)/esbuild --bundle ../assets/js/features/ElectronTrayWindow/index.tsx --outfile=build/tray-window.js --format=iife --watch --target=es6 --platform=node

## tray-compile-watch: Compile & watch Electron Tray Window code
.PHONY: pip-compile-watch
pip-compile-watch:
	@cd electron && $(ELECTRONBIN)/esbuild --bundle ../assets/js/features/ElectronPipWindow/index.tsx --outfile=build/pip-window.js --format=iife --watch --target=es6 --platform=node

## electron-compile: Compile Electron
.PHONY: electron-build
electron-build:
	@echo "Building $(VERSION)"
	@cd electron && $(ELECTRONBIN)/electron-builder

## electron-release: Build new Electron distribution
.PHONY: electron-release
electron-release:
	@echo "Releasing $(VERSION)"
	@scp electron/dist/Sway-$(VERSION)-* root@downloads.sway.so:/var/www/html/releases/.
	@scp electron/dist/latest* root@downloads.sway.so:/var/www/html/releases/.

.PHONY: generate-icons
## electron-generate-icons: Generate Electron icons from logo
electron-generate-icons:
	convert priv/static/images/electron_icon.png -resize 16x16 $(ELECTRONBASE)/assets/icon_16x16.png
	convert priv/static/images/electron_icon.png -resize 32x32 $(ELECTRONBASE)/assets/icon_16x16@2x.png
	convert priv/static/images/electron_icon.png -resize 32x32 $(ELECTRONBASE)/assets/icon_32x32.png
	convert priv/static/images/electron_icon.png -resize 64x64 $(ELECTRONBASE)/assets/icon_32x32@2x.png
	convert priv/static/images/electron_icon.png -resize 128x128 $(ELECTRONBASE)/assets/icon_128x128.png
	convert priv/static/images/electron_icon.png -resize 256x256 $(ELECTRONBASE)/assets/icon_128x128@2x.png
	convert priv/static/images/electron_icon.png -resize 256x256 $(ELECTRONBASE)/assets/icon_256x256.png
	convert priv/static/images/electron_icon.png -resize 512x512 $(ELECTRONBASE)/assets/icon_256x256@2x.png
	convert priv/static/images/electron_icon.png -resize 512x512 $(ELECTRONBASE)/assets/icon_512x512.png
	convert priv/static/images/electron_icon.png -resize 1024x1024 $(ELECTRONBASE)/assets/icon_512x512@2x.png
	convert priv/static/images/electron_icon.png -resize 1024x1024 $(ELECTRONBASE)/assets/icon_1024x1024.png

## clean: clean up electron dist folder
electron-clean:
	@rm -rf electron/dist/*

.PHONY: help
all: help
help: Makefile
	@echo
	@echo "  Choose a command to run in "$(PROJECTNAME)":"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo
