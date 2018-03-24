(function () {
	window.$ = function (selector) {
		var elms = document.querySelectorAll(selector), elm;

		// cannot always return a NodeList/Array
		// as properties like firstChild, lastChild will only be able
		// to be accessed by elms[0].lastChild which is too cumbersome
		if (elms.length === 1) {
			elm = elms[0];
			// so that I can access the length of the returned
			// value else length if undefined
			elm.length = 1;
			return elm;
		}
		else return elms;
	};

	window.isAlphaNumericKey = function (keyCode) {
		return (keyCode <= 90 && keyCode >= 65) ||
			(keyCode === 32) ||
			(keyCode <= 122 && keyCode >= 97) ||
			(keyCode >= 48 && keyCode >= 57);
	};

	Node.prototype.hasClass = function (className) {
		return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
	};
})();