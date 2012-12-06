export REPO="$(pwd | sed s,^/home/travis/builds/,,g)"
if [ "$TRAVIS_BRANCH" == "master" -a "$REPO" == "wet-boew/wet-boew" ]; then
	echo "Updating working examples..."
	git add -f dist/.
	git stash
	git fetch
	git checkout gh-pages
	git rebase master
	git rm -r dist/.
	git stash pop
	git add -f dist/.
	git commit -m "Travis build $TRAVIS_JOB_ID pushed to gh-pages"
	git push -fq https://${GH_TOKEN}@github.com/${REPO}.git gh-pages > /dev/null
	echo "Finished updating the working examples"
fi