# Web Experience Toolkit (WET)

[![Build Status](https://secure.travis-ci.org/wet-boew/wet-boew.png?branch=master)](http://travis-ci.org/wet-boew/wet-boew)

**WET v3.0 to be released on September 17, 2012**

Web Experience Toolkit (WET) includes reusable components for building and maintaining innovative Web sites that are accessible, usable, and interoperable. These reusable components are open source software and free for use by departments and external Web communities.  

The toolkit complies with the new Standards on Web Accessibility and Web Usability; the toolkit will also ease compliance with the upcoming Standard Web Interoperability. WET is highly recommended for use on Government of Canada Websites.

## Benefits

* Provides reusable components for building and maintaining innovative Web sites.
* Respects accessibility ([WCAG 2.0](http://www.w3.org/TR/WCAG20/) AA and [WAI-ARIA](http://www.w3.org/TR/wai-aria/)), usability, and interoperability.
* Reduces costs by consolidating Web tools and solutions.
* Open source software that is free to use by departments and external Web communities.
* Uses advanced technologies to push the envelope for Web site functionality:
  * [HTML5](http://www.w3.org/TR/html5/), [CSS3](http://www.w3.org/Style/CSS/current-work), [jQuery](http://jquery.com/) (JavaScript framework);
  * Ever-growing list of open source plugins and widgets.
* Supports a wide range of layouts and designs for internal and external Web sites (including applications).

## Key resources

* [Terms and conditions](https://github.com/wet-boew/wet-boew/blob/master/License-eng.txt)
* [Working examples](http://wet-boew.github.com/wet-boew/demos/index-eng.html)

## Contributor guidelines

* Pull requests are welcome. Please make sure your changes are to the latest code and limit the commit range to just the files you intended to change (to avoid conflicts).
* New components should be added in a feature-* branch (e.g., feature-lightbox). 
  * Licensing for all new components and supporting code must be compatible with the MIT license used by WET.
  * New plugins should use [pluginTemplate.js](https://github.com/wet-boew/wet-boew/blob/master/src/pluginTemplate.js) as the basis for the JavaScript code.
  * Include the WET terms and conditions comment block in all text-based source files that fall under Crown Copyright.
* [Validate your HTML markup](http://validator.w3.org/nu/). Markup should be well-formed HTML5. 
  * To test for well-formed markup, validate with an XHTML5 preset and a checkmark next to "Be lax about HTTP Content-Type". 
* [Validate your CSS](http://jigsaw.w3.org/css-validator/#validate_by_uri+with_options) with the following changes to the default settings:
  * **Profile:** CSS level 3
  * **Vendor extensions:** Warnings
* [Validate your JavaScript code](http://www.jshint.com) with the following change to the default settings:
  * **Warn - When code is not in strict mode:** false
* Formatting recommendations:
  * Indent with tabs using the [K&R indenting style](http://en.wikipedia.org/wiki/Indent_style#K.26R_style)
  * Use single quotes for strings in JavaScript (so unescaped double quotes can be used for attributes in HTML output)
* Supported browsers (should be tested against): 
  * [Browser test baseline - YUI Graded Browser Support](http://yuilibrary.com/yui/docs/tutorials/gbs/) (excluding IE6)


-------------------------------------------------------------------

# Boîte à outils de l’expérience Web (BOEW)

**Lancement de la version v3.0 de la BOEW est 17 septembre 2012**

## Vue d'ensemble

La Boîte à outils de l’expérience Web (BOEW) rassemble différents composants réutilisables et prêts-à-utiliser pour la conception et la mise à jour de sites Web innovateurs qui sont à la fois accessibles, conviviaux et interopérables. Tous ces composants réutilisables sont des logiciels libres mis à la disposition des ministères et des collectivités Web externes. 

La Boîte à outils est conforme à la Norme sur l'accessibilité des sites Web et la Norme sur la facilité des sites Web et sera conforme à la Norme sur l’interopérabilité du Web. Il est fortement recommandé d’utiliser la BOEW pour tous les sites Web du gouvernement du Canada.

## Avantages

* Fournit composants réutilisables pour la conception et la mise à jour de sites Web innovateurs.
* Respecte l'accessibilité ([WCAG 2.0](http://www.w3.org/Translations/WCAG20-fr) AA et [WAI-ARIA](http://www.w3.org/TR/wai-aria/)), la facilité d’emploi et l'interoperabilité.
* Réduit les coûts par consolider les outils et solutions axés sur le Web. 
* Sont des logiciels libres mis à la disposition des ministères et des collectivités Web externes.
* Fait appel à des technologies nouvelles et novatrices pour rendre les sites plus novateurs et interactifs :
  * [HTML5](http://www.w3.org/TR/html5/), [CSS3](http://www.w3.org/Style/CSS/current-work#CSS3) et [jQuery](http://jquery.com/) (cadre JavaScript); 
  * liste croissante de plugiciels et gadgets de source ouverte.
* Permet d’avoir accès à une grande diversité de mises en page et de conceptions pour les sites Web internes et externes (y compris les applications). 

## Resources clés

* [Exemples pratiques](http://wet-boew.github.com/wet-boew/demos/index-fra.html)
* [Conditions régissant l'utilisation](https://github.com/wet-boew/wet-boew/blob/master/Licence-fra.txt)

## Lignes directrices pour les contributeurs

* Les demandes de retrait sont les bienvenues. Assurez-vous d'apporter les changements dans la dernière version du code et de limiter le champ de validation (commit range) seulement aux fichiers que vous aviez l’intention de modifier (pour éviter les conflits).
* Les nouvelles composantes devraient être ajoutées dans un branchement de type feature-* (p. ex., feature-lightbox). 
  * Les licences de toutes les nouvelles composantes et du code afférent doivent être compatibles avec la licence MIT utilisée par la Boîte à outils de l’expérience Web (BOEW).
  * Les nouveaux modules d’extension devraient se servir de [pluginTemplate.js](https://github.com/wet-boew/wet-boew/blob/master/src/pluginTemplate.js) comme base pour le code JavaScript.
  * Inclure le bloc de texte sur les conditions d’utilisation de la BOEW dans tous les fichiers sources textuels soumis aux droits d’auteur de la Couronne.
* [Valider votre balisage HTML](http://validator.w3.org/nu/). Le balisage devrait être en HTML5 bien formé. 
  * Pour vérifier si le balisage est bien formé, valider à l’aide d’un préréglage XHTML5 et cocher la case «&#160;Be lax about HTTP Content-Type&#160;». 
* [Valider votre CSS](http://jigsaw.w3.org/css-validator/validator.html.fr#validate_by_uri+with_options) en apportant les changements suivants aux paramètres par défaut&#160;:
  * **Profil&#160;:** CSS niveau 3
  * **Extensions Proprétaires&#160;:** Avertissements
* [Valider votre code JavaScript](http://www.jshint.com) en apportant le changement suivant aux paramètres par défaut&#160;:
  * **Warn - When code is not in strict mode:** false
* Recommandations quant au formatage&#160;:
  * Ajouter les tabulations en utilisant le [style d'indentation K&amp;R](http://fr.wikipedia.org/wiki/Style_d%27indentation#Style_K.26R)
  * Utiliser les guillemets simples pour les chaînes en JavaScript (de façon à ce que les guillemets doubles non échappés (unescaped) puissent être utilisés pour les attributs dans les données de sortie HTML)
* Fureteurs pris en charge (cet élément devrait faire l’objet d’une vérification)&#160;:
  * [Browser test baseline - YUI Graded Browser Support](http://yuilibrary.com/yui/docs/tutorials/gbs/) (sauf Internet Explorer 6)