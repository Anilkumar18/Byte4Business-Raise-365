/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react";
import { View } from "react-native";
import FlashMessage from "react-native-flash-message";
import { Routes } from "./app/routes";
import Store from "./app/store";

const App = () => {
 console.log("sdxcbxcbcxbxcbbcx");
  return (
    <Store.Provider>
      <View style={{ flex: 1 }}>
        <Routes />
        <FlashMessage position="top" />
      </View>
    </Store.Provider>
  );
};

export default App;
