# Load All of the Gems inside the jRuby jar passed in by first argument 
$LOAD_PATH.unshift "#{ARGV[0]}"

# Require the following Gems
require 'rubygems'   
require 'compass'  
require 'compass/exec'
require 'zen-grids'

# Run Compass + Gems!
exit Compass::Exec::SubCommandUI.new([ARGV[1], ARGV[2], "-q"]).run!