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
  Dimensions,
  ActivityIndicator,
  ScrollView
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import Carousel from 'react-native-snap-carousel';
import ImageLoad from 'react-native-image-placeholder';

import _ from 'lodash'
import moment from 'moment'
import { extraApiService } from '../Services/extraApiService'
import { showMessage } from "react-native-flash-message";
import { utils } from "../Utils/utils";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const RewardScreen = (props) => {

  const [location, setLocation] = useState(props.route.params.data || {})
  const [rewards, setRewards] = useState([])

  const [loading, setLoading] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  console.log('RewardScreen route params', props.route.params.data);
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    setLoading(true)

    try {
      const resp = await extraApiService.getUserRewards()
      console.log('extraApiService.getUserRewards', resp.data, location.id);
      console.log('location rewards', _.filter(resp.data, reward => reward.location_id == location.id), _.map(resp.data, 'reward.expired_until'));
      setRewards(_.filter(resp.data, reward => reward.location_id == location.id && !reward.is_redeemed))
      setLoading(false)
    }
    catch (error) {
      console.log('extraApiService.getUserRewards error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)

    }
  }

  const onRedeemPress = async item => {
    console.log('onRedeemPress', item);

    setRedeeming(true)

    try {

      const resp = await extraApiService.redeemReward({ id: item.id })
      console.log('extraApiService.redeemReward', resp.data);
      setRedeeming(false)

      showMessage({
        type: 'success',
        message: item.reward.redeem_confirm_msg
      })

      props.navigation.goBack()
      if (props.route.params.refresh) {
        props.route.params.refresh()
      }
    }
    catch (error) {
      console.log('extraApiService.redeemReward error', error);
      setRedeeming(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const renderCard = ({ item, index }) => {
    console.log('renderReward', item);
    const scrollviewStyles = item.reward?.photo ? {
      style: {
        flexGrow: 0,
        maxHeight: height * 0.1,
      },
      contentContainerStyle: {}
    } : {
        style: {},
        contentContainerStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }
      }

    const descriptionFontSize = item.reward?.photo ? height * 0.022 : height * 0.044

    return (
      <View
        style={{
          flex: 1,
          marginBottom: 15,
        }}
      >

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
           marginBottom: 10
        }}>

          <View style={{ minWidth: 60 }} />

          <Text
            style={{
              textAlign: 'center',
              fontFamily: "Nunito-Bold",
              color: '#555',
            }}>Swipe to view rewards</Text>

          <Text
            style={{
              fontSize: 18,
              textAlign: 'center',
              fontFamily: "Nunito-Bold",
              color: '#333'
            }}>{`${index + 1} of ${rewards.length}`}</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
             height: height > 800 ? height * 0.59 : height * 0.62,
            paddingBottom: 20,
            marginTop: 15,
            borderRadius: 25,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 10,
            elevation: 4,
          }}
        >

          {
            item.reward?.photo ? (
              <ImageLoad
                style={{
                  flex: 1,
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 25,
                   height: '40%',
                  backgroundColor: 'white'
                }}
                placeholderStyle={{
                  flex: 1,
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 25,
                  backgroundColor: 'white',
                   height: '40%',
                }}
                resizeMode='contain'
                source={{ uri: item.reward.photo }}
                loadingStyle={{ size: 'large', color: 'blue' }}
              />
            ) : null
          }

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginVertical: 10,
          }}>
            <Image
              style={{
                width: 10,
                height: 10,
                alignSelf: "center"
              }}
              source={require("../assets/award.png")}
            />
            <Text style={{
              fontSize: height * 0.018,
              fontFamily: "Nunito-SemiBold",
              color: "grey",
              textAlign: 'center',
              marginLeft: 8,
            }}>{item.remove_redeem ? 'One Use Only!' : 'Daily Deal'}</Text>
          </View>

          <ScrollView {...scrollviewStyles}>
            <Text
              style={{
                fontSize: descriptionFontSize,
                fontFamily: "Nunito-SemiBold",
                marginHorizontal: 30,
                marginTop: 15,
                textAlign: "center",
              }}
            >
              {item.reward.description}
            </Text>
          </ScrollView>

          <Text
            style={{
              fontSize: height * 0.018,
              fontFamily: "Nunito-SemiBold",
              color: "grey",
              textAlign: 'center',
              marginVertical: 10
            }}
          >
            Exp: {moment(item.reward.expired_until).isValid() ? moment(item.reward.expired_until).format('MM/DD/YYYY') : '-'}
          </Text>

          <TouchableOpacity
            onPress={() => onRedeemPress(item)}
            disabled={submitting}
          >
            <View style={{
              flexDirection: 'row',
              alignSelf: "center",
               marginTop: height > 800 ? 15 : 10,
              borderRadius: 8,
              height: height * 0.05,
              justifyContent: "center",
              alignItems: 'center',
              backgroundColor: Theme.redButtonColor,
              paddingHorizontal: 25,
              width: "50%",
            }}>

              {redeeming ? <ActivityIndicator color='#fff' /> : null}
              <Text
                style={{
                  color: "#fff",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                  marginLeft: redeeming ? 15 : 0
                }}
              >
                REDEEM
              </Text>
            </View>
          </TouchableOpacity>

        </View>

      </View>
    )
  }

  const renderContent = () => {

    if (loading) {
      return <ActivityIndicator color="#051533" size="large" />
    }

    if (rewards.length < 1) {
      return (
        <Text style={{
          fontFamily: "Nunito-Italic",
          fontSize: 16,
          color: "#051533",
          margin: 15,
        }}>No rewards.</Text>
      )
    }

    return (
      <Carousel
        data={rewards}
        renderItem={renderCard}
        sliderWidth={width}
        itemWidth={wp("90%")}
        removeClippedSubviews={false}
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
            if (!redeeming) {
              props.navigation.goBack();
            }
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

        <TouchableOpacity
          style={{
            position: "absolute",
            top: height > 800 ? hp("12%") : hp("12%"),
            right: 10,
          }}
          onPress={() => {
            props.navigation.navigate('rewardCode')
          }}
        >
          <ImageBackground
            style={{

              width: 110,
              height: 40,

              justifyContent: "center",
            }}
            source={require("../assets/rectangle.png")}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Nunito-Bold",
                textAlign: "center",
                color: "#fff",
              }}
            >
              Enter Code
          </Text>
          </ImageBackground>
        </TouchableOpacity>
        {/* <ImageBackground
          style={{
            position: "absolute",
            width: 110,
            height: 40,
            top: height > 800 ? hp("4%") : hp("4%"),
            right: 10,
            justifyContent: "center",
          }}
          source={require("../assets/rectangle.png")}
        >
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("prize");
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Nunito-Bold",
                textAlign: "center",
                color: "#fff",
              }}
            >
              800 Point
            </Text>
          </TouchableOpacity>
        </ImageBackground> */}

        <Text
          style={{
            fontSize: height * 0.04,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: height > 800 ? hp("10%") : hp("11%"),
            left: 20,
            color: "#fff",
          }}
        >
          Rewards
        </Text>
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
    height: height * 0.2,
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

  inputStyle: {
    paddingLeft: 13,
    marginLeft: 10,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 17,
    borderRadius: 5,
  },
  buttonContainer: {
    alignSelf: "center",
    marginTop: height * 0.015,
    borderRadius: 25,
    height: height * 0.045,
    justifyContent: "center",
    backgroundColor: Theme.redButtonColor,
    width: "85%",
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

export default RewardScreen;
