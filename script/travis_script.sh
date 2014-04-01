set -e
scss-lint .
grunt test test-mocha
./script/travis_artifacts.sh
