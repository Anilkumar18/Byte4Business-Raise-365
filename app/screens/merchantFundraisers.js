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
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  Modal,
  Keyboard,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  SafeAreaView
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TextInputMask, MaskService } from 'react-native-masked-text'
import openMap from 'react-native-open-maps';

import Theme from "../utils";
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import ImagePicker from "react-native-image-picker";
import DropDownItem from "react-native-drop-down-item";
import { extraApiService } from "../Services/extraApiService";
import ImageLoad from 'react-native-image-placeholder';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import Carousel from 'react-native-snap-carousel';

import { utils } from '../Utils/utils'
import _ from 'lodash'
import moment from 'moment'
import FlashMessage, { showMessage } from "react-native-flash-message";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const MerchantFundraiserScreen = (props) => {

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmItem, setConfirmItem] = useState(null)

  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoData, setPhotoData] = useState(null)
  const [selectedReward, setSelectedReward] = useState(null)
  const [userRewardId, setUserRewardId] = useState(null)
  const [redeeming, setRedeeming] = useState(false)
  const [amount, setAmount] = useState('0')
  const [date, setDate] = useState(moment().format('MM/DD/YYYY'))
  const [currentLocation, setCurrentLocation] = useState({})
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  const { data, fundraiserData, fundraiserType } = props.route.params

  let localFlash = null

  console.log('MerchantFundraiserScreen route params', props.route.params);

  useEffect(() => {
    loadData()
  }, []);

  const loadData = async () => {

    setLoading(true)

    try {

      const myLocation = await utils.getCurrentLocation()
      setCurrentLocation(myLocation)

      const location_id = props.route.params?.data?.id

      // const resp = await extraApiService.getFundraiserDealsByLocation(1022)
      const resp = await extraApiService.getFundraiserDealsByLocation(location_id, fundraiserType)
      console.log('extraApiService.getFundraiserDealsByLocation', resp.data);

      const filteredData = fundraiserType ?
        _.filter(resp.data.data,
          reward => _.includes(_.castArray(fundraiserType.id), reward.fundraiser_type.id)) :
        resp.data.data

      console.log('filtered getFundraiserDealsByLocation', fundraiserType, filteredData);
      setRewards(filteredData)

      setLoading(false)
    }
    catch (error) {
      console.log('extraApiService.getFundraiserDealsByLocation error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const cancelRedeem = async () => {

    try {

      setCancelling(true)

      console.log('extraApiService.cancelRedeem payload', userRewardId);
      const resp = await extraApiService.cancelRedeem({ id: userRewardId })
      console.log('extraApiService.cancelRedeem', resp.data);

      setCancelling(false)

      setSelectedReward(null)
      setPhotoData(null)
      setAmount(0)
      setDate(moment().format('MM/DD/YYYY'))

      showMessage({
        type: 'success',
        message: resp.data.success
      })
    }
    catch (error) {
      console.log('extraApiService.cancelRedeem error', error);
      setCancelling(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showLocalFlashMessage({
            type: 'danger',
            message: 'Could not process your request'
          })
        })
    }
  }

  const cancelRedeemPrompt = () => {

    if (submitting) {
      return
    }

    Alert.alert(
      'Cancel redeem?',
      'This reward needs a picture of your receipt to be approved. If you choose CANCEL, your reward will not be created. Are you sure?',
      [
        {
          text: 'Yes, I want to CANCEL',
          style: 'destructive',
          onPress: cancelRedeem
        },
        {
          text: 'No. I will take a picture'
        }
      ]
    )

  }

  const onSubmit = async () => {

    Keyboard.dismiss()

    const realAmount = MaskService.toRawValue('money', amount, {
      unit: '$',
      separator: '.',
      delimiter: ','
    })

    if (!photoData) {
      showLocalFlashMessage({
        type: 'warning',
        message: 'Use your camera to take a picture of your receipt'
      })
      return
    }

    if (realAmount <= 0) {
      showLocalFlashMessage({
        type: 'warning',
        message: 'The amount must be greater than $0,00'
      })
      return
    }

    if (!date) {
      showLocalFlashMessage({
        type: 'warning',
        message: 'Enter a valid date'
      })
      return
    }

    try {

      setSubmitting(true)

      const payload = {
        user_reward_id: userRewardId,
        photo: photoData,
        amount: realAmount,
        date
      }

      const resp = await extraApiService.rewardPhotoUpload(payload, onUploadProgress)
      console.log('extraApiService.rewardPhotoUpload', resp.data);

      setSubmitting(false)
      setSubmitted(true)

      setTimeout(() => {
        setSelectedReward(null)
        props.navigation.goBack()
      }, 3000)

       showMessage({
         type: 'success',
         message: 'Your receipt has been sent'
       })
    }
    catch (error) {
      console.log('extraApiService.rewardPhotoUpload error', error);
      setSubmitting(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showLocalFlashMessage({
            type: 'danger',
            message: 'Could not process your request'
          })
        })
    }
  }

  const showLocalFlashMessage = options => {
    if (!localFlash) {
      return
    }
    localFlash.showMessage(options)
  }

  const openCamera = () => {

    if (submitting) {
      return
    }

    const options = {
      title: "Take a picture",
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      noData: true,
      maxWidth: 500,
      maxHeight: 500
    };

    ImagePicker.launchCamera(options, async response => {
      if (response.didCancel) {
        console.log('user cancel camera');
      } else if (response.error) {
        console.log('camera error', response.error);
        showLocalFlashMessage({
          type: 'danger',
          message: 'Could not get image'
        })
      } else {
        console.log("camera response", response)
        const uri = Platform.OS === "android" ? response.uri : response.uri.replace("file://", "")
        const receipt = {
          uri,
          type: response.type,
          name: response.fileName
        };
        console.log('upload data', receipt);
        setPhotoData(receipt)
      }
    })

  }

  const onRedeemPress = item => {
    setConfirmItem(item)
    setConfirmModalVisible(true)
  }

  const redeem = async item => {

    try {

      setRedeeming(true)
      console.log('extraApiService.redeem payload', item);
      const resp = await extraApiService.redeem({
        id: item.id,
        fundraiser_type_id: fundraiserType ? fundraiserType.id : undefined
      })
      console.log('extraApiService.redeem', resp.data);
      setRedeeming(false)
      if (resp.data.error) {
        showMessage({
          type: 'danger',
          message: resp.data.error,
          duration: 6000
        })
      } else {

        setSelectedReward(item)
        setUserRewardId(resp.data.data.id)

        if (!item.take_receipt) {
          setSubmitted(true)
          setTimeout(() => {
            setSelectedReward(null)
            setSubmitted(false)
            props.navigation.goBack()
          }, 3000)
        }

        showMessage({
          type: 'success',
          message: resp.data.success,
          duration: 10000
        })
      }
    }
    catch (error) {
      console.log('extraApiService.redeem error', error);
      setRedeeming(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: `Could not process your request: ${resp.data.error}`
          })
        })
    }
  }

  const onUploadProgress = progressEvent => {
    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
  }

  const renderCard = ({ item, index }) => {
    console.log('render card item', item);

    const scrollviewStyles = item.photo ? {
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

    const descriptionFontSize = item.photo ? height * 0.022 : height * 0.044

    return (
      <View style={{ flex: 1, marginBottom: 15 }} >

        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("merchantDetail", { data, onUpdateBusiness: null });
          }}
          disabled={submitting}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              marginBottom: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ImageLoad
              style={{
                width: 38,
                height: 38,
                 borderRadius: 50,
              }}
               borderRadius={50}

              source={data.logo ? { uri: data.logo } : require("../assets/userImage.png")}
              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: 38,
                height: 38,
                 borderRadius: 50,
              }}
              resizeMode='contain'
            />
            <View
              style={{
                flex: 1,
                marginHorizontal: 5,
                alingItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Nunito-SemiBold",
                  textAlign: 'center',
                }}
                numberOfLines={2}
              >
                {data.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                openMap({
                  provider: 'google',
                  query: data.name,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  end: `${data.latitude},${data.longitude}`,
                })
              }}
              disabled={submitting}
            >

              <View style={{
                flex: 1,
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Image
                  style={{ width: 10, height: 10, alignSelf: "center" }}
                  source={require("../assets/map-pin-red.png")}
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    marginLeft: 5,
                    fontFamily: "Nunito-Regular",
                  }}
                >
                  {
                    utils.calculateDistance(
                      data.latitude,
                      data.longitude,
                      "M",
                      currentLocation.latitude,
                      currentLocation.longitude
                    )
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <View style={{ minWidth: 25 }} />

          <Text
            style={{
              textAlign: 'center',
              fontFamily: "Nunito-Bold",
              color: '#555',
            }}>Swipe to view deals</Text>

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
            item.photo ? (
              <ImageLoad
                style={{
                  flex: 1,
                   height: '40%',
                  backgroundColor: 'white',
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 25,
                }}
                placeholderStyle={{
                  flex: 1,
                   height: '40%',
                  backgroundColor: 'white',
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 25,
                }}
                resizeMode='contain'
                source={{ uri: item.photo }}
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
              {item.description}
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
            Exp: {moment(item.expired_until).isValid() ? moment(item.expired_until).format('MM/DD/YYYY') : '-'}
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

          {
            item.take_receipt ? <Text
              style={{
                fontSize: height * 0.018,
                fontFamily: "Nunito-Regular",
                textAlign: 'center',
                marginTop: 20
              }}
            >Take a picture of your receipt to get fundraiser credit!</Text> : null
          }
        </View>

        {/* <Text
          style={{
            fontSize: height * 0.018,
            fontFamily: "Nunito-Regular",
            textAlign: 'center',
            marginTop: 20
          }}
        >{`Swipe ← ${index + 1} of ${rewards.length}`}</Text> */}
      </View>
    )
  }

  const renderHeader = () => {

    const currentReward = rewards ? rewards[currentCardIndex] : null
    console.log('currnet Index', currentCardIndex, currentReward, data);

    const title = currentReward?.fundraiser_detail ?
      `${currentReward.fundraiser_detail.fundraiser_name}${currentReward.fundraiser_type?.name ? ` - ${currentReward.fundraiser_type.name}` : ''}` :
      'Fundraisers'

    return (
      <View style={{
        marginHorizontal: wp("5%"),
        marginBottom: 20
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: wp("90%"),
           marginLeft: wp("5%"),
          marginTop: Platform.OS === "ios" ? hp("5%") : hp("3%"),
        }}>


          <TouchableOpacity onPress={() => {
            if (!redeeming) {
              props.navigation.goBack();
            }
          }} >
            <Image source={require("../assets/back.png")} />
          </TouchableOpacity>

          {currentReward?.fundraiser_detail ?
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
              source={currentReward.fundraiser_detail.logo ? { uri: currentReward.fundraiser_detail.logo } : require("../assets/tea.png")}
            /> :
            <Text
              adjustsFontSizeToFit
              style={{
                fontSize: 28,
                fontFamily: "Nunito-Bold",
                color: "#fff",
                textAlign: 'center'
              }}
              numberOfLines={1}
            >{title}</Text>
          }

          <View style={{ minWidth: 32 }} />
        </View>
        {
          currentReward?.fundraiser_detail ?
            <Text
              adjustsFontSizeToFit
              style={{
                fontSize: 24,
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

  const renderContent = () => {

    if (loading) {
      return <ActivityIndicator color="#051533" size="large" />
    }

    if (rewards.length < 1) {
      return (
        <View style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 50
        }}>
          <Image
            style={{
              width: height * 0.15,
              height: height * 0.15,
              alignSelf: 'center',
              backgroundColor: 'transparent'
            }}
            source={require('../assets/appicon.png')}
          />
          <Text style={{
            fontSize: height * 0.022,
            fontFamily: 'Nunito-Regular',
            color: 'black',
            textAlign: 'center',
            marginVertical: 30,
          }}>You have redeemed all available deals for this Business.  Thank you for your support</Text>
        </View>
      )
    }

    return (
      <Carousel
        data={rewards}
        renderItem={renderCard}
        sliderWidth={width}
        itemWidth={wp("90%")}
        onSnapToItem={setCurrentCardIndex}
        removeClippedSubviews={false}
      />
    )
  }

  const renderModalContent = () => {
    console.log('renderModalContent', selectedReward);
    const message = selectedReward.redeem_confirm_msg ||
      `Thank you for supporting the ${selectedReward.fundraiser_detail.fundraiser_name} ${selectedReward.fundraiser_type.name} Fundraiser!`
    const imageStyle = {
      width: height * 0.1,
      height: height * 0.1,
      alignSelf: 'center'
    }
    if (submitted) {
      return (
        <View style={{
          width: width * 0.9,
          borderRadius: 15,
          backgroundColor: 'white',
          padding: 5,
        }}>
          <View style={{
            borderRadius: 20,
            borderColor: 'black',
            borderWidth: 2,
            padding: 20
          }}>

            <ImageLoad
              style={imageStyle}
              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={imageStyle}
              resizeMode='contain'
              source={selectedReward.fundraiser_detail.logo ? { uri: selectedReward.fundraiser_detail.logo } : require("../assets/tea.png")}
            />

            <Text style={{
              fontSize: height * 0.022,
              fontFamily: 'Nunito-Semibold',
              color: 'black',
              textAlign: 'center',
              marginTop: 30,
            }}>{message}</Text>

          </View>
        </View>
      )
    }

    if (cancelling) {
      return (
        <View style={{
          width: width * 0.9,
          borderRadius: 15,
          backgroundColor: 'white',
          padding: 5,
        }}>
          <View style={{
            borderRadius: 20,
            borderColor: 'black',
            borderWidth: 2,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}>

            <ActivityIndicator size='large' color='"#051533"' />

            <Text style={{
              fontSize: height * 0.022,
              fontFamily: 'Nunito-Semibold',
              color: 'black',
              textAlign: 'center',
              marginTop: 30,
            }}>Cancelling your reward...</Text>

          </View>
        </View>
      )
    }

    return (
      <View style={{
        maxWidth: width * 0.9,
        borderRadius: 15,
        backgroundColor: 'white',
        paddingVertical: 20,
        paddingHorizontal: 20
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <View style={{ minWidth: height * 0.045 }} />
          <View style={{
            marginBottom: 10,
            flex: 1,
          }}>
            <Text style={{
              fontSize: height * 0.022,
              fontFamily: 'Nunito-Semibold',
              color: 'black',
              textAlign: 'center',
            }}
              numberOfLines={2}>{selectedReward.fundraiser_detail.fundraiser_name}</Text>
            <Text style={{
              fontSize: height * 0.02,
              fontFamily: 'Nunito-Semibold',
              color: 'black',
              textAlign: 'center',
            }}>"{selectedReward.fundraiser_type.name}"</Text>
          </View>
          <MaterialC
            name='close'
            color='gray'
            size={height * 0.045}
            onPress={cancelRedeemPrompt}
          />
        </View>
        {
          photoData ? (
            <ImageBackground
              style={{
                width: width * 0.8,
                height: width * 0.8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              source={{ uri: photoData.uri }}
            >
              {
                submitting ? (
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    backgroundColor: 'rgba(50,50,50,0.5)',
                    borderRadius: 10
                  }}>
                    <ActivityIndicator color="white" size="large" />
                    <Text style={{
                      fontSize: height * 0.02,
                      fontFamily: 'Nunito-Regular',
                      color: 'white',
                      marginLeft: 10
                    }}>{uploadProgress} %</Text>
                  </View>
                ) : null
              }
            </ImageBackground>
          ) : (
            <TouchableOpacity onPress={openCamera}>
              <View style={{
                width: width * 0.8,
                height: width * 0.8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}>
                <MaterialC
                  name='camera'
                  color='white'
                  size={width * 0.12}
                />
                <Text style={{
                  fontSize: height * 0.02,
                  fontFamily: 'Nunito-Regular',
                  color: 'white'
                }}>Take a picture of your receipt</Text>

              </View>
            </TouchableOpacity>
          )
        }

        <Text style={{
          fontFamily: 'Nunito-Regular',
          fontSize: height * 0.022,
          marginTop: 10,
          textAlign: 'center'
        }}>Enter receipt total and date</Text>

        <View style={{
          marginVertical: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          <TextInputMask
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: height * 0.02,
              color: 'black',
              flex: 1,
              textAlign: 'center',
              borderColor: '#555',
              borderWidth: 1,
              borderRadius: 5,
              marginLeft: 10,
              marginRight: 15,

            }}
            type='money'
            options={{
              unit: '$',
              separator: '.',
              delimiter: ','
            }}
            maxLength={11}
            value={amount}
            onChangeText={setAmount}
          />

          <TextInputMask
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: height * 0.02,
              color: 'black',
              flex: 1,
              textAlign: 'center',
              borderColor: '#555',
              borderWidth: 1,
              borderRadius: 5,
              marginLeft: 15,
              marginRight: 10,
            }}
            type='datetime'
            options={{
              format: 'MM/DD/YYYY'
            }}
            value={date}
            onChangeText={setDate}
          />
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={submitting}
          style={{ alignSelf: 'center', }}
        >
          <View style={{
            flexDirection: 'row',
             alignSelf: "center",
            marginBottom: 10,
            borderRadius: 8,
            height: height * 0.05,
            justifyContent: "center",
            alignItems: 'center',
            backgroundColor: 'green',
            paddingHorizontal: 25,
             width: "50%",
          }}>
            {submitting ? <ActivityIndicator color='#fff' /> : null}
            <Text
              style={{
                color: "#fff",
                fontSize: height * 0.020,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
                marginLeft: submitting ? 15 : 0
              }}
            >
              SUBMIT
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )

  }

  const renderConfirmModal = () => {

    if (!confirmModalVisible || !confirmItem) {
      return null
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <SafeAreaView style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{
            width: width * 0.9,
            borderRadius: 15,
            backgroundColor: 'white',
            padding: 20,
            justifyContent: 'center'
          }}>

            <Text style={{
              fontFamily: 'nunito-regular',
              fontSize: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}>Are you sure you want to Redeem this deal?</Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              <View style={{
                color: "#fff",
                alignSelf: "center",
                justifyContent: "center",
                borderRadius: 25,
                height: height * 0.05,
                backgroundColor: Theme.screenBackground,
                width: "30%",
              }}>
                <TouchableOpacity onPress={() => {
                  setConfirmModalVisible(false)
                  setConfirmItem(null)
                }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: height * 0.018,
                      textAlign: "center",
                      fontFamily: "Nunito-Bold",
                    }}
                  >NO</Text>
                </TouchableOpacity>
              </View>
              <View style={{
                color: "#fff",
                alignSelf: "center",
                justifyContent: "center",
                borderRadius: 25,
                height: height * 0.05,
                backgroundColor: Theme.redButtonColor,
                 paddingHorizontal: 20,
                width: "30%",
              }}>
                <TouchableOpacity onPress={() => {
                  setConfirmModalVisible(false)
                  redeem(confirmItem)
                }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: height * 0.018,
                      textAlign: "center",
                      fontFamily: "Nunito-Bold",
                    }}
                  >YES</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </SafeAreaView>
      </View>
    )
  }

  const renderModal = () => {

    if (!userRewardId || !selectedReward) {
      return null
    }

    return (
      <Modal
        visible
        transparent
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {renderModalContent()}
            </View >
          </TouchableWithoutFeedback>
          <FlashMessage
            ref={e => localFlash = e}
            position='top'
          />
        </KeyboardAvoidingView>
      </Modal >
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/topNew.png")}
      >
        {renderHeader()}
      </ImageBackground>

      {renderContent()}
      {renderModal()}
      {renderConfirmModal()}
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
     height: height * 0.2,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
    paddingLeft: 10,
     height: 70,
     backgroundColor: "#fff",
    backgroundColor: "transparent",
     alignSelf: "center",
     marginVertical: 10,
     width: wp("93%"),

    borderRadius: 10,
  },
  dropdwonSection: {
    height: 115,
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),

    borderRadius: 10,
  },
  logo: {
    position: "absolute",
    top: hp("30%"),
  },
  viewBack: {
    backgroundColor: "#fff",
    bottom: hp("5%"),
    height: hp("70%"),
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  inputStyle: {
    marginLeft: 15,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 19,
  },
  inputContainer: {
    color: "#051533",
    marginTop: 20,
    alignSelf: "center",
    justifyContent: "center",
    height: Theme.textInputHeight,

    width: "85%",
  },
  inputNameContainer: {
    color: "#051533",
    marginTop: 30,
    alignSelf: "center",
    width: "85%",
  },
  buttonContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: 30,
    backgroundColor: Theme.redButtonColor,
    width: "35%",
  },
  buttonDeleteContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: 30,
    borderWidth: 1,
    borderColor: Theme.redButtonColor,
    width: "35%",
  },
});

export default MerchantFundraiserScreen;
