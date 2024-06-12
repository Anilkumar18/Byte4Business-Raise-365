import React, { useState, useEffect, useRef, createRef } from "react";
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
  ActivityIndicator,
  Animated,
  Alert
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import Theme from "../utils";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import MaterialC from "react-native-vector-icons/MaterialCommunityIcons";
import { set } from "react-native-reanimated";
import { extraApiService } from "../Services/extraApiService";
import { utils } from "../Utils/utils"
import _ from 'lodash'
import { showMessage } from "react-native-flash-message";
import { useIsFocused } from '@react-navigation/native';

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const NotificationDetailScreen = (props) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([]);
  const [locationId, setLocationId] = useState("");
  const isFocused = useIsFocused();

  let swipeableRefs = createRef({})

  let refs = {}
  const title = `${props.route.params?.title} Messages`


  const fetchData = async () => {

    let locationId = props.route.params.id;

    setLoading(true)

    try {
      console.log("extraApiService.getNotifcationDetails payload", locationId)
      let resp = await extraApiService.getNotificationDetails(locationId);
      console.log("extraApiService.getNotifcationDetails", resp.data)

      setData(resp.data.messages)
      setLoading(false)

    } catch (error) {
      console.log("extraApiService.getNotifcationDetails error", error)
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  useEffect(() => {
    if (isFocused) {
      fetchData()
    }
  }, [isFocused]);

  const closeRow = item => {
    refs[item.id] && refs[item.id].close()
  }

  const deleteMessage = async item => {

    try {

      const oldData = data

      setData(_.filter(oldData, message => message.id != item.id))
      const resp = await extraApiService.deleteNotificationMessage(item.id)
      console.log('extraApiService.deleteNotificationMessage', resp.data);
      showMessage({
        type: 'success',
        message: 'The message has been deleted'
      })
      if (props.route.params.refresh) {
        props.route.params.refresh()
      }
    }
    catch (error) {
      console.log('extraApiService.deleteNotificationMessage error', error);
      setData(oldData)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const onDeleteMessagePrompt = item => {
    Alert.alert(
      'Delete message',
      'Are you sure?',
      [
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => deleteMessage(item),
        },
        {
          text: 'No',
          style: 'cancel',
          onPress: () => closeRow(item)
        }
      ]
    )
  }

  const renderHeader = () => {
    return (
      <View>

        <TouchableOpacity onPress={fetchData}>
          <View style={{
            backgroundColor: 'gray',
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginVertical: 10,
            alignSelf: 'center',
            borderRadius: 10
          }}>
            <Text style={{
              fontFamily: 'Nunito-Semibold',
              color: 'white'
            }}>Check for new messages</Text>
          </View>
        </TouchableOpacity>
        <Text style={{
          fontFamily: 'Nunito-Regular',
          textAlign: 'center'
        }}>Swipe ← to delete message</Text>
      </View>
    )
  }

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
        margin: 15
      }}>
        No notifications.
      </Text>
    )
  }

  const renderRightActions = item => {
    return (
      <RectButton
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: 'darkgrey',
          flex: 1,
          justifyContent: 'flex-end'
        }}
        onPress={() => closeRow(item)}
      >
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 20
        }}>
          <MaterialC
            name='delete'
            color='white'
            size={30}
          />
          <Text style={{
            fontSize: 16,
            fontFamily: 'Nunito-Semibold',
            color: 'white',
          }}>Delete</Text>
        </View>
      </RectButton>
    )
  }

  const parseMessage = msg => msg.replace(/(<([^>]+)>)/ig, '')

  const renderItem = ({ item, index }) => {
    return (
      <Swipeable
        ref={e => refs[item.id] = e}
        rightThreshold={60}
        renderRightActions={() => renderRightActions(item)}
        onSwipeableRightWillOpen={() => {
          onDeleteMessagePrompt(item)
        }}
      >

        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("messageDetails", { data: item, refresh: props.route.params.refresh });
          }}
        >
          <View style={{
            padding: 15,
            flex: 1,
            backgroundColor: item.status ? "#E5E5E5" : "white",
          }}>

            <Text
              style={{
                fontSize: 16,
                fontFamily: item.status ? 'Nunito-Regular' : "Nunito-Bold",
                justifyContent: "center",
                // fontWeight: "800",
              }}
              numberOfLines={2}
            >{parseMessage(item.message)}</Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Nunito-Regular",
                marginTop: 5,
                color: "gray"
              }}
            >{item.create_day}</Text>

          </View>

        </TouchableOpacity>

      </Swipeable >
    );
  };

  const renderNotifications = () => {

    if (loading) {
      return <ActivityIndicator color="#051533" size="large" />
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        ListHeaderComponent={renderHeader}
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
            fontSize: height * 0.03,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            width: wp("90%"),
            top: height * 0.12,
            left: 20,
            color: "#fff",
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            position: "absolute",
            top: hp("16%"),
            left: 20,
            right: 20,
          }}
        ></View>
      </ImageBackground>

      {renderNotifications()}
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
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
    alignSelf: "center",
    alignSelf: "center",
    marginTop: 15,
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

export default NotificationDetailScreen;
