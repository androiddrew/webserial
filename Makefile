serve:
	python3 -m http.server 8080
.PHONY: serve

watch:
	npx tailwindcss -i ./src/dev.css -o ./src/main.css --watch
.PHONY: watch

build:
	echo "Not implemented yet..."
.PHONY: build

image:
	docker build -t androiddrew/webserial:latest .
.PHONY: build

push:
	docker push androiddrew/webserial:latest
.PHONY: push