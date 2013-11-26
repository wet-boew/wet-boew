cd dist
find . -name "*.html" -not -path "./ajax/*" -not -path "./assets/*" -not -path "./css/*" -not -path "./fonts/*" -not -path "./js/*" -not -path "./unmin/*" -print0 | xargs -0 -I {} phantomas --url {}
cd ..
