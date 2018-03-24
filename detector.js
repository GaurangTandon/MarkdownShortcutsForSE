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

	function replaceBronsted(value) {
		return value.replace(/Bronsted/g, "Brønsted").replace(/bronsted/g, "brønsted");
	}

	function insertBronstedButton() {
		var btn = document.createElement("input");
		btn.type = "button";
		btn.value = "Replace Bronsted";
		btn.className = "replace-bronsted";
		document.body.appendChild(btn);

		btn.onclick = function () {
			var textareas = document.querySelectorAll("textarea, #title");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = replaceBronsted(textarea.value);
			}
			var editSummary = document.querySelectorAll("input[name='edit-comment']");
			for (var i = 0, l = editSummary.length; i < l; i++) {
				editSummary[i].value = "Bronsted correction";
			}
		};
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
		document.body.appendChild(btn);
		var name = document.querySelector(".owner .user-details a").innerHTML,
			snip = "Hi " + name + ", welcome to Chem.SE! We require you to show your efforts on this problem. What formulae/steps did you try? Where did you get stuck? Please add this to your question. Thanks!";

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
		document.body.appendChild(btn);
		var name = document.querySelector(".owner .user-details a").innerHTML,
			snip = "Hi " + name + ", welcome to Chem.SE! Take the [tour](https://chemistry.stackexchange.com/tour) to get familiar with our site. Regular text can be formatted with [Markdown](https://chemistry.stackexchange.com/help/formatting), and mathematical expressions and chemical equations can be formatted using [Latex](http://meta.chemistry.stackexchange.com/questions/86/how-can-i-format-math-chemistry-expressions-here) syntax. If you receive useful answers, consider [accepting](http://chemistry.stackexchange.com/help/someone-answers) one! Thanks!";

		btn.onclick = function () {
			var textareas = document.querySelectorAll(".js-comment-text-input");
			for (var i = 0, len = textareas.length; i < len; i++) {
				textarea = textareas[i];
				textarea.value = snip;
			}
		};
	}

	function attachHandlers() {
		$("body").onkeydown = handleKeyDown;
		insertButtonApos();
		insertBronstedButton();
		insertTimelineButton();
		insertHomeworkButton();
		insertWelcomeButton();
	}

	window.onload = function () {
		storage.get(dataKey, function (obj) {
			data = obj[dataKey];
			attachHandlers();
		});
	};
})();