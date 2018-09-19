const vscode = require("vscode");
const goDfinition = require("./commands/definition");
const goUsage = require("./commands/usage");

function activate(context) {
  const definition = vscode.commands.registerCommand(
    "extension.EggDefinition",
    function() {
      vscode.workspace.textDocuments;
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      editor.viewColumn;
      goDfinition(editor);
    }
  );

  const usage = vscode.commands.registerCommand(
    "extension.EggUsage",
    function() {
      vscode.workspace.textDocuments;
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      editor.viewColumn;
      goUsage(editor);
    }
  );

  context.subscriptions.push(definition);
  context.subscriptions.push(usage);
}

exports.activate = activate;
