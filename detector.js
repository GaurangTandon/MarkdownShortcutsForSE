(function () {
	var dataKey = "COMMANDS",
		data,
		storage = chrome.storage.sync;

	// `\mathrm` is a braced command
	function isBracedCommand(command) {
		return command.endsWith("{}");
	}

	function manipulateText(command, isCtrlKeyDown) {
		var selS = this.selectionStart, selE = this.selectionEnd,
			value = this.value,
			valBefore = value.substring(0, selS),
			valMiddle = value.substring(selS, selE),
			valAfter = value.substring(selE),
			isCommandBraced = isBracedCommand(command),
			extraCaretPos, insertionString;

		if (selS != selE && isCommandBraced) {
			insertionString = command.substring(0, command.length - 1) + valMiddle + "}";
			if (isCtrlKeyDown) insertionString = "$" + insertionString + "$";

			this.value = valBefore + insertionString + valAfter;
			this.selectionStart = selS + command.length;
			this.selectionEnd = (valBefore + insertionString).length - 2;
		} else {
			insertionString = command;
			extraCaretPos = insertionString.length - (isCommandBraced ? 1 : 0);

			if (isCtrlKeyDown) {
				insertionString = "$" + insertionString + "$";
				extraCaretPos += 1;
			}

			this.value = valBefore + insertionString + valAfter;
			this.selectionStart = this.selectionEnd = selS + extraCaretPos;
		}
	}

	var handleKeyDown;
	(function () {
		handleKeyDown = function (event) {
			var node = event.target;
			if (node.tagName !== "TEXTAREA") return true;

			var keyCode = event.keyCode,
				command, commandLength, allModifiersPressed,
				matchedCommand = null;

			console.log(keyCode);

			if (!isAlphaNumericKey(keyCode)) return true; // shift key		

			// check each command
			for (var i = 0, len = data.length; i < len; i++) {
				command = data[i]; commandLength = command.length;

				allModifiersPressed = true;

				console.log(command);

				if (command[commandLength - 2] === keyCode) {
					for (var j = 0; j < commandLength - 2; j++) {
						if (!event[command[j]])
							allModifiersPressed = false;
					}

					if (allModifiersPressed) {
						matchedCommand = command[commandLength - 1];
						break;
					}
				}
			}

			if (matchedCommand)
				manipulateText.call(node, matchedCommand, event.ctrlKey);
		};
	})();

	function replaceApos(value) {
		return value.replace(/[‘’]/g, "'").replace(/[“”]/g, "\"");
	}

	function insertButtonApos() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "Replace apostrophe";
		btn.className = "replace-apos";
		document.body.appendChild(btn);

		btn.onclick = function () {
			var textareas = document.querySelectorAll("textarea");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = replaceApos(textarea.value);
			}
		};
	}

	function fixAccents(value) {
		// I intentionally skipped the first character in each case
		// as it needs unnecessary trouble detecting upper case first letter or
		// lower case	
		var map = {
			"ronsted": "rønsted",
			"uckel": "ückel",
			"hrodinger": "hrödinger",
			"illstatter": "illstätter",
			"(ant Hoff|ant hoff|an't Hoff|an't hoff)": "an 't Hoff",
			"(der waals|der Waals'|der Waal's|der waals'|der waal's)": "der Waals"
		};

		for (var key in map)
			value = value.replace(new RegExp(key, "g"), map[key]);

		return value;
	}

	function fixMathjax(value) {
		var map = {
			"(ka|Ka)": "K_\mathrm{a}",
			"(pka|pKa)": "\mathrm{p}K_\mathrm{a}",
			"(ph|pH|PH|Ph)": "\mathrm{pH}",
		};

		for (var key in map)
			value = value.replace(new RegExp(key, "g"), map[key]);

		return value;
	}

	function createLinkToTimeline(id) {
		var a = document.createElement("a");
		a.href = "/posts/" + id + "/timeline";
		a.innerHTML = "timeline";
		return a;
	}

	function insertTimelineButton() {
		var divs = document.querySelectorAll(".post-menu");
		for (var i = 0; i < divs.length; i++) {
			var div = divs[i],
				allC = div.children,
				last = allC[allC.length - 1],
				id = last.dataset.postid;
			div.appendChild(createLinkToTimeline(id));
		}
	}

	function insertHomeworkButton() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "homework";
		btn.className = "homework";

		try {
			var name = document.querySelector(".owner .user-details a").innerHTML,
				snip = "Hi " + name + ", welcome to Chem.SE! We require you to show your efforts on this problem. What formulae/steps did you try? Where did you get stuck? Please add this to your question. Thanks!";
			document.body.appendChild(btn);
		} catch (e) {
			// we were on a non-question page, no need to insert the button in this case
			return;
		}

		btn.onclick = function () {
			var textareas = document.querySelectorAll(".js-comment-text-input");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = snip;
			}
		};
	}

	function insertWelcomeButton() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "welcome";
		btn.className = "welcome";

		try {
			var name = document.querySelector(".owner .user-details a").innerHTML,
				snip = "Hi " + name + ", welcome to Chem.SE! Take the [tour](https://chemistry.stackexchange.com/tour) to get familiar with our site. Regular text can be formatted with [Markdown](https://chemistry.stackexchange.com/help/formatting), and mathematical expressions and chemical equations can be formatted using [Latex](http://meta.chemistry.stackexchange.com/questions/86/how-can-i-format-math-chemistry-expressions-here) syntax. If you receive useful answers, consider [accepting](http://chemistry.stackexchange.com/help/someone-answers) one! Thanks!";
			document.body.appendChild(btn);
		} catch (e) {
			// we were on a non-question page, no need to insert the button in this case
			return;
		}

		btn.onclick = function () {
			var textareas = document.querySelectorAll(".js-comment-text-input");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = snip;
			}
		};
	}

	function insertAccentButton() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "fix accents";
		btn.className = "accent";
		document.body.appendChild(btn);

		btn.onclick = function () {
			var textareas = document.querySelectorAll("textarea, #title");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = fixAccents(textarea.value);
			}
			var editSummary = document.querySelectorAll("input[name='edit-comment']");
			for (var i = 0, l = editSummary.length; i < l; i++) {
				editSummary[i].value += "fixed accented characters; ";
			}
		};
	}

	// fixes very common mathjax typos
	function insertMathjaxButton() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "fix common mathjax errors";
		btn.className = "mathjax";
		document.body.appendChild(btn);

		btn.onclick = function () {
			var textareas = document.querySelectorAll("textarea, #title");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = fixMathjax(textarea.value);
			}
			var editSummary = document.querySelectorAll("input[name='edit-comment']");
			for (var i = 0, l = editSummary.length; i < l; i++) {
				editSummary[i].value += "fixed mathjax errors, see meta.chem.se/posts/444, mhchem.github.io/MathJax-mhchem/; ";
			}
		};
	}

	function attachHandlers() {
		$("body").onkeydown = handleKeyDown;
		insertButtonApos();
		insertTimelineButton();
		insertHomeworkButton();
		insertWelcomeButton();
		insertAccentButton();
		insertMathjaxButton();
	}

	window.onload = function () {
		storage.get(dataKey, function (obj) {
			data = obj[dataKey];
			attachHandlers();
		});
	};
})();