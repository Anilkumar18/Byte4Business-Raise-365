import React, { useState, useEffect, useContext } from "react";
import {
  ImageBackground,
  StyleSheet,
  Linking,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator
} from "react-native";
import openMap from 'react-native-open-maps';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { extraApiService } from "../Services/extraApiService";
import { Icon } from 'react-native-elements'
import MaterialC from 'react-native-vector-icons/MaterialCommunityIcons'
import Theme from "../utils";
import { utils } from "../Utils/utils"
import moment from 'moment'
import _ from 'lodash'
import Video from 'react-native-video';

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const MerchantDetailScreen = (props) => {
  const [showDetail, setShowDetail] = useState(false);
  const [isShortBio, setShortBio] = useState(true);
  const [currentTime, setCurrentTime] = useState(moment())
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState(null);

  const rewards = data ? data.reward_count : 0
  const unread = data ? data.unread_message_count : 0

  useEffect(() => {
     setData(props.route.params.data)
    loadData()
    addViewCount()
    const timerId = setInterval(() => updateCurrentTime(), 1000)
    return () => clearInterval(timerId)
  }, [])

  const loadData = async () => {
    console.log('refreshing business data...');
    try {
      setLoading(true)
      const locationId = props.route.params.data.id
      const resp = await extraApiService.getBusiness(locationId)
      console.log('extraApiService.getBusiness', resp.data);
      setLoading(false)
      setData(resp.data)
    } catch (error) {
      console.log('extraApiService.getBusiness error', error);
      setLoading(false)
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const addViewCount = async () => {
    try {
      console.log('extraApiService.addViewCount payload', props.route.params);
      const resp = await extraApiService.addViewCount(props.route.params.data.id)
      console.log('extraApiService.addViewCount', resp.data);
      if (resp.data.status == 'success') {
        if (props.route.params.onUpdateBusiness) {
          props.route.params.onUpdateBusiness(props.route.params.data, { user_views: props.route.params.data.user_views + 1 })
        }
      }
    }
    catch (error) {
      console.log('extraApiService.addViewCount error', error);
      utils.checkAuthorized(error, props.navigation)
    }
  }

  const updateCurrentTime = () => {
    setCurrentTime(moment())
  }

  const isOpenNow = () => {

    if (!data?.hours_of_operation) {
      return false
    }

    const todayHoursOfOperation = _.find(data.hours_of_operation,
      ({ day_of_week }) => (day_of_week - 1) % 7 == currentTime.day())

    if (!todayHoursOfOperation) {
      return false
    }

    const HOUR_FORMAT = 'hh:mm A'

    const timeOpen = moment(todayHoursOfOperation.time_open, HOUR_FORMAT)
    const timeClose = moment(todayHoursOfOperation.time_close, HOUR_FORMAT)

    if (!timeOpen.isValid() || !timeClose.isValid()) {
      return false
    }

    return timeClose.isBefore(timeOpen) ? currentTime.isBetween(timeOpen, timeClose.add(1, 'd')) : currentTime.isBetween(timeOpen, timeClose)
  }

  const renderCuisineTypes = (items) => {
    let content = ""
    for (var item of items) {
      if (content) {
        content = content + ", " + item.name

      } else {
        content = item.name

      }
    }
    return content
  }

  const media = data ? _.first(data.photos) : null
  const isVideo = media && media.is_video && media.url
  const isOpen = isOpenNow()
   console.log('when we serve you', JSON.stringify(data?.hours_of_operation), currentTime.format('hh:mm A'));

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'black',
      }}>
        <View style={{
          width: width,
          height: height * 0.4,
        }}>
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
          <ActivityIndicator color="white" size="large" />
        </View>
        <View style={styles.viewBack}>
          <ActivityIndicator color="#051533" size="large" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {data ? <>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("shopGallery", { data: data.photos });
          }}
        >
          {
            isVideo ? (
              <View style={{
                width: width,
                height: height * 0.4,
              }}>

                <Video
                  muted
                  repeat
                  style={StyleSheet.absoluteFill}
                  resizeMode='contain'
                  source={{ uri: media.url }}
                />

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
              </View>
            ) : (
                (media && media.url) ? (
                  <ImageBackground
                    style={styles.splash}
                    source={{ uri: media.url }}
                    resizeMode='contain'
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
                  </ImageBackground>
                ) : (
                    <View style={{
                      width: width,
                      height: height * 0.4,
                    }}>
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
                          fontFamily: "Nunito-Italic",
                          fontSize: 16,
                          color: "white",
                          margin: 15,
                          textAlign: 'center',
                        }}
                      >No photo.</Text>
                    </View>
                  )
              )
          }

        </TouchableOpacity>
        <View style={styles.viewBack}>
          <View
            style={{
              flexDirection: "row",
              width: width * 0.9,
              alignSelf: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("grades", { data: props.route.params.data });
              }}
            >
              <View>
                <ImageBackground
                  style={{
                    width: 42,
                    height: height > 800 ? height * 0.06 : height * 0.08,
                    justifyContent: "center",
                  }}
                  source={utils.calculateGrade(data.rating).image}
                >
                  <Text
                    style={{
                      fontFamily: "Nunito-Bold",
                      fontSize: 16,
                       color: "#fff",
                      color: 'black',
                      textAlign: "center",
                    }}
                  >
                    {utils.calculateGrade(data.rating).title}
                  </Text>
                </ImageBackground>
              </View>
            </TouchableOpacity>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Nunito-SemiBold",
                fontSize: height * 0.025,
                marginLeft: 10,
                marginTop: 15,
              }}
            >
              {data.name}
            </Text>
          </View>
          <ScrollView bounces={false}>
            <View
              style={{
                width: width,
                height: height * 0.13,
                marginTop: height * 0.03,
                backgroundColor: "#F8F8F8",
                paddingBottom: height * 0.05
              }}
            >
              <View
                style={{
                  width: width * 0.9,
                  flexDirection: "row",
                  marginTop: height * 0.02,
                  alignSelf: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <Image
                    style={{
                      width: width * 0.03,
                      height: height * 0.015,
                      marginTop: 3,
                    }}
                    source={require("../assets/award.png")}
                  />
                  <Text
                    style={{
                      fontFamily: "Nunito-Regular",
                      fontSize: height * 0.018,
                      marginLeft: 5,
                    }}
                  >
                    {renderCuisineTypes(data.cuisine_types)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginRight: 40,
                  }}
                >
                  <Image
                    style={{
                      width: width * 0.03,
                      height: height * 0.015,
                      marginTop: 3,
                    }}
                    source={require("../assets/phone.png")}
                  />
                  <Text
                    style={{
                      fontFamily: "Nunito-Regular",
                      fontSize: height * 0.018,
                      marginLeft: 5,
                    }}
                    onPress={() => {
                      Linking.openURL(`tel:${data.phone}`)
                        .catch(error => console.log('cannot call number', error))
                    }}
                  >
                    {data.phone}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: width * 0.9,
                  flexDirection: "row",
                  marginTop: height * 0.02,
                  alignSelf: "center",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity onPress={() => {
                  openMap({
                    provider: 'google',
                    query: data.name,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    end: `${data.latitude},${data.longitude}`,
                  })
                }}>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Image
                      style={{
                        width: width * 0.03,
                        height: height * 0.017,
                        marginTop: 3,
                      }}
                      source={require("../assets/map-pin-red.png")}
                    />
                    <Text
                      style={{
                        fontFamily: "Nunito-Regular",
                        fontSize: height * 0.018,
                        marginLeft: 5,
                        marginRight: 10,
                      }}
                    >
                      {data.address + " " + data.city + " " + data.zip + " " + data.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                width: width * 0.9,
                marginTop: height * 0.03,
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: height * 0.019,
                  marginLeft: 3,
                }}
              >
                When we serve you
            </Text>

              <TouchableOpacity
                onPress={() => {
                  setShowDetail(!showDetail);
                }}
              >
                <View
                  style={{
                    backgroundColor: isOpen ? "#EAFFEC" : 'lightpink',
                    marginTop: 5,
                    borderRadius: 25,
                    padding: 10,
                  }}
                >
                  <View style={styles.timeView}>
                    <Text
                      style={{
                        fontFamily: "Nunito-SemiBold",
                        fontSize: height * 0.018,
                        color: isOpen ? "#00AE11" : 'black',
                      }}
                    >
                      {isOpen ? 'Open' : 'Closed now'}
                    </Text>

                    <MaterialC
                      name={showDetail ? 'chevron-up' : 'chevron-down'}
                      color={isOpen ? '#00AE11' : 'black'}
                      size={height * 0.027}
                    />
                  </View>

                  {showDetail && data?.hours_of_operation ? (
                    <View>
                      {
                        _.map(data.hours_of_operation, h => {
                          const dayName = moment().day(h.day_of_week - 1).format('dddd')
                          return (
                            <View key={dayName} style={[styles.timeView, { marginTop: 5 }]}>
                              <Text style={styles.timeTextView}>{dayName}</Text>
                              <Text style={styles.timeTextView}>{`${h.time_open} - ${h.time_close}`}</Text>
                            </View>
                          )
                        })
                      }
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: height * 0.019,
                  marginTop: 15,
                }}
              >
                Who we are
            </Text>
              <Text
                style={{
                  fontSize: height * 0.02,
                  fontFamily: "Nunito-Regular",
                  color: "grey",
                  marginTop: 5,
                }}
              >
                {isShortBio ? data.bio.substring(0, 150) + "..." : data.bio}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShortBio(!isShortBio)
                }}>
                <Text
                  style={{
                    fontFamily: "Nunito-Regular",
                    textDecorationLine: "underline",
                    fontSize: height * 0.019,
                    marginTop: 5,
                  }}
                >
                  {isShortBio ? "See more description" : "See Less description"}

                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: width * 0.9,
                marginTop: height * 0.03,
                alignSelf: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("productMenu", { business: data });
                }}
              >
                <View style={[{ flexDirection: "row" }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/file-text-red.png")}
                  />
                  <Text style={styles.inputStyle}>Menu</Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("reward", { data, refresh: loadData });
                }}
              >
                <View style={[{ flexDirection: "row", marginTop: height * 0.02 }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/giftOutline-red.png")}
                  />

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={styles.inputStyle}>Rewards</Text>

                    {
                      rewards > 0 ? (
                        <View style={{
                          borderRadius: 20,
                          width: 28,
                          height: 28,
                          backgroundColor: 'red',
                          padding: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 20
                        }}>
                          <Text style={{
                            fontSize: 16,
                            color: "white",
                            fontFamily: "Nunito-bold",
                          }}>{rewards}</Text>
                        </View>
                      ) : null
                    }
                  </View>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("merchantFundraisers", { data });
                }}
              >
                <View style={[{ flexDirection: "row", alignItems: 'center', marginTop: height * 0.02 }]}>
                  <MaterialC
                    name='star-outline'
                    color='red'
                    size={24}
                  />
                  <Text style={styles.inputStyle}>Fundraisers</Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("message", {
                    id: props.route.params.data.id,
                    title: props.route.params.data.name,
                    refresh: loadData
                  });
                }}
              >
                <View style={[{ flexDirection: "row", marginTop: height * 0.02 }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/message-square-red.png")}
                  />
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={styles.inputStyle}>Message</Text>
                    {
                      unread > 0 ? (
                        <View style={{
                          borderRadius: 20,
                          width: 28,
                          height: 28,
                          backgroundColor: 'red',
                          padding: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 20
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
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("feedback", { locationId: data.id });
                }}
              >
                <View style={[{ flexDirection: "row", marginTop: height * 0.02 }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/thumbs-up-red.png")}
                  />
                  <Text style={styles.inputStyle}>Rate Products or Services</Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("favourite", { filter: data });
                }}
              >
                <View style={[{ flexDirection: "row", marginTop: height * 0.02 }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/heartOutlineFav-red.png")}
                  />
                  <Text style={styles.inputStyle}>Favorite</Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  width: wp("92%"),
                  backgroundColor: "#e6e6e6",
                  alignSelf: "center",
                  marginTop: 15,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("collectPhotos", { data });
                }}
              >
                <View style={[{ flexDirection: "row", marginTop: height * 0.02 }]}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={require("../assets/cameraOutline-red.png")}
                  />
                  <Text style={styles.inputStyle}>Collect photos</Text>
                </View>
              </TouchableOpacity>

            </View>

            <View
              style={{
                flexDirection: "row",
                alignSelf: "center",
                position: "absolute",
                bottom: height * 0.25,
              }}
            >
              <Image
                style={{ width: 16, height: 16, marginTop: 3 }}
                source={require("../assets/eye.png")}
              />
              <Text
                style={{
                  fontFamily: "Nunito-SemiBold",
                  color: "grey",
                  fontSize: height * 0.018,
                  textAlign: "center",
                  marginLeft: 2,
                }}
              >
                {data.user_views} View
            </Text>
            </View>

            <View
              style={{
                flexDirection: "column-reverse",
                height: height * 0.2,
                backgroundColor: "lightgrey",
                marginTop: height * 0.11,
                borderTopLeftRadius: 25,
                 marginBottom: Platform.OS === "android" ? 30 : 0,
                paddingBottom: Platform.OS === "android" ? 60 : 0,
                paddingTop: Platform.OS === "android" ? 10 : 0,
                justifyContent: "center",
                borderTopRightRadius: 25,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                {data.facebook_url ? <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(data.facebook_url)

                  }}>
                  <Image
                    style={styles.socialView}
                    source={require("../assets/facebook.png")}
                  />
                </TouchableOpacity> : null}
                {data.twitter_url ? <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(data.twitter_url)

                  }}>
                  <Image
                    style={styles.socialView}
                    source={require("../assets/twitter.png")}
                  />
                </TouchableOpacity> : null}
                {data.instagram_username ? <TouchableOpacity
                  onPress={() => {
                    Linking.openURL("https://instagram.com/" + data.instagram_username)

                  }}>
                  <Image
                    style={styles.socialView}
                    source={require("../assets/instagram.png")}
                  />
                </TouchableOpacity> : null}
                {data.linked_url ? <TouchableOpacity
                  onPress={() => {
                    Linking.openURL("https://instagram.com/" + data.instagram_username)

                  }}>
                  <Image
                    style={styles.socialView}
                    source={require("../assets/linkedin.png")}
                  />
                </TouchableOpacity> : null}
                {data.url ? <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(data.url)
                  }}>
                  <View style={{
                    ...styles.socialView,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 15,
                    backgroundColor: 'steelblue'
                  }}>
                    <MaterialC name='web' color='white' size={36} />
                  </View>
                </TouchableOpacity> : null}
              </View>
              <Text
                style={{
                  fontFamily: "Nunito-Regular",
                  fontSize: height * 0.018,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Follow us on social media
            </Text>
            </View>
          </ScrollView>
        </View>


      </> : null
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  splash: {
    width: width,
    height: height * 0.4,
    resizeMode: "cover",
  },
  timeView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: width * 0.02,
    marginRight: width * 0.015,
  },
  socialView: {
    width: height > 800 ? 60 : 50,
    height: height > 800 ? 60 : 50,
    marginRight: width * 0.035,
  },
  timeTextView: {
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.018,
    color: "grey",
  },
  viewBack: {
    backgroundColor: "#fff",
    flex: 1,
     paddingBottom: height * 0.05,
     bottom: height * 0.05,
     height: height * 0.75,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  inputStyle: {
    paddingLeft: 13,
    marginLeft: 5,

    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: height * 0.025,

    borderRadius: 5,
  },
});

export default MerchantDetailScreen;
