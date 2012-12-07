export REPO="$(pwd | sed s,^/home/travis/builds/,,g)"
declare -a supported_branches=('master' 'v3.0') # List of branches to store build output for
number_to_keep=10 #Number of build to keep for
branch='downloads' #branch that hosts the artifacts

#Copy result of build in a temporary location
cp dist $HOME/dist

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

	#Update the artifact branch
	case "${supported_branches[@]}" in  *"$TRAVIS_BRANCH"*)
		echo "Updating the $branch branch"

		git checkout $branch

		# Create a folder to store the downloads for this branch if it doesn't exist already
		if [ ! -d "$TRAVIS_BRANCH" ];
		then
			mkdir "$TRAVIS_BRANCH"
		fi

		cd "$TRAVIS_BRANCH"

		#Only keep a certain number of folders (defined by $number_to_keep)
		if [ $(ls -1 | wc -l) -gt $number_to_keep ];
		then
			ls -Qt | awk 'NR>'$number_to_keep | xargs -r rm -rf
		fi

		#remove the latest prefix to leave place for the new latest
		if ls -d latest* &> /dev/null ;
		then
			for f in latest-*; do
				file=${f:7}
				[ ! -f $file ] && mv "$f" $file
			done
		fi
		cd ..

		#Add the latest build files
		dest="$TRAVIS_BRANCH/latest-$TRAVIS_COMMIT"
		mv $HOME/dist $dest

		#Commit the result
		git add -f $dest
		git commit -m "Travis build $TRAVIS_JOB_ID pushed to $branch"
		git push -fq https://${GH_TOKEN}@github.com/${REPO}.git $branch > /dev/null

		echo "Finished updating the $branch branch"
	;; esac
fi