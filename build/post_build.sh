#!/bin/bash
start=$(date +%s)
echo -e "Current repo: $TRAVIS_REPO_SLUG\n"

if [ "$TRAVIS_PULL_REQUEST" == "false" ] &&  [ "$TRAVIS_REPO_SLUG" == "wet-boew/wet-boew" ]; then
	declare -a supported_branches=('master' 'v3.0') # List of branches to store build output for

	#Set git user
	git config --global user.email "laurent.goderre@gmail.com"
	git config --global user.name "Travis"

	#Set remotes
	git remote add upstream https://${GH_TOKEN}@github.com/wet-boew/wet-boew.git 2> /dev/null > /dev/null
	git remote add experimental https://${GH_TOKEN}@github.com/LaurentGoderre/wet-boew.git 2> /dev/null > /dev/null

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
		git commit -q -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
		git push -fq upstream gh-pages 2> /dev/null || echo "\e[1;31mError updating working examples\e[0m"; exit 1;

		echo -e "Finished updating the working examples\n"
	fi

	#Update the experimental working example
	if [[ "$TRAVIS_BRANCH" == experimental* ]]; then
		echo -e "Updating experimental working examples...\n"

		git checkout -B gh-pages
		git add -f dist/.
		git commit -q -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
		git push -fq experimental gh-pages 2> /dev/null || echo "\e[1;31mError updating experimental working examples\e[0m"; exit 1;

		echo -e "Finished updating the experimental working examples\n"
	fi

	#Add the latest tags
	case "${supported_branches[@]}" in  *"$TRAVIS_BRANCH"*)
		echo -e "Uploading the build artifact for branch $TRAVIS_BRANCH\n"

		build_branch="$TRAVIS_BRANCH-dist"

		cd ..
		git clone -q -b $build_branch https://${GH_TOKEN}@github.com/wet-boew/wet-boew-dist.git 2> /dev/null  || echo "\e[1;31mError cloning the artifact repository\e[0m"; exit 1;
		cd wet-boew-dist

		#Replace the new dist and demo folders and root files with the new ones
		git rm -qrf dist/*
		git rm -qrf demos/*
		git rm -qrf test/*
		cp -Rf $HOME/temp_wet-boew/* .

		#Commit the result
		git add -f dist
		git add -f demos
		git add -f test
		git add -f *.*
		git commit -q -m "Travis build $TRAVIS_BUILD_NUMBER pushed to $TRAVIS_BRANCH"
		git push -fq origin $build_branch 2> /dev/null || echo "\e[1;31mError uploading the build artifacts\e[0m"; exit 1;

		#Create the dist without the GC themes
		if [ "$TRAVIS_BRANCH" == "master" ]; then
			git checkout master-base-dist
			cp -Rf $HOME/temp_wet-boew/dist ./dist
			rm -Rf ./dist/theme-clf2-nsi2
			rm -Rf ./dist/theme-gcwu-fegc
			rm -Rf ./dist/theme-intranet
			cp -Rf $HOME/temp_wet-boew/demos/theme-base ./demos/theme-base
			cp -Rf $HOME/temp_wet-boew/demos/theme-wet-boew ./demos/theme-wet-boew
			git add -f .
			git commit -q -m "Travis build $TRAVIS_BUILD_NUMBER pushed to $TRAVIS_BRANCH"
			git push -fq origin master-base-dist 2> /dev/null || echo "\e[1;31mError uploading the base build artifacts\e[0m"; exit 1;
		fi

		echo -e "Done uploading the build artifact for branch $TRAVIS_BRANCH\n"
	;; esac
fi

end=$(date +%s)
elapsed=$(( $end - $start ))
minutes=$(( $elapsed / 60 ))
seconds=$(( $elapsed % 60 ))
echo "Post-Build process finished in $minutes minute(s) and $seconds seconds"
