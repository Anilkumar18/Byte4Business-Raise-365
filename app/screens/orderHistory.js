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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { extraApiService } from "../Services/extraApiService";
import Theme from "../utils";
import ImageLoad from 'react-native-image-placeholder';
import {utils} from "../Utils/utils"

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const OrderHistoryScreen = (props) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const [itemid, setItemid] = useState("");
  const [showOrder, setShowOrder] = useState(false);

  const DATA = [
    {
      id: "1",
      title: "First Item",
    },
    {
      id: "2",
      title: "Second Item",
    },
  ];


  useEffect(() => {
    (async () => {
      try {
        let resp = await extraApiService.getOrders();
        setOrders(resp.data)
        setLoading(false)


      } catch (error) {
        setLoading(false)
        utils.checkAuthorized(error, props.navigation)
      }

    })();
  }, []);

  const getSubtotalAmount = (orders) => {
    var amount = 0
    for (var order of orders) {
      amount = amount + order.price
    }
    return amount.toFixed(2)
  }

  const calculateTax = (item) => {
    const amount = getSubtotalAmount(item.order_items);
    return (amount * item.tax).toFixed(2)
  }


  const calculateTip = (item) => {
    const amount = getSubtotalAmount(item.order_items);
    return (item.tip_percent * amount).toFixed(2)

  }


  const calculateTotal = (item) => {
    var subtotal = getSubtotalAmount(item.order_items);
    var tax = calculateTax(item);
    var tip = calculateTip(item)
    console.log("sub", subtotal, "tax", tax, "tip", tip)
    return (parseFloat(subtotal) + parseFloat(tax) + parseFloat(tip)).toFixed(2)
  }
  const renderItem = ({ item }) => {
    return (
      <View
        key={item.id}
        style={[
          styles.userInfoSection,
          {
            height:
              showOrder && itemid === item.id ? height * 0.47 : height * 0.17,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >


            <ImageLoad
              style={{
                width: height * 0.1,
                height: height * 0.1 * 1,
                borderRadius: 50,
              }}
              borderRadius={50}

              source={{
                uri: "https://api.adorable.io/avatars/50/abott@adorable.png",
              }}

              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: height * 0.1,
                height: height * 0.1 * 1,
                borderRadius: 50,
              }}

            />
            <View
              style={{
                marginLeft: 15,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: height * 0.022, fontFamily: "Nunito-Bold" }}
              >
                {item.location_name}
              </Text>

              <Text
                style={{
                  fontSize: height * 0.016,
                  color: "grey",
                  fontFamily: "Nunito-Regular",
                }}
              >
                {utils.formatDate(item.order_date)}

              </Text>
            </View>
          </View>
          <View style={{ justifyContent: "center", marginRight: 20 }}>
            <TouchableOpacity
              onPress={() => {
                setShowOrder(!showOrder);
                setItemid(item.id);
              }}
            >
              <Image
                style={{ width: 32, height: 32 }}
                source={require("../assets/dropdown.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        {showOrder && itemid === item.id ? (
          <>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  fontFamily: "Nunito-SemiBold",
                  fontSize: height * 0.018,
                  marginTop: height * 0.01,
                }}
              >
                Ticket # {item.ticket}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.orderText}>Subtotal:</Text>
              <Text style={styles.orderText}>${getSubtotalAmount(item.order_items)}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.orderText}>Tax {item.tax * 100}%:</Text>
              <Text style={styles.orderText}>${calculateTax(item)}</Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.orderText}>Tip amount:</Text>
              <Text style={styles.orderText}>${calculateTip(item)}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.orderText}>Service fee:</Text>
              <Text style={styles.orderText}>$0.00</Text>
            </View>
          </>
        ) : null}
        <View
          style={{
            height: 1,
            width: wp("100%"),
            backgroundColor: "#e6e6e6",
            alignSelf: "center",
            marginTop: height * 0.016,
          }}
        ></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: height * 0.02,
              marginTop: 5,
            }}
          >
            Total:
          </Text>
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              color: Theme.redButtonColor,
              fontSize: height * 0.02,
              marginTop: 5,
              marginRight: 20,
            }}
          >
            $ {calculateTotal(item)}
          </Text>
        </View>
        {showOrder && itemid === item.id ? (
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
          >
            <View style={styles.buttonDeleteContainer}>
              <TouchableOpacity onPress={() => { }}>
                <Text
                  style={{
                    color: Theme.redButtonColor,
                    fontSize: height * 0.02,
                    textAlign: "center",
                    fontFamily: "Nunito-Bold",
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => { }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: height * 0.02,
                    textAlign: "center",
                    fontFamily: "Nunito-Bold",
                  }}
                >
                  Reorder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

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
            fontSize: 30,
            fontFamily: "Nunito-Bold",
            position: "absolute",
            top: hp("12%"),
            left: 20,
            color: "#fff",
          }}
        >
          Order History
        </Text>
      </ImageBackground>

      {loading ? <ActivityIndicator color="#000" size="large" /> : <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />}

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

export default OrderHistoryScreen;
