# Markdown Shortcuts for StackExchange

This userscript gives users several quick key bindings to speed up the editing of mathjax/chem/etc. into StackExchange posts.

## Example hotkeys

The hotkeys are customizable!

1. Pressing <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> would insert `\pi` directly.
2. Pressing <kbd>Alt</kbd>+<kbd>R</kbd> would insert `\mathrm{}` with the caret auto-placed in the middle. Pressing <kbd>Alt</kbd>-<kbd>R</kbd> again would _unwrap_ the `\mathrm{}` back.
3. Pressing <kbd>Alt</kbd>+<kbd>R</kbd> with some `text` pre-selected would insert `\mathrm{text}`, retaining the selection on the text. Pressing <kbd>Alt</kbd>-<kbd>R</kbd> again would _unwrap_ the `\mathrm{text}` back to `text`, retaining the selection on text.
4. Prepending <kbd>Ctrl</kbd> to any of the above keybindings will auto-surround the insertion text with `$$` (or `\$` on some other SE sites)
5. The keybinding and its associated insertion text can be modified by the user. So, you can set it to insert `\pi` on <kbd>Alt</kbd>+<kbd>A</kbd> instead.

Moreover, there are certain special shortcuts too:

-   <kbd>Alt</kbd>-<kbd>Z</kbd> => dollar-ifying (`text` => `$text$`)
-   <kbd>Alt</kbd>-<kbd>C</kbd> => double dollar-ifying (`text` => `$$text$$`)
-   <kbd>Alt</kbd>-<kbd>A</kbd> => frac-ify (`A/B` => `\frac{A}{B}`)
-   <kbd>Alt</kbd>-<kbd>S</kbd> => align-ify ([image demo](https://i.stack.imgur.com/RmWFQ.png))

You can change their keycodes or disable them as well. The given <kbd>Z</kbd>/<kbd>C</kbd>/<kbd>A</kbd>/etc. keycombos are just the default values.

You may use the <kbd>Alt</kbd>-<kbd>H</kbd> hotkey to get a popup containing a list of your current keybindings, in case you forget any of them ;)

---

## **How to customize hotkeys?**

Each hotkey is composed of three parts:

-   modifier: either an "altKey" or a "shiftKey+altKey" combo
-   key: the key to press.
-   LaTeX command: to be inserted on pressing modifier+key. These are of two types:

    -   braced: like `\mathrm{}`
    -   non-braced: like `\pi`.

To **customize hotkeys**, head over to line 40 where `SHORTCUTS =` is initialized. By default, it is set as (note it is important to escape the `\`, so we write `\\`):

    SHORTCUTS = [
        ["altKey", "I", "\\pi"],
        ["altKey", "R", "\\mathrm{}"],
    ]

So, if you want to insert `\large{}` on <kbd>Alt</kbd>-<kbd>L</kbd>, just add a single line:

    SHORTCUTS = [
        ["altKey", "I", "\\pi"],
        ["altKey", "R", "\\mathrm{}"],
        ["altKey", "H", "\\large{}"]
    ]

To **customize special hotkeys** (for frac-ify, align lines, etc.), head over to the declaration for `SPECIAL_SHORTCUTS`. To disable any of them, delete/comment the corresponding line.

To **position the caret at a specific position**, use the pipe (`|`) character. Usual wrapping rules apply. In the absence of the pipe character, the caret is inserted inside the last `{}`/`()`pair, or at the end of the string.

**Note**: some Alt+key combos might be system-reserved (check [this list](https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts)), so you may need to prepend Shift to avoid overriding system-reserved behavior.
