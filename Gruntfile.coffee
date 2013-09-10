#global module:false
module.exports = (grunt) ->
  
  # Project configuration.
  grunt.initConfig
    
    # Metadata.
    pkg: grunt.file.readJSON("package.json")
    banner: "/*! Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html\n" + " - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\\n\" : \"\" %>" + " License: <%= pkg.license %> */\n"
    
    # Task configuration.
    concat:
      options:
        banner: "<%= banner %>"

      plugins:
        options:
          stripBanners: true

        src: ["dist/js/wet-boew.js", "src/plugins/**/*.js"]
        dest: "dist/js/wet-boew.js"

      core:
        options:
          stripBanners: false

        src: ["lib/modernizr/modernizr-custom.js", "dist/js/vapour.js"]
        dest: "dist/js/vapour.js"

    assemble:
      options:
        prettify:
          indent: 2

        marked:
          sanitize: false

        production: false
        data: "site/data/**/*.{yml,json}"
        assets: "dist"
        helpers: "site/helpers/helper-*.js"
        layoutdir: "theme/layouts"
        partials: ["site/includes/**/*.hbs"]

      site:
        options:
          layout: "theme.hbs"

        expand: true
        cwd: "src"
        src: ["*.hbs"]
        dest: "dist/"

      demo:
        options:
          layout: "theme.hbs"

        expand: true
        cwd: "src/plugins"
        src: ["**/*.hbs"]
        dest: "dist/demo"
        flatten: true

    sass:
      all:
        expand: true
        cwd: "src/base"
        src: ["**/*.scss", "!**/_*.scss"]
        dest: "dist/css/"
        ext: ".css"

    uglify:
      polyfills:
        options:
          preserveComments: "some"

        expand: true
        cwd: "src/polyfills"
        src: ["**/*.js"]
        dest: "dist/js/polyfills/"
        ext: ".min.js"
        flatten: true

      core:
        options:
          preserveComments: "some"

        files:
          "dist/js/vapour.min.js": "dist/js/vapour.js"

      plugins:
        options:
          banner: "<%= banner %>"

        files:
          "dist/js/wet-boew.min.js": "dist/js/wet-boew.js"

      i18n:
        options:
          banner: "<%= banner %>"

        expand: true
        cwd: "dist/js/i18n"
        src: ["**/*.js"]
        dest: "dist/js/i18n"
        ext: ".min.js"

      lib:
        options:
          preserveComments: "some"

        files:
          "dist/js/deps/jquery.pjax.min.js": "lib/jquery-pjax/jquery.pjax.js"

    coffee:
      vapour:
        options:
          bare: true

        files:
          "dist/js/vapour.js": "src/core/vapour.coffee"

      plugins:
        options:
          bare: true

        files:
          "dist/js/wet-boew.js": ["src/core/helpers.coffee", "src/plugins/**/*.coffee"]

    modernizr:
      
      # [REQUIRED] Path to the build you're using for development.
      devFile: "lib/modernizr/modernizr-custom.js"
      
      # By default, source is uglified before saving
      uglify: true
      
      # [REQUIRED] Path to save out the built file.
      outputFile: "lib/modernizr/modernizr-custom.js"
      
      # Based on default settings on http://modernizr.com/download/
      extra:
        shiv: true
        printshiv: false
        load: true
        mq: true
        css3: true
        input: true
        inputtypes: true
        html5: true
        cssclasses: true
        fontface: true
        backgroundsize: true
        borderimage: true

      
      # continue with all tests
      
      # Based on default settings on http://modernizr.com/download/
      extensibility:
        addtest: false
        prefixed: false
        teststyles: true
        testprops: true
        testallprops: true
        hasevents: true
        prefixes: true
        domprefixes: true

      
      # Define any tests you want to impliticly include.
      tests: ["elem_details"]
      
      # By default, this task will crawl your project for references to Modernizr tests.
      # Set to false to disable.
      parseFiles: false
      
      # When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
      # You can override this by defining a "files" array below.
      # "files" : [],
      # When parseFiles = true, matchCommunityTests = true will attempt to
      # match user-contributed tests.
      matchCommunityTests: false
      
      # Have custom Modernizr tests? Add paths to their location here.
      customTests: []

    copy:
      jquery:
        files: [
          cwd: "lib/jquery"
          src: ["jquery.min.js", "jquery.min.map"]
          dest: "dist/js"
          expand: true
        ]

      oldie:
        cwd: "lib"
        #TODO: Minify
        src: ["jquery-ie/jquery.min.js", "jquery-ie/jquery.min.map", "selectivizr/selectivizr.js", "respond/respond.min.js"]
        dest: "dist/js/oldie"
        expand: true
        flatten: true

      bootstrap:
        files:
          "dist/css/bootstrap.min.css": "lib/bootstrap/dist/css/bootstrap.min.css"

    clean:
      dist: "dist"
      jsUncompressed: ["dist/js/**/*.js", "!dist/js/**/*.min.js"]

    watch:
      gruntfile:
        files: "<%= jshint.gruntfile.src %>"
        tasks: ["jshint:gruntfile", "build"]

      lib_test:
        files: "<%= jshint.lib_test.src %>"
        tasks: ["jshint:lib_test", "qunit"]

      source:
        files: "<%= jshint.lib_test.src %>"
        tasks: ["build"]
        options:
          interval: 5007
          livereload: true

    jshint:
      options:
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        unused: true
        boss: true
        eqnull: true
        browser: true
        globals:
          jQuery: true

      gruntfile:
        src: "Gruntfile.js"

      lib_test:
        src: ["src/**/*.js", "!src/**/*min.js", "!src/polyfills/**/*.js", "test/**/*.js"]

    connect:
      server:
        options:
          port: 8000
          base: "."

    i18n:
      options:
        template: "src/i18n/base.js"
        csv: "src/i18n/i18n.csv"

      src: "src/js/i18n/formvalid/*.js"

  
    # These plugins provide necessary tasks.
    @loadNpmTasks "grunt-contrib-concat"
    @loadNpmTasks "grunt-contrib-copy"
    @loadNpmTasks "grunt-contrib-uglify"
    @loadNpmTasks "grunt-contrib-jshint"
    @loadNpmTasks "grunt-contrib-watch"
    @loadNpmTasks "grunt-contrib-coffee"
    @loadNpmTasks "grunt-contrib-clean"
    @loadNpmTasks "grunt-contrib-connect"
    @loadNpmTasks "grunt-sass"
    @loadNpmTasks "grunt-modernizr"
    @loadNpmTasks "assemble"
    @loadTasks "tasks"
    
    # Default task.
    @registerTask "build", ["coffee", "sass", "concat", "i18n", "uglify", "clean:jsUncompressed", "copy", "assemble"]
    @registerTask "test", ["jshint"]
    @registerTask "html", ["assemble"]
    @registerTask "default", ["clean:dist", "build", "test"]
    @registerTask "server", ["connect", "watch:source"]
    @registerTask "init", ["modernizr"]