import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TextInputMask } from 'react-native-masked-text'
//import ImagePicker from "react-native-image-picker";
import { launchImageLibrary } from 'react-native-image-picker';
import Theme from "../utils";
import QRCode from 'react-native-qrcode-svg'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { url } from "../api/api";
import { userService } from "../Services/userService";
import ImageLoad from 'react-native-image-placeholder';
import { Icon, Avatar } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share'

import _ from 'lodash'
import { extraApiService } from "../Services/extraApiService";
import { utils } from "../Utils/utils";


const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const ProfileScreen = (props) => {
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState(false);
  const [avatar, setAvatar] = useState(null);
  // const [serverImage, setServerImage] = useState(null);
  // const [team, setTeam] = useState(null)
  // const [selectedTeam, setSelectedTeam] = useState(null)
  // const [sharelink, setShareLink] = useState('')

  // const [teams, setTeams] = useState([])
  // const [preparingShareContent, setPreparingShareContent] = useState(false)
  // const [qrCodeVisible, setQrCodeVisible] = useState(false)
  // const [error, setError] = useState(false)

  let birthdayRef = React.createRef();

  const USER_KEY = "USER";
  const USER_TOKEN = "TOKEN";

  useEffect(() => {
    (async () => {

      try {
        const token = await AsyncStorage.getItem(USER_TOKEN);
        console.log("token", token)
        const userfirst_name = await AsyncStorage.getItem("@first_name");
        const userlast_name = await AsyncStorage.getItem("@last_name");
        const username = await AsyncStorage.getItem("@username");
        const email = await AsyncStorage.getItem("@email");
        const userbirthday = await AsyncStorage.getItem("@birthday");
        const userzip = await AsyncStorage.getItem("@zip");
        const userphone = await AsyncStorage.getItem("@phone");
        const userimage = await AsyncStorage.getItem("@picture");
        // const team = await AsyncStorage.getItem("@fundraiser_type_id");
        // const sharelink = await AsyncStorage.getItem('@sharelink')

        console.log("userImage", userimage)
        setAvatar(JSON.parse(userimage));
        console.log(userfirst_name);
        setFirstName(JSON.parse(userfirst_name));
        setLastName(JSON.parse(userlast_name));
        setUsername(JSON.parse(username));
        setEmail(JSON.parse(email));
        setBirthday(JSON.parse(userbirthday));
        setZipCode(JSON.parse(userzip));
        setPhone(JSON.parse(userphone));
        // setTeam(JSON.parse(team));
        // setSelectedTeam(JSON.parse(team));
        setToken(JSON.parse(token));
        // setShareLink(JSON.parse(sharelink));

        // const resp = await extraApiService.getAllFundraiserGroups()
        // console.log('extraApiService.searchFundraiser response', resp.data)
        // setTeams(resp.data)

        setLoading(false);
      }
      catch (error) {
        setLoading(false);
        utils.checkAuthorized(error, props.navigation)
      }
    })();
  }, []);

  const signUpError = (message) => {
    setLoading(false);
    showMessage({ message: message, type: "danger" });
    return;
  };

  const validate = () => {
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

  const updateProfile = async () => {
    if (!firstName || !lastName || !phone) {
      signUpError("Please fill all fields");
      return;
    }

    if (!validate()) {
      return
    }

    try {
      let creds = {
        access_token: token,
        first_name: firstName,
        last_name: lastName,
        zip: zipCode,
        birthday: birthday,
        // username: username,
        phone: phone,
        // fundraiser_type_id: selectedTeam
      }

      console.log("payload", creds)
      let resp = await userService.updateProfile(creds);
      console.log("response", resp.data)
      setLoading(false);
      let data = resp.data
      if (data.status === "success") {
        setLoading(false);
        // setTeam(selectedTeam)
        console.log("Update Profile Responce: ", data);
        showMessage({
          message: "Your profile has been updated.",
          type: "success",
        });

        // !! READ ONLY !!
        // AsyncStorage.setItem("@username", JSON.stringify(username));
        AsyncStorage.setItem("@phone", JSON.stringify(phone));

        AsyncStorage.setItem("@first_name", JSON.stringify(firstName));
        AsyncStorage.setItem("@last_name", JSON.stringify(lastName));
        AsyncStorage.setItem("@zip", JSON.stringify(zipCode));
        AsyncStorage.setItem("@birthday", JSON.stringify(birthday));
        // AsyncStorage.setItem("@fundraiser_type_id", JSON.stringify(selectedTeam));
        AsyncStorage.setItem("@sharelink", JSON.stringify(data.sharelink));
        AsyncStorage.setItem("@leaderboard", JSON.stringify(data.leaderboard));
      }

    } catch (err) {
      console.log("Request Not Founding:", JSON.stringify(err));

      if (err && err.response && err.response.data) {

        let data = err.response.data
        if (data.errors) {
          if (data.errors.username) {
            signUpError("username " + data.errors.username + " ");
            setLoading(false);
            return;
          } else if (data.errors.email) {
            signUpError("email " + data.errors.email + " ");
            setLoading(false);
            return;
          } else if (data.errors.phone) {
            signUpError(data.errors.phone + " ");
            setLoading(false);
            return;
          } else if (data.errors.zip) {
            signUpError("zip " + data.errors.zip + " ");
            setLoading(false);
            return;
          } else if (data.errors.birthday) {
            signUpError("birthday " + data.errors.birthday + " ");
            setLoading(false);
            return;
          } else if (data.errors.password) {
            signUpError("password " + data.errors.password + " ");
            setLoading(false);
            return;
          }
        }
        signUpError(data.error);

      } else {
        signUpError("Profile Failed Catch! Please try again");
      }
      setLoading(false);
    }
  };

  const updateImage = async (uploadData, oldAvatar) => {
    console.log("uploadData", uploadData)

    const data = new FormData();
    data.append("access_token", token);
    data.append("avatar", uploadData);

    try {
      setUploading(true)
      console.log("userService.updateAvatar", data)
      var resp = await userService.updateAvatar(data)
      setUploading(false)
      console.log("userService.updateAvatar", resp.data)

      if (resp.data.avatar) {
        AsyncStorage.setItem("@picture", JSON.stringify(resp.data.avatar));
        setAvatar(resp.data.avatar);
        showMessage({
          message: "Profile image has been changed.",
          type: "success",
        });
      }

    } catch (err) {
      console.log("errorim", err)
      setAvatar(oldAvatar)
      setUploading(false);
      if (err.response && err.response.data && err.response.error) {
        signUpError(err.response.error);
      } else {
        signUpError("Image Failed Catch! Please try again");

      }
    }
  };

  const options = {
    title: "Select Avatar",
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
    noData: true,
    maxWidth: 300,
    maxHeight: 300
  };
   const addImage = () => {
      const options = {
        title: 'Select Avatar',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
          showMessage({
            type: 'warning',
            message: response.error
          });
        } else {
          console.log("Response:", response);
          const uri = Platform.OS === "android" ? response.assets[0].uri : response.assets[0].uri.replace("file://", "");
          const fileName = _.last(uri.split('/'));
          console.log('fileName', fileName);
          const uploadData = {
            uri,
            type: response.assets[0].type,
            name: fileName
          };
          console.log("Upload Data:", uploadData);
          const oldAvatar = avatar;
          setAvatar(uri);
          Alert.alert(
            "Profile Image",
            "Are you sure to update image?",
            [
              {
                text: "Cancel",
                onPress: () => setAvatar(oldAvatar),
                style: "cancel",
              },
              {
                text: "OK",
                onPress: () => updateImage(uploadData, oldAvatar)
              },
            ],
            { cancelable: false }
          );
        }
      });
    };

  const renderFileData = () => {

    if (uploading) {
      return (
        <ActivityIndicator
          style={{
            backgroundColor: 'darkgray',
            alignItems: 'center',
            justifyContent: 'center',
            ...styles.uploadImage
          }}
          size="large"
          color="#fff"
        />
      );
    }

    return (
      <Avatar
        rounded
        size={width * 0.2}
        source={{ uri: avatar ? avatar : undefined }}
        title={(firstName || lastName) && utils.getInitials(`${firstName} ${lastName}`)}
        containerStyle={{
          backgroundColor: 'darkgray',
        }}
      />
    )
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      // keyboardVerticalOffset={20}
      style={styles.container}
    >
      <TouchableWithoutFeedback
        style={{
          flex: 1,
          backgroundColor: 'white'
        }}
        onPress={Keyboard.dismiss}
      >
        <View style={styles.container} >
          <ImageBackground
            style={styles.splash}
            source={require("../assets/top.png")}
          >
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Image
                resizeMode="cover"
                overflow="visible"
                style={{
                  marginTop: hp("5"),
                  left: 20,
                }}
                source={require("../assets/back.png")}
              />
            </TouchableOpacity>
            <View
              style={{
                position: "absolute",
                top: hp("12%"),
                left: 20,
                flexDirection: "row",
              }}
            >
              {renderFileData()}

              <TouchableOpacity
                onPress={() => {
                  addImage();
                }}
              >
                <Image
                  style={{ marginTop: 25, marginLeft: 15 }}
                  source={require("../assets/camera.png")}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Nunito-Bold",
                position: "absolute",
                top: hp("24%"),
                left: 20,
                color: "#fff",
              }}
            >
              {firstName} {lastName}
            </Text>
          </ImageBackground>

          {loading ? (
            <ActivityIndicator
              style={{
                justifyContent: "center",
                marginTop: "50%",
              }}
              size="large"
              color="#000"
            />
          ) : (
            <ScrollView>
              <View
                style={[
                  styles.inputNameContainer,
                  { flexDirection: "row", justifyContent: "space-between" },
                ]}
              >
                <View
                  style={[
                    styles.inputContainer,
                    { width: wp("41%"), marginTop: 0 },
                  ]}
                >
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="First Name"
                    value={firstName}
                    placeholderTextColor="grey"
                    onChangeText={(text) => {
                      setFirstName(text);
                    }}
                  />
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    { width: wp("41%"), marginTop: 0 },
                  ]}
                >
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Last Name"
                    value={lastName}
                    placeholderTextColor="grey"
                    onChangeText={(text) => {
                      setLastName(text);
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInputMask
                  ref={birthdayRef}
                  type='datetime'
                  options={{
                    format: 'MM/DD/YYYY'
                  }}
                  style={styles.inputStyle}
                  placeholder="Birthday"
                  value={birthday}
                  autoCapitalize="none"
                  placeholderTextColor="grey"
                  onChangeText={setBirthday}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Zip Code"
                  value={zipCode}
                  autoCapitalize="none"
                  placeholderTextColor="grey"
                  onChangeText={(text) => {
                    setZipCode(text);
                  }}
                />
              </View>
              <View style={{
                ...styles.inputContainer,
                backgroundColor: 'lightgray'
              }}>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="E-mail"
                  value={email}
                  autoCapitalize="none"
                  placeholderTextColor="grey"
                  editable={false}
                />
              </View>
              <View style={{
                ...styles.inputContainer,
                // backgroundColor: 'lightgray'
              }}>
                <TextInputMask
                  type='custom'
                  options={{ mask: '(999) 999-9999' }}
                  style={styles.inputStyle}
                  placeholder="Phone #"
                  value={phone}
                  onChangeText={setPhone}
                  autoCapitalize="none"
                  keyboardType='numeric'
                  placeholderTextColor="grey"
                // editable={false}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setLoading(true);
                    updateProfile();
                  }}
                  disabled={loading}
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
                      Submit Change
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    height: hp("30%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  logo: {
    //position: "absolute",
    //top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
    bottom: hp("5%"),
    height: hp("70%"),
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    //paddingBottom: 50,
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
  inputNameContainer: {
    color: "#051533",
    marginTop: 20,
    alignSelf: "center",
    justifyContent: "center",
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
  uploadImage: {
    width: width * 0.2,
    height: width * 0.2 * 1,
    borderRadius: 50,
  },
});

export default ProfileScreen;
