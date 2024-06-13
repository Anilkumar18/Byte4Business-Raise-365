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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckBox from "react-native-check-box";
import { TextInputMask } from 'react-native-masked-text'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userService } from "../Services/userService"

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StackActions } from "@react-navigation/native";
import Theme from "../utils";
import { showMessage } from "react-native-flash-message";
import IonIcon from "react-native-vector-icons/Ionicons";
import { url } from "../api/api";
import { useNavigation } from "@react-navigation/native";

const SignUpScreen = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [joinTeamChecked, setJoinTeamChecked] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  let firstNameRef = React.createRef();
  let lastNameRef = React.createRef();
  let usernameRef = React.createRef();
  let emailRef = React.createRef();
  let passwordRef = React.createRef();
  let birthdayRef = React.createRef();
  let zipCodeRef = React.createRef();
  let phoneRef = React.createRef();

  const signUpError = (message) => {
    setLoading(false);
    showMessage({ message: message, type: "danger" });
    return;
  };

  const validate = () => {
    let reg = /^\w+([\.\-\+]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
      console.log("Email is Not Correct");
      setLoading(false);
      showMessage({ message: "Email is Not Correct", type: "danger" });
      return false;
    }

     if (!!birthday) {
       if (birthday.length < 10 || !birthdayRef.current.isValid()) {
         console.log("Birth date is invalid");
         setLoading(false);
         showMessage({ message: "Birth date is invalid", type: "danger" });
         return false;
       }
     }

    return true;
  };

  const onSignUpSuccess = ({
    id = '',
    access_token = '',
    first_name = '',
    last_name = '',
    get_avatar = '',
    fundraiser_type_id = null,
    userLoggedIn = true,
    leaderboard = '',
    sharelink = '',
    restaurant_type = '',
    payment_method = []
  }) => {

    console.log('storing user data...');

    AsyncStorage.setItem("@id", JSON.stringify(id));
    AsyncStorage.setItem("@email", JSON.stringify(email));
    AsyncStorage.setItem("@username", JSON.stringify(username));
    AsyncStorage.setItem("@first_name", JSON.stringify(first_name));
    AsyncStorage.setItem("@last_name", JSON.stringify(last_name));
    AsyncStorage.setItem("@zip", JSON.stringify(zipCode));
    AsyncStorage.setItem("@phone", JSON.stringify(phone));
    AsyncStorage.setItem("@birthday", JSON.stringify(birthday));
    AsyncStorage.setItem("@picture", JSON.stringify(get_avatar));
    AsyncStorage.setItem("@fundraiser_role", JSON.stringify('None'));
    AsyncStorage.setItem("@restaurant_type", JSON.stringify(restaurant_type));
    AsyncStorage.setItem("@fundraiser_type_id", JSON.stringify(fundraiser_type_id));
    AsyncStorage.setItem("@leaderboard", JSON.stringify(leaderboard));
    AsyncStorage.setItem("@sharelink", JSON.stringify(sharelink));
    AsyncStorage.setItem("@isRemember", JSON.stringify(userLoggedIn));
    AsyncStorage.setItem("@payment_method", JSON.stringify(payment_method));
    AsyncStorage.setItem('@cart', JSON.stringify({ business: {}, items: [] }))
    AsyncStorage.setItem("TOKEN", JSON.stringify(access_token));

    console.log('navigating to home screen...');

    const navOptions = joinTeamChecked ? { screen: 'userFundraiser', } : undefined
    
    navigation.dispatch(StackActions.replace("tabs", navOptions));
  }

  const signUp = async () => {
    if (!firstName || !lastName || !phone || !email || !password) {
      signUpError("Please fill all fields");
      return;
    }
    if (!validate()) {
      return;
    }

    let creds = {
      username: email,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: email,
      password: password,
       zip: zipCode,
       birthday: birthday,
    }

    console.log("resprttt", creds)

    try {
      let resp = await userService.register(creds)
      setLoading(false);

      if (resp.status === 200) {
        var data = resp.data;
        if (data.status === "success") {
          console.log("Sign Up Responce: ", resp);
          showMessage({ message: "Signup Success", type: "success" });
          onSignUpSuccess({
            ...data,
            first_name: firstName,
            last_name: lastName,
          })
        }

      }
    } catch (err) {
      setLoading(false);
      console.log("Request Not Founding:", JSON.stringify(err));

      if (err.response && err.response.data) {
        let data = err.response.data
        if (data.errors.username) {
          signUpError("username " + data.errors.username + " ");
          return;
        } else if (data.errors.email) {
          signUpError("email " + data.errors.email + " ");
          return;
        } else if (data.errors.phone) {
          signUpError(data.errors.phone + " ");
          return;
        } else if (data.errors.zip) {
          signUpError("zip " + data.errors.zip + " ");
          return;
        } else if (data.errors.birthday) {
          signUpError("birthday " + data.errors.birthday + " ");
          return;
        } else if (data.errors.password) {
          signUpError("password " + data.errors.password + " ");
          return;
        }
      } else {
        signUpError("Signup Failed Catch! Please try again");

      }

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

        <View style={{
          marginVertical: 20
        }}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Nunito-Bold",
              fontSize: 24,
              marginTop: 15,
            }}
          >SIGN UP</Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Nunito-regular",
              fontSize: 20,
            }}
          >TO CREATE ACCOUNT</Text>
        </View>

        <KeyboardAwareScrollView enableOnAndroid={true} contentContainerStyle={{
          paddingBottom: 20
        }}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={firstNameRef}
              style={styles.inputStyle}
              placeholder="First Name"
              value={firstName}
              autoCapitalize="none"
              autoFocus={true}
              blurOnSubmit={false}
              // @ts-ignore
              onSubmitEditing={() => lastNameRef.current.focus()}
              returnKeyType="next"
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setFirstName(text);
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={lastNameRef}
              style={styles.inputStyle}
              placeholder="Last Name"
              value={lastName}
              autoCapitalize="none"
               autoFocus={true}
              blurOnSubmit={false}
              // @ts-ignore
              onSubmitEditing={() => phoneRef.current?.getElement().focus()}
              returnKeyType="next"
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setLastName(text);
              }}
            />
          </View>
          { <View style={styles.inputContainer}>
            <TextInput
              ref={usernameRef}
              style={styles.inputStyle}
              placeholder="Username"
              value={username}
              autoCapitalize="none"
              autoFocus={true}
              blurOnSubmit={false}
              // @ts-ignore
              onSubmitEditing={() => emailRef.current.focus()}
              returnKeyType="next"
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setUsername(text);
              }}
            />
          </View> }

          <View style={styles.inputContainer}>
            <TextInputMask
              ref={phoneRef}
              type='custom'
              options={{ mask: '(999) 999-9999' }}
              style={styles.inputStyle}
              placeholder="Phone #"
              value={phone}
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="none"
              // @ts-ignore
              onSubmitEditing={() => emailRef.current.focus()}
              keyboardType='numeric'
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setPhone(text);
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={emailRef}
              style={styles.inputStyle}
              placeholder="Email Address"
              value={email}
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="none"
              // @ts-ignore
              onSubmitEditing={() => passwordRef.current?.focus()}
              keyboardType={"email-address"}
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setEmail(text);
              }}
            />
          </View>
          {/* <View style={styles.inputContainer}>
            <TextInputMask
              ref={birthdayRef}
              type='datetime'
              options={{ format: 'MM/DD/YYYY' }}
              style={styles.inputStyle}
              placeholder="Birthday (03/17/1987)"
              value={birthday}
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="none"
              // @ts-ignore
              onSubmitEditing={() => zipCodeRef.current.focus()}
              keyboardType='numeric'
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setBirthday(text);
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={zipCodeRef}
              style={styles.inputStyle}
              placeholder="Zip Code: Min 5 digit"
              value={zipCode}
              blurOnSubmit={false}
              returnKeyType="next"
              autoCapitalize="none"
              maxLength={5}
              // @ts-ignore
              onSubmitEditing={() => passwordRef.current.focus()}
              keyboardType='numeric'
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setZipCode(text);
              }}
            />
          </View> */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={passwordRef}
              style={styles.inputStyle}
              placeholder="Create Password"
              value={password}
              autoCapitalize="none"
              returnKeyType="done"
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
                size={20}
              />
            ) : (
              <IonIcon
                onPress={() => {
                  setHidePassword(true);
                }}
                 style={{ position: "absolute", right: 12, top: 12 }}
                name="eye-off-outline"
                color="#000"
                size={20}
              />
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              width: wp("85%"),
              alignSelf: "center",
              justifyContent: "center",
              alignItems: 'center',
              marginTop: 25,
            }}
          >
            <View style={{
              flex: 1,
              flexDirection: "row",
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckBox
                 style={styles.checkbox}
                onClick={() => setJoinTeamChecked(!joinTeamChecked)}
                isChecked={joinTeamChecked}
                checkedCheckBoxColor="#000"
                checkBoxColor="#000"
              />
              <View>
                <Text style={styles.checkboxText}>Join a Fundraiser Team?</Text>
                <Text style={styles.checkboxText}>Admins and Participants Only</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                signUp();
              }}
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
                >SIGN UP</Text>
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
                paddingBottom: 10,
                textAlign: "center",
                fontFamily: "Nunito-Regular",
              }}
            >
              I have an already account?
            </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("login");
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
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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
     paddingBottom: hp("5%")
  },
  logo: {
    position: "absolute",
    top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
    height: "75%",
    width: "100%",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    paddingBottom: 50,
  },
  inputStyle: {
     paddingLeft: 13,
    marginHorizontal: 10,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,

    borderRadius: 5,
    flex: 1,
  },
  inputContainer: {
    color: "#051533",
    marginBottom: 10,
    alignSelf: "center",
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 15,
     borderTopLeftRadius: 8,
     borderTopRightRadius: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.redButtonColor,
    height: Theme.textInputHeight,
    justifyContent: "flex-start",
    alignItems: 'center',
    flexDirection: 'row',
     height: 40,
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
    shadowColor: 'black',
    shadowOpacity: 0.8,
    shadowOffset: { width: 2, height: 2 },
    elevation: 4
  },
  checkboxText: {
    paddingTop: 2,
    paddingLeft: 5,
    color: "black",
    fontSize: 14,
    fontFamily: "Nunito-regular",
  },
});

export default SignUpScreen;
