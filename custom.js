/* Based off of:
	(1) https://stackoverflow.com/a/28568018/3624264
	(2) https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/move_selected_cells
*/

define([
	'base/js/namespace',
	'base/js/events'
], function(
	Jupyter,
	events
) {
	"use strict";

	var prefix = 'custom-js';

	var Notebook = Jupyter.notebook;
	var Kernel = Notebook.kernel;
	var KeyManager = Jupyter.keyboard_manager;
	var Edit = KeyManager.edit_shortcuts;
	var Command = KeyManager.command_shortcuts;

	var seen = new Set();

	/* My Shortcuts (Edit and Command mode) */
	var my_shortcuts =
	{
		'ctrl-e': {
			help : 'Edit Cell in Sublime',
			icon : 'fa-pencil-square',
			edit : true,
			command : true,
			handler (event) {
				var id = Notebook.get_selected_cell().cell_id;

				if (!seen.has(id))
					seen.add(id);

				Kernel.execute("%%writefile .sublime_cell.py\n"
							 + Notebook.get_selected_cell().get_text());
				Kernel.execute("import os\n"
							 + "os.system('subl .sublime_cell.py')");

				return false;
			}
		},

		'ctrl-shift-e': {
			help : 'Update Cell from Sublime',
			icon : 'fa-refresh',
			edit : true,
			command : true,
			handler (event) {
				var id = Notebook.get_selected_cell().cell_id;

				if (!seen.has(id))
					return false;

				var callback = {
					output : (msg) => Notebook.get_selected_cell().set_text(msg.content.text)
				};

				Kernel.execute("print(open('.sublime_cell.py', 'r').read(), end='')",
							  {iopub: callback},
							  {silent: false});

				return false;
			}
		}
	};

	function getName (shortcut) {
		return shortcut.help.replace(/[\s-]+/g, '-').toLowerCase();
	}

	function getPrefixedName (shortcut) {
		return prefix + ':' + shortcut.help.replace(/[\s-]+/g, '-').toLowerCase();
	}

	function use_custom_shortcuts () {

		/* 	Register my_shortcuts as actions.
			Then add them as shortcuts. */
		for (var key in my_shortcuts) {
			var shortcut = my_shortcuts[key];
			var name = getName(shortcut);
			var prefixed_name = getPrefixedName(shortcut);
			KeyManager.actions.register(shortcut, name, prefix);
			if(shortcut.edit)		Edit.add_shortcut(key, prefixed_name);
			if(shortcut.command)	Command.add_shortcut(key, prefixed_name);
		}

		/* Reconfigure builtin shortcuts */
        Edit.add_shortcut('ctrl-b', 'jupyter-notebook:run-cell');
        Command.add_shortcut('ctrl-b', 'jupyter-notebook:run-cell');
        Edit.remove_shortcut('ctrl-enter');
        Edit.add_shortcut('alt-w', 'jupyter-notebook:enter-command-mode');
        Command.add_shortcut('alt-w', 'jupyter-notebook:enter-edit-mode');
	}

	return {
		load_ipython_extension: use_custom_shortcuts
	};
});