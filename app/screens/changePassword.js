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
  Platform,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import { showMessage } from "react-native-flash-message";
import { userService } from '../Services/userService'
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePasswordScreen = (props) => {
  const [newPassword, setNewPasssword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideNewPasswordConfirmation, setHideNewPasswordConfirmation] = useState(true);

  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {

    if (!newPassword.trim() || !newPasswordConfirmation.trim()) {
      showMessage({
        type: 'warning',
        message: 'Please fill all fields'
      })
      return
    }

    if (newPassword.length < 6) {
      showMessage({
        type: 'warning',
        message: 'Password must be at least 6 characters'
      })
      return
    }

    if (newPassword != newPasswordConfirmation) {
      showMessage({
        type: 'warning',
        message: 'Passwords do not match'
      })
      return
    }

    try {

      setSubmitting(true)

      const access_token = JSON.parse(await AsyncStorage.getItem('TOKEN'))

      const payload = {
        access_token,
        password: newPassword
      }

      const resp = await userService.updatePassword(payload)
      console.log('userService.updatePassword', resp.data);

      setSubmitting(false)

      if (resp.data.status != 'success') {
        showMessage({
          type: 'danger',
          message: `Could not change your password${resp.data.errors ? ': ' + resp.data.errors.password.join() : ''}`
        })
      } else {

        showMessage({
          type: 'success',
          message: 'Your password has changed'
        })

        AsyncStorage.setItem('TOKEN', JSON.stringify(resp.data.access_token));

        setNewPasssword('')
        setNewPasswordConfirmation('')

        props.navigation.goBack()
      }
    }
    catch (error) {
      console.log('onSubmit error', error);
      setSubmitting(false)
      showMessage({
        type: 'danger',
        message: 'Could not process your request at this time. Please try again later.'
      })
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/topNew.png")}
      >
        <TouchableOpacity
          onPress={() => {
            if (!submitting) {
              props.navigation.goBack();
            }
          }}
        >
          <Image
            style={{
              marginTop: hp("5"),
              left: 20,
            }}
            source={require("../assets/back.png")}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 30,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: hp("12%"),
            left: 20,
            color: "#fff",
          }}
        >
          Change Password
        </Text>
      </ImageBackground>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          placeholder="New Password"
          value={newPassword}
          secureTextEntry={hideNewPassword}
          placeholderTextColor="grey"
          onChangeText={(text) => {
            setNewPasssword(text);
          }}
        />
        {hideNewPassword ? (
          <IonIcon
            onPress={() => {
              setHideNewPassword(false);
            }}
            style={{ position: "absolute", right: 14, top: 13 }}
            name="eye"
            color="#000"
            size={20}
          />
        ) : (
            <IonIcon
              onPress={() => {
                setHideNewPassword(true);
              }}
              style={{ position: "absolute", right: 12, top: 13 }}
              name="eye-off"
              color="#000"
              size={20}
            />
          )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          placeholder="Retype New Password"
          value={newPasswordConfirmation}
          secureTextEntry={hideNewPasswordConfirmation}
          placeholderTextColor="grey"
          onChangeText={(text) => {
            setNewPasswordConfirmation(text);
          }}
        />
        {hideNewPasswordConfirmation ? (
          <IonIcon
            onPress={() => {
              setHideNewPasswordConfirmation(false);
            }}
            style={{ position: "absolute", right: 14, top: 13 }}
            name="eye"
            color="#000"
            size={20}
          />
        ) : (
            <IonIcon
              onPress={() => {
                setHideNewPasswordConfirmation(true);
              }}
              style={{ position: "absolute", right: 12, top: 13 }}
              name="eye-off"
              color="#000"
              size={20}
            />
          )}
      </View>

      <TouchableOpacity onPress={onSubmit}>
        <View style={styles.buttonContainer}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {submitting ? <ActivityIndicator color='white' /> : null}
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
                marginLeft: submitting ? 15 : 0
              }}
            >
              Submit
          </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    height: hp("20%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
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
});

export default ChangePasswordScreen;
