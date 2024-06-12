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
  Platform,
  SectionList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import _ from 'lodash'
import Theme from "../utils";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageLoad from 'react-native-image-placeholder';
import { utils } from "../Utils/utils"
import { useIsFocused } from '@react-navigation/native';

import { extraApiService } from "../Services/extraApiService"


const FavouriteScreen = (props) => {
  const [currentPassword, setCurrentPasssword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [newHidePassword, setNewHidePassword] = useState(true);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [business, setBusinesses] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const isFocused = useIsFocused();

  const [token, setToken] = useState("")
  const showTabs = !props.route.params.filter

  async function fetchFavorite() {
    const _token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

    console.log("fetchFavorite", _token)

    setToken(_token);

    try {
      let resp = await extraApiService.getFavorites(_token);
      setLoading(false)
      let data = resp.data;
      console.log("sdsdsdssds", JSON.stringify(data))
      setBusinesses(data.locations)
      setMenuItems(data.items)
    } catch (error) {
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }

  }

  useEffect(() => {
    if (isFocused) {
      fetchFavorite()
    }
  }, [isFocused]);

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

  const renderEmptyList = (message = 'No data') => {
    return (
      <View style={{ paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Nunito-Italic",
            fontSize: 16,
            color: "#051533",
            margin: 15
          }}
        >{message}</Text>
      </View>
    )
  }

  const renderFlatLists = () => {

    const { filter } = props.route.params
    // console.log('filter', filter, business, menuItems);

    // if (tabIndex === 0 && showTabs) {
    //   return <FlatList
    //     ListEmptyComponent={renderEmptyList('No business.')}
    //     data={filter ? business.filter(b => b.id == filter.id) : business}
    //     renderItem={renderRestaurent}
    //     keyExtractor={(item) => `${item.id}`}
    //   />
    // } else {


    const filteredMenuItems = filter ? menuItems.filter(item => item.location_id == filter.id) : menuItems

    // if (showTabs) {
    const sections = _.map(
      _.groupBy(filteredMenuItems, 'location_name'), (group, key) => ({
        title: key,
        data: group
      })
    )
    console.log('filter', filter, sections);
    return (
      <SectionList
        ListEmptyComponent={renderEmptyList('No menu items.')}
        sections={sections}
        renderSectionHeader={({ section: { title } }) => (
          showTabs ? <Text style={{
            marginTop: 10,
            marginLeft: 15,
            fontSize: 16,
            fontFamily: "Nunito-SemiBold"
          }}>{title}</Text> : null
        )}
        renderItem={renderMenuItem}
        keyExtractor={(item) => `${item.id}`}
      />
    )
    // }

    // return <FlatList
    //   ListEmptyComponent={renderEmptyList('No menu items.')}
    //   data={filteredMenuItems}
    //   renderItem={renderMenuItem}
    //   keyExtractor={(item) => `${item.id}`}
    // />
    // }

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


  const renderCategories = (items) => {
    let content = ""
    for (var item of items) {
      if (content) {
        content = content + ", " + item

      } else {
        content = item

      }
    }
    return content
  }

  const getMenuItemPic = (images) => {
    console.log("imagesss", images)
    let image = "https://api.adorable.io/avatars/50/abott@adorable.png"
    if (images.length > 0) {
      if (!images[0].is_video) {
        return images[0].image

      }
    }
    return image
  }

  const renderRestaurent = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("merchantDetail", { data: item, onUpdateBusiness: null })
        }}
        style={styles.userInfoSection} key={item.id}>
        <View
          style={{
            flexDirection: "row",
            marginTop: 9,
          }}
        >
          <ImageLoad
            style={{
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
            source={{
              uri: item.logo ? item.logo : "https://api.adorable.io/avatars/50/abott@adorable.png",
            }}
          />
          <View
            style={{
              marginLeft: 15,
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: "Nunito-SemiBold" }}>
              {item.name}
            </Text>

            <Text
              style={{
                fontSize: 12,
                marginTop: 5,
                fontFamily: "Nunito-Regular",
              }}
            >
              Favourited on: {utils.formatDate(item.favorited_date)}
            </Text>
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
                  fontFamily: "Nunito-Regular",
                }}
              >
                {renderCuisineTypes(item.cuisine_types)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  const renderMenuItem = ({ item }) => {
    // console.log("item===", item)
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("productDetail", { data: item })
        }}
        style={styles.userInfoSection} key={item.id}>
        <View
          style={{
            flexDirection: "row",
            marginTop: 9,
          }}
        >


          <ImageLoad
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
            }}
            borderRadius={50}

            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 70,
              height: 70,
              borderRadius: 50,
            }}
            source={{
              uri: getMenuItemPic(item.images)
            }}
          />
          <View
            style={{
              marginLeft: 15,
              flex: 1
            }}
          >
            <Text style={{
              fontSize: 16,
              fontFamily: "Nunito-SemiBold"
            }}>{item.name}</Text>

            <Text
              style={{
                fontSize: 12,
                marginTop: 5,
                fontFamily: "Nunito-Regular",
              }}
            >
              Favourited on: {utils.formatDate(item.favorited_date)}
            </Text>
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
                  fontFamily: "Nunito-Regular",
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {renderCategories(item.category_names)}
              </Text>
            </View>
          </View>
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
            fontSize: 30,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: hp("12%"),
            left: 20,
            color: "#fff",
          }}
        >
          Favorites
        </Text>
        {/* {
          showTabs ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                position: "absolute",
                top: hp("16%"),
                left: 20,
                right: 20,
              }}
            >
              {tabButton(0, "Business")}
              {tabButton(1, "Menu Items")}
            </View>
          ) : null
        } */}
      </ImageBackground>

      {loading ? <ActivityIndicator color="#fff" size="large" />
        : renderFlatLists()}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    height: hp("18%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
    // paddingHorizontal: 10,
    padding: 10,
    // backgroundColor: "yellow",
    backgroundColor: "#fff",
    // alignSelf: "center",
    marginTop: 10,
    marginHorizontal: 15,
    // width: wp("93%"),
    flex: 1,
    // height: 90,
    borderRadius: 10,
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

export default FavouriteScreen;
