@echo off
rem make sure command extensions and delayed expansion are enabled
VERIFY errors 2>nul
SETLOCAL ENABLEEXTENSIONS
IF ERRORLEVEL 1 ( echo Unable to enable extensions
				goto :error )

echo Are you sure you want to release the staged artifacts?
echo Once this is done, the auto-sync to Maven Central will pick them up and there's no turning back.
echo There is no such thing as unrelease!
SET /P continue=Continue ^(y/n^)?
if "%continue%" NEQ "y" goto :abort

rem Set up environment
setlocal
set initial.folder=%cd%
set wet.maven.folder=wet-parent

cd %wet.maven.folder%

rem Tell Nexus to release the staged artifacts
echo Releasing staged artifacts...
call mvn org.sonatype.plugins:nexus-staging-maven-plugin:release
IF %ERROR_CODE% EQU 0 (echo Command result: SUCCESS) ELSE (echo Something went wrong while trying to release the artifacts!  Aborting.
															GOTO :error)

goto :done

:error
	cd %initial.folder%
	endlocal
	exit /B 1

:abort
	echo Release aborted.
	exit /B 0

:done
	call mvn clean
	echo Artifacts released.  Now you can commit the changed Maven files, create your tags, etc...
	cd %initial.folder%
	endlocal
	exit /B 0