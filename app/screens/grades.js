import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import Theme from "../utils";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ImageLoad from 'react-native-image-placeholder';
import { utils } from "../Utils/utils";
import moment from 'moment'

import { extraApiService } from "../Services/extraApiService"
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const GradesScreen = (props) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const DATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "First Item",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571es9d72",
      title: "Third Item",
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53ybb28ba",
      title: "First Item",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbdd1aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3da1-d71f-bd96-145571e29d72",
      title: "Third Item",
    },
    {
      id: "bd7acbea-c1b1-4dc2-aed5-3ad53abb28ba",
      title: "First Item",
    },
    {
      id: "3dc68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3dd1-471f-bd96-145571e29d72",
      title: "Third Item",
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        let resp = await extraApiService.getLocationComments(props.route.params.data.id)

        setLoading(false)
        console.log("rrrrrrr", JSON.stringify(resp.data))

        setData(resp.data)
      } catch (error) {
        setLoading(false)
        console.log("eerrror", error)
        utils.checkAuthorized(error, props.navigation)
      }

    })();

  }, [])

  const renderItem = (comment) => {
    console.log("comments", JSON.stringify(comment))
    console.log("==========")
    const momentUpdated = moment(comment.item.updated)
    const updated = momentUpdated.isValid() ? momentUpdated.format('MM/DD/YYYY') : ''
    const grade = utils.calculateGrade(comment.item.rating)
    return (
      <TouchableOpacity
        key={comment.item.item_id}

      >
        <View style={styles.userInfoSection}>
          <View
            style={{
              flexDirection: "row",
              marginTop: 9,
            }}
          >

            <ImageLoad style={{
              width: 50,
              height: 50,
              borderRadius: 50,
            }}
              borderRadius={50}

              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: 50,
                height: 50,
                borderRadius: 50,
              }}
              source={comment.item.user_avatar ? { uri: comment.item.user_avatar } : require("../assets/user.png")}
            />

            <View
              style={{
                marginLeft: 15,
                marginRight: 30,
                flex: 1,
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: height * 0.02,
                      fontFamily: "Nunito-SemiBold",
                    }}
                    numberOfLines={2}
                  >
                    {comment.item.username}
                  </Text>
                </View>
                <Text>{updated}</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: height * 0.019,
                    color: "grey",
                    fontFamily: "Nunito-Regular",
                  }}
                >
                  {comment.item.text}
                </Text>
              </View>
            </View>

            <ImageBackground
              style={{
                width: 30,
                height: 36,
                // position: "absolute",
                // right: 10,
                // top: height * 0.018,
                // backgroundColor: 'yellow'
                marginRight: 10
              }}
              source={grade.badge}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 16,
                  textAlign: "center",
                  color: 'black',
                  marginTop: 5,
                }}
              >
                {grade.title}
              </Text>
            </ImageBackground>
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
      </TouchableOpacity>
    );
  };
  const averageGrade = utils.calculateGrade(props.route.params.data.rating)
  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={{ uri: props.route.params.data.photos && props.route.params.data.photos.length > 0 ? props.route.params.data.photos[0].url : null }}
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

      <View style={styles.viewBack}>
        {loading ? <ActivityIndicator color="#000" size="large" /> : <>
          <View
            style={{
              flexDirection: "row",
              width: width * 0.9,
              alignSelf: "center",
            }}
          >
            <ImageBackground
              style={{
                width: 42,
                height: height > 800 ? height * 0.06 : height * 0.08,
                justifyContent: "center",
              }}
              source={averageGrade.image}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 16,
                  color: 'black',
                  textAlign: "center",
                }}
              >
                {averageGrade.title}
              </Text>
            </ImageBackground>

            <Text
              style={{
                textAlign: "center",
                fontFamily: "Nunito-SemiBold",
                fontSize: height * 0.028,
                marginLeft: 10,
                marginTop: height * 0.022,
              }}
            >
              {data.length} Grades
          </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.pop();
              }}
            >
              <Image
                style={{
                  marginLeft: 10,
                  width: height * 0.02,
                  height: height * 0.02,
                  marginTop: height * 0.033,
                }}
                source={require("../assets/x.png")}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </>}
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
    width: width,
    height: height * 0.3,
    resizeMode: "cover",
  },
  userInfoSection: {
    paddingLeft: 10,
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),
    paddingBottom: 15,
  },

  viewBack: {
    backgroundColor: "#fff",
    bottom: height * 0.05,
    height: height * 0.75,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
});

export default GradesScreen;
