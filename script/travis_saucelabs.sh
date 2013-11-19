function error_exit
{
	echo -e "\e[01;31m$1\e[00m" 1>&2
	exit 1
}

if [ "$TRAVIS_SECURE_ENV_VARS" == "true" ] && [ "$TRAVIS_REPO_SLUG" == "wet-boew/wet-boew" ]; then
	grunt saucelabs || error_exit "Error running Sauce tests";
fi
