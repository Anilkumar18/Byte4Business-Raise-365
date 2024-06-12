import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Icon } from 'react-native-elements'
import Theme from "../utils";
import { extraApiService } from "../Services/extraApiService";
import { utils } from "../Utils/utils";


const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const FeedbackScreen = (props) => {
  const [message, setMessage] = useState("");
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true)


  useEffect(() => {
    (async () => {
      try {
        console.log("dsdsdds", props.route.params)
        let resp = await extraApiService.getAllMenuItem(props.route.params.locationId)
        setLoading(false)
        console.log("ddataaaa", JSON.stringify(resp.data))
        setData(resp.data)

      } catch (error) {
        console.log("erroro", error)
        setLoading(false);
        utils.checkAuthorized(error, props.navigation)
      }
    })();
  }, []);

  const clearSearch = () => {
    setMessage('')
  }

  const getImage = (images) => {
    var image = require("../assets/menuBasket.png");
    if (images.length > 0) {
      if (!images[0].is_video) {
        return { uri: images[0].image }
      }
    }
    return image
  }

  const renderItem = ({ item }) => {
    console.log("====item", item)

    if (!utils.normalizedSearchText(item.name, message) &&
      !utils.normalizedSearchText(item.description, message)
    ) {
      return null
    }

    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("productDetail", { data: item, locationId: props.route.params.locationId, rateProduct: true });
        }}
      >
        <View style={styles.userInfoSection}>
          <View
            style={{

              flexDirection: "row",
              padding: 15,
              paddingLeft: 0,
            }}
          >
            <Image
              style={{
                width: 30,
                height: 30,
                borderRadius: 50,
              }}
              source={getImage(item.images)}
            />
            <View>
              <Text
                style={{
                  fontSize: height * 0.02,
                  marginLeft: 10,
                  marginTop: height * 0.005,
                  fontFamily: "Nunito-Regular",
                  fontWeight: "bold"
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  marginLeft: 10,
                  marginTop: height * 0.005,
                  fontFamily: "Nunito-Regular",
                }}
              >
                {item.description}
              </Text>

            </View>
          </View>
          <View
            style={{
              height: 1,
              width: wp("92%"),
              backgroundColor: "#e5e5e5",
              alignSelf: "center",
            }}
          ></View>
        </View>
      </TouchableOpacity>
    );
  };

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
            fontSize: height * 0.035,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: height > 800 ? hp("10%") : hp("11%"),
            left: 20,
            color: "#fff",
          }}
        >
          Give us Feedback!
        </Text>
      </ImageBackground>
      <Text
        style={{
          fontFamily: "Nunito-Regular",
          fontSize: height * 0.017,
          color: "grey",
          textAlign: "center",
          marginTop: 15,
        }}
      >
        Select item to Rate
      </Text>
      <View
        style={{
          width: wp("90"),
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            height: height * 0.06,
            borderTopLeftRadius: 10,
            backgroundColor: "lightgrey",
            justifyContent: "center",
            borderTopRightRadius: 10,
            marginTop: 15,
          }}
        >
          <TouchableOpacity onPress={clearSearch}>

            {
              !message.trim() ? <Image
                style={{
                  width: height * 0.025,
                  height: height * 0.025,
                  marginTop: height * 0.016,
                  marginLeft: 10,
                }}
                source={require("../assets/searchBlackOutline.png")}
              /> :
                <Icon
                  name='close'
                  type='material-community'
                  size={height * 0.025}
                  color='#192641'
                  style={{
                    marginTop: height * 0.016,
                    marginLeft: 10,
                  }}
                />
            }
          </TouchableOpacity>
          <TextInput
            style={styles.inputSearchStyle}
            placeholder="Start typing a menu item name"
            value={message}
            placeholderTextColor="grey"
            onChangeText={(text) => {
              setMessage(text);
            }}
          />
        </View>
      </View>
      {isLoading ? <ActivityIndicator color="#000" size="large" /> : <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />}
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
    height: height * 0.18,
    resizeMode: "cover",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  image: {
    alignSelf: "center",
    marginTop: hp("2%"),
    width: wp("92%"),
    height: 120,
  },
  inputSearchStyle: {
    marginLeft: 10,
    padding: 7,
    width: wp("80%"),
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.02,

    borderRadius: 5,
  },
  userInfoSection: {
    width: wp("90"),
    alignSelf: "center",
  },
});

export default FeedbackScreen;
