import React, { useState, useEffect, useContext, useRef } from 'react'
import { View, SafeAreaView, AppState, ScrollView, Text, Image, ActivityIndicator, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native'
import { useTheme, Title, Caption, Drawer } from "react-native-paper";
import { Avatar } from 'react-native-elements'
import Geolocation from 'react-native-geolocation-service'
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../Services/userService"
import messaging from '@react-native-firebase/messaging'
import { StackActions } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { Icon } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import _ from 'lodash'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import Theme from "../utils";
import QRCode from 'react-native-qrcode-svg'
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share'

import VersionInfo from 'react-native-version-info';
import { useIsFocused } from '@react-navigation/native';

import PushNotification from "react-native-push-notification";
import { utils } from '../Utils/utils'
import { extraApiService } from "../Services/extraApiService";
import Store from '../store'

import * as RNZendesk from "rn-zendesk";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");

const MoreScreen = props => {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [loadingProfileData, setLoadingProfileData] = useState(false)
  const [team, setTeam] = useState(null)
  const [sharelink, setShareLink] = useState('')
  const [leaderboard, setLeaderBoard] = useState('')
  const [teams, setTeams] = useState([])
  const [preparingShareContent, setPreparingShareContent] = useState(false)
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  const [error, setError] = useState(false)

  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [store, setStore] = useContext(Store.Context)

  const appState = useRef(AppState.currentState)

  const [watchId, setWatchId] = useState(null)

  const insets = useSafeAreaInsets();

  const userTeam = _.find(teams, { id: team })

  const unread = _.sumBy(store.notifications, 'unread')

  useEffect(() => {
    setTimeout(() => watchLocation(), 500)
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

    const subscription = AppState.addEventListener("change", nextAppState => {
      console.log('app state', nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
        PushNotification.removeAllDeliveredNotifications()
      }

      appState.current = nextAppState
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {

    if (isFocused) {
      loadProfileData()
    } else {
      setQrCodeVisible(false)
    }
  }, [isFocused, avatar, name]);

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
      if (error.message == 'TRY_AGAIN') {
        setTimeout(() => watchLocation(), 500)
      }
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
        nearbyBusinessCenter: currentLocation,
        ignoredList: []
      }))
      return resp.data
    } catch (error) {
      console.log('updateNearbyBusiness error', error);
      utils.checkAuthorized(error, props.navigation)
    }
  }
  const loadProfileData = async () => {

    console.log('loading profile data');

    setLoadingProfileData(true)

    const user_id = JSON.parse(await AsyncStorage.getItem("@id"));
    const userfirst_name = JSON.parse(await AsyncStorage.getItem("@first_name"));
    const userlast_name = JSON.parse(await AsyncStorage.getItem("@last_name"));
    const userimage = JSON.parse(await AsyncStorage.getItem("@picture"));
    const team = JSON.parse(await AsyncStorage.getItem("@fundraiser_type_id"));
    const sharelink = JSON.parse(await AsyncStorage.getItem('@sharelink'))
    const leaderboard = JSON.parse(await AsyncStorage.getItem('@leaderboard'))

     const resp = await extraApiService.getAllFundraiserGroups()
     console.log('extraApiService.searchFundraiser response', resp.data)
    setUserId(user_id)
    setFirstName(userfirst_name)
    setLastName(userlast_name)
     setTeams(resp.data)

    if (userfirst_name && userlast_name) {
      setName(`${userfirst_name} ${userlast_name}`);
    }
    if (userimage) {
      setAvatar(userimage);
    }

    team && setTeam(team)
    sharelink && setShareLink(sharelink)
    leaderboard && setLeaderBoard(leaderboard)

    setLoadingProfileData(false)
  }
  const removeToken = async () => {
    await AsyncStorage.removeItem('USER');
    await AsyncStorage.removeItem("@isRemember");
    await AsyncStorage.clear();
    setStore(previous => ({ ...previous, cart: { business: {}, items: [] } }))
    navigation.dispatch(StackActions.replace("login"));
  };

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

        PushNotification.removeAllDeliveredNotifications()
      }
    }
    catch (error) {
      console.log('setupNotifications error', error);
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

         if (!isNaN(badge)) {
           console.log('setting badge counter to ', badge);
           PushNotification.setApplicationIconBadgeNumber(badge)
         } else {
           console.log('Badge not present on data payload, setting badge counter to 0');
           PushNotification.setApplicationIconBadgeNumber(0)
         }
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

  const logout = async () => {
    const api_token = await AsyncStorage.getItem('TOKEN');
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
    if (watchId !== null) {
      utils.clearWatch(watchId)
    }
    Geolocation.stopObserving()
  };

  const onSharePress = async () => {

    console.log('onSharePress', teams, userTeam);

    if (!userTeam) {
      showMessage({
        type: 'danger',
        message: 'An unexpected error ocurred on share your fundraiser team'
      })
      return
    }

    try {

      const imageUrl = userTeam.fundraiser.logo

      if (!imageUrl) {
        console.log('cannot get image url');
        return
      }

      setPreparingShareContent(true)

      const resp = await RNFetchBlob.config({ fileCache: true }).fetch('GET', imageUrl)
      const base64Data = await resp.readFile('base64')

      const fileContent = `data:image/png;base64,${base64Data}`
       console.log(fileContent);
      setPreparingShareContent(false)

      if (userId) {
        extraApiService.shareCount({
          user_id: userId,
          fundraiser_type_id: team,
          category_id: 0,
          page_type: 'share'
        })
          .then(data => {
            console.log('share count success', data)
          })
          .catch(error => {
            console.log('share count error', error);
          })
      }

      const message = `Hi, this is ${name} with ${userTeam.fundraiser.fundraiser_name}.\nPlease help us raise money for our fundraiser by clicking the link below. Thank you!\n${userTeam.fundraiser.fundraiser_name} - ${sharelink}`

      setTimeout(async () => {
        const shareResponse = await Share.open({
          title: userTeam.fundraiser.fundraiser_name,
          message,
          subject: `${userTeam.fundraiser.fundraiser_name}`,
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

  const renderShareModal = () => {

    if (!preparingShareContent) {
      return null
    }

    return (
      <View style={StyleSheet.absoluteFill}>
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
      </View>
    )
  }
  const renderQRCodeModal = () => {

    const title = userTeam ? userTeam.fundraiser_name : 'QR Code'

    if (!qrCodeVisible) {
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
            <Text
              style={{
                fontFamily: "Nunito-Regular",
                fontSize: height * 0.022,
                color: "grey",
                textAlign: 'center'
              }}
            >{title}</Text>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 20
              }}
            >
              {
                (userTeam && !error) ?
                  <QRCode
                    value={sharelink}
                    size={width * 0.8}
                    onError={error => {
                      console.log('Error generating qr code', error);
                      setError(true)
                    }}
                  />
                  :
                  <Text
                    style={{
                      fontFamily: "Nunito-Regular",
                      fontSize: height * 0.022,
                      color: "grey",
                      textAlign: 'center'
                    }}
                  >Error: Couldn't get your share link</Text>
              }
            </View>
            <TouchableOpacity onPress={() => {
              setQrCodeVisible(false)
              setError(false)
            }} >
              <View style={styles.buttonContainer}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    textAlign: "center",
                    fontFamily: "Nunito-Bold",
                  }}
                >Close</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const renderHeader = () => {
    return (
      <View style={{
        backgroundColor: "#EAF4FF",
        paddingTop: insets.top,
      }}>
        <View style={{
          paddingLeft: 20,
          paddingTop: 15,
          height: 90,
        }}>
          <View style={{ flexDirection: "row", }} >
            <Avatar
              rounded
              size={60}
              source={{ uri: avatar ? avatar : undefined }}
              title={utils.getInitials(name)}
              containerStyle={{
                backgroundColor: 'darkgray',
              }}
            />
            <View style={{ marginLeft: 15, }} >

              <Title style={{
                fontSize: 20,
                fontFamily: "Nunito-SemiBold",
              }}>{name}</Title>

              <TouchableOpacity onPress={() => props.navigation.navigate("profile")} >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Nunito-Regular",
                    textDecorationLine: "underline",
                    color: '#999'
                  }}
                >View profile</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderContent = () => {
    return (
      <View style={{
        flex: 1,
      }}>
        <ScrollView>
          {
            loadingProfileData && !userId ? (
              <ActivityIndicator
                style={{
                  justifyContent: "center",
                  marginTop: "50%",
                  backgroundColor: '#fff'
                }}
                size="large"
                color="#000"
              />
            ) : (
              <>
                <Drawer.Section>
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
                </Drawer.Section>
                <Drawer.Section>
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
                    label="Purchase History"
                    onPress={() => props.navigation.navigate("purchaseHistory", { userId })}
                  />

                  { <DrawerItem
                    labelStyle={{
                      fontSize: 18,
                      color: "#051533",
                      fontFamily: "Nunito-Regular",
                    }}
                    icon={({ color, size }) => (
                      <View style={{
                        borderRadius: 32,
                        borderWidth: 1,
                        borderColor: '#051533'
                      }}>
                        <MaterialC
                          name='currency-usd'
                          color='#051533'
                          size={size}
                        />
                      </View>
                    )}
                    label="Fundraisers"
                    onPress={() => props.navigation.navigate("userFundraiser", { user: { id: userId, name, avatar } })}
                  /> }
                  <DrawerItem
                     labelStyle={{
                       fontSize: 18,
                       color: "#051533",
                       fontFamily: "Nunito-Regular",
                     }}
                    icon={iconProps => <Icon type='material-community' {...iconProps} name='bell-outline' />}
                    style={{
                      marginVertical: 0,
                    }}
                    label={() => (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <Text style={{
                          fontSize: 18,
                          color: "#051533",
                          fontFamily: "Nunito-semibold",
                        }}>Notifications</Text>
                        {
                          unread > 0 ? (
                            <View style={{
                              paddingHorizontal: 4,
                              borderRadius: 16,
                              minWidth: 28,
                              height: 28,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: Theme.redButtonColor,
                            }}>
                              <Text style={{
                                fontSize: 16,
                                color: "white",
                                fontFamily: "Nunito-bold",
                              }}
                              >{unread > 100 ? '99+' : unread}</Text>
                            </View>
                          ) : null
                        }
                      </View>
                    )}
                    onPress={() => props.navigation.navigate("notifications")}
                  />

                </Drawer.Section>
                { <Drawer.Section>
            <DrawerItem
              labelStyle={{
                fontSize: 18,
                color: "#051533",
                fontFamily: "Nunito-Regular",
              }}
              icon={({ color, size }) => (
                loadingProfileData && teams.length < 1 ?
                  <ActivityIndicator
                    color={"#051533"}
                    style={{
                      width: 26,
                      height: 26
                    }}
                  /> :
                  <View style={{
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: '#051533'
                  }}>
                    <MaterialC
                      name='currency-usd'
                      color='#051533'
                      size={size}
                    />
                  </View>
              )}
              label={() => (
                <>
                  <Text style={{
                    fontSize: 18,
                    color: "#051533",
                    fontFamily: "Nunito-Regular",
                  }}>Join a Fundraiser</Text>
                  {
                    userTeam ? (
                      <Text style={{
                        fontSize: 14,
                        color: "#051533",
                        fontFamily: "Nunito-Regular",
                      }}>{userTeam.fundraiser_name}</Text>
                    ) : null
                  }
                </>
              )}
              onPress={() => {

                console.log('press', userTeam, teams.length, team);
                if (teams.length > 0) {
                  props.navigation.navigate('searchFundraiser', { teams, firstName, lastName })
                }
              }}
            />

            {
              team &&
              <>
                <DrawerItem
                  labelStyle={{
                    fontSize: 18,
                    color: "#051533",
                    fontFamily: "Nunito-Regular",
                  }}
                  icon={({ color, size }) => (
                    <Icon
                      type='material-community'
                      name='trophy-outline'
                      color="#051533"
                    />
                  )}
                  label="Leader Board"
                  onPress={async () => {
                    try {
                      console.log('trying to open leaderboard', leaderboard);
                      const canOpen = await Linking.canOpenURL(leaderboard)
                      if (canOpen) {
                        Linking.openURL(leaderboard)
                      } else {
                        showMessage({
                          type: 'warning',
                          message: 'Could not open your leader board'
                        })
                      }
                    }
                    catch (error) {
                      console.log('leaderboard error', error);
                      showMessage({
                        type: 'warning',
                        message: 'Could not open your leader board'
                      })
                    }
                  }}
                />
                <DrawerItem
                  labelStyle={{
                    fontSize: 18,
                    color: "#051533",
                    fontFamily: "Nunito-Regular",
                  }}
                  icon={({ color, size }) => (
                    <Ionicons
                      name='share-social-outline'
                      color='#051533'
                      size={size}
                    />
                  )}
                  label="Share Fundraiser"
                  onPress={onSharePress}
                />
                <DrawerItem
                  labelStyle={{
                    fontSize: 18,
                    color: "#051533",
                    fontFamily: "Nunito-Regular",
                  }}
                  icon={({ color, size }) => (
                    <Ionicons
                      name='qr-code-outline'
                      color="#051533"
                      size={size}
                    />
                  )}
                  label="QRCODE Fundraiser"
                  onPress={() => setQrCodeVisible(true)}
                />
              </>}
          </Drawer.Section> }
                <Drawer.Section>
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
                         props.navigation.navigate("needHelp")
                      }
                      catch (error) {
                        console.log('open zendesk error', error);
                      }
                    }}
                  />
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

                </Drawer.Section>
                <Drawer.Section>
                  <DrawerItem
                    labelStyle={{
                      fontSize: 18,
                      color: "#051533",
                      fontFamily: "Nunito-Regular",
                    }}
                    icon={({ color, size }) => (
                      <Icon
                        type='material-community'
                        name='file-certificate-outline'
                        color="#051533"
                      />
                    )}
                    label="Terms & Privacy"
                    onPress={() => Linking.openURL('https://69e8e9e0-d7bc-4902-aec0-5e0878da055e.filesusr.com/ugd/d2c4d6_8ae2b25eb3b4490098a406b9ef243513.pdf')}
                  />
                </Drawer.Section>
              </>
            )
          }
        </ScrollView>
        <Text style={{
          fontSize: 13,
          fontFamily: 'Nunito-Semibold',
          margin: 20,
          color: '#aaa'
        }}>APP VERSION {VersionInfo.appVersion} ({VersionInfo.buildVersion})</Text>
        <Drawer.Section style={{
        }}>
          {loading ? (
            <ActivityIndicator color="#051533" size="large" />
          ) : (
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
          )}
        </Drawer.Section>
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
      {renderHeader()}
      {renderContent()}
      {renderShareModal()}
      {renderQRCodeModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: Theme.buttonHeight,
    backgroundColor: Theme.redButtonColor,
    width: "85%",
  },
})

export default MoreScreen