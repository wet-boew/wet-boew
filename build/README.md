# Building the Web Experience Toolkit (WET)

[![Build Status](https://secure.travis-ci.org/wet-boew/wet-boew.png?branch=master)](http://travis-ci.org/wet-boew/wet-boew)

Web Experience Toolkit (WET) uses Ant(1.8+), JRuby(1.6.7.2), YUI Compressor, and several Ruby gems.

## Windows

* Ant: download from [Apache](http://ant.apache.org) and extract to C:\ant
* Java JDK: download from [Oracle](http://www.oracle.com/technetwork/java/javase/downloads/index.html) if your current installation doesn't meet the minimum stated by "[Which version of Java is required to run Apache Ant?"](http://ant.apache.org/faq.html#java-version)
* open a command prompt to the root directory and run:
> build.cmd 

### *nix (OS X, Linux)

* Ant: many distributions come with a verions of Ant, but ensure that a version later than 1.8 is installed by running the following at the terminal:
> ant -version

* open a shell to the root directory and run:
> ant

## Proxy Issues
The build will download several files during the first build so those behind restrictive firewalls may encounter issues.
You will need to set your proxy information in the ANT_OPTS environmental variable. See the [Ant Proxy manual](http://ant.apache.org/manual/proxy.html) for further information.

* On Windows you can use the build.cmd to set the ANT_OPTS variable: 

    > build.cmd -Dhttp.proxyHost=PROXY -Dhttp.proxyPort=PORT
    
* If the above way is not working, adding the proxy to the build file seems to be getting some result (at least in Statcan). Modify the build.xml to include the following block :

	<target name="proxy">
		<property name="proxy.host" value="****"/>
		<property name="proxy.port" value="****"/>
		<property name="proxy.user" value="****"/>
		<property name="proxy.pass" value="****"/>
		<setproxy proxyhost="${proxy.host}" proxyport="${proxy.port}"
			proxyuser="${proxy.user}" proxypassword="${proxy.pass}"/>
	</target>
	
    And in the default goal :
    
	<target name="default" depends="clean,proxy,build" description="Performs a Cleand and Build when calling ant without any target"></target>
	