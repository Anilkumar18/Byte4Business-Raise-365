import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import DropDownItem from "react-native-drop-down-item";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const FaqScreen = (props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [itemid, setItemid] = useState("");
  const [visible, setVisible] = useState(false);

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
      </ImageBackground>
      <Text
        style={{
          fontFamily: "Nunito-Bold",
          fontSize: height * 0.028,
          width: width * 0.85,
          alignSelf: "center",
          marginTop: 20,
        }}
      >
        Can i login with my phone number?
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: "lightgrey",
          width: width * 0.85,
          marginTop: 20,
          alignSelf: "center",
        }}
      ></View>
      <Text style={styles.text}>
        Yes you can login to the BYTE app using the following ways.
      </Text>
      <Text style={[styles.text, { marginTop: 20 }]}>1- Email / Password</Text>
      <Text style={styles.text}>2- Username / Password</Text>
      <Text style={styles.text}>3- Phone number / Password</Text>
      <Text style={[styles.text, { marginTop: 25 }]}>
        Note: You need to make sure have added phone number in your profile
        section.
      </Text>
      <Text style={[styles.text, { marginTop: 5, color: "grey" }]}>
        ~Mike Little - January 29, 2019~
      </Text>
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
    height: height * 0.15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  text: {
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.018,
    width: width * 0.85,
    alignSelf: "center",
    marginTop: 10,
  },
  line: {
    backgroundColor: "lightgrey",
    height: 1,
    width: width * 0.85,
    alignSelf: "center",
  },
});

export default FaqScreen;
