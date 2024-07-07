# Sharing the Past with the Public: Augmented Reality User Experience at Archaeological Site

Sharing the Past is 2023-2024 HKU FYP in collaboration with the Ararat Plain Southeast Archaeological Project. [More info here](https://wp2023.cs.hku.hk/fyp23051/)

Developers write in Expo with React Native and Viro for AR development across all mobile platforms. For better type annotation, typescript was applied.

## Pre-requisites

Node version is lower than 17 because the Expo Cli in this project does not support Node version 17+. You can use [Node Version Manager (nvm)](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/). To use the packages provided by Expo, please install them by running `yarn`.

## Instructions for running app [DEV]

- Run `nvm use 16.xx.x` for node version configuration, if your current node version is larger or equal to 17.
- Run `yarn` for install packages.
- Enable developer mode and connect your tester device
  - [Android]: <https://developer.android.com/codelabs/basic-android-kotlin-compose-connect-device#0>.
  - [iOS]: <https://getupdraft.com/blog/how-enable-ios-developer-mode-iphone-or-ipad>.
- Depending on your development environment, run `yarn android` or `yarn ios` for running on your mobile.

### Remarks

- The app has been migrated from Realm api to our own [server and apis](https://github.com/Humen-debug/XR-archaeology-server/tree/main). Before running the app, please create a `.env` file and configure the server api uri as `EXPO_PUBLIC_API_URL`. After running the server, the connection URI should be your **hosting device IP with port _3002_**.

- `yarn start` has been duplicated by the `yarn android` and `yarn ios` because ViroReact does not support the Expo Go client.

- if you are developing using Android, after running `yarn clean`, please rollback the Android Linking of ViroReact in the `android` directory, by the [ViroReact Installation Instructions](https://viro-community.readme.io/docs/installation-instructions), or using source controls in Git to revert the changes in `android` directory.

## Folder structure

- app: stores all the pages for the front end.
  - (tabs): contains pages having the bottom navigation bar.
    - \_layout: stores the navigation bar layout.
    - home: The home page shows the collections of items.
    - profile: User account and settings
  - \_layout: root stack/layout router
- assets: stores static assets, mainly images
- components: our customized components/widgets.
- models: the MongoDB database schema or classes
- providers: our customized react contexts
- styles: app theme styles
- types: declared or modified types in other packages
- package.json: libraries

## Package versions

- package: `expo-three-orbit-controls` on Git Hub uses an outdated version of `three@0.108`. To solve the code conflict, an update is made by using `package-patch`.

- If you want to run the app with a database that already has official data, don't hesitate to get in touch with @Humen-debug to get the public API URL.

## Sample Overview

<img src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/1e0d045f-a1e3-4ad8-9a31-bc7277081bee.png" data-canonical-src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/1e0d045f-a1e3-4ad8-9a31-bc7277081bee.png" width="33%" alt="POI_selection"/>
<img src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/ce90798f-7193-415f-876b-1f7d7b2add05" data-canonical-src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/ce90798f-7193-415f-876b-1f7d7b2add05" width="33%" alt="AR_travel"/>
<img width="33%" alt="arrival" src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/fa0b0fd2-6b37-4212-a17a-87aaf2f587e5">
<br/>
AR travel directs the user to the points of interest on the selected route.
<br/>

<img width="33%" src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/51ee891f-0d39-4d9c-b833-5ae900c16e6e"/>
<img width="33%" src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/ef406331-694d-4812-bcd2-08980947a3c1"/>
<img width="33%" src="https://github.com/Humen-debug/XR-archaeology-app/assets/70459494/9ff9306f-b15c-48e2-b226-f6a7a2806324"/>
<br/>
Explore attractions in Vedi River Valley.
<br/>


