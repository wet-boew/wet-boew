# grunt-contrib-nodeunit [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-nodeunit.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-nodeunit)

> Run Nodeunit unit tests.



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-nodeunit --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-nodeunit');
```




## Nodeunit task
_Run this task with the `grunt nodeunit` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

This plugin provides server-side JavaScript unit testing via [nodeunit](https://github.com/caolan/nodeunit/). If you're looking to test JavaScript that uses `window` or the DOM, please use the [grunt-contrib-qunit plugin](https://github.com/gruntjs/grunt-contrib-qunit)`qunit` task.


### Usage examples

#### Wildcards

In this example, `grunt nodeunit:all` (or `grunt nodeunit` because `nodeunit` is a [multi task][]) will test all files ending with `_test.js` in the `test` directory.

```js
// Project configuration.
grunt.initConfig({
  nodeunit: {
    all: ['test/*_test.js']
  }
});
```

With a slight modification, `grunt nodeunit:all` will test files matching the same pattern in the `test` directory _and all subdirectories_.

```js
// Project configuration.
grunt.initConfig({
  nodeunit: {
    all: ['test/**/*_test.js']
  }
});
```

## Release History

 * 2013-02-14   v0.1.2   First official release for Grunt 0.4.0.
 * 2013-01-17   v0.1.2rc6   Updating grunt/gruntplugin dependencies to rc6. Changing in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-08   v0.1.2rc5   Updating to work with grunt v0.4.0rc5. Switching to this.filesSrc api.
 * 2012-11-12   v0.1.1   Switch to this.file api internally.
 * 2012-11-03   v0.1.0   Work in progress, not yet officially released.

---

Task submitted by ["Cowboy" Ben Alman](http://benalman.com)

*This file was generated on Mon Feb 18 2013 08:58:34.*
