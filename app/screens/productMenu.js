import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput
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
import { extraApiService } from "../Services/extraApiService";
import { utils } from '../Utils/utils'
import _ from 'lodash'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const ProductMenuScreen = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    loadCategoriesAndItems()
  }, [])

  const loadCategoriesAndItems = async () => {

    try {

      setLoading(true)

      console.log('loadCategoriesAndItems', props.route.params.business.id);

      const categoriesResp = await extraApiService.getLocationCategories(props.route.params.business.id)
      console.log('extraApiService.getLocationCategories response', categoriesResp.data);

      const itemsResp = await extraApiService.getAllMenuItem(props.route.params.business.id)
      console.log('extraApiService.getAllMenuItem response', itemsResp.data);

      setLoading(false)

      const categories = _.flatMap(_.filter(categoriesResp.data.tag_categories, { tag_type: 'category' }), 'tags_mobile')
      console.log('categories, items', categories);

      setData(categories)
      setMenuItems(itemsResp.data)

    } catch (error) {
      console.log('loadCategoriesAndItems error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const toggleSearch = () => {

    if (loading) {
      return
    }

    setSearching(!searching)
    setSearchText('')
  }

  const renderItem = ({ item }) => {

    if (searching &&
      !_.some(menuItems, menuItem =>
        item.category_id == menuItem.category_id && (
          utils.normalizedSearchText(menuItem.name, searchText) ||
          utils.normalizedSearchText(menuItem.description, searchText)
        )
      )
    ) {
      return null
    }

    return (
      <TouchableOpacity
        key={item.category_id}
        onPress={() => {
          props.navigation.navigate("menuCatergory", {
            business: props.route.params.business,
            category_id: item.category_id,
            category_tag: item.name
          });
        }}
        style={{
          marginHorizontal: 10,
          padding: 5
        }}
      >

        <ImageBackground
          resizeMode="cover"
          imageStyle={{
            width: "100%",
            borderRadius: 20,
            // padding: 15

          }}

          style={{
            marginTop: 10,
            // height: height > 800 ? height * 0.19 : height * 0.23,
          }}

          source={item.image_url ? { uri: item.image_url } : require("../assets/soup.png")}
        >

          <View style={{ paddingHorizontal: 15 }}>
            <View style={{
              width: '100%',
              marginHorizontal: 10,

              padding: 10,
            }} />
          </View>
          <View style={{ paddingHorizontal: 5 }}>
            <Text
              style={{
                // fontSize: height * 0.02,
                padding: 40,
                fontFamily: "Nunito-SemiBold",
                color: "#fff", textAlign: "center",

              }}
            >
              {item.name}
            </Text>
          </View>

          <View style={{
            width: '100%',

            padding: 10,
          }} />
        </ImageBackground>

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

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: wp("90%"),
          marginHorizontal: 20,
          marginTop: hp(4),
        }}>
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
                  fontSize: height * 0.04,
                  fontFamily: "Nunito-Bold",
                  // position: "absolute",
                  // top: height * 0.12,
                  // left: 20,
                  color: "#fff",
                }}
              >Product Menu</Text>
          }
          <TouchableOpacity onPress={toggleSearch}>
            {
              searching ?
                <Image
                  style={{
                    // position: "absolute",
                    // top: height * 0.12,
                    // right: 6,
                    width: height > 800 ? 45 : 37,
                    height: height > 800 ? 45 : 37,
                  }}
                  source={require("../assets/close.png")}
                /> :
                <Image
                  style={{
                    // position: "absolute",
                    // top: height * 0.12,
                    // right: 6,
                    width: height > 800 ? 45 : 37,
                    height: height > 800 ? 45 : 37,
                  }}
                  source={require("../assets/search.png")}
                />
            }
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {loading ? <ActivityIndicator color="#000" size="large" /> : <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.category_id.toString()}
      />}

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
    // marginHorizontal:20

  },
});

export default ProductMenuScreen;
