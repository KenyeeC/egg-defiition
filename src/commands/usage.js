const core = require("../core");

const ERR_PREFIX = "[EggUsage]";
const TARGET_FILE = {
  "app/controller": ["app/router"],
  "app/service": ["app/controller", "app/service"],
  "app/dao": ["app/service"]
};

async function goUsage(editor) {
  try {
    const { text, line } = core.getSelectText(editor);
    // Validate text
    if (line.isEmptyOrWhitespace || line.text.indexOf(` ${text}(`) === -1)
      throw new Error(`${ERR_PREFIX} Not a function difinition`);
    const targets = core.getTargetUri(editor, TARGET_FILE);
    let command = targets.map(
      uri => `grep -rn "\\.${text}[(|)|\\.|,|\\;]" ${uri}`
    );
    const stdout = core.execMuti(command);
    const resource = stdout.split(/\n|\r|\n\r/g).filter(i => i);
    await core.handleResolve(resource, editor);
  } catch (e) {
    core.errHandler(e, ERR_PREFIX);
  }
}

module.exports = goUsage;
