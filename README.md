# Markdown Shortcuts for StackExchange

This  userscript gives users some quick key bindings to speed up the process of editing mathjax/chem/etc. into posts.

**Example usage**: (the hotkeys are customizable!)

1. Pressing Alt+Shift+P would insert `\pi` directly.
2. Pressing Alt+R would insert `\mathrm{}` with the caret auto-placed in the middle. Pressing Alt-R again would _unwrap_ the `\mathrm{}` back.
3. Pressing Alt+R with some `text` pre-selected would insert `\mathrm{text}`, retaining the selection on the text. Pressing Alt-R again would _unwrap_ the `\mathrm{text}` back to `text`, retaining the selection on text.
4. Prepending Ctrl to any of the above keybindings will auto-surround the insertion text with `$$` (or `\$` on some other SE sites)
5. The keybinding and its associated insertion text can be modified by the user. So, you can set it to insert `\pi` on Alt+A instead.

Moreover, there are certain reserved keycodes like: 

- Alt-Z => dollar-ifying (`text` => `$text$`)
- Alt-C => double dollar-ifying (`text` => `$$text$$`)
- Alt-A => frac-ify (`A/B` => `\frac{A}{B}`)
- Alt-S => align-ify ([image demo](https://i.stack.imgur.com/RmWFQ.png))

You can still change their keycode or entirely disable them as well, the given Z/C/A/etc. keycombos are just the default values.

----

### **How to customize hotkeys?**

Each hotkey is composed of three parts:

- modifier: either an "altKey" or a "shiftKey+altKey" combo
- key: the key to press, please keep it uppercase.
- LaTeX command: to be inserted on pressing modifier+key. These are of two types:
  - braced: like `\mathrm{}`
  - non-braced: like `\pi`.
  
To **customize hotkeys**, head over to line 38 where `SHORTCUTS = ` is initialized. By default, it is set as (note it is important to escape the `\`, so we write `\\`): 

    SHORTCUTS = [
        ["altKey", "I", "\\pi"],
		["altKey", "R", "\\mathrm{}"],
    ]
    
So, if you want to insert `\Huge{}` on Alt-H, just add a single line:

    SHORTCUTS = [
        ["altKey", "I", "\\pi"],
		["altKey", "R", "\\mathrm{}"],
        ["altKey", "H", "\\Huge{}"]
    ]

To **customize reserved hotkeys** (for frac-ify, align lines, etc.), head over to the declaration for `SPECIAL_SHORTCUTS`. To disable any of them, delete the corresponding row.

To **position the caret at a specific position**, use the pipe (`|`) character. Usual wrapping rules apply. In the absence of the pipe character, the caret is inserted inside the last `{}`/`()`pair, or at the end of the string.

**Note**: some Alt+key combos might be system-reserved (check [this list](https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts)), so you may need to prepend Shift to avoid overriding system-reserved behavior.
