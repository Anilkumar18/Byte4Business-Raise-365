import React, { useEffect, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useTheme, Avatar, Title, Caption, Drawer } from "react-native-paper";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../Services/userService"
import messaging from '@react-native-firebase/messaging'
import * as RNZendesk from "rn-zendesk";

Icon.loadFont();
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { url } from "../api/api";
import { StackActions } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { extraApiService } from "../Services/extraApiService";
import Store from '../store'
import _ from 'lodash'
import PushNotification from "react-native-push-notification";
import { utils } from '../Utils/utils'

const USER_KEY = "USER";
const USER_TOKEN = "TOKEN";
export function DrawerContentComponent(props) {
  const [loading, setLoading] = useState(false);
  const [serverImage, setServerImage] = useState(null);
  const [name, setName] = useState("");
  const navigation = useNavigation();
  const isDrawerOpen = useIsDrawerOpen()
  const [watchId, setWatchId] = useState(null)

  const [store, setStore] = useContext(Store.Context)
  const unread = _.sumBy(store.notifications, 'unread')

  useEffect(() => {
    watchLocation()
    return () => {
      console.log('clear watch position...');
      if (watchId !== null) {
        utils.clearWatch(watchId)
      }
    }
  }, [])

  useEffect(() => {
    setupNotifications()
    getUserNotifications()
  }, [])

  useEffect(() => {
    loadProfileData()
  }, [isDrawerOpen]);

  const watchLocation = async () => {

    try {
      console.log('try watch location');
      const watchId = await utils.watchLocation(
        currentLocation => {
          setStore(previous => ({ ...previous, currentLocation }))
          updateNearbyBusiness(currentLocation)
        },
        error => { }
      )
      console.log('utils.watchLocation', watchId);
      setWatchId(watchId)
    } catch (error) {
      console.log('utils.watchLocation error', error);

    }
  }

  const updateNearbyBusiness = async currentLocation => {

    const shouldUpdate = _.isEmpty(store.nearbyBusinessCenter) ||
      `${utils.calculateDistance(
        store.nearbyBusinessCenter.latitude,
        store.nearbyBusinessCenter.longitude,
        'M',
        currentLocation.latitude,
        currentLocation.longitude,
      )}`.replace(' mi', '') >= 1

    if (!shouldUpdate) {
      console.log('should not update nearby locations. User dont move enough', `${utils.calculateDistance(
        store.nearbyBusinessCenter.latitude,
        store.nearbyBusinessCenter.longitude,
        'M',
        currentLocation.latitude,
        currentLocation.longitude,
      )}`.replace(' mi', ''));
      return store.nearbyBusiness
    }

    try {
      const payload = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        zip: '',
        radius: 20,
      }
      console.log('updating nearby business...', JSON.stringify(payload));
      const resp = await extraApiService.getLocalBusinesses(payload)
      console.log('updateNearbyBusiness response', resp.data.length);
      setStore(previous => ({
        ...previous,
        nearbyBusiness: resp.data,
        nearbyBusinessCenter: currentLocation
      }))
      return resp.data
    } catch (error) {
      console.log('updateNearbyBusiness error', error);
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const getUserNotifications = async () => {
    console.log('DrawerContentComponent getting notifications...');
    try {
      setStore(previous => ({ ...previous, loading: true }))
      let resp = await extraApiService.getNotifications();
      console.log('DrawerContentComponent notifications', resp.data);
      if (resp.data?.restaurants) {

        const badge = _.sumBy(resp.data.restaurants, 'unread')

        // if (!isNaN(badge)) {
        //   console.log('setting badge counter to ', badge);
        //   PushNotification.setApplicationIconBadgeNumber(badge)
        // } else {
        //   console.log('Badge not present on data payload, setting badge counter to 0');
        //   PushNotification.setApplicationIconBadgeNumber(0)
        // }
      }
      setStore(previous => ({ ...previous, loading: false, notifications: resp.data.restaurants }))
    }
    catch (error) {
      console.log('DrawerContentComponent notifications error', error);
      setStore(previous => ({ ...previous, loading: false }))
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const updateDeviceToken = async (device_token) => {

    console.log('device_token', device_token);

    const access_token = JSON.parse(await AsyncStorage.getItem('TOKEN'))

    const payload = {
      access_token,
      device_token
    }

    const resp = await userService.updateDeviceToken(payload)
    console.log('userService.updateDeviceToken', resp.data);
  }

  const setupNotifications = async () => {

    console.log('*** setting up notifications...');

    try {

      const granted = await messaging().requestPermission()
      console.log('setupNotifications status', granted);

      if (granted) {

        const device_token = await messaging().getToken()

        updateDeviceToken(device_token)

        messaging().onTokenRefresh(refreshedToken => {
          console.log('[TOKEN REFRESHED]', refreshedToken);
          updateDeviceToken(refreshedToken)
        })
      }
    }
    catch (error) {
      console.log('setupNotifications error', error);
    }
  }

  const loadProfileData = async () => {
    if (!isDrawerOpen) {
      return
    }
    const userimage = await AsyncStorage.getItem("@picture");
    const userfirst_name = await AsyncStorage.getItem("@first_name");
    const userlast_name = await AsyncStorage.getItem("@last_name");
    setName(JSON.parse(userfirst_name) + " " + JSON.parse(userlast_name));
    setServerImage(JSON.parse(userimage));
    console.log("useeffect drawer", userimage);
  }

  const removeToken = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem("@isRemember");
    await AsyncStorage.clear();
    navigation.dispatch(StackActions.replace("login"));
  };

  const logout = async () => {
    const api_token = await AsyncStorage.getItem(USER_TOKEN);
    let token = JSON.parse(api_token);

    console.log("token", token);
    try {
      let creds = {
        access_token: token,

      }

      console.log("sdsdsdsd", creds)
      let resp = await userService.logout(creds)
      if (resp.data.status === "success") {
        removeToken();
      } else {
        showMessage({
          message: resp.data.error,
          type: "danger",
        });
        removeToken();
        setLoading(false);
      }

    } catch (error) {
      removeToken();
      if (error.response && error.response.data && error.response.data.error) {
        showMessage({
          message: error.response.data.error,
          type: "danger",
        });
      } else {
        showMessage({
          message: "Logout Failed",
          type: "danger",
        });
      }

      console.log("Request Failed");
      setLoading(false);
    }
  };

  const logoutDrawerItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/log-out.png")}
          />
        )}
        label="Logout"
        onPress={() => {
          setLoading(true);
          logout();
        }}
      />
    );
  };

  const settingItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/settings.png")}
          />
        )}
        label="Setting"
        onPress={() => props.navigation.navigate("setting")}
      />
    );
  };

  const needHelpItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/help-circle.png")}
          />
        )}
        label="Need Help"
        onPress={async () => {

          try {

            const username = JSON.parse(await AsyncStorage.getItem('@username')) || 'app user'
            const email = JSON.parse(await AsyncStorage.getItem('@email')) || '-'

            console.log('set identity', username, email);

            RNZendesk.identifyAnonymous(username, email);
            RNZendesk.showHelpCenter({ subject: "Need help" })

            props.navigation.closeDrawer()
            // props.navigation.navigate("needHelp")
          }
          catch (error) {
            console.log('open zendesk error', error);
          }
        }}
      />
    );
  };

  const orderHistoryItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/file-text.png")}
          />
        )}
        label="Order History"
        onPress={() => props.navigation.navigate("orderHistory")}
      />
    );
  };
  const rewardCodeItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/gift.png")}
          />
        )}
        label="Enter Reward Code"
        onPress={() => props.navigation.navigate("rewardCode")}
      />
    );
  };

  const homeDrawerItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/home.png")}
          />
        )}
        label="Home"
        onPress={() => props.navigation.navigate("home")}
      />
    );
  };
  const NotificationDrawerItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/bell.png")}
          />
        )}
        // label='Notifications'
        label={() => (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Text style={{
              fontSize: 18,
              color: "#051533",
              fontFamily: "Nunito-Semibold",
            }}>Notifications</Text>
            {
              unread > 0 ? (
                <View style={{
                  borderRadius: 20,
                  width: 28,
                  height: 28,
                  backgroundColor: 'red',
                  padding: 4,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: "white",
                    fontFamily: "Nunito-bold",
                  }}>{unread}</Text>
                </View>
              ) : null
            }
          </View>
        )}
        onPress={() => props.navigation.navigate("notifications")}
      />
    );
  };
  const FavouriteItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/heart.png")}
          />
        )}
        label="Favorites"
        onPress={() => props.navigation.navigate("favourite", { filter: null })}
      />
    );
  };
  const DealsNearItem = () => {
    return (
      <DrawerItem
        labelStyle={{
          fontSize: 18,
          color: "#051533",
          fontFamily: "Nunito-Regular",
        }}
        icon={({ color, size }) => (
          <Image
            style={{ width: 24, height: 24 }}
            source={require("../assets/map-pin.png")}
          />
        )}
        label="Deals Near Me"
        onPress={() => props.navigation.navigate("dealsNear")}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
              }}
            >
              {!serverImage ? (
                <Avatar.Image
                  source={{
                    uri:
                      "https://api.adorable.io/avatars/50/abott@adorable.png",
                  }}
                  size={60}
                />
              ) : (
                  <Avatar.Image
                    source={{
                      uri: serverImage,
                    }}
                    size={60}
                  />
                )}
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <Title style={[styles.title, { height: 33 }]}>{name}</Title>

                <Caption
                  style={[
                    styles.caption,
                    { flex: 1, flexWrap: "wrap", height: 22 },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate("profile");
                      props.navigation.closeDrawer()
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 16,
                        fontFamily: "Nunito-Regular",
                        textDecorationLine: "underline",
                      }}
                    >
                      View profile
                    </Text>
                  </TouchableOpacity>
                </Caption>
              </View>
            </View>
          </View>
          <Drawer.Section style={styles.drawerSection}>
            {homeDrawerItem()}
            {NotificationDrawerItem()}
            {FavouriteItem()}
            {/* {DealsNearItem()} */}
          </Drawer.Section>
          <Drawer.Section>
            {rewardCodeItem()}
            {orderHistoryItem()}
          </Drawer.Section>
          <Drawer.Section>
            {needHelpItem()}
            {settingItem()}
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>

      <Drawer.Section style={styles.bottomDrawerSection}>
        {loading ? (
          <ActivityIndicator color="#051533" size="large" />
        ) : (
            logoutDrawerItem()
          )}
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    backgroundColor: "#EAF4FF",
    height: 90,
    marginTop: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: "Nunito-SemiBold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    width: wp("45%"),
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
  },
});
