import React, { useState, useEffect, useContext } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Image,
  Text,
  Dimensions,
  TextInput,
  FlatList,
  Platform,
  SafeAreaView,
  Modal,
  DatePickerIOSBase,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import { utils } from '../Utils/utils'

import CheckBox from "react-native-check-box";
import IonIcon from "react-native-vector-icons/Ionicons";
import Store from '../store'
import { showMessage } from "react-native-flash-message";
import _ from 'lodash'
import moment from 'moment'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const OrderItemScreen = (props) => {

  const [store, setStore] = useContext(Store.Context)

  const item = props.route?.params?.item
  const business = props.route?.params?.business

  const [showModal, setShowModal] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [modifiers, setModifiers] = useState(
    _.map(_.filter(_.flatMap(item.modifier_categories, 'modifiers'), 'is_selected'), 'id')
  )
  const [notes, setNotes] = useState('')


   console.log('order item modifiers', modifiers);
  console.log('order item', item, business);

  const increase = () => {

    if (quantity >= 99) {
      return
    }

    setQuantity(quantity + 1)
  }

  const decrease = () => {

    if (quantity <= 1) {
      return
    }

    setQuantity(quantity - 1)
  }

  const addToCart = () => {

    setStore(previous => ({
      ...previous,
      cart: {
        ...previous.cart,
        business,
        items: [
          ...previous.cart.items,
          {
            id: moment().toISOString(),
            itemData: item,
            checkoutData: {
              quantity,
              modifiers,
              notes
            }
          }
        ]
      }
    }))

    setShowModal(false)
    props.navigation.pop()
    showMessage({
      type: 'success',
      message: 'Added to shopping cart!'
    })
  }

  const renderImage = (images) => {
    let image = require("../assets/orderImage.png");
    if (images && images.length > 0) {
      if (!images[0].is_video) {
        return { uri: images[0].image }
      }
    }
    return image
  }

  const renderModifierCategories = () => {

    if (_.isEmpty(item.modifier_categories)) {
      return null
    }

    return (
      <View style={{
      }}>

        {
          _.map(item.modifier_categories, category => (
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
                      onClick={() => {
                        if (category.select_only_one) {
                          setModifiers([
                            ..._.difference(modifiers, _.map(category.modifiers, 'id')),
                            modifier.id
                          ])
                        } else {
                          setModifiers(_.xor(modifiers, [modifier.id]))
                        }
                      }}
                      isChecked={_.includes(modifiers, modifier.id)}
                      rightText={modifier.name}
                      rightTextStyle={{ fontSize: height * 0.02 }}
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
    )
  }

  const renderHeader = () => {
    return (
      <View style={{
        alignItems: 'flex-end',
        marginBottom: 10
      }}>
        <TouchableOpacity
          onPress={() => {
            setShowModal(false)
            props.navigation.pop()
          }}
        >
          <Image
            style={{
              width: height * 0.04,
              height: height * 0.04,
            }}
            source={require("../assets/close.png")}
          />
        </TouchableOpacity>
      </View>
    )
  }

  const renderButtons = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          backgroundColor: 'white',
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
          paddingBottom: 15,
        }}
      >

        <View style={styles.buttonDeleteContainer}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false)
              props.navigation.pop();
            }}
          >
            <Text
              style={{
                color: Theme.redButtonColor,
                fontSize: height * 0.02,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}
            >Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={addToCart}>
            <Text
              style={{
                color: "#fff",
                fontSize: height * 0.02,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}
            >Add to cart</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }
  return (

    <Modal
      visible={showModal}
      transparent
    >

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >

        <SafeAreaView style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>

          <View style={{
            flex: 1,
            padding: 20,
             borderRadius: 25
          }}>

            {renderHeader()}

            <View style={{
              flex: 1,
              backgroundColor: 'transparent',
               borderRadius: 25,
            }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  style={{
                    flexGrow: 0
                  }}
                >

                  <View style={styles.container}>

                    <View
                      style={{
                        flex: 1,
                         paddingBottom: 20,
                        backgroundColor: "transparent",
                         borderRadius: 25,
                         marginTop: 15,
                         alignSelf: "center",
                      }}
                    >

                      <View>

                        <Image
                          style={{
                            width: width * 0.9,
                            height: height * 0.25,
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                            resizeMode: "stretch",
                            alignSelf: 'center',
                             backgroundColor: 'transparent'
                          }}
                          source={renderImage(item.images)}
                        />
                        {
                          Number(item.price) > 0 ? (
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
                              >{utils.formatMoney(Number(item.price))}</Text>
                            </View>
                          ) : null
                        }

                      </View>

                      <View style={{
                        flex: 1,
                        paddingHorizontal: 15,
                        backgroundColor: 'white'
                      }}>
                        <Text
                          style={{
                            fontSize: 22,
                            fontFamily: "Nunito-SemiBold",
                            marginTop: 15,
                            padding: 0,
                            includeFontPadding: false,
                          }}
                        >{item.name}</Text>

                        <View
                          style={{
                            flexDirection: "row",
                            backgroundColor: "#e6e6e6",
                             height: height * 0.07,
                            marginTop: height * 0.01,
                            padding: 10,
                             width: width * 0.83,
                             alignSelf: "center",
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                          }}
                        >
                          <TouchableOpacity onPress={decrease}>
                            <Image
                              style={{ width: height * 0.04, height: height * 0.04 }}
                              source={require("../assets/minus-circle.png")}
                            />
                          </TouchableOpacity>

                          <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text
                              style={{
                                fontSize: height * 0.02,
                                fontFamily: "Nunito-Regular",
                              }}
                            >Quantity:</Text>
                            <Text
                              style={{
                                fontSize: height * 0.03,
                                fontFamily: "Nunito-Bold",
                                marginLeft: 10,
                              }}
                            >{quantity}</Text>
                          </View>
                          <TouchableOpacity onPress={increase}>
                            <Image
                              style={{ width: height * 0.04, height: height * 0.04, }}
                              source={require("../assets/plus-circle.png")}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.separator} />

                        {renderModifierCategories()}

                        <TextInput
                          style={styles.inputSearchStyle}
                          placeholder="Notes"
                          value={notes}
                          multiline
                          scrollEnabled={false}
                          numberOfLines={3}
                          returnKeyType="done"
                          placeholderTextColor="grey"
                          onChangeText={setNotes}
                        />

                      </View>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
              
              {renderButtons()}
            </View>

          </View>

        </SafeAreaView>

      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  inputSearchStyle: {
     marginLeft: 10,
    backgroundColor: "#e6e6e6",
    padding: 7,
     marginTop: height * 0.02,
     width: width * 0.85,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.02,
    height: height * 0.1,
    borderRadius: 5,
  },
  buttonContainer: {
    color: "#fff",
    marginTop: height * 0.015,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: height * 0.05,
    backgroundColor: Theme.redButtonColor,
    width: "40%",
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
    width: "40%",
  },
  separator: {
    backgroundColor: "lightgrey",
    height: 1,
     marginTop: height * 0.015,
    marginVertical: 15,
    width: width * 0.83,
    alignSelf: "center",
  }
});

export default OrderItemScreen;
