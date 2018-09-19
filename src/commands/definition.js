const core = require("../core");

const ERR_PREFIX = "[EggDefinition]";
const TARGET_FILE = {
  "app/router": ["app/controller"],
  "app/controller": ["app/service"],
  "app/service": ["app/dao", "app/service"],
  "app/schedule": ["app/dao", "app/service"]
};

async function goDefinition(editor) {
  try {
    const definition = await core.executeDefinition(editor);
    // If already has definition, just go there
    if (definition) {
      await core.showTextDocument(definition.uri, definition.range);
      return;
    }
    // Otherwise, find the definition via chosen text
    const { text, line } = core.getSelectText(editor);
    // Validate text
    if (line.isEmptyOrWhitespace || line.text.indexOf(`.${text}`) === -1)
      throw new Error(`${ERR_PREFIX} No definition match`);
    const targets = core.getTargetUri(editor, TARGET_FILE);
    let command = targets.map(uri => `grep -rn " ${text}(" ${uri}`);
    const stdout = core.execMuti(command);
    const resource = stdout.split(/\n|\r|\n\r/g).filter(i => i);
    await core.handleResolve(resource, editor);
  } catch (e) {
    core.errHandler(e, ERR_PREFIX);
  }
}

module.exports = goDefinition;
