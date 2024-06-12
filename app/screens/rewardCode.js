import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TextInput,
  ActivityIndicator,
  FlatList,
  Platform,
  Keyboard,
  ImageBackground,
} from "react-native";
import Modal from "react-native-modal";
import { useIsFocused } from '@react-navigation/native';

import { extraApiService } from "../Services/extraApiService"
import { utils } from "../Utils/utils";
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const RewardCodeScreen = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("")
  const isFocused = useIsFocused();
  const [submitted, setSubmitted] = useState(true)

  useEffect(() => {
    if (isFocused) {
      setShowModal(true)
      setCode('')
      setSubmitting(false)
      setSubmitted(false)
      setError('')
    }
  }, [isFocused])

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please Enter Code")
      return
    }
    Keyboard.dismiss()
    setError('')
    setSubmitting(true)

    try {
      let resp = await extraApiService.verifyRewardCode(code);
      console.log('extraApiService.verifyRewardCode', resp.data);
      setSubmitting(false)
      if (resp.data.error) {
        setError(resp.data.error)
      } else {
        setSubmitted(true)
      }

    } catch (error) {
      setSubmitting(false)

      console.log("error", JSON.stringify(error.response))
      utils.checkAuthorized(error, props.navigation)
        .then(() => {

          if (error.response && error.response.data
            && error.response.data && error.response.data.error) {
            setError(error.response.data.error)

          } else {
            setError("Error! Please Try Again")
          }
        })
    }
  }

  const onCancel = () => {

    if (submitting) {
      return
    }

    setShowModal(false)
    props.navigation.goBack()
  }

  const renderContent = () => {
    if (submitted) {
      return (
        <View style={{ flex: 1, }}>
          <Image
            style={{
              width: width * 0.6,
              height: Math.round((width * 8.3) / 16),
              borderRadius: 25,
              alignSelf: "center",
              position: "absolute",
              bottom: height * 0.03,
            }}
            source={require("../assets/codeGift.png")}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              // marginTop: height * 0.03,
              marginTop: 20,
              paddingHorizontal: 15
            }}
          >

            <View style={{ minWidth: height * 0.04 }} />

            <TouchableOpacity onPress={onCancel} >
              <Image
                style={{
                  width: height * 0.04,
                  height: height * 0.04,
                }}
                source={require("../assets/close.png")}
              />
            </TouchableOpacity>
          </View>
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 40
          }}>

            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: width * 0.043,
                color: "#fff",
                textAlign: "center",
                marginHorizontal: 5,
                flex: 1,
              }}
              numberOfLines={2}
            >{`Your Reward is now available. Redeem under Business > Rewards section.`}</Text>
          </View>
        </View>
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            // marginTop: height * 0.03,
            marginTop: 20,
            paddingHorizontal: 15
          }}
        >

          <View style={{ minWidth: height * 0.04 }} />
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: width * 0.043,
              color: "#fff",
              textAlign: "center",
              flex: 1,
              marginHorizontal: 5
            }}
            numberOfLines={2}
          >
            DO YOU HAVE A REWARD CODE
          </Text>
          <TouchableOpacity onPress={onCancel} >
            <Image
              style={{
                width: height * 0.04,
                height: height * 0.04,
              }}
              source={require("../assets/close.png")}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          autoFocus
          style={styles.inputSearchStyle}
          placeholder="Enter Reward Code Here"
          value={code}
          placeholderTextColor="grey"
          onChangeText={(text) => {
            if (submitting) {
              return
            }
            setCode(text);
          }}
        />

        {
          error ? (
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignSelf: 'center',
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20
            }}>
              <Text
                style={{
                  color: "#ff5252",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >{error}</Text>
            </View>
          ) : null
        }

        <Image
          style={{
            width: width * 0.6,
            height: Math.round((width * 8.3) / 16),
            borderRadius: 25,
            alignSelf: "center",
            position: "absolute",
            bottom: height * 0.03,
          }}
          source={require("../assets/codeGift.png")}
        />
        <View
          style={{ flexDirection: "row", justifyContent: "space-evenly" }}
        >
          <View style={styles.buttonDeleteContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false)
                props.navigation.goBack()
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Cancel
                </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={{
              flexDirection: "row",
              alignContent: "center", alignItems: "center", justifyContent: "center"
            }} onPress={() => {
              handleSubmit()
            }}>

              {submitting ? <ActivityIndicator color="#000" size="large" /> : null}

              <Text
                style={{
                  color: "#051533",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Submit
                </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      <Modal isVisible={showModal}>
        <ImageBackground
          style={{
            width: width * 0.9,
            height: Math.round((width * 19.3) / 16),
            borderRadius: 25,

            alignSelf: "center",
          }}
          source={require("../assets/codeGiftBackground.png")}
        >
          {renderContent()}
        </ImageBackground>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  inputSearchStyle: {
    backgroundColor: "#e6e6e6",
    padding: 7,
    marginTop: height * 0.04,
    width: width * 0.75,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.02,
    height: height * 0.06,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignSelf: "center",
  },
  buttonContainer: {
    color: "#051533",
    marginTop: height * 0.025,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: height * 0.06,
    backgroundColor: "#fff",
    width: "37%",
  },
  buttonDeleteContainer: {
    color: "#fff",
    marginTop: height * 0.025,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: height * 0.06,
    borderWidth: 1,
    borderColor: "#fff",
    width: "37%",
  },
});

export default RewardCodeScreen;
