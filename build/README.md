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

* If issues are still encountered, you may manually download the required files to their expected location before running Ant.
	1. [jRuby](http://jruby.org.s3.amazonaws.com/downloads/1.6.7.2/jruby-complete-1.6.7.2.jar) to build/lib and rename it jruby-download.jar
	2. Create the folder build/lib/jruby-compiled and copy the gems inside with version number removed from the file name
		* [sass.gem](http://production.cf.rubygems.org/gems/sass-3.1.19.gem)
		* [chunky_png.gem](http://production.cf.rubygems.org/gems/chunky_png-1.2.5.gem)
		* [fssm.gem](http://production.cf.rubygems.org/gems/fssm-0.2.9.gem)
		* [compass.gem](http://production.cf.rubygems.org/gems/compass-0.12.1.gem)