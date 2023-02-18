# Create a mobile-app with monorepo

(1) Create and modify `package.json` according to https://www.callstack.com/blog/setting-up-react-native-monorepo-with-yarn-workspaces

(2)
`mkdir packages`
`cd packages`
`npx react-native init app --directory mobile-app --template react-native-template-typescript`

(When being asked how to install CocoaPods, gem or Homebrew, whichever is OK.)

You'll end up with some errors

```
✔ Downloading template
✔ Copying template
✔ Processing template
ℹ Installing dependencies
✔ CocoaPods (https://cocoapods.org/) is not installed. CocoaPods is necessary for the iOS project to run correctly. Do you want to install it? › Yes, with gem (may require sudo)
✔ Installing CocoaPods
✔ Installing Bundler
✖ Installing CocoaPods dependencies (this may take a few minutes)
error 
[!] Invalid `Podfile` file: cannot load such file -- /Users/kuang/github/TryMonorepo/packages/mobile-app/node_modules/react-native/scripts/react_native_pods.

 #  from /Users/kuang/github/TryMonorepo/packages/mobile-app/ios/Podfile:1
 #  -------------------------------------------
 >  require_relative '../node_modules/react-native/scripts/react_native_pods'
 #  require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
 #  -------------------------------------------

✖ Installing CocoaPods dependencies (this may take a few minutes)
error Error: Looks like your iOS environment is not properly set. Please go to https://reactnative.dev/docs/next/environment-setup and follow the React Native CLI QuickStart guide for macOS and iOS.
Error: Error: Looks like your iOS environment is not properly set. Please go to https://reactnative.dev/docs/next/environment-setup and follow the React Native CLI QuickStart guide for macOS and iOS.
    at createFromTemplate (/Users/kuang/.npm/_npx/7930a8670f922cdb/node_modules/@react-native-community/cli/build/commands/init/init.js:169:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.initialize [as func] (/Users/kuang/.npm/_npx/7930a8670f922cdb/node_modules/@react-native-community/cli/build/commands/init/init.js:222:3)
    at async Command.handleAction (/Users/kuang/.npm/_npx/7930a8670f922cdb/node_modules/@react-native-community/cli/build/index.js:140:9)
info Run CLI with --verbose flag for more details.
```

To fix it, modify `packages/mobile-app/ios/Podfile`, change its first 2 lines from
```
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
```
to
```
require_relative '../../../node_modules/react-native/scripts/react_native_pods'
require_relative '../../../node_modules/@react-native-community/cli-platform-ios/native_modules'
```
and then
`cd packages/mobile-app/ios`
`pod install`
And then open `app.xcworkspace` with Xcode, `Project settings` > `Build Phases` open `Bundle React Native code and images`, change the 2 lines in the script from
```
WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"
REACT_NATIVE_XCODE="../node_modules/react-native/scripts/react-native-xcode.sh"
```
to
```
WITH_ENVIRONMENT="../../../node_modules/react-native/scripts/xcode/with-environment.sh"
REACT_NATIVE_XCODE="../../../node_modules/react-native/scripts/react-native-xcode.sh"
```
Before fixing android, let's first fix Metro config so that we could run ios. Replace the contents in `packages/mobile-app/metro.config.js` with
```
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');

module.exports = {
  watchFolders: [path.resolve(__dirname, '../../node_modules')],
};
```
and then we could run ios
`cd packages/mobile-app`
(`command-T` to create a new Terminal console and in one console)
`yarn start`
(then in the other console)
`yarn ios`

Now let's fix android. Fix all these files
`packages/mobile-app/android/build.gradle`
`packages/mobile-app/android/settings.gradle`
`packages/mobile-app/android/app/build.gradle`
by replacing `../node_modules/` with `../../../node_modules/`

For android, we also need to patch react-native.
Open `node_modules/react-native/react.gradle` and replace
```
def rootCliJs = new File(reactRoot, "node_modules/react-native/cli.js")
```
with
```
def rootCliJs = new File(reactRoot, "../../node_modules/react-native/cli.js")
```
After locally modified `node_modules/react-native/react.gradle`,
`npx patch-package react-native --include "react.gradle"`
and add `"postinstall": "patch-package"` to the root `package.json`:
```
  ...
  "scripts": {
    ...
    "postinstall": "patch-package",
    ...
  }
  ...
```
And add `patch-package` to `mobile-app`
`cd packages/mobile-app`
`yarn add patch-package`

# Create a buddy app

(1)
`cd packages`
`npx react-native init buddy --directory buddy-app --template react-native-template-typescript`
(Notice here the name for the new created app should be different than the previous one(s) to avoid name conflict in the same workspace.)

Fix the `node_modules` relative path in ios `Podfile` and `Project settings` > `Build Phases` open `Bundle React Native code and images` for `budd-app` as we did for `mobile-app`.
And fix `buddy-app`'s `metro.config.js` as we did for `mobile-app`.
Then we could `yarn ios` to run `buddy-app`.

Now the android part.
Fix the `node_modules` relative path for `buddy-app`'s
`packages/buddy-app/android/build.gradle`
`packages/buddy-app/android/settings.gradle`
`packages/buddy-app/android/app/build.gradle`
as we did for `mobile-app`.
`node_modules/react-native/react.gradle` was already patched when we were fixing `mobile-app`. But when creating `buddy-app`, the hoisted modules were overwritten so now the local patch is gone.
We don't need to make the patch for `node_modules/react-native/react.gradle` again,
  because the `patches/react-native+0.70.6.patch` is still there and the `"postinstall"` entry is still in the root `package.json`.
But we do need to install `patch-package` for `buddy-app`.
`cd packages/buddy-app`
`yarn add patch-package`
Now we need to remove the whole root `node_modules` folder and reinstall them to apply the patch.
(Change the work directory to the root, which is packages/..)
`rm -rf node_modules`
`yarn`
Then we could run android and do a recursive test on ios.
