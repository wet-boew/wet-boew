#
# * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
# * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
# 

#
# * DataTables
# 
### global Modernizr:true, vapour:true  ###
do ($ = jQuery, window, vapour, Modernizr, undef = undefined) ->
	"use strict"
	selector = ".wb-tables"
	$document = vapour.doc
	mode = vapour.getMode()


	### default settings ###
	opts =
		aaSorting:[[1, 'asc']]
		aColumns : []
		aLengthMenu : [10, 25, 50, 100]
		aMobileColumns : false
		bInfo: true
		bPaginate : true
		bSearch : true
		bSort : true
		bStateSave: false
		bVisible : true
		bZebra : false
		
		iDisplayLength: 10
		sPaginationType: 'two_button'

	### Internal Functions ###
	###
	Retrieves data from a 'data-' attribute
	###
	getData = (elm, data_name) ->
	  $elm = (if typeof elm.jquery isnt undef then elm else $(elm))
	  dataAttr = $elm.attr("data-" + data_name)
	  dataObj = toObject(dataAttr)  if dataAttr
	  $.data elm, data_name, dataObj
	  dataObj

	###
	Converts a string to an object
	###
	toObject = (data_string) ->
	  try
	    obj = $.parseJSON(data_string)
	  catch e
	    # Fallback if data_string is a malformed JSON string (less secure than with a JSON string)
	    data_string = "{" + data_string + "}"  if data_string.indexOf("{") is -1
	    obj = eval("(" + data_string + ")")
	  obj

	### A simple wrapper does not really need anything more than just an init ###
	$document.on "timerpoke.wb tablify.wb-tables", selector, (event) ->
		### "this" is cached for all events to utilize. ###
		$elm = $(@)
		eventType = event.type

		switch eventType
			when "timerpoke"
				window._timer.remove selector
				Modernizr.load [
					load: "site!deps/jquery.dataTables" + mode + ".js"
					complete: ()->
						$elm.trigger "tablify.wb-tables"
				]

			when "tablify"
				i18n = window.i18n
				# Class-based overrides - use undefined where no override of defaults or settings.js should occur
				overrides = {}
				# Extend the defaults with settings passed through settings.js (wet_boew_tables), class-based overrides and the data-wet-boew attribute
				$.extend opts, overrides, getData($elm, "wet-boew")
				$elm.dataTable
				  aaSorting: opts.aaSorting
				  aoColumnDefs: [
				    bVisible: (opts.bVisible is true)
				    aTargets: opts.aColumns
				  ]
				  asStripeClasses: ((if (opts.bZebra is true) then ["odd", "even"] else []))
				  bFilter: (opts.bSearch is true)
				  bInfo: ((if (opts.bInfo is true) then ((if (opts.bSearch is true or opts.bPaginate is true) then true else false)) else false))
				  bPaginate: (opts.bPaginate is true)
				  iDisplayLength: opts.iDisplayLength
				  aLengthMenu: opts.aLengthMenu
				  bSort: (opts.bSort is true)
				  bStateSave: (opts.bStateSave is true)
				  sPaginationType: ((if (opts.sPaginationType is "two_button") then opts.sPaginationType else "full_numbers"))
				  oLanguage:
				    oAria:
				      sSortAscending: i18n("%sSortAscending")
				      sSortDescending: i18n("%sSortDecending")

				    oPaginate:
				      sFirst: i18n("%first")
				      sLast: i18n("%last")
				      sNext: i18n("%next")
				      sPrevious: i18n("%previous")

				    sEmptyTable: i18n("%sEmptyTable")
				    sInfo: i18n("%sInfo")
				    sInfoEmpty: i18n("%sInfoEmpty")
				    sInfoFiltered: i18n("%sInfoFiltered")
				    sInfoThousands: i18n("%sInfoThousands")
				    sLengthMenu: i18n("%sLengthMenu")
				    sLoadingRecords: i18n("%loading")
				    sProcessing: i18n("%processing")
				    sSearch: i18n("%jqm-filter") + i18n("%colon")
				    sZeroRecords: i18n("%no-match-found")

		return false

	
	window._timer.add selector