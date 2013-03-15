About this overlay
================== 
This overlay is not a standalone application! The intention is that you can pull 
this into an existing java web project, so that you do not have to store a copy 
of Web Experience Toolkit in your own code repository.  This will hopefully 
facilitate easy upgrades when future versions of WET are released -- if WET did 
not undergo major changes, it could sometimes simply be a matter of incrementing 
the version number and rebuilding your application.

How to use it
=============
Just include something like this to the Maven POM file for your application:
	
	<build>
	... 
		<pluginManagement>
			<plugins>
				<!-- Configure WAR overlay(s) that will be combined with the output of 
				this project -->
				<plugin> 
					<groupId>org.apache.maven.plugins</groupId>
					<artifactId>maven-war-plugin</artifactId>
					<configuration>
						<overlays>
							<overlay>
								<groupId>ca.gc.tbs-sct.wet-boew</groupId>
								<artifactId>wet-gcwu-intranet-theme-overlay</artifactId>
								<targetPath>static/WET</targetPath>
							</overlay>
						</overlays>
					</configuration> 
				</plugin>
			</plugins>
		</pluginManagement>
	...
	</build>

	<dependencies>
	...
		<dependency>
			<groupId>ca.gc.tbs-sct.wet-boew</groupId>
			<artifactId>wet-gcwu-intranet-theme-overlay</artifactId>
			<version>3.0</version>
			<type>war</type>
			<scope>runtime</scope>
		</dependency>
	...
	</dependencies>

Notice above that within the <overlay> section, a <targetPath> is specified.  If 
a <targetPath> is specified, then instead of the WAR contents being extracted 
under WEB-INF, they will be extracted under WEB-INF/<targetPath>.  This is 
recommended so that you can maintain a clean separation between your own code 
and WET.  Furthermore, having a dedicated folder under WEB-INF for static 
content will allow you to configure a caching strategy very easily, enhancing 
the performance of your application.

When you build your application, you should find a folder in the <targetPath> 
location containing WET. Now it's simply a matter of referring to it and using 
it in your own view template(s), an exercise that is left to the reader.