# SASS/SCSS for Web Experience Toolkit (WET)

The various subdirectories in this folder are under SASS control!


ABOUT SASS AND COMPASS
----------------------

Sass is a language that is just normal CSS plus some extra features, like
variables, nested rules, math, mixins, etc. If your stylesheets are written in
Sass, helper applications can convert them to standard CSS so that you can
include the CSS in the normal ways with your theme.

To learn more about Sass, visit: http://sass-lang.com

Compass is a helper library for Sass. It includes libraries of shared mixins, a
package manager to add additional extension libraries, and an executable that
can easily convert Sass files into CSS.

To learn more about Compass, visit: http://compass-style.org


DEVELOPING WITH SASS OVERVIEW
-----------------------------

While using generated CSS with Firebug, the line numbers it reports will be
wrong since it will be showing the generated CSS file's line numbers and not the
line numbers of the source Sass files. To correct this problem, you can install
the FireSass plug-in into Firefox and then edit your sub-theme's config.rb file
to set: firesass = true
  https://addons.mozilla.org/en-US/firefox/addon/firesass-for-firebug/


DEVELOPING WITH SASS AND ANT
-------------------------

Steps performed for SASS ANT Support in ../build/lib (Compile + Watch Feature)

  $ java -jar jruby-complete-1.6.7.2.jar -S gem install -i ./vendors compass sass
  $ jar uf jruby-complete-1.6.7.2.jar -C vendors .
  $ rm -rf vendors
  $ java -jar jruby-complete-1.6.7.2.jar -S gem list

  *** LOCAL GEMS ***

  chunky_png (1.2.5)
  compass (0.12.1)
  fssm (0.2.9)
  rake (0.8.7)
  sass (3.1.19)
  sources (0.0.1)
  zen-grids (1.2)

To automatically generate the CSS versions of the scss while you are doing theme
development, you'll need to tell Compass to "watch" the sass directory so that
any time a .scss file is changed it will automatically place a generated CSS
file into your sub-theme's css directory:
  
  a) build directory

  $ ant (will perform overall build out)

  b) subdirectories (base, grids, js, theme-gcwu-fegc, theme-gcwu-intranet)

  subdirectory $ ant compile.sass (will compile scss files relative to dir)
  subdirectory $ ant watch.sass (will poll scss files relative to dir)


DEVELOPING WITH SASS AND COMPASS
--------------------------------

To automatically generate the CSS versions of the scss while you are doing theme
development, you'll need to tell Compass to "watch" the sass directory so that
any time a .scss file is changed it will automatically place a generated CSS
file into your sub-theme's css directory:

  src $ command

  compass compile base
  compass compile grids
  compass compile js
  compass compile theme-gcwu-fegc
  compass compile theme-gcwu-intranet

  compass watch base
  compass watch grids
  compass watch js
  compass watch theme-gcwu-fegc

  If you are already in the root of your sass controlled directory, you can simply
  type:  compass watch
