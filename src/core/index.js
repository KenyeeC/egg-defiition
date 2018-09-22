const vscode = require("vscode");
const exec = require("./exec");
const error = require("./error");

const ERR_PREFIX = error.ERR_PREFIX;

module.exports = {
  ...exec,
  ...error,

  ERR_PREFIX,

  async handleResolve(result, editor) {
    try {
      const currentUri = editor.document.uri;
      const resource = result
        .map(item => {
          const match = item.split(":");
          return {
            uri: vscode.Uri.parse(`file://${match[0]}`),
            line: Number(match[1]) - 1,
            match: item
          };
        })
        .filter(item => item.uri.path !== currentUri.path);
      if (resource.length === 0) return 0;
      if (resource.length === 1)
        await module.exports.jumpDefinition(resource[0]);
      if (resource.length > 1) await module.exports.createQuickPick(resource);
    } catch (e) {
      throw new Error(`${ERR_PREFIX} No definition match`);
    }
  },

  async jumpDefinition(source) {
    const { uri, line } = source;
    const range = new vscode.Range(line, 0, line, 0);
    await module.exports.showTextDocument(uri, range);
  },

  async showTextDocument(uri, range) {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { selection: range });
  },

  async createQuickPick(resource) {
    const chips = resource.map(item => {
      return item.match.replace(/.*?\/app\//, "app/");
    });
    const resolve = await vscode.window.showQuickPick(chips);
    if (!resolve) return;
    const index = chips.indexOf(resolve);
    await module.exports.jumpDefinition(resource[index]);
  },

  getTargetUri(editor, TARGET_FILE) {
    const { uri } = editor.document;
    let targetUri = [];
    Object.keys(TARGET_FILE).forEach(key => {
      if (uri.path.indexOf(key) > -1) {
        const uriPrefix = uri.path.split(key)[0];
        TARGET_FILE[key].forEach(file => targetUri.push(uriPrefix + file));
      }
    });
    if (targetUri.length === 0)
      throw new Error(
        `${ERR_PREFIX} Not support for this file
        (Tips:Egg Definition can temporarily do search include ${Object.keys(
          TARGET_FILE
        ).join(", ")})`
      );
    return targetUri;
  },

  getSelectText(editor) {
    let selection = editor.selection;
    let startPosition = selection.start;
    let endPosition = selection.end;

    const samePlace =
      startPosition.line === endPosition.line &&
      startPosition.character === endPosition.character;

    if (samePlace) {
      const word = editor.document.getWordRangeAtPosition(startPosition);
      if (!word || word.isEmpty) throw new Error(`${ERR_PREFIX} Empty word`);
      startPosition = word.start;
      endPosition = word.end;
    }

    const range = new vscode.Range(startPosition, endPosition);
    const text = editor.document.getText(range);
    const line = editor.document.lineAt(endPosition.line);
    return { text, line };
  },

  async executeDefinition(editor) {
    const { uri } = editor.document;
    let selection = editor.selection;
    let startPosition = selection.start;
    const [definition] = await vscode.commands.executeCommand(
      "vscode.executeDefinitionProvider",
      uri,
      startPosition
    );
    return definition;
  }
};
