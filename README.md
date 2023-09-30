# XR-archaeology

2023-2024 FYP in collaboration with Ararat Plain Southeast Archaeological Project

## Pre-requisites

This project uses Expo for React Native. To use the packages provided by Expo, please install them by running `yarn` first.

For better type annotation, typescript is recommended.

## Folder structure

- app: stores all the pages for front-end.
  - (tabs): contains pages having the bottom navigation bar.
    - _layout: stores the navigation bar layout.
    - home: Home Page shows the collections of items.
    - profile: User account and settings
  - _layout: root stack/layout router
- assets: stores static assets, mainly images
- components: stores customized components/widgets.
- models: stores the database schema or classes
- providers
- styles
- types: declared or modified types in other packages
  
## Package versions

NOTE: package: `expo-three-orbit-controls` on github is using outdated version of `three@0.108`. To solve the code conflict, an update is made in local `node_module`.
