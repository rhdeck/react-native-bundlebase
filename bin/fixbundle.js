#!/usr/bin/env node
const {
  getBaseFromBundle,
  getNameFromBundle,
  updatePlist,
  updatePbxproj,
  getBundleFromPbxproj,
  getBundleFromPackage
} = require("xcode-bundle-management");
const { get } = require("rninfo-manager");
const { getPlists, getPbxprojs } = require("../");
(async () => {
  var plists = getPlists();
  var pbxprojs = getPbxprojs();
  const defaultBase = "org.reactjs.native.example";
  var { iosBundle } = require("package.json");
  if (iosBundle) {
    plists.forEach(updatePlist);
    pbxprojs.forEach(p => updatePbxproj(p, iosBundle));
  } else if (
    pbxprojs.find(v => getBundleFromPbxproj(v).startsWith(defaultBase))
  ) {
    const bundleBase = await get(
      "bundle",
      "You do not have a saved bundlebase.\nWhat is the base ID you would use for your organization? (e.g. com.mycompany for an app that would be eventually com.mycompany.myapp)",
      answer => (answer.length ? true : "You need a string of some length")
    );
    plists.forEach(updatePlist);
    pbxprojs.forEach(p => {
      const oldBundle = getBundleFromPackage(p);
      const oldBase = getBaseFromBundle(oldBundle);
      if (oldBase == defaultBase) {
        const oldName = getNameFromBundle(oldBundle);
        const newBundle = `${bundleBase}.${oldName}`;
        updatePbxproj(p, newBundle);
      }
    });
  }
})();
