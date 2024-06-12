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
  Platform,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import DropDownItem from "react-native-drop-down-item";
import ImageLoad from 'react-native-image-placeholder';
import { extraApiService } from "../Services/extraApiService";
import _ from 'lodash'
import { utils } from "../Utils/utils";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const CollectPhotosScreen = (props) => {

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    try {

      setLoading(true)
      const locationId = props.route.params.data.id
      const resp = await extraApiService.getBusiness(locationId)
      console.log('extraApiService.getBusiness', resp.data);
      setLoading(false)
      const approvedPhotos = _.filter(resp.data.contest_actions, { status: 'Approved' })
      setImages(approvedPhotos)
    }
    catch (error) {
      console.log('extraApiService.getBusiness error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const renderEmptyList = () => {
    return (
      <View style={{ paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Nunito-Italic",
            fontSize: 16,
            color: "#051533",
            margin: 15
          }}
        >No photos.</Text>
      </View>
    )
  }

  const renderItem = ({ item }) => {
    console.log("renderrdss", item)
    return (
      <View
        style={{
          flexDirection: "column",
          margin: 6,
          flex: 2
        }}
      >
        <ImageLoad style={styles.imageThumbnail}
          loadingStyle={{ size: 'large', color: 'blue' }}
          placeholderStyle={styles.imageThumbnail}
          source={{ uri: item.photo_url }}
          borderRadius={10}
        />
      </View>
    );
  };

  const renderContent = () => {

    if (loading) {
      return <ActivityIndicator color="#051533" size="large" />
    }

    return (
      <FlatList
        data={images}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item, index) => `${index}`}
        ListEmptyComponent={renderEmptyList}
      />
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
          Collect Photos
        </Text>
        <Image
          style={{
            width: 40,
            height: 40,
            position: "absolute",
            top: hp("12%"),
            left: width * 0.85,
          }}
          source={require("../assets/cameraWhite.png")}
        />
      </ImageBackground>
      {renderContent()}

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
    height: height * 0.22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  imageThumbnail: {
    width: width * 0.47,
    height: Math.round((width * 6.3) / 16),
    borderRadius: 10,
  },
});

export default CollectPhotosScreen;
