const vscode = require("vscode");
const goDfinition = require("./commands/definition");

function activate(context) {
  const definition = vscode.commands.registerCommand(
    "extension.EggDefinition",
    function () {
      vscode.workspace.textDocuments;
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      editor.viewColumn;
      goDfinition(editor);
    }
  );
  context.subscriptions.push(definition);
}

exports.activate = activate;
