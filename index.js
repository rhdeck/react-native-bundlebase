const { join } = require("path");
const { sync } = require("glob");

module.exports.getPlists((thisPath = process.cwd()) =>
  sync(join(thisPath, "ios", "*", "Info.plist"))
);
module.exports.getPbxprojs((thisPath = process.cwd()) =>
  sync(join(thisPath, "ios", "*", "project.pbxproj"))
);
