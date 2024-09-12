<p align=center> <b>Sharing the Past with the Public: Augmented Reality User Experience at Archaeological Site</b> </p>

## 💡Overview: [More info here](https://wp2023.cs.hku.hk/fyp23051/)

Sharing the Past is an augmented reality (AR) app designed to enhance your experience at archaeological sites, particularly in the stunning Vedi River Valley, Armenia. 2023-2024 HKU FYP in collaboration with the Ararat Plain Southeast Archaeological Project ([APSAP](https://hdt.arts.hku.hk/apsap-project)). 

## ✨ Features

| 👀 Demo | 📝 Description |
| :---: | --- |
| ![FYP_img2](https://github.com/user-attachments/assets/08dc5f3a-3997-459b-9221-487b2e24ccb0) | Our app uses your smartphone’s GPS and magnetometer to guide you through the valley, offering a first-person perspective that makes exploring feel like a true adventure |
| ![distance](https://github.com/user-attachments/assets/7c46431f-9a8a-4b30-bd0f-a9d16f341e9a) | Our app ensures you stay on track with real-time updates on your location and orientation |
| <img width="50%" alt="trigger" src="https://github.com/user-attachments/assets/e8cc40a8-24b9-4ac9-9a4a-f07a6e31c03e"> | Trigger pop-up information windows that provide fascinating details about landmarks, history, and cultural heritage |
| ![comments](https://github.com/user-attachments/assets/56386599-d9f3-4cf4-a8d0-3827486b9b8e) | The app allows users to leave comments and feedback on different attractions, fostering a sense of community among explorers |
| ![Final FYP-- AR at Armenia](https://github.com/user-attachments/assets/90469273-c4eb-4c81-91b4-b781ab56652e) | Cloud-based syncing of the latest information of the sites to promote sustainable tourism |


### Other features

- Authentication (login / sign up with email & password)
- Update user profiles and preference in the settings
- Dark mode toggle with local storage save
- Clean, accessible and responsive UI across all screens

## 🚀 Run locally

> [!IMPORTANT]
> - Node version is lower than 17 because the Expo Cli in this project does not support Node version 17+. You can use [Node Version Manager (nvm)](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/).
> - The app has been migrated from Realm api to our own [server and apis](https://github.com/Humen-debug/XR-archaeology-server/tree/main). Before running the app, please create a `.env` file and configure the server api uri as `EXPO_PUBLIC_API_URL`. After running the server, the connection URI should be your **hosting device IP with port _3002_**.

1. Clone this project to your local environment
```
git clone "https://github.com/Humen-debug/XR-archaeology-app.git"
```
2. Configure the node version tp 16.xx.x, if your current node version is larger or equal to 17
```
nvm use 16
```
3. Install required packages
```
yarn
```
4. Enable developer mode and connect your tester device
  - Android: <https://developer.android.com/codelabs/basic-android-kotlin-compose-connect-device#0>
  - iOS: <https://getupdraft.com/blog/how-enable-ios-developer-mode-iphone-or-ipad>
5. Depending on your development environment run 
```
yarn android
```
or 
```
yarn ios
```

> [!NOTE]
> - `yarn start` has been duplicated by the `yarn android` and `yarn ios` because ViroReact does not support the Expo Go client.
> - if you are developing using Android, after running `yarn clean`, please rollback the Android Linking of ViroReact in the `android` directory, by the [ViroReact Installation Instructions](https://viro-community.readme.io/docs/installation-instructions), or using source controls in Git to revert the changes in `android` directory.
> - If you want to run the app with a database with official data, don't hesitate to contact @Humen-debug to get the public API URL.

## Development

#### 📦 File Structure

<details>
  <summary>Details</summary>
  
  ```
  ├── app: stores all the pages for the front end
  │   ├── (auth)
  │   └── (tabs): contains pages with the bottom navigation bar
  |       ├── \_layout: stores the navigation bar layout
  │       ├── account: User account and settings
  │       └── home: The home page shows the collections of items
  ├── assets: stores static assets
  ├── components: our customized components/widgets
  ├── models: the MongoDB database schema or classes
  ├── patches
  ├── plugins
  ├── providers: our customized react contexts
  ├── styles: app theme styles
  └── types: declared or modified types in other packages
  ```  
</details>

#### 🧩 Built-with

- [TypeScript](https://www.typescriptlang.org/) - Statically typed superset of JavaScript
- [Expo](https://expo.dev/) - Open-source platform providing variety of packages and allowing easy deployment
- [React Native](https://reactnative.dev/) - Frontend framework for creating reusable components
- [ViroReact](https://viro-community.readme.io/docs/overview) - Library for buiding AR and VR experience
- [Feathers.js](https://feathersjs.com/) - Framework for creating APIs and real-time application
- [Three.js](https://threejs.org/) - Library to create lightweight, cross-browser 3D environment


#### 🔧 Package versions

- `expo-three-orbit-controls` on Git Hub uses an outdated version of `three@0.108`. An update is made using `package-patch` to solve the code conflict.

