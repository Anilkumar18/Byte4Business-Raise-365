import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  useWindowDimensions,
} from "react-native";
import { StackActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

const USER_TOKEN = "TOKEN";

const LoadingScreen = (props) => {
  const navigation = useNavigation();

  React.useEffect(() => {
    console.log("useEffect");
    (async () => {
      const api_token = await AsyncStorage.getItem(USER_TOKEN);
      const checkbox = AsyncStorage.getItem("@isRemember");

      console.log(api_token + checkbox);

      if (api_token && checkbox) {
        console.log("if");
        props.navigation.dispatch(StackActions.replace("tabs"));
      } else {
        console.log("else");
        props.navigation.dispatch(StackActions.replace("login"));
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <View
        style={styles.splash}
        source={require("../assets/splash.png")}
      >
        <Image
          style={styles.logo}
          source={require("../assets/splash-adrenaline.png")}
          resizeMode='contain'
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  splash: {
    width: wp("100%"),
    height: hp("100%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#bcbfc2'
  },
  logo: {
    position: "absolute",
    // top: hp("30%"),
    width: '60%'
  },
});

export default LoadingScreen;
