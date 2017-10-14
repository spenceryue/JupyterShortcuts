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

			function use_custom_shortcuts () {

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

							if (seen.size == 0)
								Kernel.execute("import os\n"
									+ "os.system('subl -n .sublime_cell.py')");
							else
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

							Kernel.execute("import sys\n"
								+ "with open('.sublime_cell.py', 'r') as r:\n"
								+ "    sys.stdout.write(r.read())",
								{iopub: callback},
								{silent: false});

							return false;
						}
					},

					'ctrl-o': {
						help : 'Copy Cell Output',
						icon : 'fa-clone',
						edit : true,
						command : true,
						handler (event) {
							var target = Notebook.get_selected_cell().output_area;

							if (target.outputs.length == 0)
								return;

							var case_0 = target.outputs[0].hasOwnProperty('text');

							if (case_0)
							{
								console.log('case 0')
								var output = target.outputs[0].text;
							}
							else
								var output = target.outputs[0].data['text/plain'];

							console.log('Jupyter Cell Output Copied!\n' + output)

							var input = document.createElement("input");
							input.value = output;
							input.style.position = 'fixed';
							input.style.top = 0;
							input.style.left = 0;

					// Ensure it has a small width and height. Setting to 1px / 1em
					// doesn't work as this gives a negative w/h on some browsers.
					input.style.width = '2em';
					input.style.height = '2em';

					// We don't need padding, reducing the size if it does flash render.
					input.style.padding = 0;

					// Clean up any borders.
					input.style.border = 'none';
					input.style.outline = 'none';
					input.style.boxShadow = 'none';

					// Avoid flash of white box if rendered for any reason.
					input.style.background = 'transparent';
					document.body.appendChild(input);
					input.select();
					document.execCommand('cut');
					document.body.removeChild(input);

					return false;
				}
			},
		};

		function getName (shortcut) {
			return shortcut.help.replace(/[\s-]+/g, '-').toLowerCase();
		}

		function getPrefixedName (shortcut) {
			return prefix + ':' + shortcut.help.replace(/[\s-]+/g, '-').toLowerCase();
		}


		/* 	Register my_shortcuts as actions.
		Then add them as shortcuts. */
		for (var key in my_shortcuts) {
			var shortcut = my_shortcuts[key];
			var name = getName(shortcut);
			var prefixed_name = getPrefixedName(shortcut);
			KeyManager.actions.register(shortcut, name, prefix);
			if(shortcut.edit)
				Edit.add_shortcut(key, prefixed_name);
			if(shortcut.command)
				Command.add_shortcut(key, prefixed_name);
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