# Web Experience Toolkit (WET) Contributor guidelines

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

# Boîte à outils de l’expérience Web (BOEW) lignes directrices pour les contributeurs

* Les demandes de retrait sont les bienvenues. Assurez-vous d'apporter les changements dans la dernière version du code et de limiter le champ de validation (commit range) seulement aux fichiers que vous aviez l’intention de modifier (pour éviter les conflits).
* Les nouvelles composantes devraient être ajoutées dans un branchement de type feature-* (p. ex., feature-lightbox). 
  * Les licences de toutes les nouvelles composantes et du code afférent doivent être compatibles avec la licence MIT utilisée par la Boîte à outils de l’expérience Web (BOEW).
  * Les nouveaux modules d’extension devraient se servir de [pluginTemplate.js](https://github.com/wet-boew/wet-boew/blob/master/src/pluginTemplate.js) comme base pour le code JavaScript.
  * Inclure le bloc de texte sur les conditions d’utilisation de la BOEW dans tous les fichiers sources textuels soumis aux droits d’auteur de la Couronne.
* [Valider votre balisage HTML](http://validator.w3.org/nu/). Le balisage devrait être en HTML5 bien formé. 
  * Pour vérifier si le balisage est bien formé, valider à l’aide d’un préréglage XHTML5 et cocher la case «&#160;Be lax about HTTP Content-Type&#160;». 
* [Valider votre CSS](http://jigsaw.w3.org/css-validator/validator.html.fr#validate_by_uri+with_options) en apportant les changements suivants aux paramètres par défaut&#160;:
  * **Profil&#160;:** CSS niveau 3
  * **Extensions Propriétaires&#160;:** Avertissements
* [Valider votre code JavaScript](http://www.jshint.com) en apportant le changement suivant aux paramètres par défaut&#160;:
  * **Warn - When code is not in strict mode:** false
* Recommandations quant au formatage&#160;:
  * Ajouter les tabulations en utilisant le [style d'indentation K&amp;R](http://fr.wikipedia.org/wiki/Style_d%27indentation#Style_K.26R)
  * Utiliser les guillemets simples pour les chaînes de caractères en JavaScript (de façon à ce que les guillemets doubles non échappés (unescaped) puissent être utilisés pour les attributs dans les données de sortie HTML)
* Fureteurs pris en charge (cet élément devrait faire l’objet d’une vérification)&#160;:
  * [Browser test baseline - YUI Graded Browser Support](http://yuilibrary.com/yui/docs/tutorials/gbs/) (sauf Internet Explorer 6)