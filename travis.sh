#!/bin/bash
start=$(date +%s)
echo -e "Current repo: $TRAVIS_REPO_SLUG\n"

function error_exit
{
	echo -e "\e[01;31m$1\e[00m" 1>&2
	exit 1
}

if [ "$TRAVIS_PULL_REQUEST" == "false" ] &&  [ "$TRAVIS_REPO_SLUG" == "wet-boew/wet-boew" ]; then

	#Set git user
	git config --global user.email "wet.boew.bot@gmail.com"
	git config --global user.name "Web Experience Toolkit Bot"

	#Add the latest build result
	echo -e "Uploading the build artifact for branch $TRAVIS_BRANCH\n"

	build_branch="$TRAVIS_BRANCH-dist"

	grunt deploy > /dev/null 2>&1  || error_exit "Error cloning the artifact repository";

	echo -e "Done uploading the build artifact for branch $TRAVIS_BRANCH\n"

	#Update the working examples
	echo -e "Updating working examples...\n"

	cd ..
	git clone -q https://${GH_TOKEN}@github.com/wet-boew/wet-boew.github.io.git > /dev/null 2>&1  || error_exit "Error cloning the working examples repository";
	cd wet-boew.github.io

	if [ "$TRAVIS_BRANCH" == "master" ]; then
		submodule_name="wet-boew"
	else
		submodule_name="$TRAVIS_BRANCH-ci"
	fi

	echo -e "Updating submodule '$submodule_name'"
	#Use the existing local repo for initializing the submodule
	git submodule update --reference ../wet-boew-dist --init "$submodule_name"

	cd "$submodule_name"
	#Checkout dist branch to move forward submodule HEAD pointer
	git checkout $build_branch
	cd ..
	git add .
	git commit -q -m "Travis build $TRAVIS_BUILD_NUMBER"
	git push -fq origin master > /dev/null 2>&1 || error_exit "Error uploading the working examples"


	echo -e "Finished updating the working examples\n"

fi

end=$(date +%s)
elapsed=$(( $end - $start ))
minutes=$(( $elapsed / 60 ))
seconds=$(( $elapsed % 60 ))
echo "Post-Build process finished in $minutes minute(s) and $seconds seconds"
