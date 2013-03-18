@echo off
rem make sure command extensions are enabled
VERIFY errors 2>nul
SETLOCAL ENABLEEXTENSIONS
IF ERRORLEVEL 1 ( echo Unable to enable extensions
				goto :error )
SETLOCAL ENABLEDELAYEDEXPANSION

rem Set up local environment
setlocal
IF "%~1"=="" (GOTO :usage) ELSE (set new.version=%1)
set wet.maven.folder=wet-parent

echo Updating WET poms to version %new.version%...
rem find out what folder we started in. If we're not in the wet-parent folder, then go there
for %%F in ("%cd%") do set "initial.folder=%%~nxF"
if "%initial.folder%" NEQ "%wet.maven.folder%" (cd %wet.maven.folder%)

call mvn -N versions:set -DnewVersion=%new.version% -DprocessDependencies=false -DprocessPlugins=false
IF %ERROR_CODE% EQU 0 (echo Command result: SUCCESS) ELSE (echo Command result: FAILURE
															GOTO :revert)
call mvn -q versions:commit
goto :done

:revert
	echo An error occurred while trying to set the version.  Reverting POM(s) to initial version.
									call mvn -q versions:revert )

:error
	cd %initial.folder%
	endlocal
	exit /B 1
:usage
	echo Usage:  setVersion.cmd ^<new.version^>
	endlocal
	exit /B 1
:done
	del /S /Q *.*versionsBackup 2>NUL
	echo Maven version numbers have been updated.
	cd %initial.folder%
	endlocal
	exit /B 0