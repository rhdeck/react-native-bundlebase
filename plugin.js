const {
  updatePbxproj,
  updatePlist,
  getBundleFromPbxproj,
  getNameFromBundle
} = require("xcode-bundle-management");
const { set } = require("rninfo-manager");
const { getPlists, getPbxProjs } = require("./");
const { writeFileSync } = require("fs");
module.exports = [
  {
    name: "set-bundle <newbundle>",
    description: "Set the bundle id for native code",
    func: ([newbundle]) => {
      getPlists().forEach(updatePlist);
      getPbxProjs().forEach(p => updatePbxproj(p, newbundle));
      let p = require("package.json");
      p.iosBundle = newbundle;
      writeFileSync("package.json", JSON.stringify(p, null, 2));
    }
  },
  {
    name: "set-bundlebase <newbundlebase>",
    description: "Set the base bundle for native code",
    options: [
      {
        command: "-g --global",
        description: "Set value in my user-wide .rninfo file as well"
      }
    ],
    func: ([newbundlebase], _, { global }) => {
      getPlists().forEach(updatePlist);
      getPbxProjs().forEach(p => {
        const name = getNameFromBundle(getBundleFromPbxproj(p));
        const bundle = `${newbundlebase}.${name}`;
        updatePbxproj(p, bundle);
        if (global) set("bundlebase", newbundlebase);
      });
    }
  }
];
