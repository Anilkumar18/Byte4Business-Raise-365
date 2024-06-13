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
  Platform,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import ImageLoad from 'react-native-image-placeholder';

import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set, Extrapolate } from "react-native-reanimated";
import { showMessage } from "react-native-flash-message";
import { extraApiService } from '../Services/extraApiService'
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from 'lodash'
import moment from 'moment'
import { utils } from '../Utils/utils'

const MessageDetailScreen = (props) => {

  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({})
  const [reply, setReply] = useState('')
  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    console.log('props.route.params.data', props.route.params.data);
    loadData()
  }, [])

  const loadData = async () => {

    setLoading(true)

    try {

      const userId = await AsyncStorage.getItem('@id')

      setUserId(userId)

      const notification = props.route.params.data

      setNotification(notification)

      const resp = await extraApiService.getNotificationMessages(notification.id)
      console.log('extraApiService.getNotifcationDetails', resp.data);
      setMessages(resp.data.message)
      setLoading(false)
      readMessage()
    }
    catch (error) {
      console.log('extraApiService.getNotifcationDetails error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const readMessage = async () => {
    try {
      const message_id = props.route.params.data.id
      const resp = await extraApiService.changeMessageStatus(message_id)
      console.log('extraApiService.changeMessageStatus', resp.data);
      if (props.route.params.refresh) {
        props.route.params.refresh()
      }
    } catch (error) {
      console.log('extraApiService.changeMessageStatus error', error);
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const onReplyMessage = async () => {

    if (loading) {
      return
    }

    if (!reply.trim()) {
      showMessage({
        type: 'warning',
        message: 'The comment cannot be empty'
      })
      return
    }

    const newId = new Date().toISOString()
    const oldMessages = messages

    try {

      const payload = {
        userId,
        msg_id: notification.id,
        location_id: notification.location_id,
        message: reply,
        alert_type: notification.alert_type
      }

      setMessages(messages.concat({ ...payload, from_user: userId, msg_id: newId }))

      const resp = await extraApiService.replyNotificationMessage(payload)
      console.log('extraApiService.replyNotificationMessage', resp.data);

      setReply('')
      showMessage({
        type: 'success',
        message: 'The reply has been sent'
      })
    }
    catch (error) {
      console.log('extraApiService.replyNotificationMessage error', error);
      setMessages(oldMessages)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const renderMsg = (msg) => {
    return msg.replace(/(<([^>]+)>)/ig, '');
  }

  const renderEmptyList = () => {
    return (
      <Text style={{
        fontFamily: "Nunito-Italic",
        fontSize: 16,
        color: "#051533",
        margin: 15,
        textAlign: 'right',
        transform: [{ scaleY: -1 }]
      }}>No messages.</Text>
    )
  }

  const renderReplyToolbar = () => {
    return (
      <View
        style={{
          flexDirection: "column-reverse",
          height: 100,
          backgroundColor: "lightgrey",
          borderTopLeftRadius: 25,
          justifyContent: "center",
          borderTopRightRadius: 25,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <TextInput
            style={styles.inputSearchStyle}
            placeholder="Reply comment"
            value={reply}
            placeholderTextColor="grey"
            onChangeText={text => setReply(text)}
          />
          <TouchableOpacity onPress={onReplyMessage}>
            <Image
              style={{ width: 38, height: 38 }}
              source={require("../assets/send.png")}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderItem = ({ item }) => {

    const isAuthor = item.from_user == userId
    const momentCreatedAt = moment(item.create_time, 'MM-DD-YYYY hh:mm:ss')
    const createdAt = item.create_time && momentCreatedAt.isValid() ? momentCreatedAt.fromNow() : ''

    return (
      <View style={{ marginTop: 15, }}>
        <View style={{ flexDirection: "row", }} >
          {
            !isAuthor ? (
              <ImageLoad
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 50,
                }}
                loadingStyle={{ size: 'large', color: 'blue' }}
                placeholderStyle={{
                  width: 36,
                  height: 36,
                  borderRadius: 50,
                }}
                borderRadius={50}
                source={item.avatar ? { uri: item.avatar } : require("../assets/userImage.png")}
              />
            ) : null
          }
          <View style={{ flex: 1, }} >
            <View style={{
              marginLeft: 15,
              backgroundColor: "lightgrey",
              padding: 15,
              borderRadius: 7,
              alignSelf: isAuthor ? 'flex-end' : 'flex-start'
            }}>
              {
                !isAuthor ? (
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Nunito-Bold",
                       justifyContent: "center",
                    }}
                  >{item.username}</Text>
                ) : null
              }
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Nunito-Regular",
                }}
              >{renderMsg(item.message)}</Text>
              <View>
                <Text
                  style={{
                    marginTop: 5,
                    fontSize: 12,
                    fontFamily: "Nunito-Regular",
                    color: "grey",
                    textAlign: 'right'
                  }}
                >{createdAt}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    );
  };


  const renderMessages = () => {

    if (loading) {
      return (
        <View style={{ flex: 1 }}>
          <ActivityIndicator color="#051533" size="large" />
        </View>
      )
    }

    return (
      <FlatList
        style={{
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
        data={messages.reverse()}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.msg_id}`}
        ListEmptyComponent={renderEmptyList}
        inverted
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

      {renderMessages()}
      {renderReplyToolbar()}

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
    resizeMode: "cover",
    height: hp("12%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
     alignSelf: "center",
     alignSelf: "center",
    marginTop: 15,
    marginHorizontal: 15,
     width: wp("90%"),
  },
  inputStyle: {
    paddingLeft: 13,
    marginLeft: 10,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,

    borderRadius: 5,
  },
  inputSearchStyle: {
    marginLeft: 10,
    backgroundColor: "#fff",
    padding: 7,
    width: wp("80%"),
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 14,

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

export default MessageDetailScreen;
