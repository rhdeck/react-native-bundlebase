#!/usr/bin/env node
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const plist = require("plist");
const deasync = require("deasync-promise");
const inquirer = require("inquirer");
//Get my directory
var thisPath = process.argv[1];
var thisPath = path.dirname(thisPath); //bin directory
var thisPath = path.dirname(thisPath); //dependency directory
var privacyText = "This app requires the camera to function";
const myPackagePath = thisPath + "/package.json";
if (fs.existsSync(myPackagePath)) {
  const mypackage = require(myPackagePath);
  if (typeof mypackage.IOSCameraPrivacyText != "undefined") {
    privacyText = mypackage.IOSCameraPrivacyText;
  }
}

var thisPath = path.dirname(thisPath); // node_modules
var baseName = path.basename(thisPath);
if (!baseName.startsWith("node_modules")) {
  console.log("This is not a dependency: ", thisPath);
  process.exit();
}
var thisPath = path.dirname(thisPath); // parent
const packagePath = thisPath + "/package.json";
if (fs.existsSync(packagePath)) {
  const package = require(packagePath);
  if (typeof package.IOSCameraPrivacyText != "undefined") {
    console.log("Setting from parent package");
    privacyText = package.IOSCameraPrivacyText;
  }
}
var iosPath = thisPath + "/ios";
if (!fs.existsSync(iosPath)) {
  console.log("Could not find ios in ", thisPath, iosPath);
  console.log(fs.readdirSync(thisPath));
  process.exit();
}
plists = glob.sync(iosPath + "/*/Info.plist");
const homefile = process.env.HOME + "/.rninfo";
var homeinfo;
if (fs.existsSync(homefile)) {
  homeinfo = JSON.parse(fs.readFileSync(homefile));
} else {
  homeinfo = {};
}
var needToAsk = false;
var foundDefault = false;
const defaultBase = "org.reactjs.native.example";
plists.map(path => {
  const source = fs.readFileSync(path, "utf8");
  var o = plist.parse(source);
  if (o.CFBundleIdentifier) {
    if (o.CFBundleIdentifier.startsWith(defaultBase)) {
      foundDefault = true;
    }
  }
});
if (foundDefault) {
  if (!homeinfo.bundleBase) {
    console.log("HI there is no problem yet");
    inquirer
      .prompt([
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
      ])
      .then(
        answers => {
          const newbundle = answers.bundle;
          homeinfo.bundleBase = newbundle;
          fs.writeFileSync(homefile, JSON.stringify(homeinfo));
          addToPlists();
        },
        err => {
          console.log("Got an error", err);
          process.exit(1);
        }
      );
  } else {
    addToPlists();
  }
}

function addToPlists() {
  plists.map(path => {
    const source = fs.readFileSync(path, "utf8");
    //console.log("Output:", source);
    var o = plist.parse(source);
    //console.log("Parsed output", o);
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
}
