/**
* @title WET-BOEW Telephone Link
* @overview Automatically add links to telephone numbers in a Web page on a extra small screen (mobile phones).
* @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
* @author @atamsingh
*/

function addTeleLink() {
	if( screen.width < 650 ) {
		var regex = /(|\()(\d{3}).{0,2}(\d{3}).{0,1}(\d{4})(?!([^<]*>)|(((?!<a).)*<\/a>))/g; 
		var text = $( "main" ).html();

		text = text.replace( regex, "<a href=\"tel:$&\">$&</a>" );
		//console.log(text);
		$( "main" ).html( text );
	}
}

$( document ).ready( function() {
	addTeleLink();
});