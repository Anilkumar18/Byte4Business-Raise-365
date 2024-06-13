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
  Alert
} from "react-native";
import { Icon } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import MaterialC from "react-native-vector-icons/MaterialCommunityIcons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { extraApiService } from "../Services/extraApiService";
import Theme from "../utils";
import ImageLoad from 'react-native-image-placeholder';
import { utils } from "../Utils/utils"
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share'
import Store from '../store'
import _ from 'lodash'
import moment from 'moment'
import { showMessage } from "react-native-flash-message";
import { useIsFocused } from '@react-navigation/native';

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const PurchaseHistoryScreen = (props) => {

  const [store, setStore] = useContext(Store.Context)

  const [loading, setLoading] = useState(true);
  const [productsPurchaseData, setProductsPurchaseData] = useState([]);
  const [fundraisersPurchaseData, setFundraisersPurchaseData] = useState({});

  const [itemid, setItemid] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [preparingShareContent, setPreparingShareContent] = useState(false)

  const [tabIndex, setTabIndex] = useState(0)
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  let refs = {}

  const userId = _.get(props, 'route.params.userId')

  useEffect(() => {
    if (isFocused) {
      loadData()
    }
  }, [isFocused]);

  const loadData = async () => {

    try {

      setLoading(true)

      const productsResponse = await extraApiService.getOrders()
      const fundraisersResponse = await extraApiService.getFundraisersPurchases()

      console.log('extraApiService.getOrders', productsResponse.data);
      console.log('extraApiService.getFundraisersPurchases', fundraisersResponse.data);

      setProductsPurchaseData(productsResponse.data)
      setFundraisersPurchaseData(fundraisersResponse.data)

      setLoading(false)
    }
    catch (error) {

      console.log('extraApiService.getFundraisersPurchases error', error);

      setLoading(false)

      utils.checkAuthorized(error, props.navigation)
    }
  }

  const onSharePress = async purchaseItem => {

    console.log('on share press', purchaseItem, userId);
    if (_.isEmpty(purchaseItem)) {
      showMessage({
        type: 'danger',
        message: 'An unexpected error ocurred on share your link'
      })
      return
    }

    try {

      const imageUrl = purchaseItem.fundraiser?.logo
      let fileContent = ''

      if (imageUrl) {

        setPreparingShareContent(true)

        const resp = await RNFetchBlob.config({ fileCache: true }).fetch('GET', imageUrl)
        const base64Data = await resp.readFile('base64')

        fileContent = `data:image/png;base64,${base64Data}`
        setPreparingShareContent(false)
      }

      if (userId) {
        extraApiService.shareCount({
          user_id: userId,
          fundraiser_type_id: purchaseItem.fundraiser_type_id,
          category_id: 0,
          page_type: 'share gift'
        })
          .then(data => {
            console.log('share count success', data)
          })
          .catch(error => {
            console.log('share count error', error);
          })
      }

       console.log('fileCOntnet', fileContent);
      setTimeout(async () => {
        const shareResponse = await Share.open({
          title: purchaseItem.fundraiser.fundraiser_name,
          message: `${purchaseItem.fundraiser.fundraiser_name} - ${purchaseItem.sharelink}`,
          subject: `${purchaseItem.fundraiser.fundraiser_name}`,
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

  const closeRow = item => {
    refs[item.id] && refs[item.id].close()
  }

  const deleteOrderPurchase = async item => {

    const oldData = productsPurchaseData
    try {


      setProductsPurchaseData(_.filter(oldData, purchase => purchase.id != item.id))
      const resp = await extraApiService.removeOrder(item.id)
      console.log('extraApiService.removeOrder', resp.data);

      if (resp.data?.status == 'ok') {
        showMessage({
          type: 'success',
          message: 'The order has been removed form history'
        })
      } else {
        showMessage({
          type: 'danger',
          message: 'Could not process your request at this time. Please try again later.'
        })
      }
    }
    catch (error) {
      console.log('extraApiService.removeOrder error', error);
      setProductsPurchaseData(oldData)
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
          onPress: () => deleteOrderPurchase(item),
        },
        {
          text: 'No',
          style: 'cancel',
          onPress: () => closeRow(item)
        }
      ]
    )
  }

  const onAddToCartMessagePrompt = item => {
    Alert.alert(
      'Reorder items',
      'Would you like to reorder these items?',
      [
        {
          text: 'Yes',
          onPress: () => {
            setStore(previous => ({
              ...previous,
              cart: {
                reordering: true,
                name: item.name,
                phone: item.phone,
                business: item.location,
                items: _.map(item.order_items, purchasedItem => ({
                  id: moment().toISOString(),
                  itemData: {
                    id: purchasedItem.item_id,
                    name: purchasedItem.item_name,
                    price: purchasedItem.price,
                    images: purchasedItem.images,

                    modifier_categories: purchasedItem.modifier_categories,
                     modifier_categories: [{
                       id: 'last-choice',
                       name: 'Last Choice',
                       modifiers: _.map(purchasedItem.order_item_options, modifier => ({
                         id: modifier.item_option_addon_id,
                         name: modifier.item_option_addon_name,
                         price: modifier.price
                       }))
                     }]
                  },
                  checkoutData: {
                    quantity: purchasedItem.quantity,
                    modifiers: _.map(purchasedItem.order_item_options, 'item_option_addon_id'),
                    notes: purchasedItem.note
                  }
                }))
              }
            }))
            props.navigation.navigate("cart")
          },
        },
        {
          text: 'No',
        }
      ]
    )
  }

  const renderProductPurchase = ({ item }) => {

    const logo = item.location_logo ? item.location_logo.replace(/bo_\d+px\w+\//, '') : ''
    const pickupDate = moment(item.order_date).isValid() ? moment(item.order_date).format('MM.DD.YY') : ''
    const address = item.address ? _.trim(item.address) : ''
    const total = item.total_price ? item.total_price : '0'

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
            onAddToCartMessagePrompt(item)

          }}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 10,
              paddingVertical: 5,
              minHeight: 70,
              backgroundColor: "#fff",
               alignSelf: "center",
              marginTop: 13,
              marginHorizontal: 10,
              width: wp("93%"),
              borderRadius: 10,
              justifyContent: 'center'
            }}
          >

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              {
                logo ? (
                  <ImageLoad
                    style={{
                      width: 50,
                      height: 50,
                      alignSelf: 'center'
                    }}
                    loadingStyle={{ size: 'large', color: 'blue' }}
                    placeholderStyle={{
                      width: 50,
                      height: 50,
                       backgroundColor: '#ccc'
                    }}
                    resizeMode='contain'
                    source={{ uri: logo }}
                  />
                ) : (
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: 'grey'
                    }}
                  />
                )
              }
              <View style={{
                flex: 1,
                marginLeft: 15,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: "Nunito-SemiBold"
                }}>{item.location_name}</Text>
                <View style={{
                  flexDirection: "row",
                  marginTop: 5,
                  justifyContent: 'space-between'
                }}>

                  <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start'
                  }}>

                    <Image
                      style={{ width: 10, height: 10, alignSelf: "center" }}
                      source={require("../assets/award.png")}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        marginLeft: 5,
                        color: "grey",
                        fontFamily: "Nunito-Regular",
                      }}
                    >{pickupDate}</Text>
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 12,
                       marginLeft: 5,
                      color: "grey",
                      fontFamily: "Nunito-Regular",
                    }}
                  >{utils.formatMoney(total)}</Text>

                </View>

                {
                  address ? (
                    <View style={{ flexDirection: "row", marginTop: 5 }}>
                      <Image
                        style={{ width: 10, height: 10, alignSelf: "center" }}
                        source={require("../assets/map-pin-red.png")}
                      />
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          marginLeft: 5,
                          color: "grey",
                          fontFamily: "Nunito-Regular",
                        }}
                      >{address}</Text>
                    </View>
                  ) : null
                }
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }

  const renderFundraiserPurchase = ({ item }) => {
    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          minHeight: 70,
          backgroundColor: "#fff",
          alignSelf: "center",
          marginTop: 13,
          width: wp("93%"),
          borderRadius: 10,
        }}
      >

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center'
        }}>

          <Text style={{
            color: "grey",
            fontSize: 12,
            fontFamily: 'Nunito',
          }}>Exp: {item.fundraiser.exp_date}</Text>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 0,
        }}>

          <ImageLoad
            style={{
              width: 50,
              height: 50,
               backgroundColor: '#ccc'
            }}
            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 50,
              height: 50,
               backgroundColor: '#ccc'
            }}
            resizeMode='contain'
            source={item.fundraiser.logo ? { uri: item.fundraiser.logo } : require("../assets/tea.png")}
          />

          <Text
            style={{
              flex: 1,
              marginHorizontal: 15,
              fontSize: 16,
              fontFamily: "Nunito-SemiBold",
              textAlign: 'center'
            }}
            adjustsFontSizeToFit
          >{item.fundraiser.fundraiser_name} - {item.fundraiser_type.name}</Text>

          {
            item.used ?
              <View style={{ minWidth: 50 }} /> :
              <View style={{
                backgroundColor: 'lightblue',
                borderRadius: 25,
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
                marginLeft: 5
              }}>
                <Ionicons
                  name='share-social-outline'
                  color='steelblue'
                  size={24}
                  onPress={() => onSharePress(item)}
                />
              </View>
          }

        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 5,
        }} >

          <View style={{ flexDirection: 'row', flex: 1, }}>
            <Image
              style={{ width: 10, height: 10, alignSelf: "center" }}
              source={require("../assets/award.png")}
            />
            <Text style={{
              color: "grey",
              fontSize: 12,
              fontFamily: 'Nunito',
            }}> {item.used ? 'Activated' : 'Unactivated'}</Text>
          </View>

          <Text style={{
            color: "grey",
            fontSize: 12,
            fontFamily: 'Nunito',
          }}>Purchased: {moment(item.updated_at).format('MM/DD/YYYY')}</Text>

          <View style={{ flex: 1 }} />

        </View>

      </View >
    )
  };

  const renderTabButtons = () => {

    const containerStyle = {
       alignSelf: "center",
      justifyContent: "center",
      borderRadius: 5,
       flex: 1,
      height: 32,
       width: "49%",

      backgroundColor: 'grey'
    }

    const selectedContainerStyle = {
      ...containerStyle,
      backgroundColor: 'white'
    }

    const textStyle = {
      fontSize: 14,
      textAlign: "center",
      fontFamily: "Nunito-SemiBold",
      color: 'white'
    }

    const selectedTextStyle = {
      ...textStyle,
      color: 'black'
    }


    return (

      <View style={{
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}>

        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setTabIndex(0)} >
          <View style={tabIndex == 0 ? selectedContainerStyle : containerStyle} >
            <Text style={tabIndex == 0 ? selectedTextStyle : textStyle}>Products</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: 8 }} />
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setTabIndex(1)} >
          <View style={tabIndex == 1 ? selectedContainerStyle : containerStyle}>
            <Text style={tabIndex == 1 ? selectedTextStyle : textStyle}>Fundraisers</Text>
          </View>
        </TouchableOpacity>

      </View>
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
          justifyContent: 'flex-end',
          marginTop: 15,
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

  const renderProductsPurchaseHistory = () => {

    if (_.isEmpty(productsPurchaseData)) {
      return (
        <Text style={{
          fontFamily: "Nunito-Italic",
          fontSize: 16,
          color: "#051533",
          margin: 15,
        }}>No history.</Text>
      )
    }

    return (
      <FlatList
        ListHeaderComponent={() => (
          <Text style={{
            fontFamily: 'Nunito-Regular',
            textAlign: 'center',
            marginTop: 13,
          }}>Swipe ← to delete or touch to update and checkout</Text>
        )}
        data={productsPurchaseData}
        keyExtractor={item => `${item.id}`}
        renderItem={renderProductPurchase}
      />
    )
  }

  const renderFundraiserPurchaseHistory = () => {

    if (_.isEmpty(fundraisersPurchaseData)) {
      return (
        <Text style={{
          fontFamily: "Nunito-Italic",
          fontSize: 16,
          color: "#051533",
          margin: 15,
        }}>No history.</Text>
      )
    }

    const items = _.flatMap(fundraisersPurchaseData,
      purchaseItem => _.times(purchaseItem.quantity, index => ({
        key: `${index}`,
        ...purchaseItem,
        used: index < purchaseItem.used
      }))
    )

    console.log('purchase items', items);

    return (
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${index}`}
        renderItem={renderFundraiserPurchase}
      />
    )
  }

  const renderContent = () => {

    if (loading) {
      return <ActivityIndicator color="#000" size="large" />
    }

    return tabIndex == 0 ?
      renderProductsPurchaseHistory() :
      renderFundraiserPurchaseHistory()
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={{
          width: wp("100%"),
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          paddingTop: insets.top,
          paddingBottom: 15,
          paddingHorizontal: 20,
          overflow: 'hidden'
        }}
        resizeMode='cover'
        source={require("../assets/topNew.png")}
      >

        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity onPress={props.navigation.goBack} >
            <Image source={require("../assets/back.png")} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 30,
              fontFamily: "Nunito-Bold",
              color: "#fff",
              textAlign: 'center',
              flex: 1,
            }}
          >Purchase History</Text>
          <View style={{ width: 32 }} />

        </View>

        {renderTabButtons()}

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
    height: hp("20%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  userInfoSection: {
    paddingLeft: 10,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),
    borderRadius: 10,
  },
  orderText: {
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.02,
    marginTop: height * 0.005,
    marginRight: 15,
  },
  buttonContainer: {
    color: "#fff",
    marginTop: height * 0.015,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: height * 0.05,
    backgroundColor: Theme.redButtonColor,
    width: "35%",
  },
  buttonDeleteContainer: {
    color: "#fff",
    marginTop: height * 0.015,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: height * 0.05,
    borderWidth: 1,
    borderColor: Theme.redButtonColor,
    width: "35%",
  },
});

export default PurchaseHistoryScreen;
