git diff --name-only --exit-code; 
rc=$?
if [ $rc != 0 ]; then 
	echo "Changes have not been built"; 
	exit 1;
else
	echo "No changes after build";
	exit 0;
fi;