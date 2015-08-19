<?php
/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
if ($_SERVER['HTTP_REFERER'] != "") {
	$q = $_SERVER['HTTP_REFERER'];
} else {
	$q = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['QUERY_STRING'];
}
$q = preg_replace('/#(.*)$/', '', $q);
if (preg_match('/_e\./', $q) > 0) {
	$q = preg_replace('/_e\./', '_f.', $q);
} else if (preg_match('/-eng\./', $q) > 0) {
	$q = preg_replace('/-eng\./', '-fra.', $q);
} else if (preg_match('/-en\./', $q) > 0) {
	$q = preg_replace('/-en\./', '-fr.', $q);
} else if (preg_match('/_f\./', $q) > 0) {
	$q = preg_replace('/_f\./', '_e.', $q);
} else if (preg_match('/-fra\./', $q) > 0) {
	$q = preg_replace('/-fra\./', '-eng.', $q);
} else if (preg_match('/-fr\./', $q) > 0) {
	$q = preg_replace('/-fr\./', '-en.', $q);
}
header("Location: " . $q . "\n\n");
exit();
?>