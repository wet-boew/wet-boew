/*
 * @title WET-BOEW Geomap English config file
 * @overview Exemple d'un fichier de configuration français pour Géocarte
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */

/*
 * Les composantes individuelles seront substituées par les compasantes globales
 *
 * Les couche de superpositions seront ajoutés dans l'ordre où ils sont fournis
 * (c'est à dire la première couche sera ajouté en premier, puis la suivante
 * sur le dessus, et ainsi de suite).
 *
 * Prennez note, la carte de base peut être définie globalement dans le fichier settings.js.
 */
/*jshint unused:false*/
var wet_boew_geomap = {

	// OPTIONNEL: Géomap va fournir une carte de base par défaut si aucune carte de base n"est spécifié ici.
	/*basemap: {
		title:"OSM Map",
		type:"osm",
		mapOptions: {
			center: [ -123, 49 ],
			zoomLevel: 5
		}
	},*/
	overlays: [
		{
			title: "WMS",
			caption: " Ceci est un exemple de service WMS chargé à l’aide de Géomap.",
			type: "wms",
			url: "//geo.weather.gc.ca/geomet/?Lang=F",
			visible: false,
			version: "1.1.1",
			format: "image/png",
			layers: "GDPS.ETA_PR",
			transparent: true,
			options: {
				opacity: 0.5,

				//legendGraphicUrl: "//geo.weather.gc.ca/geomet/?Lang=E&LAYERS=GDPS.ETA_PR&VERSION=1.1.1&FORMAT=image%2Fpng&SERVICE=WMS&REQUEST=GetLegendGraphic&STYLE=PRECIPMM"
				legendHTML: "<small>GeoMet Precipitation (mm)</small>" +
						"<ul class='list-unstyled'>" +
						"<li><span style='background-color:#800000;display:inline-block;height:20px;width:20px'/> <small>100.0</small></li>" +
						"<li><span style='background-color:#FF0000;display:inline-block;height:20px;width:20px'/> <small>50.0</small></li>" +
						"<li><span style='background-color:#FF4500;display:inline-block;height:20px;width:20px'/> <small>25.0</small></li>" +
						"<li><span style='background-color:#FFA500;display:inline-block;height:20px;width:20px'/> <small>20.0</small></li>" +
						"<li><span style='background-color:#FFD700;display:inline-block;height:20px;width:20px'/> <small>15.0</small></li>" +
						"<li><span style='background-color:#E5E500;display:inline-block;height:20px;width:20px'/> <small>10.0</small></li>" +
						"<li><span style='background-color:#7FFF00;display:inline-block;height:20px;width:20px'/> <small>7.5</small></li>" +
						"<li><span style='background-color:#7FFFD4;display:inline-block;height:20px;width:20px'/> <small>5.0</small></li>" +
						"<li><span style='background-color:#00FFFF;display:inline-block;height:20px;width:20px'/> <small>2.5</small></li>" +
						"<li><span style='background-color:#87CEFA;display:inline-block;height:20px;width:20px'/> <small>1.0</small></li>" +
						"<li><span style='background-color:#1E90FF;display:inline-block;height:20px;width:20px'/> <small>0.5</small></li>" +
						"<li><span style='background-color:#0000CD;display:inline-block;height:20px;width:20px'/> <small>0.25</small></li>" +
						"<li><span style='background-color:#000080;display:inline-block;height:20px;width:20px'/> <small>0.10</small></li>" +
						"</ul>"
			}
		},
		{
			title: "KML",
			caption: "*NEEDS TRANSLATION*This data is extracted from the <a href=\"http://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst/457ede2f-fd65-5936-ab60-3fe71da0e98b\">Principal mineral areas of Canada</a> publication.",
			type: "kml",
			url: "demo/producing-mines.kml",
			visible: false,
			datatable: true,
			tooltips: true,
			tooltipText: "Opération",
			popups: true,
			attributes: {
				Type_: "Type",
				OwnersF: "Opérateur / propriétaire",
				OperationF: "Opération",
				ComGroupF: "Groupe de produits minéraux",
				CommodityF: "Produit minérale"
			},
			style: {
				type: "unique",
				field: "Type",
				init: {
					"Coal": {
						externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA+hJREFUSInN1n9MVWUYwPH" +
						"vOfeC51zvubeQiwtDCS37sZxbP5YaKbVqaw1W/DKCQiaEBfYD19ZabrlaMp0tNREItJBoDabWrC2pK1qbxXRMmoMwDav1R8GFe4DzAvee0x/iTbpwuZRrPf++z/t8znPe57w7dv6jsP8vICH8i0Gqx" +
						"LIiP5AknVYUbcs/goQYvgHL9AJJIEV0sMgQhn6tomovzgoSYij5MnLU20bzkc+nNeKucfNSaQme+HkvCEOXFVV7PirIMIYWYlleYFHrsTaaDn8asRlPXBzbqqrZtKGEhPj4jcLQJUXVNkaEDENPkrC" +
						"8QPKXbcf58NAlRJJlLNMMQ2LsdvJzMgkGgjR83ExBThYJ8fHlwvBLiuoqnxIaGfEvkMALpHx14gSNBz8BYMeW13BpGn19Pj472krbt+2hzeOBAFt27OSVslJKCwuo3t/Ak9mZzPd4yiawskmQZf0WM" +
						"yokL7D42IlvONByOFTMpWnIkownfh4Fa7NJuj5x0vr42BgjQpAQm0B+Thbb99RQsaGY+R7Pc8LQ+xVV2xyCDMM9R5aCN17o7eWDloOTXs/vf/Qx3+MBQJZkfL7B0Fqs3U7FsyW4nE5efv1N0h96gBV" +
						"3LGdbVQ3bN78KWMumPKOxsfGwczjyRSuFebnIkoxpmYyOjU5C3C4XW3dVMajrNLQcYvU9d6H79bA6M94MX7efIikxEb+uY1om2RnpBIImK+++E7fLReW7exkY/KvLtpPtxNjDy0Z1BV054rIkU5CbR" +
						"X+/j7d2V9Hf74umxOzuuli7neW334ZvYBBVVViUeN3Vh2ImzsQ5dy5vvL2LZUuXsO6JHKzGj+g423V1IJvNRkXpelxOJ5W79zLg93P8u1OMBYKsy8ul7kATZ7p++HeQzWaj4pn1aJoWmq7LcfJ0B8F" +
						"AgMK8texrbKKzuycyZJqmKdswFyYtkG9OSabr/E+hhFuXpKCqClt37kEfHg4r0H7me8YDAR59+MEQlJP+yKVFSQp9L3YAp9M5IoRepCpqfVlxkby7tj6EdXb30Nn9TsSuO852hc4pPzOD+1NTAesCy" +
						"JsmQQCKor0vhC45VEddWXGRvKu2nu4rOosmnsp8jDWpqwDOW8hpquK8GAZNYPsvY+XFRdJssKezHmf1vSsBfrQgTVWdP1+5HjYMiqLtE4YuO1RHbbRYYXYm961aAXDuEqL98vecKadOUbU6Yfglh+q" +
						"oKS8uknovhu0LxRwllpRFyQDnTMta43C4fp0qb9rxVlTXexNY9S1Lb5rhp4Ee07LSpkMiQhNYrRCDzZJks0XKEyI45Ha7RaScGT9YRXFHd5nNEH8C+eGD9m6tNTgAAAAASUVORK5CYII=",
						fillOpacity: "1",
						graphicWidth: "25",
						name: "Mines de charbon"
					},
					"Metal mines and mills": {
						externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA9FJREFUSInN1ltoHFUYwPH" +
						"/mdndzKwzs6l7Iy1N25S+FCLaF69gg5cHq6S2FUSaS5OqD6YxASklgUpTCgqCIki1uTRF0QcDIlJpaWpES4UgrljBh7RRqsVmN5fNbpo52ezO+JBkcZtkk2gRv9fznfObc77vHMbDfxSe/wUkZWori" +
						"Ddx3eIfJMQPmmZ2/CNIyltbcJ0BYCOIog4u1dJOr9N0s3VNkJRTmxeQcxPf8vFU/7JGSLE4Eq4n4gu2SDutaLr56qog254qx3UHgE3nJy5xJn2+6Gai6jpOJHpojzQQ8QabpZ0Wmm42F4VsO71R4A4" +
						"Amy8kL9GbPgeAgoKDswjxCpUDwWqybo7TY59RH9xN1Bs6JO2U0HTr0JLQ9HRqg4ABoKI/eZme1Bxycv1hLI/JaGacLya/pt+O5SfPujnab77P65EGmiIv8F78E+ruribqCzXNY00FkOv+6Z2RYgDYe" +
						"jH5Hd2pL/OLWR4DBUHEF+RAeA+bkmUF4zNkmHYkURGmLljNG/FejoTrifpCr0g7Pa7p5tE8ZNuBEkXktg3L63SlzhYcTyIzTtQXmj9CwUR2Mj9WIry0hWqxVIPmG2+xz3iUR7RKTiR6eHfDYcC9Z8k" +
						"aZZzZRXX4PPkVByPPoSBwcLDdmQKk1GPRMdJN0pmiK3WWJ/T7SDq3Fq2z4sswIH+ifKKMdG6KHA7Ph3bhjDo8bOyg1GNyPN7NmJPK51+wY3iFunYIKGhxBUFd+FnGZpN0xDtJ5FJFZq4RWogS4WWHs" +
						"Z2J7CR+tYQtnrI7D3mFSluoFkO5i6M3T3Gvr4IXQ3sg0cdgZujOQB6h0h6qw1INjsd7GHfSXJQ/MjuWozG8FyfxKd9nrv07yCNU2oI1WKrBsfhcdy3EN/IK2dEsjeG95BJ9xDLDxSHHcRxFxSnX1iu" +
						"V3nKuzF7PJ1R6N+FXdY6NdDPpLm7byzO/kE1k2R2oIpaYg2rNJ+cGhcjfFw+AYRjTUqYb/Ire0xLdr7wz8lEei2WGiY2cLLrrwcwQg4m5OjVaT/F46UOA+ysorxVAAJpmnpEyLfyKv7slul95e+RDf" +
						"p79vShwexy0dvFY6YMAwy5Kla4Z+aMpqJGmmb0LWGu0RqwFe8l6mqrSBwCuuVCl60bBxEXNoGnmaWmnFb/i71wt9nLgGXYG7ge4OoeYf9yes2TXabrZLe2U8Cv+U63RGvGbvLEsoiklVGjlAFcd193" +
						"p91tLJi/b3ppudc1jH2z3b1vhp4Ehx3WrlkOKQvNYp5STfUKoi1/Jv4WUualAICCL5ax4YTUtMLFSzmriL1z5gWQ67XYNAAAAAElFTkSuQmCC",
						fillOpacity: "1",
						graphicWidth: "25",
						name: "Mines de métaux"
					},
					"Industrial minerals": {
						externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA79JREFUSInN1ktMXFUYwPH" +
						"/uVxmzoV5tBUGDe+SGmnwFWVBqQHUhYmJxo1xKZg2Pmh91IVJFWx140JXTapC62NtoombYmgHmoZQSUxUKDVWpuVheQ2tzAz3zMDc42KmIAwMUBvjtz3f/X7nnu87N9fkPwrzfwEpNV8F4iO0zr4hI" +
						"X6S0nv8tiClYpVoJwiUgsjqoHlW2ZGd0vK+uS1IqWjFLWRy8Azhy19vaOS4A1Q0HEX6Ct9QdsSQlvf1LUG2HS1D6yBQPjnURXi4M+vLmHn3EOo5TmXje0hf4LCyI0Ja3sNZIduOlAp0EKiYvNRF+FJ" +
						"HakEYoJ1MRbgoqW1GJ5cYHzhNSW0L0hc4pOx5IS3foXWhhYX5YgFBYPfUcDfhoRSy5+lOci0f8UiYqcHviE50rTytE4ycfYeKhmNU7G/l2oUTFD/ajPQXtaax1lWQ1tdz40oEgaqp4bPMDn66XCvX8" +
						"iGEgfQVUlb3EtOXK1et66QiuWhjmHdTXNtCqOdDKhuOIv1Fryk7Mictb9syZNt+tyGSe6LTI8wOnlx1OvH5GaS/KHVSwmApNrdycoakpL4N0+3lt+9b2XXv8/hKGgj1fkD1MycA/cC6PUomExltmPz" +
						"1W8rrDyKEgdYOySW1jJTubyPX2kEo+D7OYpjZoZN4ip/CScxl1Nn0yxC73s3UUAVJNY/WSUpqX2DMWWJX1WMppOcYTmJ6OT86cQaEa/sQsGbEDcr3NROPzjFyrh0nPrmVEtv71glD4i9/hHjsBjkui" +
						"du3G3vmTkPCleqJ28NI97vkFTxEad0BRvsc1Gz/HYKESWl9O6bbm278LNE/f2DixyXK6g4y2qdR4Yv/EhImJfvayZVervakputWxCbPMX5xidK6A4z1Oai5geyQ4ziOkYOTf1eZ4drxIImbPy8nyJ0" +
						"PY7osQr3t6MUbGQUWps8z1p8gUPMco+dTUMHeF9ObFIurII/Hs6BUpMV05Z2ubHjLCPV+soypuQGuBjfeKYCa7Wf0fKpPBTUvU1T9JKBDYLy9CgKQ0vuVUhFhuvJPpbCPSdz8JSuwNgpqXqGo+gmAE" +
						"Y3RZEnPaAaUxr5cwY6I7WCFNa8SqH4c4A8NTZblGfvnesYwSOn9QtkRw3Tld2wVK7y/lcB9jQBXUoh3fG3OulMnLe8pZc8L05X/eWXDERGbubYhkpPrxhOoArjiaN2Yl+ebWC9vw/GWlq8zjX3mL96" +
						"7yU8DvztaN22EZIXSWIdSf30jRE5OtjylklG/36+y5Wx6YaX0Z16e24i/AWg1hRJKTWppAAAAAElFTkSuQmCC",
						fillOpacity: "1",
						graphicWidth: "25",
						name: "Mines de non-métaux"
					},
					"Oil Sands": {
						externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA9VJREFUSInN1l9QVFUcwPH" +
						"vucDuucveXZqCHXOkZakexFkcmHypRon+PFYPNT1UY0zAiEBKJmjiKDqF04zUWA+IWk0PvTiNNtWI5hDj+CCwFskb/8JyKvk37gL3uLD39sC2hguLmNN0Xn+/+/ucP79z5qbzH430/wWkVDgfxCFsO" +
						"/WEhLgspdF0V5BS03nYVgewBkRKB5vnlRm5T+rG9hVBSk35/0b6v23natsXSxoZq7Ip2r8bd072NmVGNKkbb90RZJpTudh2B/BQ/3ftjHx8POVinA+u4vKeAxQd3IM7J6dWmREhdaM2JWSakTUCuwP" +
						"wD5xpZ+RIHNE0sKwkRDgdFFRuJjY3R1/rCdZVlOH25dQoMyyk7qlZFJqZCa8W0AEEBs9+zy8fzSOPf3kU6fUwPTrOwFenGTt9NvGxfTNKV+0uij7YR1FdNT+2fMLa8s0YPl91HKteANn27xk3legA8" +
						"ofOnWe45WiimPR6EELDnZNNYWUZQwH/gritbjJrKtKdTgrK3+By43sUHdiF2+fbqszIhNSNvQnINL1OTcQeGR8cYuhw64Ltmb4+itvnm98qoaHGJ25tnS4Jvr8H6THoLKsh99WXeKD0SULvHmTjsSO" +
						"AHVz0jGLRaNI59J88xfqqcoTQsG2LmKluIc2N6FleeuqbiI1OMNzSSvYLzzE3NplUZ9mXYfyb8wz4/UTDN8CyKXjtFey5GKs3PYHMyiK0u4m5P64n8kdPtSOcjpVDwMIWFxCs2Iw5NkF3wz5mr/15J" +
						"yVW9tYJXeJ7rBhzYpJ0l8T1aIAb9xoSTgfB5kachpuut/eStaGQYNWb9FoW4c5L9wjKSCfY3Ij0GITqm5i7PsbY1+foi85SWFXOT5ZF5EL3v4TiiNNj0LNzH7HRW+09eeYH+mIxglXl/GzZRC72pIY" +
						"sy7K0NKwsf66WuaGQ6a7eRIKxYT0ZLp3Qzv3ExpPbdvLcBa5EowRefpHeOOTf8vp8UIjZBZDb7Z5RKlLm0F0niuu3aaFDHyawyMUeQilmChDuvERv/JzytleQ/+zTgD0M2o4FEICUxudKRYTDlXm8u" +
						"H6bFmo+zHT3lZTA7SNQV0ngmVKAIRutRJfuq0lQHPssgTXUiZVggR1bCJSWAAzaUKLr7l//GU9qBimNT5UZ0RyuzLY7xfLf2UreUxsBBuYR47fbcxbtOqkbx5UZFg5X5tHihjoxOTSyJJIundz/cD7" +
						"AgGXbm1wuz7VF85YqIHXPsTjW6lu3dpmfBvot2y5ZCkkJxbE2pW6cFCItLVWeUrEpr9erUuUse2Gl9CZfnrsYfwFqWYQCxROHDQAAAABJRU5ErkJggg==",
						fillOpacity: "1",
						graphicWidth: "25",
						name: "Mines de sables bitumineux"
					}
				},
				select: {
					externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAACKElEQVR42uWWMU/bQBTHWVBR1aUSG7Sl4oMBoiwd+gEYGBgqWIoCLDDCBEUIqUJqB6TOEe1" +
					"QCQGOEyeRHBTHl/OLfTkvcNwz2NDkzrGTpVItPeXknPy7/3t/vXdjY//V43nNWR/gyHGcEwzSbJ6QRuMp5DtXvuMcVkaAeO8BoM59X4QyuCZC/hDdrreRG0IpneEereKHXkyxgWH9KUcw33ULmSHtdvutT" +
					"JeVFRLHr5+lGLY5EEIIecMpLeeBXBZNcfbNSNZRGhlsaSGu604Frmv2Qki1KjiAMH6bWtiPY0NAoxGtLxIY3e6DnJ/vjAcAhkoJQpLiy7UKtLFuCN9xxFXRfFLW9QVjsPoXSFr3FTrrYO9amZrnLlNBLov" +
					"9akPmC7S/ErS2WlKeOFHVo6ggIVdFdUpxvxKEf3zWgJ6H32olkFalot0XpoEwDVmchspa0iRpexDk6EBfMoBQCToRbm7SDzOKot7Cx5bWgRzZB3PXqKBxF9Tr+RSFKYrQjd8P9WqJol48UIBs237JO3BLb" +
					"Fv5odPDwbXrPeRDR4evfd0h6HTmpJtuaUreswZCeNeryAb9TtnvOpTOI4yMAIsgAGWcAqkdHChdkBvvhoFxhs3UM3EKZJpJjNLFvDAsPg+gJCHTuaasTOMHhFFpELT9yrIZ/a49rj99LEfr/V1DhI8QHDV" +
					"D3RsY85YQ1ndPiNcIwHEQgDE0JH5qtdpraf/JtLAsa+KfubrdA6qupf9mD9mBAAAAAElFTkSuQmCC",
					graphicOpacity: "1"
				}
			}
		},
		{
			title: "TopoJSON (World 110m)",
			caption: "*NEEDS TRANSLATION*This is a sample dataset loaded from a remote TopoJSON resource.",
			type: "topojson",
			url: "demo/topojson.json",
			accessible: false,
			style: {
				strokeColor: "#3399ff",
				strokeWidth: 2.0
			},
			visible: false
		},
		{
			title: "EsriJSON",
			caption: "*NEEDS TRANSLATION*This is a sample dataset loaded from a remote Esri JSON resource.",
			type: "esrijson",
			url: "//geoappext.nrcan.gc.ca/arcgis/rest/services/NEB/Pipeline/MapServer/0/query?where=OBJECTID>0&f=pjson",
			attributes: {
				OPERATOR: "Opérateur"
			},
			visible: false,
			zoom: true,
			style: {
				strokeColor: "#FF0000",
				strokeWidth: 2.0,
				strokeDash: [ 6, 4 ]
			}
		},
		{
			title: "JSON (Séismes récents)",
			caption: "*NEEDS TRANSLATION*This is a sample dataset loaded from a remote JSON resource, in this case the Earthquakes API.",
			type: "json",
			url: "//www.earthquakescanada.nrcan.gc.ca/api/earthquakes/latest/30d.json",
			visible: false,
			popups: true,
			datatable: true,
			zoom: true,
			attributes: {
				location: { path: "en", alias: "Localisation" },
				magnitude: "Magnitude",
				origin_time: "Time"
			},
			style: {
				type: "rule",
				rule: [
					{
						field: "Magnitude",
						value: [ 2 ],
						filter: "LESS_THAN",
						name: "M < 2",
						init: {
							strokeColor: "#333333",
							fillColor: "#000066",
							pointRadius: 2.5,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					},
					{
						field: "Magnitude",
						value: [ 2, 2.9 ],
						filter: "BETWEEN",
						name: "M-2",
						init: {
							strokeColor: "#333333",
							fillColor: "#6600cc",
							pointRadius: 4.5,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					},
					{
						field: "Magnitude",
						value: [ 3, 3.9 ],
						filter: "BETWEEN",
						name: "M-3",
						init: {
							strokeColor: "#333333",
							fillColor: "#990099",
							pointRadius: 6.5,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					},
					{
						field: "Magnitude",
						value: [ 4, 4.9 ],
						filter: "BETWEEN",
						name: "M-4",
						init: {
							strokeColor: "#333333",
							fillColor: "#ff0000",
							pointRadius: 8,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					},
					{
						field: "Magnitude",
						value: [ 5, 5.9 ],
						filter: "BETWEEN",
						name: "M-5",
						init: {
							graphicName: "star",
							strokeColor: "#333333",
							fillColor: "#ff6600",
							pointRadius: 14,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					},
					{
						field: "Magnitude",
						value: [ 5.9 ],
						filter: "GREATER_THAN",
						name: "M-6+",
						init: {
							graphicName: "star",
							strokeColor: "#333333",
							fillColor: "#ff9933",
							pointRadius: 18,
							fillOpacity: 0.8,
							strokeWidth: 1.0
						}
					}
				] }
		},
		{
			title: "GeoJSON (CartoDB)",
			caption: "Ceci est un exemple d'un jeu de données JSON chargé à partir d'un site externe, dans ce cas-ci les caméras de circulation de la ville d'Ottawa à partir du site Carto DB.",
			type: "geojson",
			url: "//stephenott.cartodb.com/api/v2/sql",
			params: {
				format: "GeoJSON",
				q: "SELECT * FROM traffic_cameras LIMIT 25"
			},
			attributes: {
				location_desc: "Emplacement",
				longitude: "Latitude",
				latitude: "Longitude",
				updated_at: "Dernière mise à jour"
			},
			visible: false,
			zoom: true,
			datatable: true,
			style: {
				type: "symbol",
				init: {
					graphicWidth: 30,
					graphicHeight: 30,
					externalGraphic: "demo/trafficcamera.png",
					graphicOpacity: 1.0
				},
				select: {
					graphicWidth: 20,
					graphicHeight: 20,
					externalGraphic: "demo/trafficcamera_active.png",
					graphicOpacity: 0.5
				}
			}
		}
	]
};
