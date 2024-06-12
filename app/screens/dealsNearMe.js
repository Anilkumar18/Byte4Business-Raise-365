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
  Dimensions,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import _ from 'lodash'
import { extraApiService } from "../Services/extraApiService";
import { utils } from '../Utils/utils'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const DealsNearScreen = (props) => {

  const showFundraisers = props.route.params?.data?.show_type == 'fundraiser_near_me'
  
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')


  useEffect(() => {
    loadDeals()
  }, []);

  const loadDeals = async () => {
    try {
      const myLocation = await utils.getCurrentLocation()
      const payload = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        radius: props.route.params?.data?.radius || undefined 
      }

      let resp = showFundraisers ?
        await extraApiService.getFundraisersNearMe(payload) :
        await extraApiService.getDealsNearMe(payload)

      setLoading(false)
      console.log("deals near me", resp.data)
      setDeals(_.orderBy(resp.data, 'name'))

    } catch (error) {
      console.log("erroro", error.response)
      setLoading(false);
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const toggleSearch = () => {
    setSearching(!searching)
    setSearchText('')
  }

  const renderItem = ({ item, index }) => {

    if (searching &&
      !utils.normalizedSearchText(item.name, searchText) &&
      !_.some(item.rewards, reward => utils.normalizedSearchText(reward.name, searchText))
    ) {
      return null
    }

    return (
      <View key={item.id}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("dealsDetail", { data: item });
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
              <View style={{ justifyContent: "center", flex: 1, marginStart: 15 }}>
                <Text
                  style={{
                    fontFamily: "Nunito-SemiBold",
                    fontSize: 16,
                    color: "#fff",
                  }}
                >
                  {item.quantity == 0 ? "Unlimited" : item.quantity}
                </Text>
                <Text
                  style={{
                    fontFamily: "Nunito-SemiBold",
                    fontSize: height * 0.023,
                    color: "#fff",
                    overflow: "hidden"
                  }}
                >
                  {`(${item.rewards.length}) - ${item.name}`}
                </Text>
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

  const renderEmptyList = () => {
    const text = showFundraisers ? 'No fundraisers near me' : 'No deals near ne'
    return (
      <View style={{ paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Nunito-Italic",
            fontSize: 16,
            color: "#051533",
          }}
        >{text}</Text>
      </View>
    )
  }

  const title = showFundraisers ? 'Fundraisers Near Me ' : 'Deals Near Me'

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/nearBackground.png")}
      >
        <ImageBackground
          style={styles.splash}
          source={require("../assets/nearFrame.png")}
        >

          <View style={{
            flexDirection: 'row',
            width: wp("90%"),
            marginLeft: wp("5%"),
            justifyContent: "space-between",
            // alignItems: 'center',
            marginTop: Platform.OS === "ios" ? hp("5%") : hp("3%"),
          }}>

            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Image
                style={{
                  // marginTop: hp("5"),
                  // left: 20,
                }}
                source={require("../assets/back.png")}
              />
            </TouchableOpacity>

            <View style={{ minWidth: 32 }} />
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: wp("90%"),
            marginLeft: wp("5%"),
            marginTop: hp(2),
          }}>
            <View style={{ minWidth: 40 }} />

            {
              searching ?
                <TextInput
                  style={{
                    fontSize: height * 0.032,
                    fontFamily: "Nunito-Bold",
                    color: "#fff",
                    borderBottomColor: '#fff',
                    borderBottomWidth: 0.5,
                    flex: 1,
                    marginHorizontal: 20,
                    textAlign: 'center'
                  }}
                  autoFocus
                  autoCorrect={false}
                  value={searchText}
                  onChangeText={setSearchText}
                /> :
                <Text
                  style={{
                    fontSize: height * 0.032,
                    fontFamily: "Nunito-Bold",
                    color: "#fff",
                  }}
                >{title}</Text>
            }

            {
              loading ?
                <View style={{ minWidth: 40 }} /> : (
                  <TouchableOpacity onPress={toggleSearch}>
                    {
                      searching ?
                        <Image
                          style={{ height: 40, width: 40 }}
                          source={require("../assets/close.png")}
                        /> :
                        <Image
                          style={{ height: 40, width: 40 }}
                          source={require("../assets/search.png")}
                        />
                    }
                  </TouchableOpacity>
                )
            }
          </View>
        </ImageBackground>
      </ImageBackground>

      {
        loading ?
          <ActivityIndicator
            color="#051533"
            size="large"
          />
          : <FlatList
            data={deals}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${index}`}
            ListEmptyComponent={renderEmptyList}
          />
      }
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
    height: height * 0.2,
  },
  image: {
    alignSelf: "center",
    marginTop: hp("2%"),
    width: width * 0.9,
    padding: 5,
    // height: width * 0.8 * 0.35,
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
    // height: Theme.textInputHeight,
    backgroundColor: "#ececec",
    width: "85%",
  },
});

export default DealsNearScreen;
