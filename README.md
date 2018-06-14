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
- Diracify (TODO)

You can still change their keycode or entirely disable them as well, the given Z/C/A/etc. keycombos are just the default values.

----

### **How to customize hotkeys?**

Each hotkey is composed of three parts:

- modifier: either an "altKey" or a "shiftKey+altKey" combo
- keycode: the key to be pressed alongwith the modifier. You can get the numerical keycode from keycode.info
- LaTeX command: to be inserted on pressing modifier+key. These are of two types:
  - braced: like `\mathrm{}`
  - non-braced: like `\pi`.
  
To **customize hotkeys**, head over to line 44 where `var data = ` is initialized. By default, it is set as:

    var data = [
        ["shiftKey", "altKey", 80, "pi"],
        ["shiftKey", "altKey", 82, "mathrm{}"]
    ]
    
So, if you want to insert `Huge{}` on Alt-H, just add this line:

    var data = [
        ["shiftKey", "altKey", 80, "pi"],
        ["shiftKey", "altKey", 82, "mathrm{}"],
        ["altKey", 72, "Huge{}"]
    ]
    
(The keycode for H is 72 (as seen on keycode.info))

To **customize reserved hotkeys**, just change the keycode entry for the corresponding variables just below `DATA`: `DOLLARIFY_KEYCODE`, `DOUBLE_DOLLARIFY_KEYCODE`, `FRACIFY_KEYCODE`. To disable any of them, set its value `= -1`.

**Note**: some Alt+key combos might be system-reserved (check [this list](https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts)), so you may need to prepend Shift to get them to work.
