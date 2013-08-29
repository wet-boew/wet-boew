/*! HTML5 sessionStorage
 * @build		2009-08-20 23:35:12
 * @author		Andrea Giammarchi
 * @license	Mit Style License
 * @project	http://code.google.com/p/sessionstorage/
 */

// define sessionStorage only if not present (old browser)
if(typeof sessionStorage === "undefined")(function(window){

// this script could have been included via iframe so we would like to use the top context as storage area
// but if the iframe is not part of the domain below check could generate an error
var // the top pointer is used in any case to point to the top context level
	top = window
;
try {
	while(top !== top.top)
		top = top.top;
} catch(e) {
};

/** RC4 Stream Cipher
 *	http://www.wisdom.weizmann.ac.il/~itsik/RC4/rc4.html
 * -----------------------------------------------
 * @description	A quick stream cipher object able to encode
 *					or decode whatever string using
 *					a random key from lennght 1 to 256
 *
 * @author			this JavaScript porting by Andrea Giammarchi
 * @license		Mit Style License
 * @blog			http://webreflection.blogspot.com/
 * @version		1.1
 * @compatibility	hopefully every browser
 */
 var RC4 = (function(fromCharCode, random){
	return {

		/** RC4.decode(key:String, data:String):String
		 * @description	given a data string encoded with the same key
		 *					generates original data string.
		 * @param	String	key precedently used to encode data
		 * @param	String	data encoded using same key
		 * @return	String	decoded data
		 */
		decode:function(key, data){
			return this.encode(key, data);
		},

		/** RC4.encode(key:String, data:String):String
		 * @description	encode a data string using provided key
		 * @param	String	key to use for this encoding
		 * @param	String	data to encode
		 * @return	String	encoded data. Will require same key to be decoded
		 */
		encode:function(key, data){
			// cannot spot anything redundant that
			// could make this algo faster!!! Good Stuff RC4!
			for(var
				length = key.length, len = data.length,
				decode = [], a = [],
				i = 0, j = 0, k = 0, l = 0, $;
				i < 256; ++i
			)	a[i] = i;
			for(i = 0; i < 256; ++i){
				j = (j + ($ = a[i]) + key.charCodeAt(i % length)) % 256;
				a[i] = a[j];
				a[j] = $;
			};
			for(j = 0; k < len; ++k){
				i = k % 256;
				j = (j + ($ = a[i])) % 256;
				length = a[i] = a[j];
				a[j] = $;
				decode[l++] = fromCharCode(data.charCodeAt(k) ^ a[(length + $) % 256]);
			};
			return decode.join("");
		},

		/** RC4.key(length:Number):String
		 * @description	generate a random key with arbitrary length
		 * @param	Number	the length of the generated key
		 * @return	String	a randomly generated key
		 */
		key:function(length){
			for(var i = 0, key = []; i < length; ++i)
				key[i] = fromCharCode(1 + ((random() * 255) << 0));
			return key.join("");
		}
	}
	// I like to freeze stuff in interpretation time
	// it makes things a bit safer when obtrusive libraries
	// are around
})(window.String.fromCharCode, window.Math.random);

/** Linear String Storage
 * -----------------------------------------------
 * @description	A Linear String Storage is a way to save
 *					unique keys with related values inside a string.
 *
 * @author			Andrea Giammarchi
 * @license		Mit Style License
 * @blog			http://webreflection.blogspot.com/
 * @version		1.3
 * @compatibility	Internet Explorer, Chrome, Opera (unobtrusive for others)
 * @protocol		Linear String Storage Protocol Specs
 * -----------------------------------------------
 * c	   = special separator char
 * s	   = key prefix char
 * key	   = key to use as value reference
 * len	   = unescaped key length
 * value   = value to store
 * length  = value length
 * entry   = c + s + key + c + c + length + c + value
 * -----------------------------------------------
 * cs key cc length c value
 * o.[	 ]oo[	   ]o[	   ]
 *
 * key must be a string
 * value must be a string
 * both key or value, if not strings, should be converted
 * both key and value cannot contain the special "c" char (replacement)
 * entry can always be appended into the linear string storage
 * entry cannot exist, or there could be more than an entry
 * if a key was already present, its entry has to be removed and the new one appended
 * -----------------------------------------------
 */
var LSS = (function(window){

	/** new LSS([storage:Object, key:String, data:String])
	 * @param	Object		an optional object to use as storage or directly a linear String.
	 * @param	String		the Object property with the linear string to manage.
	 * @param	String		optional data to preserve as initial string (when clear is performed, data is preserved)
	 * @example
	 *			// persistent storage via window.name property
	 *			var s = new LSS(window, "name");
	 *
	 *			// temporary storage via existent string
	 *			var s = new LSS(window.name);
	 *
	 *			// temporary storage with empty string
	 *			var s = new LSS();
	 */
	function LSS(_storage, _key, _data){
		this._i = (this._data = _data || "").length;
		if(this._key = _key)
			this._storage = _storage;
		else {
			this._storage = {_key:_storage || ""};
			this._key = "_key";
		};
	};

	/** @description	special character to use as separator
	 */
	LSS.prototype.c = String.fromCharCode(1);

	/** @description	character to use as key prefix (avoid problems with empty key/values)
	 */
	LSS.prototype._c = ".";

	/** this.clear(void):void
	 * @description	reset the storage string
	 */
	LSS.prototype.clear = function(){
		this._storage[this._key] = this._data;
	};

	/** this.del(key:String):void
	 * @description	remove a key if present and its related value.
	 * @param	String	the key to remove
	 */
	LSS.prototype.del = function(key){
		var data = this.get(key);
		if(data !== null)
			this._storage[this._key] = this._storage[this._key].replace(escape.call(this, key, data), "");
	};

	/** this.escape(data:String):String
	 * @description	escape a generic string. By default it uses window.escape function.
	 *					Please note if modified it should preserve the used special character.
	 * @param	String	data to escape
	 * @return	String	escaped data that can NOT contain the special character.
	 */
	LSS.prototype.escape   = window.escape;

	/** this.get(key:String):String
	 * @description	retrieve stored data if key is present.
	 * @param	String	key related to stored data
	 * @return	String	stored data or null if key was not present.
	 */
	LSS.prototype.get = function(key){
		var _storage = this._storage[this._key],
			c = this.c,
			i = _storage.indexOf(key = c.concat(this._c, this.escape(key), c, c), this._i),
			data = null
		;
		if(-1 < i){
			i = _storage.indexOf(c, i + key.length - 1) + 1;
			data = _storage.substring(i, i = _storage.indexOf(c, i));
			data = this.unescape(_storage.substr(++i, data));
		};
		return data;
	};

	/** this.key(void):Array
	 * @description	put each key into an array and return it
	 * @return	Array	all keys found in the storage.
	 */
	LSS.prototype.key = function(){
		var _storage = this._storage[this._key],
			c = this.c,
			_c = c + this._c,
			i = this._i,
			data = [],
			length = 0,
			l = 0
		;
		while(-1 < (i = _storage.indexOf(_c, i))){
			data[l++] = this.unescape(_storage.substring(i += 2, length = _storage.indexOf(c, i)));
			i = _storage.indexOf(c, length) + 2;
			length = _storage.indexOf(c, i);
			i = 1 + length + 1 * _storage.substring(i, length);
		};
		return data;
	};

	/** this.set(key:String, data:String):void
	 * @description	stores data relating it with the specified key.
	 *					pleae note if the key was present, it is removed
	 *					and the new key/value pair appended.
	 * @param	String	key to related with specified data.
	 * @return	String	data to store.
	 */
	LSS.prototype.set = function(key, data){
		this.del(key);
		this._storage[this._key] += escape.call(this, key, data);
	};

	/** this.unescape(data:String):String
	 * @description	unescape a generic string. This should compatible with escape.
	 * @param	String	data to unescape
	 * @return	String	unescaped data that could contain the special char as well.
	 */
	LSS.prototype.unescape = window.unescape;

	/** escape(key:String, data:String):String
	 * @description	private scope callback. A shortcut to retrieve an entry via key and data
	 */
	function escape(key, data){
		var c = this.c;
		return c.concat(this._c, this.escape(key), c, c, (data = this.escape(data)).length, c, data);
	};

	return LSS;

})(window);

/** HTML5 sessionStorage cross-browser implementation
 * @description	sessionStorage object is an HTML5 working draft
 *					which aim is to remove cookie limits.
 *					Using a sort of "de-facto" standard as window.name
 *					behavior is, it is possible to implement the
 *					sessionStorage object in old browsers.
 *					The concept is that window.name persists in the tab,
 *					whatever page we are surfing, while as security measure
 *					I combined browser cookie management plus RC4 stream cipher
 *					in order to reduce security problems as much as possible.
 *
 * @author			Andrea Giammarchi
 * @license		Mit Style License
 * @blog			http://webreflection.blogspot.com/
 * @version		1.4
 * @compatibility	Android, Chrome, Explorer, Opera, unobtrusive for other browsers
 * @credits		W3 WebStorage Draft	http://dev.w3.org/html5/webstorage/
 *					RC4 Stream Cipher		http://www.wisdom.weizmann.ac.il/~itsik/RC4/rc4.html
 * @protocol		Linear String Storage, by the @author
 */
 
// well, there is no other way to understand if onload
// event will be fired before onload event itself
if(Object.prototype.toString.call(window.opera) === "[object Opera]"){

	// Opera does not support the unload event
	// at least we can force it to support the onload one ...
	history.navigationMode="compatible";

	// Opera performs escape/unescape truly slowly
	// lets change LSS proto for this scope if the browser is opera
	LSS.prototype.escape = window.encodeURIComponent;
	LSS.prototype.unescape = window.decodeURIComponent;
};

// sessionStorage is a Singleton instance: http://en.wikipedia.org/wiki/Singleton_pattern
// Below constructor should never be reached outside this closure.
function sessionStorage(){
	// in-scope callback, will hopefully disappear
	// as soon as the sessionStorage will be created
	// 'cause it is kinda useless outside
	// the purpose: set the secret key
	// create the LSS instance mark the window name init point
	function clear(){
		// the cookie with the unique generated key
		document.cookie = [
			"sessionStorage=" + window.encodeURIComponent($key = RC4.key(128))
		].join(';');
		// set the encrypted prefix to use for each soterd key
		domain = RC4.encode($key, domain);
		// the LSS object to use in the entire scope
		LSS = new LSS(top, "name", top.name);
	};
	var // get the window.name resolved string
		name = top.name,
		// shortcut for the document
		document = top.document,
		// regexp to test the domain cookie
		cookie = /\bsessionStorage\b=([^;]+)(;|$)/,
		// check if cookie was setted before during this session
		data = cookie.exec(document.cookie),
		// internal variable
		i
	;
	// if data is not null ...
	if(data){
		// retrieve the $key to use via the RC4.decode method
		$key = window.decodeURIComponent(data[1]);
		// set the encrypted prefix to use for each soterd key
		domain = RC4.encode($key, domain);
		// create the LSS object without a predefined length
		LSS = new LSS(top, "name");
		// loop over each key in order to assign the correct for this instance, if any ...
		for(var key = LSS.key(), i = 0, length = key.length, $cache = {}; i < length; ++i){
			if((data = key[i]).indexOf(domain) === 0){
				// cache is an internal array used to quickly retrieve keys
				cache.push(data);
				$cache[data] = LSS.get(data);
				// the LSS is not efficient as is
				// everything should be removed and later re-appended
				LSS.del(data);
			};
		};
		// the optimized LSS with a start point and available clear operation
		LSS = new LSS.constructor(top, "name", top.name);
		// the length of this session
		if(0 < (this.length = cache.length)){
			// now it is possible to re-append data
			// to make things faster let's use some LSS property
			for(i = 0, length = cache.length, c = LSS.c, data = []; i < length; ++i)
				// this is a fast way to emulate LSS.set method
				data[i] = c.concat(LSS._c, LSS.escape(key = cache[i]), c, c, (key = LSS.escape($cache[key])).length, c, key);
			top.name += data.join("");
		};
	} else {
		// it is the first time user is in this page
		clear();
		// if sessionStorage cookie is not present ...
		if(!cookie.exec(document.cookie))
			// clear the cache, this sessionStorage is not usable!
			cache = null;
	};
};

// sessionStorage Sinngleton prototype
sessionStorage.prototype = {

	// lenght should be a read only property
	// it contains lenght of every key present in this object
	length:0,

	// accordingly with W3, this method
	// accepts an integer less than this.length
	// in order to obtain associated key for that length
	// please note order is browser dependent but there is
	// consistency for the related key as specs say
	/** @example
	 *	if(sessionStorage.length > 0)
	 *		alert(
	 *			sessionStorage.getItem(sessionStorage.key(0));
	 *			// it should alert the most old value set in sessionStorage
	 *		);
	 */
	key:function(index){
		// if index is not an unsigned one less than cache.length ...
		if(typeof index !== "number" || index < 0 || cache.length <= index)
			// throw an error as every compatible browser do
			throw "Invalid argument";
		return cache[index];
	},

	// this method gives back a string, or null,
	// if used key has never been set
	/** @example
	 *	if(sessionStorage.getItem("myStuff") === null)
	 *		sessionStorage.setItem("myStuff", "toldya it's my stuff!");
	 *	alert(sessionStorage.getItem("myStuff"));
	 *	// toldya it's my stuff!
	 */
	getItem:function(key){
		// the used key is internally composed
		// by the encrypted domain prefix plus the user key
		key = domain + key;
		// there is a page session included in the package
		// basically if we retrieve a key once, performanes
		// will be affected only the first time.
		// This means that if we save entire libraries
		// we will not save a lot of time (libaries are evaluated once)
		// but if we use sessionStorage for form data, as example,
		// we can retrieve it back again in a bit
		if(hasOwnProperty.call($cache, key))
			return $cache[key];
		// non cached keys are computated runtime
		var data = LSS.get(key);
		if(data !== null)
			// data is cached for next execution
			data = $cache[key] = RC4.decode($key, data);
		return data;
	},

	// this method save in the sessionStorage
	// a generic key/vaklue pair
	// please remember that specs say both key and value
	// should be strings, otherwise these are converted into strings
	/** @example
	 *	sessionStorage.setItem("myObj", {a:"b"});
	 *	alert(sessionStorage.getItem("myObj"));
	 *	// [object Object] but it will be exactly the string "[object Object]"
	 *	// and NOT the original object
	 */
	setItem:function(key, data){
		// delete the key
		this.removeItem(key);
		// set the correct key
		key = domain + key;
		// append the new key/value pair and speed up getItem for this key
		LSS.set(key, RC4.encode($key, $cache[key] = "" + data));
		// set right length
		this.length = cache.push(key);
	},

	// this method remove from the sessionStorage
	// a generic key/vaklue pair, and only if it is present.
	/** @example
	 *	sessionStorage.setItem("myName", "Andrea Giammarchi");
	 *	sessionStorage.getItem("myName"); // Andrea Giammarchi
	 *	sessionStorage.removeItem("myName");
	 *	sessionStorage.getItem("myName"); // null
	 */
	removeItem:function(key){
		var data = LSS.get(key = domain + key);
		if(data !== null){
			// only if it was present ...
			delete $cache[key];
			LSS.del(key);
			// set right length
			this.length = cache.remove(key);
		};
	},

	// this method clear everything has been stored in this object.
	/** @example
	 *	sessionStorage.setItem("myName", "Andrea Giammarchi");
	 *	sessionStorage.setItem("age", 31);
	 *	sessionStorage.clear();
	 *	sessionStorage.getItem("myName"); // null
	 *	sessionStorage.getItem("age");	  // null
	 */
	clear:function(){
		LSS.clear();
		$cache = {};
		cache.length = 0;
	}
};

// private scope variables
var
	// the prefix to use to enable multiple domains
	domain = top.document.domain,

	// Array with all set keys
	cache = [],

	// object used as cache for already set or retrieved keys
	$cache = {}, hasOwnProperty = $cache.hasOwnProperty,

	// $key used via RC4 encode/decode procedure
	$key
;

// this should be part of ES5 specs in a better
// fully indexOf compatible way, imho
cache.remove = function(data){
	var i = this.indexOf(data);
	if(-1 < i)
		this.splice(i, 1);
	return this.length;
};

// for those browser without it ...
if(!cache.indexOf) cache.indexOf = function(data){
		for(var i = 0, length = this.length; i < length; ++i){
			if(this[i] === data)
				return i;
		};
		return -1;
	};

// if there is a top sessionStorage it does not make sense
// to re-apply the constructor for the same storage (aka: window.name)
if(top.sessionStorage){
	// let's clone the top object
	sessionStorage = function(){};
	sessionStorage.prototype = top.sessionStorage;
};
// in any case it's time to create the sessionStorage for this context
sessionStorage = new sessionStorage;

// create the global reference only if it is usable
if(cache !== null)
	// be sure both top context and this context (could be the same) point to the same object
	window.sessionStorage = sessionStorage;

})(window);
