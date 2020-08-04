build:
	docker build -t google-play-publish-image .

console:
	docker run -it --rm -v ${PWD}:/app google-play-publish-image bash