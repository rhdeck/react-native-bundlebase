# react-native-bundlebase

Adding support for setting the base name of the bundle (e.g. com.mycompany).

This is important for creating binaries with unique IDs for testing on devices.

# Usage

```
yarn add react-native-bundlebase
react-native set-bundlebase
```

On link, it will fix check the bundle for the "org.reactjs.native.example" prefix and prompt you to replace it. After your first replacement, your answer will be stored in `~/.rninfo`. Delete that file to get prompted to try it again.
