@echo off
rem make sure command extensions and delayed expansion are enabled
VERIFY errors 2>nul
SETLOCAL ENABLEEXTENSIONS
IF ERRORLEVEL 1 ( echo Unable to enable extensions
				goto :error )
SETLOCAL ENABLEDELAYEDEXPANSION

rem Set up environment
setlocal
IF "%~1"=="" (GOTO :usage) ELSE (set release.version=%1)
IF "%~2"=="" (GOTO :usage) ELSE (set test.folder=%2)
set wet.maven.folder=wet-parent
rem dist path, relative to this script
set demo.folder=..\..\..\demos
rem dist path, relative to wet-parent
set dist.folder=..\..\..\dist
set initial.folder=%cd%

rem If test folder already exists, ask if we should continue
if exist %test.folder% (SET /P continue=The folder you've specified as test.folder exists.  If you choose to continue, it will be deleted and recreated.  Continue ^(y/n^)?)
if "%continue%" NEQ "y" goto :abort

rem Create a mapping of artifact names to theme folders
SET map=wet-base-theme-overlay~theme-base;wet-clf2-theme-overlay~theme-clf2-nsi2;wet-gcwu-intranet-theme-overlay~theme-gcwu-intranet;wet-gcwu-theme-overlay~theme-gcwu-fegc;wet-wet-theme-overlay~theme-wet-boew

cd %wet.maven.folder%

rem Update the version of the parent (oss-parent) to the latest.
echo Updating parent version (oss-parent)...
call mvn -N versions:update-parent
IF %ERROR_CODE% EQU 0 (echo Command result: SUCCESS) ELSE (echo Command result: FAILURE
															GOTO :revert)
call mvn -q versions:commit

rem Update artifacts to release version
echo Updating WET poms to release version...
call %initial.folder%\setVersion.cmd %release.version%
if %ERRORLEVEL% NEQ 0 GOTO :error

rem Run the Maven job to create the release artifacts
echo Creating Maven artifacts...
call mvn -Ddist.folder=%dist.folder% clean deploy
IF %ERROR_CODE% EQU 0 (echo Command result: SUCCESS) ELSE (echo Command result: FAILURE
															GOTO :revert)

rem Extract the new artifacts to demo folder for a quick smoke test
echo Creating demos for smoke test...
if exist %test.folder% ( rmdir /q /s %test.folder% )
echo Copying Maven overlays to %test.folder%...
FOR /D %%V IN ("*theme-overlay") DO	(
										echo Copying %%V...
										XCOPY /Q /S %%V\target\%%V-%release.version%\*.* %test.folder%\%%V\dist\
										IF %ERRORLEVEL% NEQ 0 GOTO :demoError
									)
echo Copying demo files to %test.folder%...
FOR /D %%V IN ("*theme-overlay") DO (
										SET folderName=%%~nV
										SET folderName=!map:*%%~nV~=!
										for /F "delims=;" %%a in ("!folderName!") do SET folderName=%%a
										echo Copying !folderName!...
										XCOPY /Q /S %demo.folder%\!folderName!\*.* %test.folder%\%%V\demo\%%V\
										IF %ERRORLEVEL% NEQ 0 GOTO :demoError
									)
goto :done

:demoError
	echo Unable to create demo files.  Aborting.
	goto :error

:revert
	echo Artifact generation failed.  Once you've found out what went wrong, please discard the modified files under the Maven folder and try again.
	echo Dropping any staging repository that may have been created...
	call mvn -q org.sonatype.plugins:nexus-staging-maven-plugin:drop > nul

:error
	cd %initial.folder%
	endlocal
	exit /B 1

:abort
	echo Staging aborted.
	cd %initial.folder%
	endlocal
	exit /B 0

:usage
	echo Usage:  mavenStage.cmd ^<release.version^> ^<test.folder^>
	echo test.folder is where the artifacts and demo files will be copied to for testing.
	exit /B 1

:done
	del  /Q /S *.*versionsBackup 2>nul
	echo Maven version numbers and staging to Sonatype repository is done.
	echo Demo files have been created in %test.folder%.
	echo You should do a quick sanity test of each theme to make sure everything is ok.
	echo When you are ready, run 'mavenRelease.cmd' to release the staged artifacts.
	cd %initial.folder%
	endlocal
	exit /B 0