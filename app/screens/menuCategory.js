import React, { useState, useEffect, useContext } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
  Modal,
  Alert
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import Video from 'react-native-video';
import Store from '../store'

import ImagePicker from "react-native-image-picker";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import { set } from "react-native-reanimated";
import { extraApiService } from "../Services/extraApiService";
import ImageLoad from 'react-native-image-placeholder';
import RNFetchBlob from 'rn-fetch-blob'
import FlashMessage, { showMessage } from "react-native-flash-message";
import Share from 'react-native-share'
import { utils } from "../Utils/utils"
import _ from 'lodash'
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const MenuCategoryScreen = (props) => {
  const [store, setStore] = useContext(Store.Context)

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [preparingShareContent, setPreparingShareContent] = useState(false)
  const [photoModalVisible, setPhotoModalVisible] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoData, setPhotoData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  let localFlash = null
  const { category_tag, business } = props.route.params

  useEffect(() => {
    requestMenuByCategory()
  }, [])

  const requestMenuByCategory = async () => {

    try {


      let resp = await extraApiService.getMenuByCategory(category_tag, business.id)

      setLoading(false)
      setData(resp.data)

    } catch (error) {
      setLoading(false)
      console.log("eerrror", error)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const showLocalFlashMessage = options => {
    if (!localFlash) {
      return
    }
    localFlash.showMessage(options)
  }

  const updateItem = item => {
    setData(
      _.map(data, dataItem => dataItem.id == item.id ? item : dataItem)
    )
  }

  const onFavoritePress = async item => {

    try {

      const is_favourite = !item.favorited

      updateItem({ ...item, favorited: is_favourite })

      const response = await extraApiService.addFavoriteMenuItem(item, is_favourite)

      if (response.data.status == 'success') {

        showMessage({
          type: 'success',
          message: `Menu item successfully ${is_favourite ? 'added' : 'removed'}`
        })

      } else {

        updateItem(item)

        showMessage({
          type: 'danger',
          message: 'Could not process your request at this time. Please try again later.'
        })
      }
    }
    catch (error) {

      console.log('onFavoritePress', error);
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          updateItem(item)

          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const onCameraPress = item => {

    console.log('onCameraPress', item, props.route.params.business);

    const business = props.route.params?.business

    if (business && (!business.contests || _.isEmpty(business.contests))) {
      showMessage({
        type: 'warning',
        message: 'Contest is not active.'
      })
      return
    }

    setSelectedItem(item)
    setPhotoModalVisible(true)
  }

  const onUploadProgress = progressEvent => {
    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
  }

  const openImagePicker = () => {

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

    ImagePicker.showImagePicker(options, async response => {
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

  const onSubmit = async () => {

    if (!photoData) {
      showLocalFlashMessage({
        type: 'warning',
        message: 'Use your camera to take a picture'
      })
      return
    }

    try {

      setSubmitting(true)

      const business = props.route.params.business
      const contest_id = _.first(business.contests).id

      const uploadPayload = {
        location_id: business.id,
        contest_id,
        contest: photoData,
      }

      const uploadResp = await extraApiService.contestPhotoUpload(uploadPayload, onUploadProgress)
      console.log('extraApiService.contestPhotoUpload', uploadResp.data);

      const payload = {
        location_id: business.id,
        contest_id,
        photo_url: uploadResp.data.image,
        item_id: selectedItem.id,
        item_name: selectedItem.name
      }

      const resp = await extraApiService.createContestAction(payload)
      console.log('extraApiService.createContestAction', resp.data);

      setSubmitting(false)
      setPhotoData(null)
      setSelectedItem(null)
      setPhotoModalVisible(false)

      showMessage({
        type: 'success',
        message: 'Your photo has been sent'
      })
    }
    catch (error) {
      console.log('extraApiService.contestPhotoUpload error', error);
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

  const onSharePress = async item => {

    console.log('onSharePress', item);

    try {

      const imageUrl = _.get(item, 'images[0].image')

      if (!imageUrl) {
        console.log('cannot get image url');
        return
      }

      setPreparingShareContent(true)

      const resp = await RNFetchBlob.config({ fileCache: true }).fetch('GET', imageUrl)
      const base64Data = await resp.readFile('base64')

      const fileContent = `data:image/png;base64,${base64Data}`
      // console.log(fileContent);
      setPreparingShareContent(false)

      setTimeout(async () => {
        const shareResponse = await Share.open({
          title: item.name,
          message: item.description,
          subject: item.name,
          url: fileContent,
          failOnCancel: false,
        })
      }, 100)
    }
    catch (error) {
      setPreparingShareContent(false)
      console.log('error sharing content', error);
    }
  }

  const onSubmitGrade = (item, { rating, review }) => {
    console.log('update item', item, rating, review);
    updateItem({ ...item, rating, rating_total: review })
  }

  const renderItem = ({ item }) => {
    console.log("menuCategory item", item)
    const grade = utils.calculateGrade(item.rating)
    const media = _.first(item.images)
    const isVideo = media && media.is_video && media.image
    return (

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("productDetail", { data: item, locationId: props.route.params.business.id, onSubmit: onSubmitGrade })
        }}
        key={item.id}
        style={{
          backgroundColor: "#fff",
          // height: height > 800 ? height * 0.65 : height * 0.67,
          marginTop: 15,
          // paddingHorizontal:10,
          marginHorizontal: 10,
          borderRadius: 15,
          paddingBottom: 10,
        }}
      >


        {
          isVideo ? (
            <Video
              muted
              repeat
              source={{ uri: media.image }}
              style={{
                height: height * 0.4,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            />
          ) : (
              <ImageLoad
                style={{
                  // width: width * 0.9,
                  height: height * 0.4,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  resizeMode: "stretch",
                }}

                loadingStyle={{ size: 'large', color: 'blue' }}
                placeholderStyle={{
                  width: width * 0.9,
                  height: height * 0.4,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  resizeMode: "stretch",
                }}

                source={(media && media.image) ? { uri: media.image } : require("../assets/chorizo.png")}
              />
            )
        }

        <TouchableOpacity
          onPress={() => onFavoritePress(item)}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
          }}
        >
          <Image
            style={{
              width: height > 800 ? 50 : 40,
              height: height > 800 ? 50 : 40,

            }}
            source={
              item.favorited ?
                require("../assets/heartCategory-filled.png") :
                require("../assets/heartCategory.png")
            }
          />
        </TouchableOpacity>

        {
          Number(item.price) > 0 ? (
            <View
              style={{
                width: width * 0.18,
                height: height * 0.052,
                borderRadius: 10,
                position: "absolute",
                backgroundColor: Theme.redButtonColor,
                right: 0,
                top: height * 0.35,
              }}
            >
              < Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  marginTop: height * 0.01,
                  color: "#fff",
                }}
              >{utils.formatMoney(Number(item.price))}</Text>
            </View>
          ) : null
        }
        <Text
          style={{
            fontSize: height * 0.025,
            fontFamily: "Nunito-SemiBold",
            margin: 20,
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          {item.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginLeft: 20,
            // marginTop: 5,
            alignItems: 'center'
          }}
        >
          <Image
            style={{
              width: width * 0.03,
              height: height * 0.015,
              // marginTop: 3,
            }}
            source={require("../assets/award.png")}
          />
          {
            _.map(item.keys, key => key.image ? (
              <Image
                style={{ width: 40, height: 40, borderRadius: 20 }}
                source={{ uri: key.image }}
              />
            ) : null)
          }
        </View>
        <Text
          style={{
            fontFamily: "Nunito-Regular",
            fontSize: height * 0.022,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            color: "grey",
          }}
        >
          {item.description}
        </Text>
        <View
          style={{
            flexDirection: "row",
            height: height * 0.06,
            marginTop: 15,
          }}
        >
          <View
            style={{
              backgroundColor: grade.color,
              // backgroundColor: "#ffc0cb",
              width: width * 0.4,
              borderTopRightRadius: 25,
              borderBottomRightRadius: 25,
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                marginLeft: 20,
                fontFamily: "Nunito-Bold",
                fontSize: height * 0.03,
                color: 'black',
                marginTop: 5,
              }}
            >
              {grade.title}
            </Text>
            <TouchableOpacity style={{ justifyContent: "center" }}
              onPress={() => {
                props.navigation.navigate("productDetail", { data: item, locationId: props.route.params.business.id, onSubmit: onSubmitGrade })
              }}>
              <Text
                style={{
                  marginLeft: 5,
                  fontFamily: "Nunito-Regular",
                  fontSize: height * 0.014,
                  color: 'black',
                }}
              >
                Overall Grade
              </Text>
              <Text
                style={{
                  marginLeft: 5,
                  fontFamily: "Nunito-Regular",
                  fontSize: height * 0.014,
                  color: 'black',
                }}
              >
                ({item.rating_total} Ratings)
              </Text>
            </TouchableOpacity>
          </View>
          <Image
            style={styles.iconStyle}
            source={require("../assets/likeBlack.png")}
          />
          <TouchableOpacity onPress={() => onCameraPress(item)}>
            <Image
              style={styles.iconStyle}
              source={require("../assets/cameraBlack.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSharePress(item)}>
            <Image
              style={styles.iconStyle}
              source={require("../assets/shareBlack.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (_.isEmpty(store.cart.business) || store.cart.business.id == business.id) {
                props.navigation.navigate("orderItem", { item, business });
              } else {
                Alert.alert(
                  'You can only add items from one business at a time',
                  'Do you want to empty your cart to add this item?',
                  [
                    {
                      text: 'Yes, add this item',
                      onPress: () => {
                        setStore(previous => ({
                          ...previous,
                          cart: {
                            business: {},
                            items: []
                          }
                        }))
                        props.navigation.navigate("orderItem", { item, business });
                      }
                    },
                    {
                      text: 'No'
                    }
                  ]
                )
              }
            }}
          >
            <Image
              style={styles.iconStyle}
              source={require("../assets/cartBlack.png")}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity >

    );
  };

  const renderContent = () => {

    if (isLoading) {
      return <ActivityIndicator color="#000" size="large" />
    }

    return (
      <FlatList
        data={data}
        style={{ marginBottom: 15 }}
        renderItem={renderItem}
        keyExtractor={item => `${item.id}`}
      />
    )
  }

  const renderShareModal = () => {
    return (
      <Modal visible={preparingShareContent} transparent>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}>
            <ActivityIndicator size='large' color='black' />
            <Text
              style={{
                fontFamily: "Nunito-Regular",
                fontSize: height * 0.022,
                marginLeft: 20,
                marginRight: 20,
                marginTop: 5,
                color: "grey",
              }}
            >
              Preparing share content...
          </Text>
          </View>
        </View>
      </Modal>
    )
  }

  const renderPhotoModal = () => {

    const imageStyle = {
      width: height * 0.1,
      height: height * 0.1,
      alignSelf: 'center'
    }

    if (!selectedItem || !photoModalVisible) {
      return null
    }

    return (
      <Modal
        visible
        transparent
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

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
                justifyContent: 'center',
              }}>
                <Text style={{
                  fontSize: height * 0.022,
                  fontFamily: 'Nunito-Semibold',
                  color: 'black',
                  textAlign: 'center',
                }}
                  numberOfLines={2}>Photo contest</Text>
              </View>
              <MaterialC
                name='close'
                color='gray'
                size={height * 0.045}
                onPress={() => {
                  setSelectedItem(null)
                  setPhotoModalVisible(false)
                }}
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
                  <TouchableOpacity onPress={openImagePicker}>
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
                      }}>Take a picture</Text>

                    </View>
                  </TouchableOpacity>
                )
            }

            <TouchableOpacity
              onPress={onSubmit}
              disabled={submitting}
            >
              <View style={{
                flexDirection: 'row',
                alignSelf: "center",
                marginTop: 20,
                marginBottom: 10,
                borderRadius: 8,
                height: height * 0.05,
                justifyContent: "center",
                alignItems: 'center',
                backgroundColor: 'green',
                // paddingHorizontal: 25
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

        </View >
        <FlashMessage
          ref={e => localFlash = e}
          position='top'
        />
      </Modal >
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
            fontSize: height * 0.04,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: height * 0.12,
            left: 20,
            color: "#fff",
          }}
        >
          Menu
        </Text>
        {/* <Image
          style={{
            position: "absolute",
            top: height * 0.12,
            right: 15,
            width: height > 800 ? 45 : 37,
            height: height > 800 ? 45 : 37,
          }}
          source={require("../assets/cart.png")}
        /> */}
      </ImageBackground>

      {renderContent()}
      {renderShareModal()}
      {renderPhotoModal()}

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
    // alignSelf: "center",
    // width: width * 0.9,
    // height: height * 0.68,
    marginTop: 10,
  },
  iconStyle: {
    width: height > 800 ? 40 : 33,
    height: height > 800 ? 40 : 33,
    marginLeft: 10,
    marginTop: 5,
  },
});

export default MenuCategoryScreen;
