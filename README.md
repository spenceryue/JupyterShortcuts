custom.js
===============

My custom Jupyter shortcuts. 😬

### How to use:

(1) While a cell is selected (blue outline in command mode, green outline in edit mode), Use Ctrl+E to open the cell in Sublime. (Save and close the file when you're done editing.)

(2) Then use Ctrl+Shift+E to update the cell with the contents saved in Sublime. (Ctrl+Shift+E will do nothing if the cell has never been edited in Sublime.)



### Additional side things:

Starting at line 94 in custom.js I added the following lines:

```Edit.add_shortcut('ctrl-b', 'jupyter-notebook:run-cell');
Command.add_shortcut('ctrl-b', 'jupyter-notebook:run-cell');
Edit.remove_shortcut('ctrl-enter');
Edit.add_shortcut('alt-w', 'jupyter-notebook:enter-command-mode');
Command.add_shortcut('alt-w', 'jupyter-notebook:enter-edit-mode');```

Basically it maps Ctrl+B to run the cell (edit or command mode), unbinds Ctrl+Enter while in edit mode, maps Alt+W to enter and exit edit mode.

If you don't want one of them, just delete the line, and nothing bad will happen.