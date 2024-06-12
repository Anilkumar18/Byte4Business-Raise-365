import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { showMessage } from "react-native-flash-message";
import Theme from "../utils";
import { url } from "../api/api";
import { userService } from "../Services/userService"

const ForgotPasswordScreen = (props) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forgotPassword = async () => {
    if (!email) {
      showMessage({
        message: "Please fill all fields",
        type: "danger",
      });
      setLoading(false)
      return
    }

    try {

      let payload = {
        email: email,
      }
      let resp = await userService.forgotPassword(payload);
      console.log("dssdsdsdsdsd", resp)
      setLoading(false)
      if (resp.status === 200) {
        showMessage({
          message: "Email has been sent your email",
          type: "success",
        });
      } else {

        showMessage({
          message: resp.error,
          type: "danger",
        });
        setLoading(false);
      }


    } catch (err) {
      console.log("Request Failed", err);
      if (err.response && err.response.data && err.response.data.error) {
        showMessage({
          message: err.response.data.error,
          type: "danger",
        });
      } else {
        showMessage({
          message: "Error! Please try again",
          type: "danger",
        });
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Nunito-Bold",
            fontSize: 24,
            marginTop: 15,
          }}
        >
          Forgot Password
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Nunito-Regular",
            fontSize: 14,
          }}
        >
          Enter your RAISE365 Account Email Address
        </Text>

        <Text
          style={{
            textAlign: "center",
            fontFamily: "Nunito-Regular",
            fontSize: 14,
            color: "red"
          }}
        >
          {error}
        </Text>
        <ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputStyle}
              placeholder="Email"
              value={email}
              autoCapitalize="none"
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setEmail(text);
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                await forgotPassword();
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      textAlign: "center",
                      fontFamily: "Nunito-Bold",
                    }}
                  >
                    Reset Password
                  </Text>
                )}
            </TouchableOpacity>
          </View>
          <View
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
              Did you remember your password?
            </Text>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
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
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bcbfc2',
  },
  splash: {
    width: "100%",
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#bcbfc2',
    // paddingBottom: hp("5%")
  },
  logo: {
    //position: "absolute",
    //top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
    // bottom: hp("5%"),
    height: "75%",
    width: "100%",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  inputStyle: {
    paddingLeft: 13,
    marginLeft: 10,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,

    borderRadius: 5,
  },
  inputContainer: {
    color: "#051533",
    marginTop: 20,
    alignSelf: "center",
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: Theme.textInputHeight,
    backgroundColor: "#ececec",
    width: "85%",
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
  },
  checkboxText: {
    paddingTop: 2,
    paddingLeft: 5,
    color: "grey",
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
  },
});

export default ForgotPasswordScreen;
