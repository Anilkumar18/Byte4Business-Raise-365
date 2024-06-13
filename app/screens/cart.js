import React, { useContext, useState, useRef, useEffect } from 'react'
import { View, SafeAreaView, ScrollView, Platform, Text, TextInput, KeyboardAvoidingView, Image, ImageBackground, Dimensions, TouchableOpacity, FlatList, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckBox from "react-native-check-box";

import { TextInputMask, MaskService } from 'react-native-masked-text'
import Theme from "../utils";
import { utils } from '../Utils/utils'
import Store from '../store'
import _, { now, initial } from 'lodash'
import moment from 'moment'
import { showMessage } from 'react-native-flash-message';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { extraApiService } from '../Services/extraApiService';
import { ActivityIndicator } from 'react-native-paper';

const { width, height } = Dimensions.get("screen");


const DateTimePicker = ({
  visible,
  title,
  onCancel,
  onConfirm,
  ...dateTimeProps
}) => {


  const now = moment()

  const [value, setValue] = useState(dateTimeProps?.initialValue || now)
  console.log('initial value', value);

  if (!visible) {
    return null
  }

  if (Platform.OS == 'android') {
    return (
      <RNDateTimePicker
        {...dateTimeProps}
        value={value}
        onChange={(event, value) => {
          if (value) {
            onConfirm(value)
          } else {
            onCancel()
          }
        }}
      />
    )
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
          paddingVertical: 20,
           alignItems: 'center',
          justifyContent: 'center'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginHorizontal: 15,
          }}>
            <View style={{ width: 28 }} />
            <Text
              style={{
                flex: 1,
                fontFamily: "Nunito-Regular",
                fontSize: height * 0.022,
                color: "grey",
                textAlign: 'center',
              }}
            >{title}</Text>

            <Icon
              name='close'
              color='grey'
              size={28}
              onPress={onCancel}
            />
          </View>

          <View style={{ marginVertical: 20, }} >
            <RNDateTimePicker
              display='spinner'
              {...dateTimeProps}
              value={value}
              onChange={(event, value) => setValue(value)}
            />
          </View>

          <TouchableOpacity onPress={() => onConfirm(value)} >
            <View style={{
              color: "#fff",
              marginTop: 25,
              alignSelf: "center",
              justifyContent: "center",
              borderRadius: 25,
              height: Theme.buttonHeight,
              backgroundColor: Theme.redButtonColor,
              width: "85%",
            }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >Confirm</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const CartScreen = props => {

  const [store, setStore] = useContext(Store.Context)
  const { cart } = store
  const reordering = !!cart.reordering
  const initialName = cart.name || ''
  const initialPhone = cart.phone || ''

  const [submitting, setSubmitting] = useState(false)
  const [donation, setDonation] = useState('20')

  const [deliveryMethod, setDeliveryMethod] = useState('Pickup')

  const [deliveryDate, setDeliveryDate] = useState(moment())
  const [deliveryTime, setDeliveryTime] = useState(moment().add(1, 'h'))
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [timePickerVisible, setTimePickerVisible] = useState(false)


  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)

  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [deliveryState, setDeliveryState] = useState('')
  const [deliveryZipcode, setDeliveryZipcode] = useState('')

  const [paymentMethod, setPaymentMethod] = useState('')

  const [checkoutVisible, setCheckoutVisible] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])

  const [paymentUserName, setPaymentUserName] = useState('')
  const [paymentCardNumber, setPaymentCardNumber] = useState('')
  const [paymentExpDate, setPaymentExpDate] = useState('')
  const [paymentCVC, setPaymentCVC] = useState('')

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const listRef = useRef()
  const deliveryCardRef = useRef(null)
  const deliveryExpRef = useRef(null)
  const deliveryCVCRef = useRef(null)

  const issuer = /^(34|37)/.test(paymentCardNumber) ? 'amex' : 'visa-or-mastercard'
  const rawCardNumber = _.replace(paymentCardNumber, /\s/g, '').substr(0, issuer == 'amex' ? 15 : 16)

   console.log('reordering?', cart.reordering, cart.name, cart.phone);

  useEffect(() => {
    if (isFocused) {
      loadData()
    }
  }, [isFocused])

  useEffect(() => {
    setName(cart.name || '')
    setPhone(cart.phone || '')
  }, [store.cart])

  const loadData = async () => {

    const paymentMethod = JSON.parse(await AsyncStorage.getItem('@payment_method'))
    console.log('payment data', paymentMethod);

    setPaymentMethods(paymentMethod || [])
  }

  const clearForms = () => {

    setDonation('20')

    setDeliveryMethod('Pickup')

    setDeliveryDate(moment())
    setDeliveryTime(moment().add(1, 'h'))
    setDatePickerVisible(false)
    setTimePickerVisible(false)

    setDeliveryAddress('')
    setDeliveryCity('')
    setDeliveryState('')
    setDeliveryZipcode('')

    setPaymentMethod('')
    setName('')
    setPhone('')

    setCheckoutVisible(false)

    setPaymentUserName('')
    setPaymentCardNumber('')
    setPaymentExpDate('')
    setPaymentCVC('')
  }

  const updateCheckoutData = (cartItem, checkoutData) => {
    setStore(previous => ({
      ...previous,
      cart: {
        ...previous.cart,
        items: _.map(previous.cart.items, item =>
          item.id == cartItem.id ?
            ({
              ...item,
              checkoutData: {
                ...item.checkoutData,
                ...checkoutData
              }
            }) : item)
      }
    }))
  }

  const calculateItemsSubtotal = () => {
    return _.sumBy(cart.items, cartItem => {
      const price = Number(cartItem.itemData.price)
      const modifiersSubtotal = _.sumBy(cartItem.checkoutData.modifiers, modifierId => {
        const found = _.find(_.flatMap(cartItem.itemData.modifier_categories, 'modifiers'), { id: modifierId })
        return found ? Number(found.price) : 0
      })
      const quantity = Number(cartItem.checkoutData.quantity)
      return (price + modifiersSubtotal) * quantity
    })
  }

  const removeItemFromCart = cartItem => {
    setStore(previous => {

      const itemsAfterRemove = _.filter(previous.cart.items, item => item.id != cartItem.id)
      const businessAfterRemove = itemsAfterRemove.length > 0 ? previous.cart.business : {}

      return ({
        ...previous,
        cart: {
          ...previous.cart,
          business: businessAfterRemove,
          items: itemsAfterRemove
        }
      })
    })
  }

  const onRemoveItemPress = cartItem => {

    Alert.alert(
      'Remove item from cart',
      'Are you sure?',
      [
        {
          text: 'Yes, remove this item',
          onPress: () => removeItemFromCart(cartItem)
        },
        {
          text: 'Cancel'
        }
      ]
    )
  }

  const removePaymentMethod = async method => {

    console.log('method', method);

    const oldPaymentMethods = paymentMethods

    try {

      const updatedPaymentMethods = _.filter(paymentMethods, ({ id }) => id != method.id)

      setPaymentMethods(updatedPaymentMethods)

      const resp = await extraApiService.removePaymentMethod(method.id)

      console.log('extraApiService.removePaymentMethod', resp);

      if (resp.data?.status == 'success') {
        await AsyncStorage.setItem('@payment_method', JSON.stringify(updatedPaymentMethods))
      } else {
        setPaymentMethods(oldPaymentMethods)
        showMessage({
          type: 'danger',
          message: 'Could not remove this card'
        })
      }
    }
    catch (error) {
      console.log('extraApiService.removePaymentMethod error', JSON.stringify(error));
      setPaymentMethods(oldPaymentMethods)
      showMessage({
        type: 'danger',
        message: 'Could not remove this card'
      })
    }
  }

  const onRemovePaymentMethodPress = method => {

    Alert.alert(
      'Remove card',
      `Are you sure you want to remove card **** **** **** ${method.last4}?`,
      [
        {
          text: 'Yes',
          onPress: () => removePaymentMethod(method)
        },
        {
          text: 'Cancel'
        }
      ]
    )
  }

  const onCheckoutPress = () => {

    Keyboard.dismiss()

    if (!_.trim(name)) {
      listRef.current.scrollToEnd()
      showMessage({
        type: 'warning',
        message: 'Fill your name'
      })
      return
    }

    if (!/\(\d{3}\) \d{3}\-\d{4}/.test(phone)) {
      listRef.current.scrollToEnd()
      showMessage({
        type: 'warning',
        message: 'Invalid phone'
      })
      return
    }

    if (deliveryMethod == 'Delivery') {

      if (!_.every([deliveryAddress, deliveryCity, deliveryState, deliveryZipcode], _.trim)) {
        listRef.current.scrollToEnd()
        showMessage({
          type: 'warning',
          message: 'Fill all delivery address fields'
        })
        return
      }

      if (deliveryZipcode.length < 5) {
        listRef.current.scrollToEnd()
        showMessage({
          type: 'warning',
          message: 'Invalid zip code'
        })
        return
      }
    }

    if (!paymentMethod) {
      listRef.current.scrollToEnd()
      showMessage({
        type: 'warning',
        message: 'Select one payment method'
      })
      return
    }

    if (paymentMethod == 'new') {
      if (!_.every([paymentUserName, paymentCardNumber, paymentExpDate, paymentCVC], _.trim)) {
        listRef.current.scrollToEnd()
        showMessage({
          type: 'warning',
          message: 'Fill all new payment fields'
        })
        return
      }

      if (issuer == 'amex' ? rawCardNumber.length < 15 : rawCardNumber.length < 16) {
        console.log('invalid card', rawCardNumber, rawCardNumber.length);
        listRef.current.scrollToEnd()
        showMessage({
          type: 'warning',
          message: 'Invalid card number'
        })
        return
      }

      if (!MaskService.isValid('datetime', paymentExpDate, { format: 'MM/YYYY' })) {
        listRef.current.scrollToEnd()
        showMessage({
          type: 'warning',
          message: 'Invalid exp date'
        })
        return
      }
    }

    checkout()
  }

  const checkout = async () => {

    const momentExpDate = moment(paymentExpDate, 'MM/YYYY')

    try {

      const new_method = paymentMethod == 'new' ? {
        name: paymentUserName,
        card: rawCardNumber,
        month: momentExpDate.format('MM'),
        year: momentExpDate.format('YYYY'),
        cvv: paymentCVC
      } : undefined

      const payload = {
        location_id: Number(cart.business.id),
        donation: MaskService.toRawValue('money', donation, {
          unit: '$ ',
          separator: '.',
          delimiter: ','
        }),
        pickup_time: `${deliveryDate.format('YYYY-MM-DD')} ${deliveryTime.format('HH:mm:ss')}`,
        name,
        phone,
        order_type: deliveryMethod,
        address: deliveryMethod == 'Delivery' ? `${deliveryAddress} ${deliveryCity} ${deliveryState} ${deliveryZipcode}` : '',
        order_items: _.map(cart.items, cartItem => ({
          item_id: cartItem.itemData.id,
          menu_id: cartItem.itemData.menu_id,
          category_id: cartItem.itemData.category_id,
          quantity: cartItem.checkoutData.quantity,
          price: Number(cartItem.itemData.price),
          note: cartItem.checkoutData.notes,
          order_item_options:
            cartItem.checkoutData.modifiers.length > 0 ?
              _.map(cartItem.checkoutData.modifiers, modifierId => ({
                item_option_addon_id: modifierId,
                price: Number(_.get(_.find(_.flatMap(cartItem.itemData.modifier_categories, 'modifiers'), { id: modifierId }), 'price')),
                quantity: 1
              })) : undefined
        })),
        payment_method: paymentMethod,
        new_method
      }

      console.log('checkout payload', payload, issuer, rawCardNumber, rawCardNumber.length);

      setSubmitting(true)
      const resp = await extraApiService.checkout(payload);
      console.log('checkout response', resp);
      setSubmitting(false)

      if (resp.data?.status == 'success') {

        showMessage({
          type: 'success',
          message: 'Your order has been sent'
        })

        if (resp.data?.new_method) {
          const updatedPaymentMethods = [...paymentMethods, resp.data.new_method]
          await AsyncStorage.setItem('@payment_method', JSON.stringify(updatedPaymentMethods))
          setPaymentMethods(updatedPaymentMethods)
        }

        setStore(previous => ({ ...previous, cart: { business: {}, items: [] } }))
        clearForms()

      } else {
        showMessage({
          type: 'danger',
          message: 'Could not process your request'
        })
      }
    }
    catch (error) {
      console.log('checkout error', JSON.stringify(error));
      setSubmitting(false)
      showMessage({
        type: 'danger',
        message: 'Could not process your request'
      })
    }
  }

  const renderBusiness = () => {

    if (_.isEmpty(store.cart.business)) {
      return null
    }

    const textStyle = {
      fontSize: 24,
      fontFamily: "Nunito-Bold",
      color: "#fff",
      textAlign: 'center',
    }

    return (
      <View style={{ marginTop: 15 }}>
        <Text style={textStyle}>{store.cart.business.name}</Text>
        <Text style={{
          ...textStyle,
          fontFamily: 'nunito-regular',
          fontSize: 20,
        }}>{store.cart.business.address}</Text>
      </View>
    )
  }

  const renderModifiers = item => {

    const { itemData, businessData, checkoutData } = item

    if (_.isEmpty(checkoutData.modifiers)) {
      return null
    }

    return (
      <View>
        {
          _.map(checkoutData.modifiers, modifierId => {

            const found = _.find(_.flatMap(itemData.modifier_categories, 'modifiers'), { id: modifierId })

            if (!found) {
              return null
            }

            return (
              <View
                key={modifierId}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                <Text
                  style={{
                    fontFamily: "Nunito-Regular",
                    color: 'gray'
                  }}
                >{found.name}</Text>
                <Text
                  style={{
                    fontFamily: "Nunito-Regular",
                    color: 'gray'
                  }}
                >$ {found.price}</Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  const renderItem = ({ item: cartItem }) => {

    const imageStyle = {
      backgroundColor: 'gray',
      width: '100%',
      height: height * 0.25,
      borderRadius: 15,
    }

    const image = _.get(cartItem, 'itemData.images[0].image')
    const subtotal = Number(cartItem.itemData.price) * cartItem.checkoutData.quantity
     const subtotalWithModifiers = cartItem.itemData.price * cartItem.checkoutData.quantity +
       _.sumBy(cartItem.checkoutData.modifiers, modifierId => {
         const found = _.find(
           _.flatMap(cartItem.itemData.modifier_categories, 'modifiers'),
           { id: modifierId }
         )
         return found ? Number(found.price) : 0
       })

    return (
      <View style={{
        flex: 1,
        borderRadius: 15,
        backgroundColor: 'white',
        marginTop: 15,
        marginHorizontal: 15,
         paddingBottom: 15,
      }}>
        <View>

          {
            image ?
              <Image
                style={imageStyle}
                source={{ uri: image }}
                resizeMode='cover'
              /> :
              <View style={imageStyle} />
          }

          {
            Number(cartItem.itemData.price) > 0 ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                  position: "absolute",
                  backgroundColor: Theme.redButtonColor,
                  right: 0,
                  bottom: 0,
                }}
              >
                < Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: height * 0.02,
                    textAlign: "center",
                    color: "#fff",
                  }}
                >{utils.formatMoney(Number(cartItem.itemData.price))}</Text>
              </View>
            ) : null
          }
        </View>

        <View style={{ padding: 15, }}>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Nunito-regular',
            }}>{cartItem.checkoutData.quantity}x {cartItem.itemData.name}</Text>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Nunito-regular',
            }}>{utils.formatMoney(subtotal)}</Text>

          </View>

          <View style={{
            flexDirection: 'row',
            marginTop: 10,
            backgroundColor: "#e6e6e6",
            padding: 10,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            alignItems: 'center',
          }}>

            <TouchableOpacity
              onPress={() => {

                if (cartItem.checkoutData.quantity <= 1) {
                  return
                }

                updateCheckoutData(cartItem, { quantity: cartItem.checkoutData.quantity - 1 })
              }}
            >
              <Icon
                name='minus-circle-outline'
                size={30}
                color='red'
              />
            </TouchableOpacity>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                fontFamily: 'nunito-regular',
                fontSize: 16,
              }}>Quantity: </Text>
              <Text style={{
                fontFamily: 'nunito-bold',
                fontSize: 22,
              }}>{cartItem.checkoutData.quantity}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (cartItem.checkoutData.quantity >= 99) {
                  return
                }

                updateCheckoutData(cartItem, { quantity: cartItem.checkoutData.quantity + 1 })
              }}
            >
              <Icon
                name='plus-circle-outline'
                size={30}
                color='red'
              />
            </TouchableOpacity>

          </View>

          <View style={styles.separator} />

          {
            !_.isEmpty(cartItem.itemData.modifier_categories) ? (
              <View>
                {
                  _.map(cartItem.itemData.modifier_categories, category => (
                    <View key={category.id}>
                      <Text style={{
                        color: 'grey',
                        fontSize: height * 0.018,
                        fontFamily: "Nunito-Regular",
                      }}>{category.name}{category.select_only_one ? ' (only one)' : ''}</Text>
                      {
                        _.map(category.modifiers, modifier => (
                          <View
                            key={modifier.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginLeft: 5,
                            }}>
                            <CheckBox
                              style={{ flex: 1, paddingVertical: 10 }}
                              isChecked={_.includes(cartItem.checkoutData.modifiers, modifier.id)}
                              rightText={modifier.name}
                              rightTextStyle={{ fontSize: height * 0.02 }}
                              onClick={() => {
                                if (category.select_only_one) {
                                  updateCheckoutData(cartItem, {
                                    modifiers: [
                                      ..._.difference(cartItem.checkoutData.modifiers, _.map(category.modifiers, 'id')),
                                      modifier.id
                                    ]
                                  })
                                } else {
                                  updateCheckoutData(cartItem, {
                                    modifiers: _.xor(cartItem.checkoutData.modifiers, [modifier.id])
                                  })
                                }
                              }}
                            />
                            <Text
                              style={{
                                fontSize: height * 0.02,
                                fontFamily: "Nunito-Regular",
                              }}
                            >{utils.formatMoney(Number(modifier.price))}</Text>
                          </View>
                        ))
                      }
                    </View>
                  ))
                }
                <View style={styles.separator} />
              </View>
            ) : null
          }

          <TextInput
            style={{
              backgroundColor: "#e6e6e6",
              padding: 7,
              // marginTop: height * 0.02,
              width: width * 0.85,
              color: "#051533",
              fontFamily: "Nunito-Regular",
              fontSize: height * 0.02,
              height: height * 0.1,
              borderRadius: 5,
            }}
            placeholder='Notes'
            scrollEnabled={false}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            placeholderTextColor="grey"
            value={cartItem.checkoutData.notes}
            onChangeText={notes => updateCheckoutData(cartItem, { notes })}
          />

          { <View style={{
            marginTop: 15,
            flexDirection: 'row',
          }}>

            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
              <Text style={{
                fontFamily: 'nunito-regular',
                fontSize: 16,
              }}>Subtotal</Text>
              <Text style={{
                fontFamily: 'nunito-regular',
                fontSize: 16,
              }}>$ {subtotalWithModifiers}</Text>
            </View>

          </View> }

          <View style={{
            marginTop: 15,
            alignItems: 'flex-end'
          }}>
            <TouchableOpacity onPress={() => onRemoveItemPress(cartItem)}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 5,
                borderColor: Theme.redButtonColor,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
                <Icon
                  name='delete-outline'
                  size={24}
                  color={Theme.redButtonColor}
                />
                <Text style={{
                  marginLeft: 5,
                  fontSize: 16,
                  fontFamily: 'nunito-regular',
                  color: Theme.redButtonColor
                }}>Remove item</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>

      </View>
    )
  }

  const renderSummary = () => {

    const rowStyle = {
      flexDirection: 'row',
      marginBottom: 10
    }
    const textStyle = {
      fontFamily: 'nunito-regular',
      fontSize: 16,
    }

    const itemsSubtotal = calculateItemsSubtotal()
    const taxes = cart.business.tax
    const serviceFee = cart.business.service_fee_type == 'percent' ? (Number(cart.business.fee) / 100) * itemsSubtotal : Number(cart.business.fee)

     const rawDonation = MaskService.toRawValue('money', donation, {
       unit: '$ ',
       separator: '.',
       delimiter: ','
     })

    const fixedDonation = Number(donation) > 0 ? donation : '0'
    const calculatedDonation = (Number(fixedDonation) / 100) * itemsSubtotal
    const calculatedTaxes = (Number(taxes) / 100) * itemsSubtotal
    const total = itemsSubtotal + calculatedTaxes + Number(serviceFee) + calculatedDonation
    console.log('subtotal', itemsSubtotal, 'taxes', calculatedTaxes, 'tip', serviceFee, 'calculatedDonation', calculatedDonation, 'total', total);

    return (
      <View style={{
        backgroundColor: 'white',
        margin: 15,
        padding: 15,
        borderRadius: 15,
      }}>

        <View style={rowStyle}>
          <View style={{ flex: 1, }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={textStyle}>Subtotal</Text>
            <Text style={textStyle}>{utils.formatMoney(itemsSubtotal)}</Text>
          </View>
        </View>

        <View style={rowStyle}>
          <View style={{ flex: 1, }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={textStyle}>Taxes ({Number(taxes)}%)</Text>
            <Text style={textStyle}>{utils.formatMoney(calculatedTaxes)}</Text>
          </View>
        </View>

        <View style={rowStyle}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
              flexDirection: 'row',
              borderRadius: 15,
              borderWidth: 1,
              paddingHorizontal: 15,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TextInputMask
                style={{
                  ...textStyle,
                  paddingHorizontal: 5,
                  marginLeft: 15,
                }}
                onBlur={() => setDonation(fixedDonation)}
                type='only-numbers'
                checkText={(previous, next) => {
                  const value = Number(next)
                  return _.trim(next) ? (value >= 0 && value <= 100) : true
                }}
                maxLength={3}
                value={donation}
                onChangeText={setDonation}
              />
              <Text style={textStyle}>%</Text>
            </View>
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={textStyle}>Tip</Text>
            { <TextInputMask
              style={{
                ...textStyle,
                flex: 1,
                borderColor: '#555',
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 5,
                marginLeft: 15,
                textAlign: 'right'
              }}
              type='money'
              options={{
                unit: '$ ',
                separator: '.',
                delimiter: ','
              }}
              maxLength={11}
              value={donation}
              onChangeText={setDonation}
            /> }
            <Text style={textStyle}>{utils.formatMoney(calculatedDonation)}</Text>
          </View>
        </View>

        <View style={rowStyle}>
          <View style={{ flex: 1, }} />
          { <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {
              cart.business.service_fee_type == 'percent' ?
                <View style={{
                  borderRadius: 15,
                  borderWidth: 1,
                  paddingHorizontal: 15
                }}>
                  <Text style={textStyle}>{Number(cart.business.fee)} %</Text>
                </View>
                : null
            }
          </View> }
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={textStyle}>Service fee {cart.business.service_fee_type == 'percent' ? `(${Number(cart.business.fee)}%)` : ''}</Text>
            <Text style={textStyle}>{utils.formatMoney(serviceFee)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', }}>
          <View style={{ flex: 1, }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={textStyle}>Total</Text>
            <Text style={textStyle}>{utils.formatMoney(total)}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {renderDeliveryMethods()}
        {renderPaymentMethods()}

      </View>
    )
  }

  const renderDeliveryForm = () => {

    const inputStyle = {
      flex: 1,
      fontSize: 16,
      fontFamily: 'nunito-regular',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    }

    if (deliveryMethod == 'Pickup') {
      return null
    }

    return (
      <View style={{
        marginTop: 10
      }}>

        <Text style={{
          fontSize: 16,
          fontFamily: 'nunito-regular',
          textAlign: 'center',
          marginBottom: 10,
        }}>Delivery Address</Text>

        <TextInput
          style={inputStyle}
          placeholder='Street Address'
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
        />

        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>

          <TextInput
            style={{
              ...inputStyle,
              marginRight: 10,
            }}
            placeholder='City'
            value={deliveryCity}
            onChangeText={setDeliveryCity}
          />
          <TextInput
            style={{
              ...inputStyle,
              marginRight: 10,
            }}
            placeholder='State'
            value={deliveryState}
            onChangeText={setDeliveryState}
          />
          <TextInputMask
            type='only-numbers'
            style={inputStyle}
            maxLength={5}
            placeholder='Zipcode'
            value={deliveryZipcode}
            onChangeText={setDeliveryZipcode}
          />
        </View>

      </View>
    )
  }

  const renderDeliveryMethods = () => {

    const containerStyle = {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'black',
      paddingHorizontal: 15,
      marginHorizontal: 10,
    }

    const selectedContainerStyle = {
      ...containerStyle,
      backgroundColor: Theme.redButtonColor,
      borderColor: Theme.redButtonColor,
    }

    const textStyle = {
      fontFamily: 'nunito-regular',
      fontSize: 20,
      color: 'black'
    }

    const selectedTextStyle = {
      ...textStyle,
      fontFamily: 'nunito-semibold',
      color: 'white'
    }

    const inputStyle = {
      flex: 1,
      fontSize: 16,
      fontFamily: 'nunito-regular',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    }

    const deliveryText = _.trim(deliveryAddress) ? `Address: ${deliveryAddress}, ${deliveryCity}, ${deliveryState}. Zipcode ${deliveryZipcode}` : 'Enter delivery address'

    return (
      <View style={{
        marginTop: 10
      }}>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
        }}>

          <TouchableOpacity onPress={() => setDeliveryMethod('Pickup')}>
            <View
              style={deliveryMethod == 'Pickup' ? selectedContainerStyle : containerStyle}
            >
              <Text
                style={deliveryMethod == 'Pickup' ? selectedTextStyle : textStyle}
              >Pickup</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setDeliveryMethod('Delivery')}>
            <View
              style={deliveryMethod == 'Delivery' ? selectedContainerStyle : containerStyle}
            >
              <Text
                style={deliveryMethod == 'Delivery' ? selectedTextStyle : textStyle}
              >Delivery</Text>
            </View>
          </TouchableOpacity>

        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 15,
        }}>

          <TouchableOpacity
            style={{
              flex: 1,
            }}
            onPress={() => setDatePickerVisible(true)}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon
                name='calendar-outline'
                size={24}
                color={Theme.redButtonColor}
              />
              <Text style={{
                marginLeft: 10,
                textAlign: 'center',
              }}>{`${deliveryMethod == 'Pickup' ? 'Pickup' : 'Delivery'} Date\n${deliveryDate.format('ddd MMM DD yyyy')}`}</Text>
            </View>
          </TouchableOpacity>

          <View style={{
            backgroundColor: 'lightgray',
            borderRadius: 1,
            width: 1,
            marginHorizontal: 15
          }} />

          <TouchableOpacity
            style={{
              flex: 1,
            }}
            onPress={() => setTimePickerVisible(true)}>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon
                name='clock-outline'
                size={24}
                color={Theme.redButtonColor}
              />
              <Text style={{
                textAlign: 'center',
                marginLeft: 10
              }}>{`Time\n${deliveryTime.format('LT')}`}</Text>
            </View>
          </TouchableOpacity>

        </View>

        <View>
          <Text style={{
            fontSize: 16,
            fontFamily: 'nunito-regular',
            textAlign: 'center',
            marginBottom: 10,
          }}>Name</Text>

          <TextInput
            style={inputStyle}
            placeholder='Your name'
            value={name}
            onChangeText={setName}
          />

          <Text style={{
            fontSize: 16,
            fontFamily: 'nunito-regular',
            textAlign: 'center',
            marginBottom: 10,
          }}>Phone</Text>

          <TextInputMask
            type='custom'
            options={{ mask: '(999) 999-9999', }}
            keyboardType='numeric'
            maxLength={14}
            style={inputStyle}
            placeholder='Your phone'
            value={phone}
            onChangeText={setPhone}
          />
        </View>


        {renderDeliveryForm()}

        <View style={styles.separator} />

      </View>
    )
  }

  const renderNewPaymentMethodForm = () => {

    const inputStyle = {
      flex: 1,
      fontSize: 16,
      fontFamily: 'nunito-regular',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: 'grey',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    }

    if (paymentMethod != 'new') {
      return null
    }

    return (
      <View style={{
        marginTop: 10
      }}>

        <TextInput
          style={inputStyle}
          placeholder='Name on Credit Card'
          value={paymentUserName}
          onChangeText={setPaymentUserName}
          returnKeyType='next'
          onSubmitEditing={() => deliveryCardRef.current?.getElement()?.focus()}
          blurOnSubmit={false}
        />

        <TextInputMask
          ref={deliveryCardRef}
          type='credit-card'
          options={{ obfuscated: false, issuer }}
          style={inputStyle}
          placeholder='Credit Card Number'
          value={paymentCardNumber}
          onChangeText={setPaymentCardNumber}
          returnKeyType={Platform.select({ ios: 'done', android: 'next' })}
          onSubmitEditing={() => deliveryExpRef.current?.getElement()?.focus()}
          blurOnSubmit={false}
        />

        <View style={{ flexDirection: 'row', }}>
          <TextInputMask
            ref={deliveryExpRef}
            type='datetime'
            options={{
              format: 'MM/YYYY'
            }}
            style={{
              ...inputStyle,
              marginRight: 10
            }}
            placeholder='Exp Date'
            value={paymentExpDate}
            onChangeText={setPaymentExpDate}
            returnKeyType={Platform.select({ ios: 'done', android: 'next' })}
            onSubmitEditing={() => deliveryCVCRef.current?.getElement()?.focus()}
            blurOnSubmit={false}
          />
          <TextInputMask
            ref={deliveryCVCRef}
            type='only-numbers'
            style={inputStyle}
            placeholder='CVC'
            value={paymentCVC}
            onChangeText={setPaymentCVC}
          />
        </View>

      </View>
    )
  }

  const renderPaymentMethods = () => {

    const containerStyle = {
      borderRadius: 15,
      borderWidth: 1,
      paddingHorizontal: 15,
      marginHorizontal: 10,
      marginBottom: 15,
    }

    const selectedContainerStyle = {
      ...containerStyle,
      backgroundColor: Theme.redButtonColor,
      borderColor: Theme.redButtonColor,
    }

    const textStyle = {
      fontFamily: 'nunito-regular',
      fontSize: 20,
      color: 'black',
    }

    const selectedTextStyle = {
      ...textStyle,
      fontFamily: 'nunito-semibold',
      color: 'white'
    }

    const isCash = paymentMethod == 'cash'
    const isNewMethod = paymentMethod == 'new'

    return (
      <View>
        <Text
          style={{
            fontFamily: 'nunito-regular',
            fontSize: 16,
            textAlign: 'center',
          }}
        >Select Payment Method</Text>

        <View style={{
          alignItems: 'center',
          marginVertical: 15
        }}>

          <TouchableOpacity onPress={() => setPaymentMethod('cash')}>
            <View style={isCash ? selectedContainerStyle : containerStyle}>
              <Text style={isCash ? selectedTextStyle : textStyle}>Cash</Text>
            </View>
          </TouchableOpacity>

          {
            _.map(paymentMethods, (method, index) => (
              <View style={{ flexDirection: 'row' }} key={`${index}`}>
                <TouchableOpacity
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => setPaymentMethod(method.id)}>
                  <View
                    style={paymentMethod == method.id ? selectedContainerStyle : containerStyle}>
                    <Text style={paymentMethod == method.id ? selectedTextStyle : textStyle}>**** **** **** {method.last4}</Text>
                  </View>
                </TouchableOpacity>

                <Icon
                  name='close-circle'
                  size={28}
                  color={Theme.redButtonColor}
                  onPress={() => onRemovePaymentMethodPress(method)}
                />

              </View>
            ))
          }

          <TouchableOpacity onPress={() => setPaymentMethod('new')}>
            <View style={isNewMethod ? selectedContainerStyle : containerStyle}>
              <Text style={isNewMethod ? selectedTextStyle : textStyle}>New Payment Method</Text>
            </View>
          </TouchableOpacity>

        </View >

        {renderNewPaymentMethodForm()}

      </View >
    )
  }

  const renderList = () => {

    if (_.isEmpty(cart.items)) {
      return (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',

        }}>
          <Icon name='cart-outline' size={50} color='#051533' />
          <Text style={{
            fontSize: 20,
            fontFamily: 'Nunito-Italic',
            color: "#051533",
          }}>Your cart is empty!</Text>
        </View>
      )
    }

    return (
      <FlatList
        ref={listRef}
        showsVerticalScrollIndicator={false}
        data={cart.items}
        keyExtractor={(item, index) => `${item.id}`}
        renderItem={renderItem}
        ListFooterComponent={renderSummary()}
      />
    )
  }

  const renderButtons = () => {

    const textStyle = {
      fontFamily: 'Nunito-Regular',
      fontSize: height * 0.018,
      marginBottom: 5,
    }

    if (_.isEmpty(cart.items)) {
      return null
    }

    return (
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 15,
      }}>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>

          <View style={{
            color: "#fff",
            alignSelf: "center",
            justifyContent: "center",
            borderRadius: 25,
            height: height * 0.05,
            borderWidth: 1,
            borderColor: Theme.redButtonColor,
            width: "40%",
          }}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Empty shopping cart',
                  'Are you sure? This action cannot be undone',
                  [
                    {
                      text: 'Yes, empty my cart',
                      onPress: () => {
                        Keyboard.dismiss()
                        setStore(previous => ({
                          ...previous,
                          cart: {
                            business: {},
                            items: []
                          }
                        }))
                      }
                    },
                    {
                      text: 'No'
                    }
                  ]
                )
              }}
            >
              <Text
                style={{
                  color: Theme.redButtonColor,
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >Empty cart</Text>
            </TouchableOpacity>
          </View>

          <View style={{
            color: "#fff",
            alignSelf: "center",
            justifyContent: "center",
            borderRadius: 25,
            height: height * 0.05,
            backgroundColor: Theme.redButtonColor,
            width: "40%",
          }}>
            <TouchableOpacity onPress={onCheckoutPress}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: height * 0.02,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  const renderDatePickerModal = () => {

    const now = moment()

    if (!datePickerVisible) {
      return null
    }

    return (
      <DateTimePicker
        title='Select date'
        visible={datePickerVisible}
        onCancel={() => setDatePickerVisible(false)}
        onConfirm={value => {
          console.log('setting delivery date', value);
          setDatePickerVisible(false)
          setDeliveryDate(moment(value))
          if (moment(value).isSame(now) && deliveryTime.isBefore(moment(now).add(1, 'h'))) {
            setDeliveryTime(moment(now).add(1, 'h'))
          }
        }}
        initialValue={deliveryDate.toDate()}
        minimumDate={now.toDate()}
      />
    )
  }

  const renderTimePickerModal = () => {

    const now = moment()

    if (!timePickerVisible) {
      return null
    }

    return (
      <DateTimePicker
        title='Select time'
        visible={timePickerVisible}
        onCancel={() => setTimePickerVisible(false)}
        onConfirm={value => {
          console.log('setting delivery time', value);
          setTimePickerVisible(false)
          setDeliveryTime(moment(value))
        }}
        initialValue={deliveryTime.toDate()}
        minimumDate={deliveryDate.isAfter(now) ? undefined : moment(now).add(1, 'h').toDate()}
        mode='time'
      />
    )
  }

  const renderCheckoutModal = () => {

    if (!submitting) {
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
            paddingVertical: 20,
             alignItems: 'center',
            justifyContent: 'center'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
              , justifyContent: 'center'
            }}>
              <ActivityIndicator
                size="large"
                color="#000"
              />
              <Text style={{
                fontFamily: 'nunito-regular',
                fontSize: 20,
                marginLeft: 15
              }}>Sending your order...</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={{
        flex: 1,
        backgroundColor: '#E5E5E5',
      }}>

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
            >Shopping Cart</Text>
            <View style={{ width: 32 }} />

          </View>

          {renderBusiness()}

        </ImageBackground>

        {renderList()}
        {renderButtons()}

        {/* {renderDateTimePickerModal()} */}
        {renderDatePickerModal()}
        {renderTimePickerModal()}
        {renderCheckoutModal()}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'lightgrey',
    marginVertical: 15,
  }
})

export default CartScreen