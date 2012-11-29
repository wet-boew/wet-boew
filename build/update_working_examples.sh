export REPO="$(pwd | sed s,^/home/travis/builds/,,g)"
if [ "$TRAVIS_BRANCH" == "master" ]; then
	git branch -D gh-pages
	git checkout -B gh-pages
	git add -f dist/.
	git commit -m "Add built output"
	git push -fq https://${GH_TOKEN}@github.com/${REPO}.git gh-pages > /dev/null
fi