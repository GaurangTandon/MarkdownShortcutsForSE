window.onload = function (window) {
	var storage = chrome.storage.sync,
		dataKey = "COMMANDS",
		// general pattern is that
		// each element represents the keybinding and the command
		// [modifiers..., keycode, command]
		// default values
		data = [
			["shiftKey", "altKey", 80, "\\pi"],
			["shiftKey", "altKey", 82, "\\mathrm{}"]
		],
		modifiersList = {
			"shiftKey": "Shift",
			"ctrlKey": "Ctrl",
			"altKey": "Alt"
		};

	function deepCopy(array) {
		var nArray = array.slice(0);

		for (var i = 0, len = nArray.length; i < len; i++) {
			if (typeof nArray[i] === "array")
				nArray[i] = deepCopy(nArray[i]);
		}

		return nArray;
	}

	function saveData(callback) {
		var obj = {};
		obj[dataKey] = data;
		storage.set(obj, callback || undefined);
	}

	function createLIForCommand(commandArray) {
		var li = document.createElement("LI"),
			len = commandArray.length,
			html = commandArray[len - 1], keys = "",
			span = document.createElement("span");

		html = String.fromCharCode(commandArray[len - 2]) + " = " + html + "&nbsp;&nbsp;&nbsp;&nbsp;";

		for (var i = 0; i < len - 2; i++)
			keys += modifiersList[commandArray[i]] + "+";

		li.innerHTML = keys + html;

		span.innerHTML = "delete";

		li.appendChild(span);

		return li;
	}

	function displayListOfCommands() {
		var ul = $(".list");
		ul.innerHTML = "";
		for (var i = 0, len = data.length; i < len; i++)
			ul.appendChild(createLIForCommand(data[i]));
	}

	function setDefaultCommands() {
		saveData(onloadFunction);
	}

	function attachKeybindRegister(button) {
		function resetButton() {
			button.innerHTML = ORG_TEXT;
		}

		var ORG_TEXT = "Register keybinding",
			NEW_TEXT = "Press keys",
			input = $("input");

		button.innerHTML = ORG_TEXT;

		button.onclick = function (e) {
			button.innerHTML = NEW_TEXT;

			setTimeout(resetButton, 5000);
		};

		button.onkeydown = function (event) {
			var keyCode = event.keyCode;
			if (!isAlphaNumericKey(keyCode)) return true;

			var modifiers = [];

			for (var modifier in modifiersList)
				if (event[modifier]) modifiers.push(modifier);

			data.push(modifiers.concat([keyCode, input.value]));

			resetButton();
			input.value = "";
			saveData(displayListOfCommands);
		};
	}

	function attachDeleteHandler() {
		var ul = $(".list");

		ul.onclick = function (event) {
			var node = event.target;

			if (node.tagName === "SPAN") {
				var li = node.parentNode,
					index = [].slice.call(li.parentNode.children).indexOf(li);
				console.log(JSON.stringify(data));
				console.log(index);
				data.splice(index, 1);
				console.log(JSON.stringify(data));
				saveData(displayListOfCommands);
			}
		};
	}

	function onloadFunction() {
		storage.get(dataKey, function (map) {
			if (!map[dataKey]) {
				setDefaultCommands();
			} else {
				data = map[dataKey];
				displayListOfCommands();
			}
		});

	}

	// attaching handlers more than once causes problems
	attachDeleteHandler();
	attachKeybindRegister($("button"));
	onloadFunction();
};