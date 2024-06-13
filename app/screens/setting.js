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
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import IonIcon from "react-native-vector-icons/Ionicons";
import ToggleSwitch from "toggle-switch-react-native";

const SettingScreen = (props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [rewardToggle, setRewardToggle] = useState(false);
  const [emailToggle, setEmailToggle] = useState(false);
  const [pushToogle, setPushToogle] = useState(false);

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/topNew.png")}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack();
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
          Setting
        </Text>
      </ImageBackground>

      <View style={[styles.inputNameContainer, { flexDirection: "row" }]}>
        <Image
          style={{ width: 24, height: 24 }}
          source={require("../assets/user.png")}
        />
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("profile");
          }}
        >
          <Text style={styles.inputStyle}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 1,
          width: wp("85%"),
          backgroundColor: "#e6e6e6",
          alignSelf: "center",
          marginTop: 15,
        }}
      ></View>
      <View
        style={[
          styles.inputNameContainer,
          { flexDirection: "row", marginTop: 20 },
        ]}
      >
        <Image
          style={{ width: 24, height: 24 }}
          source={require("../assets/lock.png")}
        />
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("changePasssword");
          }}
        >
          <Text style={styles.inputStyle}>Change Password</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 1,
          width: wp("85%"),
          backgroundColor: "#e6e6e6",
          alignSelf: "center",
          marginTop: 15,
        }}
      ></View>
      <View
        style={[
          styles.inputNameContainer,
          {
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/bell.png")}
          />

          <Text style={styles.inputStyle}>Push Notifications</Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ToggleSwitch
            isOn={pushToogle}
            onColor={Theme.redButtonColor}
            offColor="grey"
            size="medium"
            onToggle={(isOn) => setPushToogle(isOn)}
          />
        </View>
      </View>
      <View
        style={[
          styles.inputNameContainer,
          {
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/gift.png")}
          />

          <Text style={styles.inputStyle}>Reward Messages</Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ToggleSwitch
            isOn={rewardToggle}
            onColor={Theme.redButtonColor}
            offColor="grey"
            size="medium"
            onToggle={(isOn) => setRewardToggle(isOn)}
          />
        </View>
      </View>
      <View
        style={[
          styles.inputNameContainer,
          {
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/file-text.png")}
          />

          <Text style={styles.inputStyle}>Email from Business</Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ToggleSwitch
            isOn={emailToggle}
            onColor={Theme.redButtonColor}
            offColor="grey"
            size="medium"
            onToggle={(isOn) => setEmailToggle(isOn)}
          />
        </View>
      </View>
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

    height: hp("20%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  logo: {
    position: "absolute",
    top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
    bottom: hp("5%"),
    height: hp("70%"),
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    paddingBottom: 50,
  },
  inputStyle: {
    marginLeft: 15,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 19,
  },
  inputContainer: {
    color: "#051533",
    marginTop: 20,
    alignSelf: "center",
    justifyContent: "center",
    height: Theme.textInputHeight,

    width: "85%",
  },
  inputNameContainer: {
    color: "#051533",
    marginTop: 30,
    alignSelf: "center",
    width: "90%",
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

export default SettingScreen;
