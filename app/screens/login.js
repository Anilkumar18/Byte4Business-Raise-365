import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StackActions } from "@react-navigation/native";
import Theme from "../utils";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { showMessage } from "react-native-flash-message";
import { url } from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { TextInputMask, MaskService } from 'react-native-masked-text'

import { userService } from "../Services/userService"
IonIcon.loadFont();

const toRawValue = text =>
  MaskService.toRawValue('custom', text, {
    mask: '(999) 999-9999',
    getRawValue: value => value.replace(/[()\s-]/g, '')
  })

const toMask = text =>
  MaskService.toMask('custom', text, {
    mask: '(999) 999-9999',
    getRawValue: value => value.replace(/[()\s-]/g, '')
  })

const isValid = text =>
  MaskService.isValid('custom', text, {
    mask: '(999) 999-9999',
    getRawValue: value => value.replace(/[()\s-]/g, '')
  })


const LoginScreen = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  let passwordRef = React.createRef();


  const USER_KEY = "USER";
  const USER_TOKEN = "TOKEN";

  const usingPhone = username && !isNaN(username)

  const loginError = (message) => {
    setLoading(false);
    showMessage({ message: message, type: "danger" });
    return;
  };

  const saveUser = async (data) => {
    if (isRememberMe) {
      AsyncStorage.setItem("@isRemember", JSON.stringify("userLoggedIn"));
    }
    navigation.dispatch(StackActions.replace("tabs"));
  };

  const login = async () => {
    if (!username || !password) {
      loginError("Please fill all fields");
    }

    try {

      var creds = {
        username: usingPhone ? toMask(username) : username,
        password: password,
      }

      setLoading(true);

      let resp = await userService.login(creds);
      console.log('login response', resp.data);
      setLoading(false);


      if (resp.status === 200) {
        setLoading(false);

        let user = resp.data.user;
        let token = resp.data.access_token;
        console.log("DATA : ", user);

        await AsyncStorage.setItem("@id", JSON.stringify(user.id));
        await AsyncStorage.setItem("@email", JSON.stringify(user.email));
        await AsyncStorage.setItem(
          "@username",
          JSON.stringify(user.username)
        );
        await AsyncStorage.setItem(
          "@first_name",
          JSON.stringify(user.first_name)
        );
        await AsyncStorage.setItem(
          "@last_name",
          JSON.stringify(user.last_name)
        );
        await AsyncStorage.setItem("@zip", JSON.stringify(user.zip));
        await AsyncStorage.setItem("@phone", JSON.stringify(user.phone));
        await AsyncStorage.setItem(
          "@birthday",
          JSON.stringify(user.birthday)
        );
        await AsyncStorage.setItem(
          "@picture",
          JSON.stringify(user.get_avatar)
        );
        await AsyncStorage.setItem(
          "@fundraiser_role",
          JSON.stringify(user.fundraiser_role)
        );
        await AsyncStorage.setItem(
          "@restaurant_type",
          JSON.stringify(user.restaurant_type)
        );
        await AsyncStorage.setItem(
          "@fundraiser_type_id",
          JSON.stringify(user.fundraiser_type_id)
        );
        await AsyncStorage.setItem(
          "@leaderboard",
          JSON.stringify(user.leaderboard)
        );
        await AsyncStorage.setItem(
          "@sharelink",
          JSON.stringify(user.sharelink)
        );
        user.payment_method && await AsyncStorage.setItem(
          "@payment_method",
          JSON.stringify(user.payment_method)
        );

        console.log('clear cart');
        await AsyncStorage.setItem('@cart', JSON.stringify({ business: {}, items: [] }))
        await AsyncStorage.setItem(USER_TOKEN, JSON.stringify(token));

        saveUser(user);
      } else {
        loginError("Please enter correct credentials");
        console.log("Login False Response");
        setLoading(false);
      }

    } catch (err) {
      setLoading(false);

      if (err.response && err.response.data && err.response.data.error) {
        loginError(err.response.data.error);

      } else {
        loginError("Login Error! Please try again");

      }
      console.log("dsdsdsdsd", err)
      console.log("Request Failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >

      <View
        style={styles.splash}
        source={require("../assets/top.png")}
      >
        <Image

          source={require("../assets/FramenLogin.png")}
          resizeMode='contain'
          style={{ width: '50%', }}
        />
      </View>
      <View style={styles.viewBack}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("signup");
              }}
              disabled={loading}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >
                SIGN UP NOW
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{
            marginVertical: 20,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: 'black',
            alignSelf: 'center'
          }}>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Nunito-regular",
                fontSize: 20,
              }}
            >OR</Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Nunito-Bold",
                fontSize: 24,
              }}
            >LOGIN</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputStyle}
              placeholder="Email or Phone Number"
              value={usingPhone ? toMask(username) : username}
              maxLength={usingPhone ? 14 : undefined}
              autoCapitalize="none"
              keyboardType={usingPhone ? 'numeric' : undefined}
              placeholderTextColor="grey"
              returnKeyType='next'
              onSubmitEditing={() => passwordRef.current.focus()}
              onChangeText={text => {
                setUsername(usingPhone ? toRawValue(text) : text)
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={passwordRef}
              style={styles.inputStyle}
              placeholder="Password"
              value={password}
              returnKeyType="done"
              onSubmitEditing={login}
              autoCapitalize="none"
              secureTextEntry={hidePassword}
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setPassword(text);
              }}
            />
            {hidePassword ? (
              <IonIcon
                onPress={() => {
                  setHidePassword(false);
                }}
                 style={{ position: "absolute", right: 14, top: 12 }}
                name="eye-outline"
                color="#000"
                size={22}
              />
            ) : (
              <IonIcon
                onPress={() => {
                  setHidePassword(true);
                }}
                 style={{ position: "absolute", right: 12, top: 12 }}
                name="eye-off-outline"
                color="#000"
                size={22}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: "row",

              width: wp("85%"),
              alignSelf: "center",
              justifyContent: "center",
              marginTop: 15,
            }}
          >
            <View style={{ flexDirection: "row", flex: 1 }}>
              <CheckBox
                 style={styles.checkbox}
                onClick={() => {
                  setIsRememberMe(!isRememberMe);
                }}
                isChecked={isRememberMe}
                checkedCheckBoxColor="#000"
                checkBoxColor="#000"
              />
              <Text style={styles.checkboxText}>Remember Me</Text>
            </View>
            <View style={{ alignItems: "flex-end", flex: 1 }}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("forgotPassword");
                }}
              >
                <Text
                  style={{
                    alignSelf: "flex-end",
                    textAlign: "right",
                    fontFamily: "Nunito-SemiBold",
                    fontSize: 14,
                    color: "#000",
                    textDecorationLine: "underline",
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={login}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    textAlign: "center",
                    fontFamily: "Nunito-Bold",
                  }}
                >SIGN IN</Text>
              )}
            </TouchableOpacity>
          </View>
          {/* <View
          style={{
            marginTop: 25,
            alignSelf: "center",
            justifyContent: "center",
            width: "85%",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              color: "grey",
              fontSize: 15,
              textAlign: "center",
              fontFamily: "Nunito-Regular",
            }}
          >
            You don't have account?
          </Text>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("signup");
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Nunito-SemiBold",
                textDecorationLine: "underline",
                marginLeft: 10,
              }}
            >
              Sign up now
            </Text>
          </TouchableOpacity>
        </View> */}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#000",
    backgroundColor: '#bcbfc2',
  },
  splash: {
    width: "100%",
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#bcbfc2',
     paddingBottom: hp("5%")
  },
  logo: {
    position: "absolute",
    top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
     bottom: hp("5%"),
    height: "75%",
    width: "100%",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  inputStyle: {
    flex: 1,
     paddingLeft: 13,
    marginHorizontal: 10,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,

    borderRadius: 5,
  },
  inputContainer: {
    color: "#051533",
    marginBottom: 10,
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: 'center',
    flexDirection: 'row',
     borderTopLeftRadius: 8,
     borderTopRightRadius: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.redButtonColor,
    height: Theme.buttonHeight,
    backgroundColor: "#ececec",
    width: "85%",
    paddingLeft: 10,
    paddingRight: 15,
  },
  buttonContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: Theme.buttonHeight,
    backgroundColor: Theme.redButtonColor,
    width: "85%",
    shadowColor: 'black',
    shadowOpacity: 0.8,
    shadowOffset: { width: 2, height: 2 },
    elevation: 4
  },
  checkboxText: {
    paddingTop: 2,
    paddingLeft: 5,
    color: "grey",
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
  },
});

export default LoginScreen;
