import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import { extraApiService } from "../Services/extraApiService";
import ImageLoad from 'react-native-image-placeholder';
import { utils } from "../Utils/utils"
import { showMessage } from "react-native-flash-message";
import _ from 'lodash'
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const NearbySearchedScreen = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocations, setMyLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState({})
  // console.log('NEARBY SEARCHED PARAMS', props.route.params);
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
      id: "58694a0f-3da1-471f-bd96-145571e29d72",
      title: "Third Item",
    },
  ];

  const fetchData = async (data, isForSearch) => {

    try {

      const myLocation = await utils.getCurrentLocation()

      setCurrentLocation(myLocation)

      let payload = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        zip: "",
        radius: 20,

      }
      if (isForSearch) {
        payload.tags = [
          {
            "name": data,
            "type": "search"
          }
        ]
      } else {
        payload.tags = [
          {
            "name": data.name || data,
            "type": data.type || "location"
          }
        ]
      }

      setLoading(true)

      let resp = await extraApiService.getLocalBusinesses(payload);
      console.log("getLocalBusinesses", resp.data)

      let myLocationsResponse = await extraApiService.getLocationForCustomer()
      console.log('getLocationForCustomer', myLocationsResponse.data);

      setData(
        _.orderBy(resp.data,
          location => utils.calculateDistance(
            location.latitude,
            location.longitude,
            'ABS',
            myLocation.latitude,
            myLocation.longitude
          )
        )
      )

      setMyLocations(myLocationsResponse.data)

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log("eeror", error)
      utils.checkAuthorized(error, props.navigation)

    }

  }




  useEffect(() => {
    (async () => {

      if (props.route.params && props.route.params.tag) {
        await fetchData(props.route.params.tag)
        console.log("Dsdsdsds", props.route.params.tag)
      } else {
        await fetchData(props.route.params.query, true)

      }

    })();
  }, []);

  const onUpdateBusiness = (business, diff) => {
    console.log('updating business..', business, diff);
    const updatedBusiness = { ...business, ...diff }
    setData(_.map(data, b => b.id == business.id ? updatedBusiness : b))
  }

  const onToggleLocation = async item => {

    const toggleValue = !_.find(myLocations, locationId => locationId == item.id)

    try {

      const resp = await extraApiService.addLocationToCustomer(item, toggleValue)

      showMessage({
        type: 'success',
        message: `Location ${toggleValue ? 'added' : 'removed'}`
      })

      setMyLocations(_.xorBy(myLocations, [item.id], v => `${v}`))
    }
    catch (error) {
      console.log('toggle location error', error);
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const renderCuisineTypes = (items) => {
    let content = ""
    for (var item of items) {
      if (content) {
        content = content + ", " + item.name

      } else {
        content = item.name

      }
    }
    return content
  }

  const renderItem = ({ item }) => {
    const isMyLocation = _.find(myLocations, locationId => locationId == item.id)

    return (
      // <View style={styles.userInfoSection} key={item.id}>

      // </View>
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          props.navigation.navigate("merchantDetail", { data: item, onUpdateBusiness });
        }}
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 8,
          marginHorizontal: 10,
          paddingVertical: 5,
          marginTop: 5
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            marginHorizontal: 10

          }}
        >
          <ImageLoad style={{
            width: 70,
            height: 70,
            // borderRadius: 50,
          }}
            // borderRadius={50}

            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 70,
              height: 70,
              // borderRadius: 50,
            }}
            resizeMode='contain'
            source={item.logo ? { uri: item.logo } : require("../assets/pizza.png")}
          />

          <View
            style={{
              marginLeft: 15,
              flex: 1
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: "Nunito-SemiBold" }}>
              {item.name}

            </Text>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <Image
                    style={{ width: 10, height: 10, alignSelf: "center" }}
                    source={require("../assets/award.png")}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      marginLeft: 5,
                      color: "grey",
                      fontFamily: "Nunito-Regular",
                    }}
                  >
                    {renderCuisineTypes(item.cuisine_types)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <Image
                    style={{ width: 10, height: 10, alignSelf: "center" }}
                    source={require("../assets/award.png")}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      marginLeft: 5,
                      color: "grey",
                      fontFamily: "Nunito-Regular",
                    }}
                  >
                    {
                      utils.calculateDistance(
                        item.latitude,
                        item.longitude,
                        "M",
                        currentLocation.latitude,
                        currentLocation.longitude)
                    }
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => onToggleLocation(item)}>
                <MaterialC
                  name={isMyLocation ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                  size={28}
                  color={isMyLocation ? 'green' : 'gray'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

    );
  };


  const renderMainLy = () => {
    if (data.length > 0) {
      return <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    } else {
      return <Text style={{
        fontFamily: "Nunito-Bold",
        fontSize: 22,
        textAlign: "center",
        marginTop: 25,
        color: "#101c4a"
      }}>No Results Found</Text>
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
            top: height * 0.12,
            left: 20,
            color: "#fff",
          }}
        >
          Search
        </Text>
      </ImageBackground>

      <View
        style={{
          flexDirection: "row",
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 20
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Nunito-Regular",
            textAlign: "center",
            flexDirection: "row",
            // color: "grey",
          }}
        >
          Select
            </Text>
        <MaterialC
          name='checkbox-marked-outline'
          size={18}
          color='green'
          style={{ marginHorizontal: 5 }}
        />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Nunito-Regular",
            textAlign: "center",

            // color: "grey",
          }}
        >
          to receive rewards!
            </Text>
      </View>

      {loading ? <ActivityIndicator color="#000" size="large" /> : renderMainLy()}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    height: height * 0.2,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
    paddingLeft: 10,

    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),
    height: 90,
    borderRadius: 10,
    justifyContent: "center",
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

export default NearbySearchedScreen;
