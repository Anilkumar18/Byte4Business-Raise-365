import React, { useState, useEffect, useContext } from "react";
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
import Theme from "../utils";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageLoad from 'react-native-image-placeholder';
import { useIsFocused } from '@react-navigation/native';
import _ from 'lodash'
import Store from '../store'

import { extraApiService } from "../Services/extraApiService"
import PushNotification from "react-native-push-notification";

const { width, height } = Dimensions.get('screen')

const NotificationsScreen = props => {

  const [tabIndex, setTabIndex] = React.useState(0);
  const isFocused = useIsFocused();

  const [store, setStore] = useContext(Store.Context)
  const { loading, notifications } = store

  const fetchNotifications = async () => {

    console.log('fetching notifications...');
    try {

      setStore(previous => ({ ...previous, loading: true }))

      let resp = await extraApiService.getNotifications();
      console.log('extraApiService.getNotifications', resp.data);

      if (resp.data?.restaurants) {

        const badge = _.sumBy(resp.data.restaurants, 'unread')

        // if (!isNaN(badge)) {
        //   console.log('setting badge counter to ', badge);
        //   PushNotification.setApplicationIconBadgeNumber(badge)
        // } else {
        //   console.log('Badge not present on data payload, setting badge counter to 0');
        //   PushNotification.setApplicationIconBadgeNumber(0)
        // }
      }

      setStore(previous => ({ ...previous, loading: false, notifications: resp.data.restaurants }))

    } catch (error) {
      console.log('extraApiService.getNotifications error', error);
      setStore(previous => ({ ...previous, loading: true }))
      utils.checkAuthorized(error, props.navigation)
    }
  }

  useEffect(() => {
    if (isFocused) {
      fetchNotifications()
    }
  }, [isFocused]);

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: wp("90%"),
          backgroundColor: "lightgrey",
          alignSelf: "center",
        }}
      />
    )
  }

  const renderEmptyList = () => {
    return (
      <Text style={{
        fontFamily: "Nunito-Italic",
        fontSize: 16,
        color: "#051533",
        margin: 15,
      }}>No notifications.</Text>
    )
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ paddingHorizontal: 15, paddingVertical: 10 }}
        onPress={() =>
          props.navigation.navigate("message", {
            id: item.location_id,
            title: item.chain_name,
            refresh: fetchNotifications
          })}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          elevation: 2
        }}>

          <ImageLoad
            style={{
              width: 50,
              height: 50,
              // borderRadius: 50,
            }}
            // borderRadius={50}
            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 50,
              height: 50,
              // borderRadius: 50,
            }}
            resizeMode='contain'
            source={item.logo ? { uri: item.logo } : require("../assets/appicon.png")}
          />

          <Text style={{
            marginLeft: 10,
            fontSize: 16,
            fontFamily: "Nunito-SemiBold",
            justifyContent: "center",
          }}>{item.chain_name}</Text>

        </View>

      </TouchableOpacity >
    );
  };

  const renderLocations = () => {

    if (loading) {
      return <ActivityIndicator color="#051533" size="large" />
    }

    return (
      <FlatList
        style={{ paddingTop: 5, paddingBottom: 20 }}
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        ItemSeparatorComponent={renderSeparator}
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
          onPress={() => props.navigation.goBack()}
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
          Notifications
        </Text>

      </ImageBackground>

      {renderLocations()}

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
    width: width * 0.9,
    margin: width * 0.05,
    height: 65,
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

export default NotificationsScreen;
