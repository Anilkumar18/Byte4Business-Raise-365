import React, { useState, useEffect, useRef } from "react";
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
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import MapView, { PROVIDER_GOOGLE, Marker, Callout, CalloutSubview } from "react-native-maps";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import { extraApiService } from "../Services/extraApiService";
import ImageLoad from 'react-native-image-placeholder';
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import _ from 'lodash'
import { utils } from "../Utils/utils"
import { showMessage } from "react-native-flash-message";
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const DiscoverScreen = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true);

  const [showTop, setShowTop] = useState(true);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [myLocations, setMyLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState({})
  const [selectedLocation, setSelectedLocation] = useState(null)

  const mapRef = useRef(null)

  const tabButton = (tab, title) => {
    return (
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: tabIndex == tab ? "white" : "grey" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setTabIndex(tab);
            if (tab === 0) {
              setShowTop(true);
            } else {
              setShowTop(false);
            }
          }}
        >
          <Text
            style={{
              color: tabIndex == tab ? "#000" : "white",
              fontSize: 14,
              textAlign: "center",
              fontFamily: "Nunito-SemiBold",
            }}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getTags = (data) => {

    const primaryTags = data.primary_tag ?
      _.map(_.castArray(data.primary_tag), tag => ({ type: 'business_tag', name: tag.name })) : []

    const secondaryTags = data.secondary_tag ?
      _.map(_.castArray(data.secondary_tag), tag => ({ type: 'business_tag', name: tag.name })) : []

    const tagsString = data.tags_string ?
      _.map(_.castArray(data.tags_string), name => ({ type: 'cuisine', name })) : []

    return [...primaryTags, ...secondaryTags, ...tagsString]
  }

  const fetchNormalData = async (data) => {

    try {

      const myLocation = await utils.getCurrentLocation()

      setCurrentLocation(myLocation)

      let payload = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        "zip": "",
        "radius": _.get(data, 'radius', 20),
        "tags": getTags(data)
      }

      setLoading(true)

      console.log("extraApiService.getLocalBusinesses payload", payload)
      let resp = await extraApiService.getLocalBusinesses(payload);
      console.log("getLocalBusinesses", _.orderBy(resp.data,
        location => utils.calculateDistance(
          location.latitude,
          location.longitude,
          'ABS',
          myLocation.latitude,
          myLocation.longitude
        )
      ))

      let myLocationsResponse = await extraApiService.getLocationForCustomer()
      console.log('my locations', myLocationsResponse.data);

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
      console.log("respss rteeror", JSON.stringify(error.response))
      utils.checkAuthorized(error, props.navigation)
    }

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

  const fetchDataByFundraiserId = async () => {

    const fundraiserTypeId = props.route?.params?.fundraiserType?.id

    if (loading) {
      console.log('already loading!');
      return
    }

    if (!hasMoreData) {
      console.log('no more data to load');
      return
    }

    if (!fundraiserTypeId) {
      console.log('no valid fundraiser type id');
      return
    }

    try {

      setLoading(true)

      const myLocation = await utils.getCurrentLocation()

      setCurrentLocation(myLocation)

      const payload = {
        fundraiser_type_ids: _.castArray(fundraiserTypeId),
        page,
        lat: myLocation.latitude,
        lng: myLocation.longitude,
      }

      console.log("fetchMoreDataByFundraiserId payload", payload)

      let resp = await extraApiService.getLocationByFundraiserType(payload);

      console.log("fetchMoreDataByFundraiserId response", resp.data)

      if (resp.data?.length > 0) {
        setPage(page + 1)
        setHasMoreData(true)
      } else {
        setHasMoreData(false)
      }

      setData(_.uniqBy([...data, ...resp.data], 'id'))

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log("respss rteeror", JSON.stringify(error.response))
      utils.checkAuthorized(error, props.navigation)
    }
  }

  useEffect(() => {

    if (props.route?.params?.fundraiserType) {
      fetchDataByFundraiserId()
    } else if (props.route?.params?.data) {
      fetchNormalData(props.route.params.data)
    }

  }, []);

  const selectMarker = location => {
    console.log('selectMarker', location);
    setSelectedLocation(location)
  }

  const renderHeader = () => {

    const { fundraiserData, fundraiserType } = props.route.params

    const title = fundraiserData ? `${fundraiserData.fundraiser.fundraiser_name}${fundraiserType.name ? ` - ${fundraiserType.name}` : ''}` :
      props.route.params.data ? props.route.params.data.name : 'Discover'

    const logo = fundraiserData?.fundraiser?.logo || props.route?.params?.data?.image

    return (
      <View style={{
        marginHorizontal: wp("5%"),
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: wp("90%"),
          // marginLeft: wp("5%"),
          marginTop: Platform.OS === "ios" ? hp("5%") : hp("3%"),
        }}>


          <TouchableOpacity onPress={() => props.navigation.goBack()} >
            <Image source={require("../assets/back.png")} />
          </TouchableOpacity>

          {logo ?
            <ImageLoad
              style={{
                marginVertical: 20,
                width: 60,
                height: 60,
              }}
              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: 60,
                height: 60,
              }}
              resizeMode='contain'
              source={{ uri: logo }}
            /> : null
          }

          <View style={{ minWidth: 32 }} />
        </View>
        {
          title ?
            <Text
              adjustsFontSizeToFit
              style={{
                fontSize: 30,
                fontFamily: "Nunito-Bold",
                color: "#fff",
                textAlign: 'center'
              }}
              numberOfLines={1}
            >{title}</Text> : null
        }
      </View>
    )
  }
  const renderItemView = () => {
    setShowTop(false);
    return <View></View>;
  };


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
    const { fundraiserData, fundraiserType, hideCheckbox } = props.route.params

    const isMyLocation = _.find(myLocations, locationId => locationId == item.id)
    const logo = item.logo ? item.logo.replace(/bo_\d+px\w+\//, '') : ''

    const fullAddress = `${item.address}, ${item.city}`

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {

          if (fundraiserData) {
            props.navigation.navigate("merchantFundraisers", {
              data: item,
              fundraiserData,
              fundraiserType,
              onUpdateBusiness: null
            });
          } else {
            props.navigation.navigate("merchantDetail", {
              data: item,
              onUpdateBusiness: null
            });
          }
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
          <View>

            <ImageLoad style={{
              width: 70,
              height: 70,
              // borderRadius: 50,
              // backgroundColor: 'black'
            }}
              // borderRadius={50}

              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: 70,
                height: 70,
                // borderRadius: 50,
              }}
              resizeMode='contain'
              source={item.logo ? { uri: logo } : require("../assets/pizza.png")}
            />
          </View>
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
                      // textAlign: "center",
                      fontSize: 12,
                      marginLeft: 5,
                      color: "grey",
                      fontFamily: "Nunito-Regular",
                    }}
                  >
                    {fullAddress}
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

              {
                !hideCheckbox ? (
                  <TouchableOpacity onPress={() => onToggleLocation(item)}>
                    <MaterialC
                      name={isMyLocation ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                      size={28}
                      color={isMyLocation ? 'green' : 'gray'}
                    />
                  </TouchableOpacity>
                ) : null
              }
            </View>
          </View>
        </View>
      </TouchableOpacity >

    );
  };

  const renderMapMarker = location => {

    const logo = location.logo ? location.logo.replace(/bo_\d+px\w+\//, '') : ''

    return (
      <Marker
        key={`${location.id}`}
        identifier={`${location.id}`}
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude
        }}
        // tracksViewChanges={false}
        onPress={event => selectMarker(location)}
        stopPropagation={true}
        style={{
          alignItems: 'center',
          elevation: 4,
          backgroundColor: 'transparent',
          zIndex: selectedLocation && selectedLocation.id == location.id ? 200 : 10
        }}
      >

        <View style={{
          padding: 10,
          borderRadius: 10,
          // borderColor: '#ccc',
          // borderWidth: 0.5,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          elevation: 4,
          maxWidth: 80,
          // marginBottom: 10
        }}>

          <ImageLoad
            style={{
              width: 40,
              height: 40,
              // borderRadius: 20,
            }}
            // borderRadius={20}
            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 40,
              height: 40,
              // borderRadius: 20,
            }}
            resizeMode='contain'
            source={location.logo ? { uri: logo } : require("../assets/pizza.png")}
          />

          <Text
            style={{
              fontSize: 10,
              fontFamily: "Nunito-SemiBold",
              textAlign: 'center'
            }}
          >{location.name}</Text>

        </View>
        <View style={{
          width: 10,
          height: 10,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderTopWidth: 10,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'white',
          elevation: 4,
        }} />
      </Marker>
    );
  };


  const renderSelectedLocation = () => {

    console.log('renderSelectedLocation', selectedLocation);

    if (!selectedLocation) {
      return null
    }

    return (
      <View style={{
        backgroundColor: 'white',
        elevation: 4,
        // height: 60,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: 20,
        borderTopColor: '#ccc',
        borderTopWidth: 0.5
      }}>
        {renderItem({ item: selectedLocation })}
      </View>
    )
  }

  const renderEmptyList = () => {

    if (loading) {
      return null
    }

    const emptyText = props.route.params?.fundraiserType?.id ? 'No supporting businesses.' : 'No locations.'
    return (
      <View style={{ paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Nunito-Italic",
            fontSize: 16,
            color: "#051533",
            marginTop: 20
          }}
        >{emptyText}</Text>
      </View>
    )
  }
  const renderFlatList = () => {

    return <FlatList
      ListEmptyComponent={renderEmptyList}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={fetchDataByFundraiserId}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => loading ? <ActivityIndicator style={{ marginTop: 15 }} color="#000" size="large" /> : null}
    />

  }

  const renderMapList = () => {

    if (loading) {
      return <ActivityIndicator color="#000" size="large" />
    }

    const firstLocation = _.first(data)
    const initialLocation = firstLocation || {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }

    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          initialRegion={{
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          onPress={() => selectMarker(null)}
          onMapReady={() => {
            mapRef.current.fitToElements(false)
          }}
        >
          {_.map(data, renderMapMarker)}
        </MapView>

        {renderSelectedLocation()}

      </View>
    )
  }

  const renderInfoMessage = () => {

    const { hideCheckbox } = props.route.params

    if (tabIndex != 0 || data.length <= 0) {
      return null
    }

    if (hideCheckbox) {
      return (
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
            }}
          >
            Select business to see Fundraiser Deals
          </Text>
        </View>
      )
    }

    return (
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
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/topNew.png")}
        resizeMode='stretch'
      >

        {renderHeader()}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            margin: 20
          }}
        >
          {tabButton(0, "List View")}
          {tabButton(1, "Map View")}
        </View>
      </ImageBackground>
      {renderInfoMessage()}
      {tabIndex === 0 ? renderFlatList() : renderMapList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  map: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    // height: height > 800 ? hp("26") : hp("29%"),
    // height: height * 0.2,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
    backgroundColor: 'black'
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
    // marginTop: 25,
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

export default DiscoverScreen;
