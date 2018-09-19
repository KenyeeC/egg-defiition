const vscode = require("vscode");
const { execMuti } = require("./exec");

const ERR_PREFIX = "[EggDefinition]";
const TARGET_FILE = {
  "app/router": ["app/controller"],
  "app/controller": ["app/service"],
  "app/service": ["app/dao", "app/service"]
};

async function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.EggDefinition",
    async function() {
      vscode.workspace.textDocuments;
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }
      editor.viewColumn;
      await main(editor);
    }
  );
  context.subscriptions.push(disposable);
}

async function main(editor) {
  try {
    const definition = await executeDefinition(editor);
    // If already has definition, just go there
    if (definition) {
      await showTextDocument(definition.uri, definition.range);
      return;
    }
    // Otherwise, find the definition via chosen text
    const text = getSelectText(editor);
    const targets = getTargetUri(editor);
    let command = targets.map(uri => `grep -rn " ${text}(" ${uri}`);
    const stdout = execMuti(command);
    const resource = stdout.split(/\n|\r|\n\r/g).filter(i => i);
    console.log("resource:::::::", resource);
    await handleResolve(resource, editor);
  } catch (e) {
    console.log("e::::::::::::", e);
    let message = e.message;
    if (e.message.indexOf(ERR_PREFIX) === -1)
      message = `${ERR_PREFIX} Unknow error`;
    vscode.window.showInformationMessage(message);
  }
}

async function handleResolve(result, editor) {
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
    if (resource.length === 0) throw new Error();
    if (resource.length === 1) {
      await jumpDefinition(resource[0]);
    }
    if (resource.length > 1) {
      await createQuickPick(resource);
    }
  } catch (e) {
    throw new Error(`${ERR_PREFIX} No definition match`);
  }
}

async function jumpDefinition(source) {
  const { uri, line } = source;
  const range = new vscode.Range(line, 0, line, 0);
  await showTextDocument(uri, range);
}

async function showTextDocument(uri, range) {
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { selection: range });
}

async function createQuickPick(resource) {
  const chips = resource.map(item => {
    return item.match.replace(/.*?\/app\//, "/app/");
  });
  const resolve = await vscode.window.showQuickPick(chips);
  if (!resolve) return;
  const index = chips.indexOf(resolve);
  await jumpDefinition(resource[index]);
}

function getTargetUri(editor) {
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
      `${ERR_PREFIX} Can not do search in this file
      (Tips:Egg Definition can only do search include ${Object.keys(
        TARGET_FILE
      ).join(", ")})`
    );
  return targetUri;
}

function getSelectText(editor) {
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
  if (line.isEmptyOrWhitespace || line.text.indexOf(`.${text}`) === -1)
    throw new Error(`${ERR_PREFIX} No definition match`);
  return text;
}

async function executeDefinition(editor) {
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

exports.activate = activate;
