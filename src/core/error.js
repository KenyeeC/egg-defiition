const vscode = require("vscode");

const ERR_PREFIX = "[Tips]";

module.exports = {
  ERR_PREFIX,
  errHandler(e, CUSTOM_PREFIX) {
    let message = e.message.replace(ERR_PREFIX, CUSTOM_PREFIX);
    if (message.indexOf(CUSTOM_PREFIX) === -1)
      message = `${CUSTOM_PREFIX} Unknow error`;
    vscode.window.showInformationMessage(message);
  }
};
