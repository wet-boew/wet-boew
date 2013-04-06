/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/**
 * Key Cell Selector - Table usability - Core plugin
 *
 * @author: Pierre Dubois
 *
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};

$.extend($.expr[":"], {keycell:function (elem, i, match, array) {
	var tblElem,
		ElemNodeName,
		tblparser = $(elem).data().tblparser,
		keycell = tblparser.keycell,
		ret, data, thRS, cell, row, groupZero,
		j, _ilen, _jlen;
	// query Example: $('table:eq(4):keycell').css('background-color', 'yellow');

	// Is elem are a valid element for this selector ?
	if (!$(elem).data().tblparser) {
		// Get the table element
		tblElem = elem;
		
		while (true) {
			ElemNodeName = tblElem.nodeName.toLowerCase();
			if (ElemNodeName !== "table" && ElemNodeName !== "caption" &&
				ElemNodeName !== "colgroup" && ElemNodeName !== "col" && 
				ElemNodeName !== "thead" && ElemNodeName !== "tbody" && 
				ElemNodeName !== "tfoot" && ElemNodeName !== "tr" && 
				ElemNodeName !== "th" && ElemNodeName !== "td") {

				return false; // elem are not valid
			}
			
			if (ElemNodeName === "table") {
				break; // Horay we have found the table, now we can do the parsing
			}
			
			// Get the parent
			tblElem = $(tblElem).parent().get(0);
		}
		
		// Call the table parser before to filter the result
		_pe.fn.parsertable._exec($(tblElem));
	}

	switch (elem.nodeName.toLowerCase()) {

	case "table": // Matrix
		// Return all the description cell
		if (keycell) {
			for (i = 0, _ilen = keycell.length; i < _ilen; i += 1) {
				ret = keycell[i].elem;
				array.push(ret);
				ret.prevObject = elem;
			}
		}
		break;
	case "caption": // Cell
		// A Caption can not have any description cell
		// Question: Return the details element if any ?
		break;
	case "colgroup": // Group
		// return any description cell in the thead
		data = tblparser;
		groupZero = data.groupZero;
		for (i = 0, _ilen = groupZero.theadRowStack.length; i < _ilen; i += 1) {
			thRS = groupZero.theadRowStack[i];
			for (j = 0, _jlen = thRS.cell.length; j < _jlen; j += 1) {
				cell = thRS.cell[j];
				if ((cell.type === 5 || cell.descCell) && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end) {
					if (cell.descCell) {
						cell = cell.descCell;
					}
					ret = cell.elem;
					array.push(ret);
					ret.prevObject = elem;
				}
			}
			
		}
		// return any description cell in the colgroup header if selected
		if (data.start === 1) {
			for (i = 0, _ilen = groupZero.row.length; i < _ilen; i += 1) {
				row = groupZero.row[i];
				for (j = 0, _jlen = row.cell.length; j < _jlen; j += 1) {
					cell = row.cell[j];
					if (cell.type === 5 && cell.colpos >= data.start && (cell.colpos + cell.width -1) <= data.end) {
						ret = cell.elem;
						array.push(ret);
						ret.prevObject = elem;
					}
				}
			}
		}
		break;
	case "col": // Vector
		break;
	case "thead": // Group
		break;
	case "tbody": // Group
		break;
	case "tfoot": // Group
		break;
	case "tr": // Vector
		// Return all the description cell for this row
		break;
	case "th": // Cell
		// Return the associative key cell
		if (keycell) {
			ret = keycell.elem;
			array.push(ret);
			ret.prevObject = elem;
			$.fn.pushStack(ret, "parsertablekey", "");
		}
		return false;
	case "td": // Cell
		// Return true if this are a key cell otherwise false
		if (tblparser.type === 4) {
			return true;
		}
		break;
	}
	return false;
}});


/*
A little bit of documentation

* data cell [row|col]
* summary cell [row|col]
* header cell [row|col]
* key cell [row]
* description cell [row|col]
* layout cell

* data group [row|col]
* summary group [row|col]
* header group [row|col]

* data row
* summary row
* description row
* header row
* 
* data col
* summary col
* key col
* description col
* header col

* level  [row|col] // for grouping


We have as abstract
- vector (row and col)
- group (colgroup and thead, tbody, tfoot)
- cell (th and td, caption)
- matrix (table)

Kind of streotyped object
* header (type 1)
* data (type 2)
* summary (type 3)
* key (type 4)
* description (type 5)
* layout (type 6)

Data hiearchy
* level

The perpective for the computation/query search
* row
* column


*/


/*
 * 
 * Little documentation about custom selector
 * 
 *  (http://www.jameswiseman.com/blog/2010/04/19/creating-a-jquery-custom-selector/) - on 2012-06-16
 
Parameterised Custom Selectors

You’ll notice that some Pseudo-Class selectors accept a parameter, for example :has(selector). So how do we get some of that good stuff? We are going to build a lengthBetween selector that will filter out items whose length is greater than two specified parameters, in this case, four and eight. The calling code will look like:
view plaincopy to clipboardprint?

    alert($("input:lengthBetween(4,8)").length);  

The anonymous function we specified for our original custom selector actually has four parameters. We only used the first, elem. The following is the full definition:
view plaincopy to clipboardprint?

    $.extend($.expr[":"], {selectorName:function (elem, i, match, array) {
        return [boolean expression];  
    });  

So what are all of these parameters?

    elem we are already familiar with - it is the current DOM element of the iteration stack
    i is the index of elem upon the stack
    match is an array that contains all information about the custom selector
    array contains all the elements in the stack over which we are iterating

We are interested in the match array parameter, as this is where we will retrieve parameter information. The match array stores four pieces of information. So, given the the selector call:
view plaincopy to clipboardprint?

    alert($("input:lengthBetween(4,8)").length);  

    match[0] – contains the full pseudo-class selector call. In this example :lengthBetween(4,8)
    match[1] – contains the selector name only. In this example lengthBetween
    match[2] – denotes which, if any, type of quotes are used in the parameter expression. i.e. single (‘)  or double (“). In this example it will be empty.
    match[3] – gives us the parameters, i.e. what is contained in the brackets. In this example 4,8

So, if we just want the parameters, then match[3] is the way forward. This is a simple string value and it’s really up to you how you handle it. You can String.Split() it to get multiple parameters, and you can consider validating the parameters somehow. Again, we are drifting away somewhat from the scope of this discussion, so I’ll refer to the jQuery core once more:
view plaincopy to clipboardprint?

    gt: function (elem, i, match) {  
        return i > match[3] - 0;  
    },  

Here, a single parameter is expected and assumed. No validation attempt is made. So, returning to our :lengthBetween selector, the implementation might look something like:
view plaincopy to clipboardprint?

    $.extend($.expr[":"], {  
        lengthBetween: function (elem, i, match) {  
            var params = match[3].split(",");  //split our parameter string by commas  
            var elemLen = $(elem).val().length;   //cache current element length  
            return ((elemLen >= params[0] - 0) && (elemLen <= params[1] - 0));  //perform our check  
        }  
    });  

So there we have it - A custom selector that will filter out values whose length is between one and three characters.


 * 
 */
	window.pe = _pe;
	return _pe;
}(jQuery));