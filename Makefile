#!make

DOCKER_IMAGE := jest-aws-matchers

build:
	@docker build -t $(DOCKER_IMAGE) .

develop:
	@docker run --rm -it -v $(PWD):/opt/ct -w /opt/ct $(DOCKER_IMAGE) bash