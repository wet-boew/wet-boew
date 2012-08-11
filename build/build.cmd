@ECHO Off
REM Check if Ant is installed
IF "%ANT_HOME%" == "" (
	SET ANT_HOME=c:\ant
)

IF NOT EXIST %ANT_HOME% (
	ECHO Please ensure Ant is installed to C:\ant
	ECHO Otherwise manually run "SET ANT_HOME=Where you installed Ant"
	EXIT /b 1
)
	
REM See IF the Ant bin path has already been set
IF "%ANT_BIN%" == "" (
	SET ANT_BIN=%ANT_HOME%\bin
	CALL addPath.cmd ANT_BIN
	IF "%ERRORLEVEL%" == "0" ECHO ANT Added to PATH
)

IF "%*" == "" (
	IF "%ANT_OPTS%" == "" (
		ECHO If you encounter proxy issues pass the following into the command line replacing with your network values
		ECHO "-Dhttp.proxyHost=proxy -Dhttp.proxyPort=8080"
		GOTO RUN_ANT
	)
)
SET ANT_OPTS=%*

:RUN_ANT
ant -file ..\build.xml