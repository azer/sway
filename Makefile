-include .env

BUILD := $(shell git rev-parse --short HEAD 2> /dev/null)
PROJECTNAME := $(shell basename "$(PWD)")

NODEBASE := $(shell pwd)/electron
NODEBIN := $(NODEBASE)/node_modules/.bin
VERSION := $(shell cat electron/package.json | jq -r '.version' | sed 's/^v//')


## electron-dev: Start Electron in development mode
.PHONY: electron-dev
electron-dev:
	@cd electron && $(NODEBIN)/esbuild src/main.js --outfile=build/index.js --format=cjs --watch

## electron-compile: Compile Electron
.PHONY: electron-compile
electron-compile:
	@cd electron && $(NODEBIN)/esbuild src/main.js --outfile=build/index.js --format=cjs

## electron-compile: Compile Electron
.PHONY: electron-build
electron-build:
	@echo "Building $(VERSION)"
	@cd electron && $(NODEBIN)/electron-builder

## electron-release: Build new Electron distribution
.PHONY: electron-release
electron-release:
	@echo "Releasing $(VERSION)"
	@scp electron/dist/Sway-$(VERSION)-* root@downloads.sway.so:/var/www/html/releases/.
	@scp electron/dist/latest* root@downloads.sway.so:/var/www/html/releases/.

.PHONY: help
all: help
help: Makefile
	@echo
	@echo "  Choose a command to run in "$(PROJECTNAME)":"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo
