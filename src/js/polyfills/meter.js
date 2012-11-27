// Based on code from https://gist.github.com/667320

// hack for backwards compatibility
document.createElement('meter');
// create polyfill
function makeMeter(meterElement) {
	var indicator,
		width;

	// parse values and attributes
	function attr(attributeName, defaultValue) {
		return meterElement.getAttribute(attributeName) !== null ?
							meterElement.getAttribute(attributeName) :
							(defaultValue ? defaultValue : null);
	}
	function addClass(classStr) {
		var classes = meterElement.className.split(' '),
			classStrVal;
		if (classes.length === 0) {
			meterElement.className = classStr;
			return;
		}
		for (classStrVal in classes) {
			if (classStr === classStrVal) { return; }
		}
		classes.push(classStr);
		meterElement.className = classes.join(' ');
	}
	function removeClass(classStr) {
		var classes = meterElement.className.split(' '),
			i = classes.length;

		while (i--) {
			if (classes[i] === classStr) {
				classes.splice(i, 1);
				break;
			}
		}
		meterElement.className = classes.join(' ');
	}

	function getFormParent() {
		var element = meterElement;
		while (element.parent && element.parent.tagName.toLowerCase() !== 'form') {
			element = element.parent;
		}
		if (element.tagName.toLowerCase() === 'form') {
			return element;
		}
		return null;
	}

	function getFormLabels() {
		var id = meterElement.id,
			elementsLabels = [],
			labels,
			l;

		if (id === null || this.form === null) {
			return null;
		}
		// otherwise loop through the form's child label elements 
		// looking for the element that has a for="{this.id}"
		labels = this.form.getElementsByTagName('label');
		for (l in labels) {
			if (l['for'] === id) {
				elementsLabels.push(l);
			}
		}
		if (elementsLabels.length > 0) {
			return elementsLabels;
		}
		return null;
	}

	//this.min = parseFloat(attr('min', 0)); // default as per HTML5 spec
	this.min = parseFloat((attr('min') !== null ? attr('min') : 0)); // default as per HTML5 spec
	//this.max = parseFloat(attr('max', 1)); // default as per HTML5 spec
	this.max = parseFloat((attr('max') !== null ? attr('max') : 0)); // default as per HTML5 spec
	this.high = parseFloat(attr('high'));
	this.low = parseFloat(attr('low'));
	this.optimum = parseFloat(attr('optimum'));
	// TODO: make this look for 'innerText' if the attribute doesn't exist
	this.value = attr('value') !== null ? parseFloat(attr('value')) : (meterElement.textContent ? meterElement.textContent : meterElement.innerText);

	if (meterElement.textContent) {
		meterElement.textContent = '';
	} else if (meterElement.innerText) {
		meterElement.innerText = '';
	}
	//this.onchange = function() { alert(1); };

	this.title = attr('title') !== null ? attr('title') : this.value;
	this.form = getFormParent();
	this.labels = getFormLabels();

	/*
	The following inequalities must hold, as applicable:
	minimum = value = maximum
	minimum = low = maximum (if low is specified)
	minimum = high = maximum (if high is specified)
	minimum = optimum = maximum (if optimum is specified)
	low = high (if both low and high are specified)
	*/

	if (this.value < this.min) {
		this.value = this.min;
	}

	if (this.value > this.max) {
		this.value = this.max;
	}

	if (this.low !== null && this.low < this.min) {
		this.low = this.min;
	}

	if (this.high !== null && this.high > this.max) {
		this.high = this.max;
	}

	if (meterElement.children.length === 0) {
		indicator = document.createElement("div");
	} else {
		indicator = meterElement.children[0];
	}

	width = meterElement.offsetWidth;
	//width *= this.value / this.max;
	width *= (this.value - this.min) / (this.max - this.min);

	indicator.style.width = Math.ceil(width) + 'px';

	if (this.high && this.value >= this.high) {
		addClass("meterValueTooHigh");
	} else if (this.low && this.value <= this.low) {
		addClass("meterValueTooLow");
	} else {
		removeClass("meterValueTooHigh");
		removeClass("meterValueTooLow");
	}

	if (this.value >= this.max) {
		addClass('meterIsMaxed');
	} else {
		removeClass('meterIsMaxed');
	}

	meterElement.title = this.title;


	if (meterElement.children.length === 0) {
		meterElement.appendChild(indicator);
	}

}
//window.onload = function() {
var meters = document.getElementsByTagName('meter'),
	i = meters.length;

while (i--) {
	makeMeter(meters[i]);
}
//}