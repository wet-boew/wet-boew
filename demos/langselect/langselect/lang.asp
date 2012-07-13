<%@ LANGUAGE="VBSCRIPT" %>
<%
' Language selector v1.1 / Sélecteur de langue v1.1
' Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
' Terms and conditions of use: http://tbs-sct.ircan.gc.ca/projects/gcwwwtemplates/wiki/Terms
' Conditions régissant l'utilisation : http://tbs-sct.ircan.gc.ca/projects/gcwwwtemplates/wiki/Conditions
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

