#!/bin/bash
if ! type docker > /dev/null; then
	echo "Docker is required to be present on $PATH"
	exit 0
fi

run () {
	docker run -it \
		-w "/home/node/app" \
		-u node \
		-v "${PWD}":"/home/node/app" \
		-v $HOME/.gitconfig:/home/node/.gitconfig \
		-v $HOME/.npmrc:/home/node/.npmrc \
		-v $HOME/.netrc:/home/node/.netrc \
		-v /tmp/:/tmp/ \
		-e HTTP_PROXY=$HTTP_PROXY \
		-e HTTPS_PROXY=$HTTP_PROXY \
		-e http_proxy=$HTTP_PROXY \
		-e https_proxy=$HTTP_PROXY \
		--env-file "${PWD}/script/docker/env" \
		--sig-proxy=true \
		--pid=host \
		--rm \
		$extra_params \
		wetboew/wet-boew-build $@
}
