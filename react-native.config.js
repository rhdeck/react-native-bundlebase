const {
  updatePbxproj,
  updatePlist,
  getNameFromPbxproj
  //   getBundleFromPbxproj,
  //   getNameFromBundle
} = require("xcode-bundle-management");
const { set } = require("rninfo-manager");
const { getPlists, getPbxprojs } = require(".");
const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");
module.exports = {
  commands: [
    {
      name: "set-bundle <newbundle>",
      description: "Set the bundle id for native code",
      options: [
        {
          name: "--skip",
          description: "Skip updating app.json to new name",
          default: false
        }
      ],
      func: ([newbundle], _, { skip }) => {
        getPlists().forEach(updatePlist);
        getPbxprojs().forEach(p => updatePbxproj(p, newbundle));
        const ppath = join(process.cwd(), "package.json");
        let p = require(ppath);
        p.iosBundle = newbundle;
        writeFileSync(ppath, JSON.stringify(p, null, 2));
        const appPath = join(process.cwd(), "app.json");
        if (!skip && existsSync(appPath)) {
          const baseName = newbundle.split(".").pop();
          const appjson = JSON.parse(readFileSync(appPath));
          if (baseName !== appjson.name) {
            appjson.name = baseName;
            writeFileSync(appPath, JSON.stringify(appjson, null, 2));
          }
        }
      }
    },
    {
      name: "set-bundlebase [newbase]",
      description:
        "Set the base bundle for native code (e.g. com.myfirm) - blank to use your saved default",
      options: [
        {
          command: "-g --global",
          description: "Set value in my user-wide .rninfo file as well"
        }
      ],
      func: ([newbundlebase], _, { global }) => {
        getPlists().forEach(updatePlist);
        getPbxprojs().forEach(p => {
          const name = getNameFromPbxproj(p);
          if (name) {
            if (newBundleBase) {
              const bundle = `${newbundlebase}.${name}`;
              updatePbxproj(p, bundle);
              const ppath = join(process.cwd(), "package.json");
              let o = require(ppath);
              o.iosBundle = bundle;
              writeFileSync(ppath, JSON.stringify(o, null, 2));
            }
            spawnSync(join(__dirname, "bin", "fixbundle.js"), [], {
              stdio: "inherit"
            });
          }
        });
        if (global) set("bundlebase", newbundlebase);
      }
    }
  ]
};
