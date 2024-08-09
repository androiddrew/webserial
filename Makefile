serve:
	python3 -m http.server 8080
.PHONY: serve

build:
	echo "Not implemented yet..."
.PHONY: build

image:
	docker build -t androiddrew/webserial:latest .
.PHONY: build

push:
	docker push androiddrew/webserial:latest
.PHONY: push