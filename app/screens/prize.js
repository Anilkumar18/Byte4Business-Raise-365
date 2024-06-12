import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const PrizeScreen = (props) => {
  const [currentPassword, setCurrentPasssword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [newHidePassword, setNewHidePassword] = useState(true);
  const [tabIndex, setTabIndex] = React.useState(0);

  const DATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      number: "10",
      title: "This is awesome deal",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      number: "11",
      title: "Deal only for you",
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571e29d72",
      number: "12",
      title: "Dog Gromming",
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("dealsDetail");
          }}
        >
          <ImageBackground
            resizeMode="cover"
            style={styles.image}
            source={require("../assets/subtract.png")}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ justifyContent: "center" }}>
                <Text
                  style={{
                    fontFamily: "Nunito-SemiBold",
                    fontSize: height * 0.017,
                    width: width * 0.55,
                    marginLeft: 10,
                    color: "#fff",
                  }}
                >
                  Buy two entrees free bowl queso el chiko TXK
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontFamily: "Nunito-SemiBold",
                      fontSize: height * 0.02,
                      marginLeft: 10,
                      marginTop: 10,
                      color: "#FFCB00",
                    }}
                  >
                    200 points
                  </Text>
                  <Image
                    style={{ marginTop: 10, marginLeft: 20 }}
                    source={require("../assets/redeem.png")}
                  />
                </View>
              </View>
              <Image
                style={{
                  width: width * 0.25,
                  height: width * 0.25 * 0.85,
                  marginTop: 15,
                }}
                source={require("../assets/nearGift.png")}
              />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/background.png")}
      >
        <ImageBackground
          style={styles.splash}
          source={require("../assets/backgroundFrame.png")}
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
          <View style={{ alignSelf: "center" }}>
            <Text
              style={{
                fontSize: height * 0.025,
                fontFamily: "Nunito-Bold",

                top: height * 0.14,

                color: "#fff",
              }}
            >
              Users Total Reward Points
            </Text>
            <View style={{ alignSelf: "center" }}>
              <Text
                style={{
                  fontSize: height * 0.02,
                  width: width * 0.2,
                  height: height * 0.03,
                  top: height * 0.15,
                  fontFamily: "Nunito-Bold",
                  backgroundColor: "#fff",
                  textAlign: "center",
                  borderRadius: 50,
                }}
              >
                800
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ImageBackground>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  splash: {
    width: width,
    height: height > 800 ? height * 0.25 : height * 0.29,
  },
  image: {
    alignSelf: "center",
    marginTop: hp("2%"),
    width: width * 0.9,
    height: width * 0.8 * 0.35,
    overflow: "hidden",
  },

  inputStyle: {
    paddingLeft: 13,
    marginLeft: 10,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,

    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: 32,
    width: "49%",
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

export default PrizeScreen;
