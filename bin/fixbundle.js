#!/usr/bin/env node
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const plist = require("plist");
const inquirer = require("inquirer");
const xcode = require("xcode");
(async () => {
  //Get my directory
  var thisPath = process.cwd();
  var plists = glob.sync(path.join(thisPath, "ios", "*", "Info.plist"));
  var pbxprojs = glob.sync(path.join(thisPath, "ios", "*", "project.pbxproj"));
  const defaultBase = "org.reactjs.native.example";
  let found =
    plists.find(path => {
      const source = fs.readFileSync(path, "utf8");
      const o = plist.parse(source);
      return (
        o.CFBundleIdentifier && o.CFBundleIdentifier.startsWith(defaultBase)
      );
    }) ||
    pbxprojs.find(path => {
      const source = fs.readFileSync(path, "utf8");
      return source.indexOf(defaultBase) > -1;
    });

  if (!found) return;

  //FIgure out the new default
  const homefile = process.env.HOME + "/.rninfo";
  var homeinfo;
  if (fs.existsSync(homefile)) {
    homeinfo = JSON.parse(fs.readFileSync(homefile));
  } else {
    homeinfo = {};
  }
  if (!homeinfo.bundleBase) {
    try {
      const answers = await inquirer.prompt([
        {
          message:
            "You do not have a saved bundlebase.\nWhat is the base ID you would use for your organization? (e.g. com.mycompany for an app that would be eventually com.mycompany.myapp)",
          name: "bundle",
          validate: answer => {
            if (!answer.length)
              return "You need to reply with a string of some length";
            return true;
          }
        }
      ]);
      const newbundle = answers.bundle;
      homeinfo.bundleBase = newbundle;
      fs.writeFileSync(homefile, JSON.stringify(homeinfo));
    } catch (e) {
      console.log("Got an error", err);
      process.exit(1);
    }
  }
  plists.forEach(path => {
    const source = fs.readFileSync(path, "utf8");
    var o = plist.parse(source);
    if (o.CFBundleIdentifier) {
      if (o.CFBundleIdentifier.startsWith(defaultBase)) {
        if (homeinfo.bundleBase) {
          o.CFBundleIdentifier = o.CFBundleIdentifier.replace(
            defaultBase,
            homeinfo.bundleBase
          );
          const xml = plist.build(o);
          fs.writeFileSync(path, xml);
        }
      }
    }
  });
  pbxprojs.forEach(path => {
    const project = xcode.project(path);
    project.parseSync();
    Object.keys(project.pbxXCBuildConfigurationSection())
      .filter(k => !k.endsWith("_comment"))
      .forEach(k => {
        const o = project.pbxXCBuildConfigurationSection()[k];
        if (!o.isa == "XCBuildConfiguration") return;
        const oldName = o.buildSettings.PRODUCT_BUNDLE_IDENTIFIER;
        if (!oldName) return;
        if (oldName.startsWith('"' + defaultBase)) {
          project.addBuildProperty(
            "PRODUCT_BUNDLE_IDENTIFIER",
            '"' + homeinfo.bundleBase + oldName.substring(defaultBase.length)
          );
        }
      });
    fs.writeFileSync(path, project.writeSync());
  });
})();
