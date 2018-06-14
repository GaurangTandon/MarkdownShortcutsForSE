# Markdown Shortcuts for StackExchange
*insert latex commands more quickly by keybindings*

This simple userscript aims to give users some quick key bindings to speed up the process of editing mathjax/chem/etc. into posts.

**Example usage**: (the hotkeys are customizable!)

1. Pressing Alt+Shift+P would insert `\pi` directly.
2. Pressing Alt+R would insert `\mathrm{}` with the caret auto-placed in the middle. Pressing Alt-R again would _unwrap_ the `\mathrm{}` back.
3. Pressing Alt+R with some `text` pre-selected would insert `\mathrm{text}`, retaining the selection on the text. Pressing Alt-R again would _unwrap_ the `\mathrm{text}` back to `text`, retaining the selection on text.
4. Prepending Ctrl to any of the above keybindings will auto-surround the insertion text with `$$` (or `\$` on some other SE sites)

The keybinding and its associated insertion text can be modified by the user. So, you can set it to insert `\pi` on Alt+A instead.

Moreover, Alt-Z is reserved for dollar-ifying (`text` => `$text$`) and Alt-C is reserved for double dollar-ifying (`text` => `$$text$$`)

----

### **How to customize hotkeys?**

(Note that Alt-Z and Alt-C are reserved)

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
      ["altKey", 72, "pu{}"]
		]
    
(The keycode for H is 72 (as seen on keycode.info))
