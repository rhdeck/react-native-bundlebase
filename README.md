# react-native-bundlebase

Adding support for setting the base name of the bundle (e.g. com.mycompany).

This is important for creating binaries with unique IDs for testing on devices.

## Installation

```bash
yarn add react-native-bundlebase
```

## Usage

### react-native set-bundlebase [newbase]

```bash
react-native set-bundlebase
```

It will fix check the bundle for the "org.reactjs.native.example" prefix and prompt you to replace it. After your first replacement, your answer will be stored in `~/.rninfo`. Delete that file to get prompted to try it again.

### react-native set-bundle <bundle>

```bash
react-native set-bundle com.mycompany.myapp
```

Will set the bundle to the exact string set above without ever opening xcode
