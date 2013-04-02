res1=$(date +%s.%N)
echo -e "Current repo: $TRAVIS_REPO_SLUG\n"

if [ "$TRAVIS_PULL_REQUEST" == "false" ] &&  [ "$TRAVIS_REPO_SLUG" == "wet-boew/wet-boew" ]; then
	declare -a supported_branches=('master' 'v3.0') # List of branches to store build output for

	#Set git user
	git config --global user.email "laurent.goderre@gmail.com"
	git config --global user.name "Travis"

	#Set remotes
	git remote add upstream https://${GH_TOKEN}@github.com/wet-boew/wet-boew.git > /dev/null
	git remote add experimental https://${GH_TOKEN}@github.com/LaurentGoderre/wet-boew.git > /dev/null

	#Copy result of build and demo in a temporary location
	mkdir $HOME/temp_wet-boew
	cp -R dist $HOME/temp_wet-boew/dist
	cp -R demos $HOME/temp_wet-boew/demos
	cp -R test $HOME/temp_wet-boew/test
	cp *.htm* $HOME/temp_wet-boew
	cp *.md $HOME/temp_wet-boew
	cp *.txt $HOME/temp_wet-boew
	
	#Update working example
	if [ "$TRAVIS_BRANCH" == "master" ]; then
		echo -e "Updating working examples...\n"

		git checkout -B gh-pages
		git add -f dist/.
		git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
		git push -fq upstream gh-pages > /dev/null

		echo -e "Finished updating the working examples\n"
	fi

	#Update the experimental working example
	if [[ "$TRAVIS_BRANCH" == experimental* ]]; then
		echo -e "Updating experimental working examples...\n"

		git checkout -B gh-pages
		git add -f dist/.
		git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
		git push -fq experimental gh-pages > /dev/null

		echo -e "Finished updating the experimental working examples\n"
	fi

	#Add the latest tags
	case "${supported_branches[@]}" in  *"$TRAVIS_BRANCH"*)
		echo -e "Tagging the latest build for branch $TRAVIS_BRANCH\n"

		build_branch="$TRAVIS_BRANCH-dist"
		
		cd ..
		git clone --single-branch -q -b $build_branch https://${GH_TOKEN}@github.com/wet-boew/wet-boew-dist.git > /dev/null
		cd wet-boew-dist

		#Replace the new dist and demo folders and root files with the new ones
		git rm -rf dist/*
		git rm -rf demos/*
		git rm -rf test/*
		cp -Rf $HOME/temp_wet-boew/* .

		#Commit the result
		git add -f dist
		git add -f demos
		git add -f test
		git add -f *.*
		git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to $TRAVIS_BRANCH"
		git push -fq origin $build_branch > /dev/null

		echo -e "Finished tagging the latest build for branch $TRAVIS_BRANCH\n"
	;; esac
fi

res2=$(date +%s.%N)
elapsed=$(echo "$res2 - $res1"|bc )
minutes=$(echo "$elapsed /  60"|bc )
seconds=$(printf "%.0f" $(echo "$elapsed %  60"|bc ))
echo "Post-Build process finished in $minutes minute(s) and $seconds seconds"