// ==UserScript==
// @name         Markdown Shortcuts for StackExchange
// @version      1.4.0
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

// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // to understand how these keycodes work, head over to
    // https://github.com/GaurangTandon/MarkdownShortcutsForSE
    var URL = window.location.href,
        slashedMJDelimiterSites = /(electronics|codereview)\.stackexchange/,
        isSlashedMJDelimiterSite = slashedMJDelimiterSites.test(URL),
        singleMJDelimiter = (isSlashedMJDelimiterSite ? "\\" : "") + "$",
        doubleMJDelimiter = "$$",
        singleDollarInsert = singleMJDelimiter + "|" + singleMJDelimiter,
        doubleDollarInsert = doubleMJDelimiter + "|" + doubleMJDelimiter,
        SHORTCUTS = [            
	        ["altKey", "I", "\\pi"],
		    ["altKey", "R", "\\mathrm{}"],
            ["altKey", "E", "\\ce{}"],
            ["altKey", "W", "\\pu{}"],
            ["altKey", "T", "\\text{}"],
            ["altKey", "Z", singleDollarInsert],
            ["altKey", "C", doubleDollarInsert]
	    ],
        SPECIAL_SHORTCUTS = {
            // keycode: function to execute on the selected text (see
            // (it is the "helper" in function handleTextConversion)
            "S": fraciify,
            "A": alignLines
        },
        mhchemSites = /(chemistry|biology)\.stackexchange/,
        ismhchemSite = mhchemSites.test(URL);

    function convertCESubSuperScripts(valMid){
        return valMid.replace(/<sub>(\d+)<\/sub>/g, function($0, $1){
            return $1;
        }).replace(/<sub>([^\<]+)<\/sub>/g, function($0, $1){
            return $1.length > 1 ? "_{" + $1 + "}" : "_" + $1;
        }).replace(/<sup>([\+\-]?)(\d+)([\+\-]?)<\/sup>/g, function($0, $1, $2, $3){
            return "^" + $2 + ($1 || $3);
        }).replace(/<sup>([^\<]+)<\/sup>/g, function($0, $1){
            return $1.length > 1 ? "^{" + $1 + "}" : "^" + $1;
        }).replace(/([a-z])_\{?(\d+)\}?/gi, function($0, $1, $2){
            return $1 + $2;
        })
        .replace(/(\\(long)?leftarrow|\&\#8592;|\&larr;|←)/g, "<-")
        .replace(/(\\(long)?rightarrow|\&\#8594;|\&rarr;|→)/g, "->")
        .replace(/(\\(long)?leftrightarrow|\&\#8596;|\&harr;|↔)/g, "<->")
        .replace(/(\\(leftrightharpoons|rightleftharpoons)|\&\#8660;|\&hArr;|⇔)/g, "<=>");
    }

    function convertPUSubSuperScripts(valMid){
        return valMid.replace(/<sub>(\d+)<\/sub>/g, function($0, $1){
            return $1;
        }).replace(/<sub>([^\<]+)<\/sub>/g, function($0, $1){
            return "_{" + $1 + "}";
        }).replace(/<sup>([\+\-]?)(\d+)([\+\-]?)<\/sup>/g, function($0, $1, $2, $3){
            return "^" + ($1 || $3) + $2;
        }).replace(/<sup>([^\<]+)<\/sup>/g, function($0, $1){
            return "^{" + $1 + "}";
        }).replace(/([a-z])_\{?(\d+)\}?/gi, function($0, $1, $2){
            return $1 + $2;
        });
    }

    function wrap(textarea, start, end, isLatexCommand){
        // same wrapper code on either side (`$...$`)
        if(typeof end === "undefined") end = start;

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
            startLen = start.length,
            endLen = end.length,
            generatedWrapper,
            // handle trailing spaces
            trimmedSelection = valMid.match(/^(\s*)(\S?(?:.|\n|\r)*\S)(\s*)$/) || ["", "", "", ""],
            command = start + end;

        // special wrapping check (see #5)
        // when double dollarify occurs for `...$A$...` it unwraps the dollar pair and
        // then inserts double-dollar-pairs of its own
        var endsWithSingleButNotDoubleDollarFlag = false;
        valBefore.replace(/(.)?\$$/, function(wholeMatch, $1){
            endsWithSingleButNotDoubleDollarFlag = $1 ? $1 !== "$" : true;
        });

        if(start === "$$" && end === "$$" && endsWithSingleButNotDoubleDollarFlag && /^\$([^\$])?/.test(valAfter)){
            valBefore = valBefore.substring(0, valBefore.length - 1);
            valAfter = valAfter.substring(1);
        }

        // determine if text is currently wrapped
        if(valBefore.endsWith(start) && valAfter.startsWith(end)){
            textarea.value = valBefore.substring(0, valBefore.length - startLen) + valMid + valAfter.substring(endLen);
            textarea.selectionStart = valBefore.length - startLen;
            textarea.selectionEnd = (valBefore + valMid).length - startLen;
            textarea.focus();
        }else{
            valBefore += trimmedSelection[1];
            valAfter = trimmedSelection[3] + valAfter;
            valMid = trimmedSelection[2];

            if(command.indexOf("\\ce{}") > -1){
                valMid = convertCESubSuperScripts(valMid);
            }else if(command.indexOf("\\pu{}") > -1){
                valMid = convertPUSubSuperScripts(valMid);
            }

            if(isLatexCommand && /^\{.+\}$/.test(valMid)){
                valMid = valMid.substring(1, valMid.length - 1);
            }

            generatedWrapper = start + valMid + end;

            textarea.value = valBefore + generatedWrapper + valAfter;
            textarea.selectionStart = valBefore.length + start.length;
            textarea.selectionEnd = (valBefore + generatedWrapper).length - end.length;
            textarea.focus();
        }

        StackExchange.MarkdownEditor.refreshAllPreviews();
    }

    // returns [begin, end]
    function splitLatexCommand(command){
        var pipe = command.indexOf("|"), idx;

        if(pipe != -1) return command.split("|");
        else {
            idx = command.lastIndexOf("{}");
            if(idx == -1) idx = command.lastIndexOf("()");

            if(idx == -1) return [command, ""];
            return [command.substring(0, idx + 1), command.substring(idx + 1)];
        }
    }

	function insertLatexCommand(node, command, isCtrlKeyDown) {
		var splittedCommand = splitLatexCommand(command),
            begin = splittedCommand[0],
            end = splittedCommand[1];

        if(isCtrlKeyDown) {
            begin = singleMJDelimiter + begin;
            end += singleMJDelimiter;
        }

        wrap(node, begin, end, true);
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
    
    function removeTralingLeadingSpacesAndDollarSigns(string){
        return string.replace(/^[\s\n\$]+/, "").replace(/[\s\n\$]+$/, "");
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
        text = removeTralingLeadingSpacesAndDollarSigns(text);

        var lines = text.split("\n"),
            i = 0, len = lines.length,
            line, output = "";

        for(; i < len; i++){
            line = lines[i];                       
            line = removeTralingLeadingSpacesAndDollarSigns(line);
            
            if(ismhchemSite) line = insertReactionArrowsAlignment(line);
            else line = line.replace(/(=|<=|>=|>|<|\\geq|\\leq)/g, "&$1");

            line += "\\\\\n";
            output += line;
        }

        // remove last two backslashes
        output = output.substring(0, output.length - 3) + "\n";

        output = "\\begin{align}\n" + output + "\\end{align}";
        return output;
    }

    // reaction arrows as seen on https://mhchem.github.io/MathJax-mhchem/
    function insertReactionArrowsAlignment(line){
        line = line
            // replace reaction arrows first
            .replace(/(->|<-|<->|<-->|<=>|<=>>|<<=>)/, "&$1")
            // there can still be math equations on this site
            .replace(/([\<])?=/, function(wholeMatch, $1){
                return $1 ? wholeMatch : "&=";
            });

        return line;
    }

    function getKeybindingsList(){
        function getKeys(shortcut){
            var keys = "";

            for(var len = shortcut.length, i = len - 2; i >= 0; i--){
                keys = shortcut[i].replace(/Key$/, "") + " + " + keys;
            }

            // remove last + sign
            return keys.substring(0, keys.length - 3);
        }

        var list = "<ul>", shortcut, specials;

        for(var i = 0, len = SHORTCUTS.length; i < len; i++){
            shortcut = SHORTCUTS[i];
            list += "<li>" + getKeys(shortcut) +
                " = <pre>" + shortcut[shortcut.length - 1] + "</pre></li>";
        }

        list += `</ul>Prepend Ctrl to any one of the above to surround them with an extra $ pair<br><br>
        <b>The following are special shortcuts:</b><ul>`;

        i = 0; specials = Object.keys(SPECIAL_SHORTCUTS); len = specials.length;
        for(; i < len; i++){
            shortcut = specials[i];
            list += "<li>alt + " + shortcut + " = " + SPECIAL_SHORTCUTS[shortcut].name + "</li>" ;
        }

        list += "</ul>";

        return list;
    }

    var handleKeyUp;
    (function(){
        var questionKeyCode = 191, keyCode, containerDIV,
            helpBoxVisibleClass = "shown";

        function setupKeyBindingList(){
            containerDIV = document.createElement("div");
            containerDIV.id = "msse-list-popup";
            containerDIV.classList.add("msse-overlay");
            containerDIV.innerHTML = `<h2>MSSE: These are your keyboard shortcuts:</h2>` + getKeybindingsList();

            document.body.appendChild(containerDIV);
        }

        setupKeyBindingList();

        handleKeyUp = function(event){
            keyCode = event.keyCode;

            if(event.altKey && event.shiftKey && keyCode === questionKeyCode){
                if(containerDIV.classList.contains(helpBoxVisibleClass)){
                    containerDIV.classList.remove(helpBoxVisibleClass);
                } else {
                    containerDIV.classList.add(helpBoxVisibleClass);
                    // -200px is half the width of the container
                    containerDIV.style.left = "calc(" + (window.innerWidth / 2) + "px - 250px)";
                    containerDIV.style.top = "calc(" + window.scrollY + "px + 20%)";
                }
            }
        };
    })();

    function handleKeyDown(event) {
        var node = event.target, keyCode = event.keyCode,
            charPressed = String.fromCharCode(keyCode).toUpperCase(),
            command, commandLength, allModifiersPressed,
            matchedFunction = null, matchedCommand = null,
            isCtrlKeyDown = event.ctrlKey || event.metaKey;

        if(node.tagName !== "TEXTAREA") return true;

        if(event.altKey && !event.shiftKey){
            matchedFunction = SPECIAL_SHORTCUTS[charPressed];
            if(matchedFunction) {
                event.preventDefault();
                handleTextConversion(node, matchedFunction, isCtrlKeyDown);
                return;
            }
        }

        for (var i = 0, len = SHORTCUTS.length; i < len; i++) {
            command = SHORTCUTS[i]; commandLength = command.length;

            allModifiersPressed = true;

            if (command[commandLength - 2] === charPressed) {
                for (var j = 0; j < commandLength - 2; j++) {
                    if (!event[command[j]])	allModifiersPressed = false;
                }

                if (allModifiersPressed) {
                    matchedCommand = command[commandLength - 1];
                    break;
                }
            }
        }

        if (matchedCommand)	{
            event.preventDefault();
            insertLatexCommand(node, matchedCommand, isCtrlKeyDown);
        }
    }

	document.body.addEventListener("keydown", handleKeyDown);
    document.body.addEventListener("keyup", handleKeyUp);

    GM_addStyle(`
.msse-overlay{
    z-index: 3000;
    display: none;

    position: absolute;
    left: 20%;

    width: 500px;
    max-width: 80%;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(36,39,41,0.3);
    background-color: #FFF;
    border: solid 1px #9fa6ad;
}

.msse-overlay.shown{
     display: block;
}

.msse-overlay h2{
    font-weight: bold; font-size: 18px;
}

.msse-overlay pre{
     display: inline;
}

.msse-overlay ul:first-of-type li{
    margin-bottom: 15px;
}

.msse-overlay ul:nth-of-type(2) {
    margin-top: 10px;
}
`);
})();
