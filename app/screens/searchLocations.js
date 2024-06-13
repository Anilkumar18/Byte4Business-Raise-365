import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import { extraApiService } from "../Services/extraApiService";
import { useIsFocused } from '@react-navigation/native';

//import { ScrollView } from "react-native-gesture-handler";
import _ from 'lodash'
import { showMessage } from "react-native-flash-message";
import { utils } from '../Utils/utils'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const SearchLocationScreen = (props) => {
  const [error, setError] = React.useState("")

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [restaurentData, setrestaurentData] = React.useState()

  const [searchTerm, setSearchTerm] = React.useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      requestCategories()
    }
  }, [isFocused]);

  const requestCategories = async () => {
    try {

      setLoading(true)
      const myLocation = await utils.getCurrentLocation()
      const payload = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude
      }
      let resp = await extraApiService.getTags(payload)

      console.log('getTags', resp.data);

      setLoading(false)

      if (resp.data.tag_categories) {

        const expandableCategories =
          _.map(resp.data.tag_categories, tag => ({ ...tag, expand: tag.tag_type == 'business_tag' }))

        setCategories(_.orderBy(expandableCategories, 'sequence'))
      }
       let dataList = []
       let restaurentData = {}

       for (let data of resp.data.tag_categories) {
         if (data.tag_type === "location") {
           dataList.push(data)
           break
         } else {
         }
       }

       setData(dataList)
       setrestaurentData(restaurentData)
       console.log("ddataaaa", JSON.stringify(resp.data))

    } catch (error) {
      console.log("erroro", error)
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not load tags for your location'
          })
        })
    }
  }

  const renderTags = category => {

    if (!category.expand) {
      return null
    }

    if (category.tags.length < 1) {
      return (
        <View style={{ paddingLeft: 15 }}>
          <Text
            style={{
              fontFamily: "Nunito-Italic",
              fontSize: 16,
              color: "#051533",
            }}
          >No tags</Text>
        </View>
      )
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {
          _.map(_.sortBy(category.tags), tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => props.navigation.navigate("nearbySearched", { tag: { name: tag, type: category.tag_type } })}
              style={[styles.interest, { backgroundColor: "#051533" }]}>
              <Text style={[styles.fontStyle, { color: "#fff" }]}>{tag}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
    )
  }

  const renderCategory = category => {

    return (
      <View key={category.name}>

        <TouchableOpacity
          onPress={() => {
             toggle
            setCategories(
              _.map(categories,
                c => c.name == category.name ? ({ ...category, expand: !category.expand }) : c
              )
            )
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: 16,
                color: "#051533",
              }}
            >{category.name} ({category.tags.length})</Text>
            <Image
              style={{
                width: width * 0.05,
                height: height * 0.025,
              }}
              source={
                category.expand
                  ? require("../assets/chevron-up.png")
                  : require("../assets/chevron-down.png")
              }
            />
          </View>
        </TouchableOpacity>

        <View style={{ marginVertical: 8 }}>
          {renderTags(category)}
        </View>
      </View>
    )
  }

  const renderContent = () => {

    if (loading) {
      return <ActivityIndicator color="#000" size="large" />
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          marginTop: 10,
          marginBottom: 25,
          paddingBottom: 25,
          marginHorizontal: 15,
        }}
      >
        {_.map(categories, renderCategory)}
      </ScrollView>
    )
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
            top: hp("12%"),
            left: 20,
            color: "#fff",
          }}
        >
          Search
        </Text>
        <View
          style={{
            fontSize: height * 0.04,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            width: width * 0.9,
            marginLeft: width * 0.05,
            paddingLeft: width * 0.05,
            paddingRight: width * 0.05,

            top: height * 0.18,
            backgroundColor: "lightgrey",
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <View style={[styles.inputSearchStyle, { justifyContent: "center" }]}>

            <TextInput
              placeholder="Search business term"
              value={searchTerm}
              style={{
                includeFontPadding: false, color: "#051533",
                fontFamily: "Nunito-Regular",
                fontSize: 13,
              }}
              placeholderTextColor="grey"
              onChangeText={(text) => {
                setSearchTerm(text);
                if (text) {
                  setError(null)
                }
              }}
            />

            {error ? <Text style={{ color: "red", fontWeight: "600", marginBottom: 5, fontSize: 12 }}>{error}</Text>
              : null}
          </View>

          <TouchableOpacity
            onPress={() => {

              if (searchTerm) {
                props.navigation.navigate("nearbySearched", {
                  query: searchTerm
                })

              } else {
                setError("Search is empty!")
              }
            }}
            style={{ padding: 10, borderRadius: 50 }}>
            <Image

              source={require("../assets/searchBlackOutline.png")} />
          </TouchableOpacity>
        </View>

      </ImageBackground>

      {renderContent()}

    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  splash: {
    width: wp("100%"),
    height: hp('27%'),
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

  fontStyle: {
    fontSize: height * 0.02,
    fontFamily: "Nunito-Regular",
    textAlign: "center",
  },

  inputSearchStyle: {
     marginLeft: width * 0.05,
     paddingLeft: width * 0.05,
     width: width * 0.9,
    flex: 1,
     height: height * 0.06,



    borderRadius: 5,
  },
  interest: {
    marginTop: 10,
    height: height * 0.05,
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: width * 0.02,
    borderColor: "#fff",
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: width * 0.045,
  },
});

export default SearchLocationScreen;
