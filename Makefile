serve:
	npx vite
.PHONY: serve

watch:
	npx tailwindcss -i ./src/dev.css -o ./src/main.css --watch
.PHONY: watch

build:
	npx vite build --emptyOutDir
.PHONY: build

image:
	docker build -t androiddrew/webserial:latest .
.PHONY: build

push:
	docker push androiddrew/webserial:latest
.PHONY: push