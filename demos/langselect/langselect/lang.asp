﻿<%@ LANGUAGE="VBSCRIPT" %>
<%
' Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
' www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
sString = Request.ServerVariables("HTTP_REFERER")
sFullFileName = Mid (sString, Instr (sString, ".asp"))
iLen = Instr (sString, ".asp")-4
sFileName = Mid (sString, 1, iLen)
sExtension = Mid (sString, iLen+1, 3)
if (sExtension = "eng") Then
sExtension = "fra"
else
sExtension = "eng"
end if
sNewFileName= sFileName & sExtension & sFullFileName
Response.Redirect sNewFileName
%>