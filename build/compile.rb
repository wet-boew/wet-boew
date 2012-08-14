# Load All of the Gems inside the jRuby jar passed in by first argument 
Dir.entries(ARGV[0]).each do |lib|  
    $LOAD_PATH.unshift "#{ARGV[0]}/#{lib}/lib"  
end 

# Require the following Gems
require 'rubygems'   
require 'compass'  
require 'compass/exec'
require 'zen-grids'

# Run Compass + Gems!
exit Compass::Exec::SubCommandUI.new([ARGV[1], ARGV[2], "-c" + File.join(File.dirname(__FILE__), 'config.rb'),"-q"]).run!