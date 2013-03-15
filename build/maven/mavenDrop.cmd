@echo off
rem make sure command extensions and delayed expansion are enabled
VERIFY errors 2>nul
SETLOCAL ENABLEEXTENSIONS
IF ERRORLEVEL 1 ( echo Unable to enable extensions
				goto :error )

rem Set up environment
setlocal
set initial.folder=%cd%
set wet.maven.folder=wet-parent

cd %wet.maven.folder%

rem Tell Nexus to release the staged artifacts
echo Dropping staging repository...
call mvn org.sonatype.plugins:nexus-staging-maven-plugin:drop
IF %ERROR_CODE% EQU 0 (echo Command result: SUCCESS) ELSE ( echo Something went wrong while trying to drop the Sonatype repository!  Aborting.  You may want to log into Sonatype Nexus and drop the repository from there.
															GOTO :error)

goto :done

:error
	cd %initial.folder%
	exit /B 1

:done
	echo Staging repository dropped.
	call mvn clean
	cd %initial.folder%
	endlocal
	exit /B 0