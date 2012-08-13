// HTML5 datalist plugin v.0.1
// Copyright (c) 2010-The End of Time, Mike Taylor, http://miketaylr.com
// MIT Licensed: http://www.opensource.org/licenses/mit-license.php
//
// Enables cross-browser html5 datalist for inputs, by first testing
// for a native implementation before building one.
//

$.fn.datalist = function() {
  
  //first test for native placeholder support before continuing
  return ((typeof this[0].list === 'object' ) && (document.createElement('datalist') && !!window.HTMLDataListElement)) ? this : this.each(function() {
    //local vars
    var $this = $(this),
        //the main guts of the plugin
        datalist = $('#' + $this.attr('list')),
        opts = datalist.find('option'),
        
        //wrapper stuffs
        width = $this.width(),
        height = $this.height(),
        ul = $("<ul>", {"class": "datalist", "width": width, "css": 
          {'position': 'absolute', 
           'left': 0, 
           'top': height + 6, 
           'margin': 0, 
           'padding': '0 2px',
           'list-style': 'none',
           'border': '1px solid #ccc', 
           '-moz-box-shadow': '0px 2px 3px #ccc', 
           '-webkit-box-shadow': '0px 2px 3px #ccc', 
           'box-shadow': '0px 2px 3px #ccc', 
           'z-index':99, 
           'background':'#fff', 
           'cursor':'default'}
          }),
        wrapper = $('<div>').css('position', 'relative');
        
    //return this if matching datalist isn't found
    //to be polite if there's any chaining
    if (!datalist.length) {
        return this;
    } else {
    //otherwise, build the structure
      opts.each(function(i, opt) {
        $('<li>')
          .append('<span class="value">'+opt.value+'</span>')
          .append('<span class="label" style="float:right">'+opt.label+'</span>')
          .appendTo(ul);
      });
    };
    
    //stick the stuff in and hide it
    $this.wrap(wrapper);
    ul.hide().insertAfter($this);
    
    //show it on focus
    $this.focus(function(){
      ul.show(); 
    });
    
    //hide it on blur
    $this.blur(function(){
      ul.hide();
    });
    
    //set value of input to clicked option
    var lis = $this.next().find('li');
    lis.mousedown(function(){
      var value = $(this).find('span.value').text();
      $this.val(value); 
    });
  });
};

$(document).ready(function(){
	$('input[list]').datalist();
});