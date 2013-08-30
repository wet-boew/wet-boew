<%@ LANGUAGE="VBSCRIPT" %>
<%
' Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
' wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
sString = Request.ServerVariables("HTTP_REFERER")
sFullFileName = Mid (sString, Instr (sString, ".asp"))
iLen = Instr (sString, ".asp")-4
sFileName = Mid (sString, 1, iLen)
sExtension = Mid (sString, iLen+1, 3)
sExtension2 = Mid (sString, iLen+1, 2)
sExtension3 = Mid (sString, iLen+1, 1)
if (sExtension = "eng") Then
sExtension = "fra"
else if (sExtension = "fra") Then
sExtension = "eng"
else if (sExtension2 = "en") Then
sExtension = "fr"
else if (sExtension2 = "fr") Then
sExtension = "en"
else if (sExtension3 = "e") Then
sExtension = "f"
else if (sExtension3 = "f") Then
sExtension = "e"
else
sExtension = "eng"
end if
sNewFileName= sFileName & sExtension & sFullFileName
Response.Redirect sNewFileName
%>