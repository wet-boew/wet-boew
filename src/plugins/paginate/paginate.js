/**
 * @title WET-BOEW Tag filter
 * @overview Filter based content tagging
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
( function( $, window, document, wb ) {
"use strict";

let i18n, i18nText;

const componentName = "wb-paginate",
	selector = ".provisional." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	filterClass = "wb-fltr-out",
	pgFilterOutClass = "wb-pgfltr-out",
	tagFilterClass = "wb-tgfltr-out",
	pagerClass = "wb-paginate-pager",
	pageData = "data-pagination-idx",
	notFilterClassSel = ":not(." + filterClass + "):not(." + tagFilterClass + ")",
	defaults = {
		lst: {
			selector: "li"
		},
		grp: {
			selector: "> *"
		},
		tbl: {
			selector: "tr",
			section: ":scope > tbody"
		},
		itemsPerPage: 10
	},

	init = function( event ) {
		const elm = wb.init( event, componentName, selector );

		if ( elm ) {
			var $elm = $( elm ),
				paginationElm,
				elmTagName = elm.nodeName,
				setDefault,
				uiTargetElm;

			if ( !i18nText ) {
				i18n = wb.i18n;
				i18nText = {
					prv: i18n( "prv" ),
					nxt: i18n( "nxt" )
				};
			}

			// Setup configurations
			switch ( elmTagName ) {
				case "UL":
					setDefault = defaults.lst;
					break;
				case "TABLE":
					setDefault = defaults.tbl;
					break;
				default:
					setDefault = defaults.grp;
					break;
			}

			elm.id = elm.id || wb.getId();
			elm.pgSettings = $.extend( true, {}, setDefault, window[ componentName ], wb.getData( $elm, componentName ) );
			elm.pgSettings.currPage = 1;
			elm.pgSettings.itemsPerPage = elm.pgSettings.itemsPerPage || defaults.itemsPerPage;
			elm.pgSettings.items = elm.querySelectorAll( ( elm.pgSettings.section || ":scope" ) + " " + elm.pgSettings.selector + notFilterClassSel );

			// Setup pagination container
			paginationElm = document.createElement( "div" );
			paginationElm.id = componentName + "-" + elm.id;
			paginationElm.classList.add( pagerClass );

			// Add pagination container
			if ( elm.pgSettings.uiTarget ) {
				uiTargetElm = document.querySelector( elm.pgSettings.uiTarget );
				uiTargetElm.appendChild( paginationElm );
			} else if ( elm.pgSettings.section ) {
				if ( elmTagName === "UL" || elmTagName === "TABLE" ) {
					elm.after( paginationElm );
				} else {
					elm.querySelector( elm.pgSettings.section ).after( paginationElm );
				}
			} else {
				elm.after( paginationElm );
			}

			// Show/hide items and generate pagination
			updateItems( elm );
			generateUI( elm );

			wb.ready( $( elm ), componentName );
		}
	},

	// Set or reset pagination UI
	generateUI = function( elm ) {
		var paginationUI = "",
			currPage = elm.pgSettings.currPage,
			pagesCount = elm.pgSettings.pagesCount,
			paginationElm = document.querySelector( "#" + componentName + "-" + elm.id ),
			i = 1;

		// Make sure the defined current page is not bigger than the total pages
		if ( currPage > pagesCount ) {
			currPage = pagesCount;
		}

		// Only add pagination if there is more than one page
		if ( pagesCount > 1 ) {
			paginationUI = "<ol class=\"pagination\">";

			// Add Previous page button
			var prevLI = "";
			prevLI += "<li" + ( i === currPage ? " class=\"disabled\"" : "" ) + ">";
			prevLI += "<button type=\"button\" class=\"paginate-prev\" aria-controls=\"" + elm.id + "\"><span class=\"wb-inv\">Page </span>" + i18nText.prv + "</button>";
			prevLI += "</li>";

			paginationUI += prevLI;

			// Add pages buttons
			for ( i; i <= pagesCount; i++ ) {
				var pageButtonLI = "";
				pageButtonLI += "<li class=\"" + returnItemClass( currPage, pagesCount, i ) + "\"" + ">";
				pageButtonLI += "<button type=\"button\" " + pageData + "=\"" + i + "\" aria-controls=\"" + elm.id + "\"" + ( i === currPage ? " aria-current=\"true\"" : "" ) + "><span class=\"wb-inv\">Page </span>" + i + "</button>";
				pageButtonLI += "</li>";
				paginationUI += pageButtonLI;
			}

			// Add Next page button
			var nextLI = "";
			nextLI += "<li" + ( i === currPage ? " class=\"disabled\"" : "" ) + ">";
			nextLI += "<button type=\"button\" class=\"paginate-next\" aria-controls=\"" + elm.id + "\"><span class=\"wb-inv\">Page </span>" + i18nText.nxt + "</button>";
			nextLI += "</li>";
			paginationUI += nextLI;
			paginationUI += "</ol>";
		}

		// Insert HTML
		paginationElm.innerHTML = paginationUI;
	},

	// Show/hide items to reflect current page
	updateItems = function( elm ) {
		let currPage = elm.pgSettings.currPage,
			items = elm.pgSettings.items,
			itemsPerPage = elm.pgSettings.itemsPerPage;

		items.forEach( function( item, index ) {
			if ( ( index < ( itemsPerPage * currPage ) ) && ( index >= ( itemsPerPage * currPage ) - itemsPerPage ) ) {
				item.classList.remove( pgFilterOutClass );
			} else {
				item.classList.add( pgFilterOutClass );
			}
		} );

		elm.pgSettings.pagesCount = Math.ceil( items.length / itemsPerPage );
	},

	// Update pagination to reflect current page
	goToPage = function( elm ) {
		let paginationElm = document.querySelector( "#" + componentName + "-" + elm.id ),
			pageItems = paginationElm.querySelectorAll( "li" ),
			itemClass,
			pageLink,
			currPage = elm.pgSettings.currPage,
			pagesCount = elm.pgSettings.pagesCount;

		pageItems.forEach( function( pageItem, i ) {
			pageLink = pageItem.querySelector( "button" );

			if ( pageLink.classList.contains( "paginate-prev" ) ) {
				if ( currPage > 1 ) {
					pageItem.classList.remove( "disabled" );
				} else {
					pageItem.classList.add( "disabled" );
				}
			} else if ( pageLink.classList.contains( "paginate-next" ) ) {
				if ( currPage < pagesCount ) {
					pageItem.classList.remove( "disabled" );
				} else {
					pageItem.classList.add( "disabled" );
				}
			} else {
				pageItem.className = "";
				pageItem.children[ 0 ].removeAttribute( "aria-current" );

				itemClass = returnItemClass( currPage, pagesCount, i );

				if ( i === currPage ) {
					pageItem.children[ 0 ].setAttribute( "aria-current", "true" );
				}

				pageItem.className = itemClass;
			}
		} );
	},

	// Return the list item classname
	returnItemClass = function( currPage, pagesCount, i ) {
		let itemClass = "";

		if ( currPage > 1 && currPage < pagesCount ) {
			if ( Math.abs( currPage - i ) > 1 ) {
				itemClass += "hidden-xs hidden-sm";

				if ( Math.abs( currPage - i ) > 2 ) {
					itemClass += " hidden-md";
				}
			}
		} else {
			if ( Math.abs( currPage - i ) > 2 ) {
				itemClass += "hidden-xs hidden-sm";

				if ( Math.abs( currPage - i ) > 4 ) {
					itemClass += " hidden-md";
				}
			}
		}

		if ( pagesCount > 10 ) {
			if ( currPage <= 5 ) {
				if ( i > 10 ) {
					itemClass += " hidden";
				}
			} else if ( ( currPage > 5 ) && ( currPage < pagesCount - 5 ) ) {
				if ( ( i < currPage - 4 ) || ( i > currPage + 5 ) ) {
					itemClass += " hidden";
				}
			} else {
				if ( i <= pagesCount - 10 ) {
					itemClass += " hidden";
				}
			}
		}

		if ( i === currPage ) {
			itemClass += " active";
		}

		return itemClass;
	};

// When a page button is clicked
$document.on( "click", "." + pagerClass + " button", function()  {
	let elm = document.querySelector( "#" + this.getAttribute( "aria-controls" ) ),
		pageDest = ( ( this.getAttribute( pageData ) ) * 1 ) || elm.pgSettings.currPage;

	if ( this.classList.contains( "paginate-next" ) ) {
		pageDest++;
	} else if ( this.classList.contains( "paginate-prev" ) ) {
		pageDest--;
	}

	if ( pageDest !== elm.pgSettings.currPage ) {
		elm.pgSettings.currPage = pageDest;

		updateItems( elm );
		goToPage( elm );

		$( elm ).trigger( "setfocus.wb" );
		if ( elm.getBoundingClientRect().top < 0 ) {
			elm.scrollIntoView( { behavior: "smooth" }, true );
		}
	}


} );

// Resets items and pagination
$document.on( "wb-contentupdated", selector, function() {
	this.pgSettings.currPage = 1;
	this.pgSettings.items = this.pgSettings.items = this.querySelectorAll( ( this.pgSettings.section || ":scope" ) + " " + this.pgSettings.selector + notFilterClassSel );

	updateItems( this );
	generateUI( this );
} );

$document.on( "timerpoke.wb " + initEvent, selector, init );

wb.add( selector );

} )( jQuery, window, document, wb );
