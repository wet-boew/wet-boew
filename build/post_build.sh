if [ "$TRAVIS_PULL_REQUEST" != "true" ]; then
	export REPO="$(pwd | sed s,^/home/travis/builds/,,g)"
	declare -a supported_branches=('master' 'v3.0') # List of branches to store build output for

	#Set git user
	git config --global user.email "travis@travis-ci.org"
	git config --global user.name "Travis"

	#Set upstream remote
	git remote add upstream https://${GH_TOKEN}@github.com/${REPO}.git > /dev/null

	#Copy result of build and demo in a temporary location
	cp -R dist $HOME/dist
	cp -R demos $HOME/demos

	git fetch upstream

	if [ "$REPO" == "wet-boew/wet-boew" ]; then
		#Update working example
		if [ "$TRAVIS_BRANCH" == "master" ]; then
			echo -e "Updating working examples...\n"

			git add -f dist/.
			git stash
			git checkout gh-pages
			git rebase --committer-date-is-author-date master
			git rm -r dist/.
			git stash pop
			git add -f dist/.
			git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
			git push -fq upstream gh-pages > /dev/null

			echo -e "Finished updating the working examples\n"
		fi

		#Add the latest tags
		case "${supported_branches[@]}" in  *"$TRAVIS_BRANCH"*)
			echo -e "Tagging the latest build for branch $TRAVIS_BRANCH\n"

			build_branch="$TRAVIS_BRANCH-dist"

			git checkout -f "$build_branch"

			#Replace the new dist and demo folders with the new ones
			cp -Rf $HOME/dist .
			cp -Rf $HOME/demos .

			#Commit the result
			git add -f dist
			git add -f demos
			git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to $TRAVIS_BRANCH"
			git push -fq upstream $build_branch > /dev/null

			echo -e "Finished tagging the latest build for branch $TRAVIS_BRANCH\n"
		;; esac
	fi
fi