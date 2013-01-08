if [ "$TRAVIS_PULL_REQUEST" != "true" ]; then
	export REPO="$(pwd | sed s,^/home/travis/builds/,,g)"
	declare -a supported_branches=('master' 'v3.0') # List of branches to store build output for

	#Copy result of build and demo in a temporary location
	cp -R dist $HOME/dist
	cp -R demos $HOME/demos

	git fetch

	if [ "$REPO" == "wet-boew/wet-boew" ]; then
		#Update working example
		if [ "$TRAVIS_BRANCH" == "master" ]; then
			echo "Updating working examples..."

			git add -f dist/.
			git stash
			git checkout gh-pages
			git rebase --committer-date-is-author-date master
			git rm -r dist/.
			git stash pop
			git add -f dist/.
			git commit -m "Travis build $TRAVIS_JOB_ID pushed to gh-pages"
			git push -fq https://${GH_TOKEN}@github.com/${REPO}.git gh-pages > /dev/null

			echo "Finished updating the working examples"
		fi

		#Add the latest tags
		case "${supported_branches[@]}" in  *"$TRAVIS_BRANCH"*)
			echo "Tagging the latest build for branch $TRAVIS_BRANCH"

			build_branch="$TRAVIS_BRANCH-dist"

			git checkout -f "$build_branch"

			#Replace the new dist and demo folders with the new ones
			cp -Rf $HOME/dist .
			cp -Rf $HOME/demos .

			#Commit the result
			git add -f dist
			git add -f demos
			git commit -m "Travis build $TRAVIS_JOB_ID pushed to $TRAVIS_BRANCH"
			git push -fq https://${GH_TOKEN}@github.com/${REPO}.git $build_branch > /dev/null

			echo "Finished tagging the latest build for branch $TRAVIS_BRANCH"
		;; esac
	fi
fi