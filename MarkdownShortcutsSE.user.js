// ==UserScript==
// @name         Markdown Shortcuts for StackExchange
// @version      0.1
// @description  easily insert common (cuztomizable) LaTeX shortcuts
// @author       Gaurang Tandon
// @match        *://*.askubuntu.com/*
// @match        *://*.mathoverflow.net/*
// @match        *://*.serverfault.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://chat.stackexchange.com/*
// @match        *://chat.stackoverflow.com/*
// @exclude      *://api.stackexchange.com/*
// @exclude      *://blog.stackexchange.com/*
// @exclude      *://blog.stackoverflow.com/*
// @exclude      *://data.stackexchange.com/*
// @exclude      *://elections.stackexchange.com/*
// @exclude      *://openid.stackexchange.com/*
// @exclude      *://stackexchange.com/*
// @grant        none
// @history      0.1 - 9th June 2018 - Hello world!
// ==/UserScript==

(function() {
    'use strict';

    // to understand how these keycodes work, head over to
    // https://github.com/GaurangTandon/MarkdownShortcutsForSE
	var DATA = [
		    ["shiftKey", "altKey", 80, "pi"],
		    ["shiftKey", "altKey", 82, "mathrm{}"],
            ["shiftKey", "altKey", 67, "ce{}"],
            ["shiftKey", "altKey", 80, "pu{}"],
	    ],
        DOLLARIFY_KEYCODE = 90,
        DOUBLE_DOLLARIFY_KEYCODE = 67,
        FRACIFY_KEYCODE = 65,
        ALIGN_KEYCODE = 83,
        BIGO_KEYCODE = 81,
        URL = window.location.href,
        slashedMJDelimiterSites = /(electronics|codereview)\.stackexchange/,
        isSlashedMJDelimiterSite = slashedMJDelimiterSites.test(URL),
        mhchemSites = /(chemistry|biology)\.stackexchange/,
        ismhchemSite = mhchemSites.test(URL),
        singleMJDelimiter = (isSlashedMJDelimiterSite ? "\\" : "") + "$",
        doubleMJDelimiter = "$$";

	function isBracedCommand(command) {
		return command.endsWith("{}");
	}

    function wrap(textarea, start, end){
        // same wrapper code on either side (`$...$`)
        if(!end) end = start;

        /*--- Expected behavior:
            When there is some text selected: (unwrap it if already wrapped)
            "]text["         --> "**]text[**"
            "**]text[**"     --> "]text["
            "]**text**["     --> "**]**text**[**"
            "**]**text**[**" --> "]**text**["
            When there is no text selected:
            "]["             --> "**placeholder text**"
            "**][**"         --> ""
            Note that `]` and `[` denote the selected text here.
        */

        var selS = textarea.selectionStart,
            selE = textarea.selectionEnd,
            value = textarea.value,
            valBefore = value.substring(0, selS),
            valMid = value.substring(selS, selE),
            valAfter = value.substring(selE),
            generatedWrapper,
            // handle trailing spaces
            trimmedSelection = valMid.match(/^(\s*)(\S?(?:.|\n|\r)*\S)(\s*)$/) || ["", "", "", ""];

        // determine if text is currently wrapped
        if(valBefore.endsWith(start) && valAfter.startsWith(end)){
            textarea.value = valBefore.substring(0, valBefore.length - start.length) + valMid + valAfter.substring(end.length);
            textarea.selectionStart = valBefore.length - start.length;
            textarea.selectionEnd = (valBefore + valMid).length - end.length;
            textarea.focus();
        }else{
            valBefore += trimmedSelection[1];
            valAfter = trimmedSelection[3] + valAfter;
            valMid = trimmedSelection[2];

            generatedWrapper = start + valMid + end;

            textarea.value = valBefore + generatedWrapper + valAfter;
            textarea.selectionStart = valBefore.length + start.length;
            textarea.selectionEnd = (valBefore + generatedWrapper).length - end.length;
            textarea.focus();
        }

        StackExchange.MarkdownEditor.refreshAllPreviews();
    }

	function insertLatexCommand(command, isCtrlKeyDown) {
        command = "\\" + command;

		var selS = this.selectionStart, selE = this.selectionEnd,
			value = this.value,
			valBefore = value.substring(0, selS),
			valAfter = value.substring(selE),
			isCommandBraced = isBracedCommand(command),
            commandLen = command.length,
            lastIndex = commandLen - 1,
            begin = command.substring(0, lastIndex),
            end = command.charAt(lastIndex);

        if(isCtrlKeyDown) {
            begin = singleMJDelimiter + begin;
            end += singleMJDelimiter;
        }

        // irrespective of whether there was a text-selection or not
        if(!isCommandBraced){
            this.value = valBefore + command + valAfter;
            this.selectionStart = this.selectionEnd = selS + commandLen;
        }else wrap(this, begin, end);
	}

    function handleTextConversion(node, helper, isCtrlKeyDown){
        var selS = node.selectionStart,
            selE = node.selectionEnd,
            value = node.value,
            valBefore = value.substring(0, selS),
            valMid = value.substring(selS, selE),
            valAfter = value.substring(selE),
            // handle trailing spaces
            trimmedSelection = valMid.match (/^(\s*)(\S?(?:.|\n|\r)*\S)(\s*)$/) || ["", "", "", ""],
            middleInsert;

        valBefore += trimmedSelection[1];
        valAfter = trimmedSelection[3] + valAfter;
        valMid = trimmedSelection[2];
        middleInsert = helper(valMid, isCtrlKeyDown);

        node.value = valBefore + middleInsert + valAfter;
        node.selectionStart = valBefore.length;
        node.selectionEnd = (valBefore + middleInsert).length;
    }

    // refer to http://jsbin.com/kokahupevi/edit?js,console
    // for sample inputs and tests
    function fraciify(text, isCtrlKeyDown){
        var firstBracketPairIndices = getFirstBracketPairIndices(text),
            firstIdx = firstBracketPairIndices[0],
            secondIdx = firstBracketPairIndices[1],
            parentheticalText, slashIdx = text.lastIndexOf("\/"),
            beforeSlash, afterSlash, output;

        if(firstIdx != -1){
            parentheticalText = text.substring(firstIdx + 1, secondIdx);
            text = text.substring(0, firstIdx) + fraciify(parentheticalText) + text.substring(secondIdx + 1);
            output = fraciify(text);
        }else if(slashIdx != -1){
            beforeSlash = text.substring(0, slashIdx);
            afterSlash = text.substring(slashIdx + 1);
            text = "\\frac{" + fraciify(beforeSlash) + "}{" + fraciify(afterSlash) + "}";
            output = text;
        } else output = text;

        if(isCtrlKeyDown) output = "$" + output + "$";

        return output;
    }

    function getFirstBracketPairIndices(text){
        var firstBracketIndex = text.indexOf("("),
            len = text.length, i = firstBracketIndex + 1, c = 1, ch;

        if(firstBracketIndex == -1) return [-1, -1];

        for(; i < len; i++){
            ch = text.charAt(i);
            if(ch == ")"){
                c--; if(c === 0) return [firstBracketIndex, i];
            }else if(ch == "(") c++;
        }

        // malformed parentheses
        return [-1, -1];
    }

    /*
    Test case:
    $$A+B=C+D$$
    $$K=C+D+E$$
    $$\ce{K<=>C + D + E}$$
    $$\ce{K<<=>C + D + E}$$
    $$\ce{K->C + D + E}$$
    converts to
    $$\begin{align}
    A+B&=C+D\\
    K&=C+D+E\\
    \ce{K&<=>C + D + E}\\
    \ce{K&<<=>C + D + E}\\
    \ce{K&->C + D + E}
    \end{align}$$
    on any mhchem site
    */
    function alignLines(text){
        text = text.replace(/^[\s\n]+/, "").replace(/[\s\n]+$/, "");

        var lines = text.split("\n"),
            i = 0, len = lines.length,
            line, output = "";

        for(; i < len; i++){
            line = lines[i];
            // removing trailing spaces/$$ first
            line = line.replace(/^[\s\$]+/, "").replace(/[\s\$]+$/, "");
            if(ismhchemSite) line = insertReactionArrowsAlignment(line);
            else line = line.replace(/=/g, "&=");

            line += "\\\\\n";
            output += line;
        }

        // remove last two backslashes
        output = output.substring(0, output.length - 3) + "\n";

        output = "$$\\begin{align}\n" + output + "\\end{align}$$";
        return output;
    }

    // reaction arrows as seen on https://mhchem.github.io/MathJax-mhchem/
    function insertReactionArrowsAlignment(line){
        line = line
            // replace reaction arrows first
            .replace(/(->|<-|<->|<-->|<=>|<=>>|<<=>)/, "&$1")
            // there can still be math equations on this site
            .replace(/(<?)=/, function(wholeMatch, $1){
            return $1 ? wholeMatch : "&=";
        });

        return line;
    }

    function handleKeyDown(event) {
        var node = event.target, keyCode = event.keyCode,
            command, commandLength, allModifiersPressed,
            matchedCommand = null,
            isCtrlKeyDown = event.ctrlKey,
            beginText = "\\mathcal{O}(", endText = ")";

        if (node.tagName !== "TEXTAREA") return true;

        if(event.altKey && !event.shiftKey){
            switch(keyCode){
                case DOLLARIFY_KEYCODE:
                    wrap(node, singleMJDelimiter);
                    break;
                case DOUBLE_DOLLARIFY_KEYCODE:
                    wrap(node, doubleMJDelimiter);
                    break;
                case FRACIFY_KEYCODE:
                    handleTextConversion(node, fraciify, isCtrlKeyDown);
                    break;
                case ALIGN_KEYCODE:
                    handleTextConversion(node, alignLines);
                    break;
                case BIGO_KEYCODE:
                    if(isCtrlKeyDown) {
                        beginText = singleMJDelimiter + beginText;
                        endText += singleMJDelimiter;
                    }
                    wrap(node, beginText, endText);
                    break;
            }
        }

        for (var i = 0, len = DATA.length; i < len; i++) {
            command = DATA[i]; commandLength = command.length;

            allModifiersPressed = true;

            if (command[commandLength - 2] === keyCode) {
                for (var j = 0; j < commandLength - 2; j++) {
                    if (!event[command[j]])	allModifiersPressed = false;
                }

                if (allModifiersPressed) {
                    matchedCommand = command[commandLength - 1];
                    break;
                }
            }
        }

        if (matchedCommand)	insertLatexCommand.call(node, matchedCommand, event.ctrlKey);
    }

	document.body.addEventListener("keydown", handleKeyDown);
})();
