#!/bin/sh
cp Dockerfile.template Dockerfile

echo "\n#\n# Java\n#\n" >> Dockerfile
curl -sSL --compressed  https://raw.githubusercontent.com/docker-library/openjdk/445f8b8d18d7c61e2ae7fda76d8883b5d51ae0a5/8-jre/Dockerfile | tail -n +8  >> Dockerfile

echo "\n#\n# Ruby\n#\n" >> Dockerfile
curl -sSL --compressed  https://raw.githubusercontent.com/docker-library/ruby/bfc7a48724ceb1917ddbcb713b24c835eca584c8/2.4/Dockerfile | tail -n +3 | head -n -1  >> Dockerfile

echo "RUN gem install rake html-proofer" >> Dockerfile
