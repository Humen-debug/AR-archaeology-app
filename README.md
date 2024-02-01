# XR+archaeology

2023-2024 FYP in collaboration with Ararat Plain Southeast Archaeological Project

## Pre-requisites

This project uses Expo for React Native. To use the packages provided by Expo, please install them by running `yarn` first.

For better type annotation, typescript is recommended.

## To begin the app [DEV]

- Run `yarn` for install packages.
- Enable developer mode and connect your tester device
  - [Android]: <https://developer.android.com/codelabs/basic-android-kotlin-compose-connect-device#0>.
  - [iOS]: <https://getupdraft.com/blog/how-enable-ios-developer-mode-iphone-or-ipad>.
- Depends on your development environment, run `yarn android` or `yarn ios` for running on your mobile.

## Folder structure

- app: stores all the pages for front-end.
  - (tabs): contains pages having the bottom navigation bar.
    - \_layout: stores the navigation bar layout.
    - home: Home Page shows the collections of items.
    - profile: User account and settings
  - \_layout: root stack/layout router
- assets: stores static assets, mainly images
- components: our customized components/widgets.
- models: the mongodb database schema or classes
- providers: our customized react contexts
- styles: app theme styles
- types: declared or modified types in other packages
- package.json: libraries

## Package versions

NOTE:

- package: `expo-three-orbit-controls` on github is using outdated version of `three@0.108`. To solve the code conflict, an update is made by using `package-patch`.
