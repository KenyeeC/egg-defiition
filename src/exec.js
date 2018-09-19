const cp = require("child_process");

module.exports = {
  execMuti(command) {
    let stdout = "";
    for (const cmd of command) {
      try {
        stdout += cp.execSync(cmd);
      } catch (e) {}
    }
    return stdout;
  }
};
