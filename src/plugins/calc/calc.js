/**
 * @title WET-BOEW Calc [ calc ]
 * @overview A basic calculate library for WET-BOEW
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */

////******************************************/////////
///
( function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,
	selector = ".wb-calc";
	
	var tokens = [];
	var position = 0;

	var round = function()
	{

	};

	//TODO: create casting function

	var parser = function( sEquation )
	{
		var statement = sEquation.split(" ");
		for (var i = 0; i < statement.length; i++) {
			var element = statement[i];
			if ( element.startsWith("#") || element.startsWith(".") )
			{
				var $elm = $( element );
				console.log("^^^in parser element is : " + element);
				statement[i] = (!$elm.is('select')) ? $( element ).val() : $( element + " option:selected" ).attr("data-wb-calc-value");
				console.log("^^^in parser statement is : " + statement[i]);
			}
		};

		return statement;
	};
	
	var tokenize = function ( sCalc )
	{
		var results = [];
		//var tokenRegEx = /\s*([A-Za-z]+|[0-9]+|\S)\s*/g;
		var tokenRegEx = /\s*([#.A-Za-z]+|[+-]?([0-9]*[.])?[0-9]+|\S)\s*/g;
		
		var tok;
		while ((tok = tokenRegEx.exec(sCalc)) !== null)
		{
			console.log("in tokenize tok is : " + tok[1]);
			results.push(tok[1]);
		}
		
		return results;
	};
	
	var isNumber = function ( token ) {
		return token !== undefined && token.match(/^[+-]?([0-9]*[.])?[0-9]+$/) !== null;
	};
	
	var isSelector = function ( token ) {
		return token !== undefined && token.match(/^[#.A-Za-z]+$/) !== null;
	};

	var isElement = function ( token ) {
		return token !== undefined && token.match(/^[A-Za-z]+$/) !== null;
	};
	
	var peek = function () {
        return tokens[position];
    };

    var consume = function (token) {
        position++;
    };
	
	var parsePrimaryExpr = function () {
        var tok = peek();

        if (isNumber( tok )) {		
            consume( tok );
            return {type: "number", value: tok};
        } else if (isElement( tok )) {		
            consume( tok );
            return {type: "name", id: tok};
		} else if (isSelector( tok )) {
			if ( tok.startsWith("#") || tok.startsWith(".") )
			{
				var $elm = $( tok );
				//console.log("^^^in parsePrimaryExpr tok is : " + tok);
				tok = (!$elm.is('select')) ? $( tok ).val() : $( tok + " option:selected" ).attr("data-wb-calc-value");
				//console.log("^^^in parsePrimaryExpr statement is : " + tok);
			}
            consume( tok );
            return {type: "number", value: tok};
        } else if (tok === "(") {
            consume( tok );
            var expr = parseExpr();
            if (peek() !== ")")
                throw new SyntaxError("expected )");
            consume(")");
            return expr;
        } else {
            // If we get here, the next token doesn’t match any of the 
            // rules. So it’s an error.
            throw new SyntaxError("expected a number, a variable, or parentheses");
        }
    };

  
    var parseMulExpr = function () {
        var expr = parsePrimaryExpr();
		//console.log("in parseMulExpr expr is : " + expr.type + ", " + expr.value);
        var t = peek();
        while (t === "*" || t === "/") {
            consume( t );
            var rhs = parsePrimaryExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    };

    var parseExpr = function () {
        var expr = parseMulExpr();
		//console.log("in parseExpr expr is : " + expr.type + ", " + expr.value);
        var t = peek();
        while (t === "+" || t === "-") {
            consume( t );
            var rhs = parseMulExpr();
            expr = {type: t, left: expr, right: rhs};
            t = peek();
        }
        return expr;
    };
	
	var parse = function ( equation ) {
		tokens = tokenize( equation );
		position = 0;
		
		var result = parseExpr();
		
		return result;		
	}	
	
	var compute = function ( evalObj )
	{
		var retVal;
		switch ( evalObj.type ) {
			case "number": return parseFloat(evalObj.value);
			case "name": return evalObj.id;
			case "+":
				retVal = compute( evalObj.left ) + compute( evalObj.right );
				return retVal;
			case "-": 
				retVal = compute( evalObj.left ) - compute( evalObj.right );
				return retVal;
			case "*": 
				retVal = compute( evalObj.left ) * compute( evalObj.right );
				return retVal;
			case "/": 
				retVal = compute( evalObj.left ) / compute( evalObj.right );
				return retVal;
		}
	}
	
	var getEquation = function ( elm )
	{
		var eqNum = elm.attr('data-wb-calc-eqnum');
		
		var equation = elm.attr('data-wb-calc-equation');
		if (typeof eqNum != "undefined")
		{
			var radioObj = $("input:radio[name=" + eqNum + "]");
			//console.log("^^^ in getEquation eqation number is : " + $("input:radio[name=" + eqNum + "]:checked").val());
				
			eqNum = $("input:radio[name=" + eqNum + "]:checked").val();
			var equation = elm.attr('data-wb-calc-equation' + eqNum);
		}

		return equation;
	}


// Event binding
$(".wb-calc").submit(function( event ) {
	
	event.preventDefault();

	var $elm = $(this),
		bind = $elm.attr('data-wb-calc-bind');

	var $calculations = $(bind);

	$calculations.each(function(){
		var elm = $(this),	
			equation  = getEquation( elm ),
			roundDigits = elm.attr('data-wb-calc-rounded'),
			value = compute (parse (equation));
			//console.log( "tokens : " + tokens );
			//console.log("roundDigits :" + roundDigits );	
			//console.log("value :" + value );
		if (typeof roundDigits != 'undefined') {
			value = value.toFixed(parseInt(roundDigits));
		}
		elm.text( value );
		console.log("my calculation is :" + elm.attr('data-wb-calc-equation') );
	});

	//console.log( "my bind is " + bind);
	return false;
});

} )( jQuery, wb );