import React, { useState, useEffect, createRef } from "react";
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
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView
} from "react-native";
import Theme from "../utils";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { scrollInterpolator, animatedStyles } from "../components/animations";
import ImageLoad from 'react-native-image-placeholder';
import Video from 'react-native-video';
import { showMessage } from "react-native-flash-message";
import _ from 'lodash'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { extraApiService } from "../Services/extraApiService";
import { utils } from "../Utils/utils";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const SLIDER_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);

const ProductDetailScreen = (props) => {

  const rateProduct = props.route.params?.rateProduct

  const [message, setMessage] = useState('');
  const [tabIndex, setTabIndex] = React.useState(rateProduct ? 1 : 0);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const [menuItem, setMenuItem] = useState()

  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const gradeRef = createRef()

  console.log('productDetail', props.route.params);

  useEffect(() => {
    (async () => {
      try {
        setMenuItem(props.route.params.data)
         locationId
        let resp = await extraApiService.getAllMenuItemRatings(props.route.params.data.location_id,
          props.route.params.data.id)
        console.log('extraApiService.getAllMenuItemRatings', resp.data);
        setLoading(false)
        setLoadingComments(false);

        setComments(resp.data)
        console.log("commmentsssss", props.route.params.data.location_id, "ccdc", props.route.params.data.id)

      } catch (error) {
        console.log("erroro", error)
        setLoadingComments(false);
        setLoading(false)
        utils.checkAuthorized(error, props.navigation)
      }
    })();
  }, []);

  const GRADEDATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "A+",
      rating: 1,
      color: Theme.greenGradeColor,
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "A",
      rating: 2,
      color: Theme.greenGradeColor,
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571e29d72",
      title: "A-",
      rating: 3,
      color: Theme.greenGradeColor,
    },
    {
      id: "58694a0f-3dsas1-471f-bd96-145571e29d72",
      title: "B+",
      rating: 4,
      color: Theme.greenGradeColor,
    },
    {
      id: "bd7acba-c1b1-46c2-aed5-3ad53abb28ba",
      title: "B",
      rating: 5,
      color: Theme.greenGradeColor,
    },
    {
      id: "3c68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "B-",
      rating: 6,
      color: Theme.yellowGradeColor,
    },
    {
      id: "58694a0f-3da1-471f-bd96-14551e29d72",
      title: "C+",
      rating: 7,
      color: Theme.yellowGradeColor,
    },
    {
      id: "58694a0f-3sas1-471f-bd96-145571e29d72",
      title: "C",
      rating: 8,
      color: Theme.yellowGradeColor,
    },
    {
      id: "bd7acba-c1b1-6c2-aed5-3ad53abb28ba",
      title: "C-",
      rating: 9,
      color: Theme.yellowGradeColor,
    },
    {
      id: "3c68afc-c05-48d3-a4f8-fbd91aa97f63",
      title: "D+",
      rating: 10,
      color: Theme.redGradeColor,
    },
    {
      id: "594a0f-3da1-471f-bd96-14551e29d72",
      title: "D",
      rating: 11,
      color: Theme.redGradeColor,
    },
    {
      id: "58690f-3sas1-471f-bd96-145571e29d72",
      title: "D-",
      rating: 12,
      color: Theme.redGradeColor,
    },
    {
      id: "58690f-3s1-471f-bd96-145571e29d72",
      title: "F",
      rating: 13,
      color: Theme.redGradeColor,
    },
  ];

  const onSubmitGrade = async () => {

    try {

      const rating = GRADEDATA[gradeRef.current.currentIndex].rating

      setSubmitting(true)
      const response = await extraApiService.leaveCommentForMenuItem(menuItem, rating, message)

      console.log('submit grade response', response);

      if (response.data.status == 'success') {

        const { data, onSubmit } = props.route.params
        const { rating, review } = response.data

        props.navigation.pop()
        console.log('data', data, onSubmit);
        if (data && onSubmit) {
          onSubmit(data, { rating, review })
        }
        setSubmitting(false)
        showMessage({
          type: 'success',
          message: 'Your grade has been sent.'
        })
      } else {
        setSubmitting(false)
        showMessage({
          type: 'danger',
          message: 'Could not process your request at this time. Please try again later.'
        })
      }
    }
    catch (error) {
      console.log('onSubmitGrade error', error);
      setSubmitting(false)
      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not process your request at this time. Please try again later.'
          })
        })
    }
  }

  const renderItem = ({ item, index }) => {

    return (
      <View style={{
        width: width * 0.38,
        height: width * 0.38,
         height: Math.round(width * 6.4) / 16,
        alignSelf: "center",
        justifyContent: "center",
        marginTop: height * 0.01,
        marginRight: 30,
        backgroundColor: item.color,
        borderRadius: width * 0.2
      }}>
        <Text
          style={{
            fontSize: height * 0.065,
            fontFamily: "Nunito-Bold",
            color: 'black',
            alignSelf: "center",
          }}
        >
          {item.title}
        </Text>
      </View>
    )

    return (
      <View style={{}}>
        <TouchableOpacity
          onPress={() => {
             props.navigation.pop();
          }}
          disabled={submitting}
        >
          <ImageBackground
            style={{
              width: width * 0.4,
              height: Math.round(width * 6.4) / 16,
              alignSelf: "center",
              justifyContent: "center",
              marginTop: height * 0.01,
              marginRight: 30,
            }}
            source={require("../assets/gradeBackground.png")}
          >
            <Text
              style={{
                fontSize: height * 0.065,
                fontFamily: "Nunito-Bold",
                color: Theme.redButtonColor,
                alignSelf: "center",
              }}
            >
              {item.title}
            </Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  const DATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: "First Item",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571es9d72",
      title: "Third Item",
    },
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53ybb28ba",
      title: "First Item",
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbdd1aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3da1-d71f-bd96-145571e29d72",
      title: "Third Item",
    },
    {
      id: "bd7acbea-c1b1-4dc2-aed5-3ad53abb28ba",
      title: "First Item",
    },
    {
      id: "3dc68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: "Second Item",
    },
    {
      id: "58694a0f-3dd1-471f-bd96-145571e29d72",
      title: "Third Item",
    },
  ];

  const renderComments = (comment, index) => {
    console.log("comments", JSON.stringify(comment))
    console.log("==========")

    // const commentGrade = _.find(GRADEDATA, gradle => gradle.rating == comment.item.rating)
    const commentGrade = utils.calculateGrade(comment.item.rating)
    return (
      <TouchableOpacity
        key={`${index}`}

      >
        <View style={styles.userInfoSection}>
          <View
            style={{
              flexDirection: "row",
              marginTop: 9,
            }}
          >

            <ImageLoad style={{
              width: 50,
              height: 50,
              borderRadius: 50,
            }}
              borderRadius={50}

              loadingStyle={{ size: 'large', color: 'blue' }}
              placeholderStyle={{
                width: 50,
                height: 50,
                borderRadius: 50,
              }}
              source={comment.item.user_avatar ? { uri: comment.item.user_avatar } : require("../assets/user.png")}
            />

            <View
              style={{
                marginLeft: 15,
                width: wp("60%"),
              }}
            >
              <Text
                style={{
                  fontSize: height * 0.02,
                  fontFamily: "Nunito-SemiBold",
                }}
              >
                {comment.item.username}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Text
                  style={{
                    fontSize: height * 0.019,
                    color: "grey",
                    fontFamily: "Nunito-Regular",
                  }}
                >
                  {comment.item.text}
                </Text>
              </View>
            </View>
          </View>
          <ImageBackground
            style={{
              width: 30,
              height: 36,
              position: "absolute",
              right: 10,
              top: height * 0.018,
            }}
            source={commentGrade.badge}
          >
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: 16,
                textAlign: "center",
                color: 'black',
                marginTop: 5,
              }}
            >
              {commentGrade.title}
            </Text>
          </ImageBackground>
        </View>
        <View
          style={{
            height: 1,
            width: wp("92%"),
            backgroundColor: "#e5e5e5",
            alignSelf: "center",
          }}
        ></View>
      </TouchableOpacity>
    );
  };

  const tabButton = (tab, title) => {
    return (
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: tabIndex == tab ? "#051533" : "lightgrey" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setTabIndex(tab);
          }}
        >
          <Text
            style={{
              color: tabIndex == tab ? "#fff" : "grey",
              fontSize: 14,
              textAlign: "center",
              fontFamily: "Nunito-SemiBold",
            }}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ItemBackground = props => {

    const media = menuItem && _.first(menuItem.images)
    const isVideo = media && media.is_video && media.image

    console.log('menuItem', media, isVideo);

    if (isVideo) {

      return (
        <View style={styles.splash}>
          <Video
            muted
            repeat
            source={{ uri: media.image }}
            style={{
              width: wp("100%"),
              height: height * 0.25,
            }}
          />
          {props.children}
        </View>
      )
    }

    return (
      <ImageBackground
        style={styles.splash}
        source={(media && media.image) ? { uri: media.image } : require("../assets/productbackground.png")}
      >
        {props.children}
      </ImageBackground>
    )
  }

  const renderHeader = () => {
    return (
      <ItemBackground>
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack();
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Image
            style={{
              marginTop:
                Platform.OS === "android" ? height * 0.03 : height * 0.05,
              left: 20,
            }}
            source={require("../assets/backBlack.png")}
          />
          <Image
            style={{
              position: "absolute",
              top: Platform.OS === "android" ? height * 0.03 : height * 0.05,
              right: 20,
            }}
            source={require("../assets/heartWhite.png")}
          />
          <Image
            style={{
              position: "absolute",
              top: Platform.OS === "android" ? height * 0.03 : height * 0.05,
              right: 60,
            }}
            source={require("../assets/shareWhite.png")}
          />
        </TouchableOpacity>
      </ItemBackground>
    )
  }

  const renderNameAndPrice = () => {
    if (!menuItem) {
      return null
    }
    return (
      <View
        style={{
          flexDirection: "row",
          width: width,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            fontSize: height * 0.028,
            marginLeft: 15,
            marginTop: 20,
          }}
        >
          {menuItem.name}
        </Text>
        {Number(menuItem.price) > 0 ? (
          <View
            style={{
              width: width * 0.18,
              height: height * 0.052,
              borderRadius: 10,
              position: "absolute",
              backgroundColor: Theme.redButtonColor,
              right: 0,
              top: 0,
            }}
          >
            <Text
              style={{
                fontFamily: "Nunito-Bold",
                fontSize: height * 0.02,
                textAlign: "center",
                marginTop: height * 0.01,
                color: "#fff",
              }}
            >{utils.formatMoney(Number(menuItem.price))}</Text>
          </View>
        ) : null
        }
      </View>
    )
  }

  const renderTabButtons = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
           marginTop: height * 0.04,
          marginTop: 20,
          width: width * 0.9,
          alignSelf: "center",
        }}
      >
        {tabButton(0, "Item Details")}
        {tabButton(1, "Your grade")}
        {tabButton(2, "Comments")}
      </View>
    )
  }

  const renderContent = () => {

    if (!menuItem) {
      return null
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flexGrow: 0, }}
          contentContainerStyle={{
            marginTop: 15,
            marginHorizontal: 20,
          }}
        >
          {tabIndex === 0 ? (
            <View>
              <View
                style={{
                  height: height * 0.13,
                  backgroundColor: utils.calculateGrade(menuItem.rating).color,
                   backgroundColor: "#ffebeb",
                  borderRadius: 10,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
              >
                <View style={{ justifyContent: "center", width: width * 4 }}>
                  <Text
                    style={{
                      fontSize: height * 0.035,
                      fontFamily: "Nunito-Bold",
                      color: 'black',
                      textAlign: "center",
                    }}
                  >
                    {utils.calculateGrade(menuItem.rating).title}
                  </Text>
                  <Text
                    style={{
                      fontSize: height * 0.017,
                      fontFamily: "Nunito-Regular",
                      color: 'black',
                      textAlign: "center",
                    }}
                  >
                    Overall grade ({menuItem.rating_total})
                  </Text>
                </View>
                <View
                  style={{
                    borderLeftWidth: 1,
                    borderLeftColor: "rgba(0,0,0,0.5)",
                    height: height * 0.1,
                    marginTop: height * 0.015,
                  }}
                />
                <View style={{ justifyContent: "center", width: width * 4 }}>
                  <Text
                    style={{
                      fontSize: height * 0.035,
                      fontFamily: "Nunito-Bold",
                      color: 'black',
                      textAlign: "center",
                    }}
                  >
                    {menuItem.views}
                  </Text>
                  <Text
                    style={{
                      fontSize: height * 0.017,
                      fontFamily: "Nunito-Regular",
                      color: 'black',
                      textAlign: "center",
                    }}
                  >
                    # of views
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: height * 0.02,
                  fontFamily: "Nunito-Regular",
                  color: "grey",
                  marginTop: 10,
                }}
              >
                {menuItem.description}
              </Text>
            </View>
          ) : tabIndex === 1 ? (
            <View>
              <Text
                style={{
                  textAlign: "center",
                  fontFamily: "Nunito-Regular",
                  fontSize: height * 0.02,
                  color: "grey",
                }}
              >
                Swipe to select your grade
              </Text>

              <Carousel
                ref={gradeRef}
                data={GRADEDATA}
                renderItem={renderItem}
                sliderWidth={width}
                itemWidth={width}
                itemHeight={height}
                inactiveSlideShift={0}
                scrollInterpolator={scrollInterpolator}
                slideInterpolatedStyle={animatedStyles}
                useScrollView={true}
                scrollEnabled={!submitting}
              />

            </View>
          ) : (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "center",
                      backgroundColor: "lightgrey",
                      height: height * 0.06,
                      width: width * 0.9,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <ImageBackground
                      style={{
                        width: width * 0.09,
                        height:
                          height > 800
                            ? Math.round(width * 2.3) / 16
                            : Math.round(width * 1.9) / 16,
                        justifyContent: "center",
                        marginLeft: 20,
                      }}
                      source={utils.calculateGrade(menuItem.rating).image}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          fontSize: 16,
                          color: 'black',
                          textAlign: "center",
                        }}
                      >
                        {utils.calculateGrade(menuItem.rating).title}
                      </Text>
                    </ImageBackground>
                    <Text
                      style={{
                        fontFamily: "Nunito-SemiBold",
                        fontSize: height * 0.025,
                        marginLeft: 20,
                      }}
                    >
                      Comments
                </Text>
                  </View>
                  {loadingComments ? <ActivityIndicator color="#000" size="large" /> :
                    _.map(comments, (comment, index) => renderComments({ item: comment }, index))
                  }

                </View>
              )}
        </ScrollView>
      </TouchableWithoutFeedback>
    )
  }

  const renderFooter = () => {

    if (!menuItem) {
      return null
    }
    if (tabIndex !== 1) {
      return null
    }

    return (
      <View style={{
        alignSelf: 'center',
        width: width * 0.9
      }}>
        <TextInput
          editable={!submitting}
          style={styles.inputSearchStyle}
          placeholder="Description"
          value={message}
          multiline={true}
          numberOfLines={3}
          returnKeyType="done"
          placeholderTextColor="grey"
          onChangeText={(text) => {
            setMessage(text);
          }}
        />
        <TouchableOpacity
          onPress={onSubmitGrade}
          disabled={submitting}
        >
          <View
            style={[
              styles.buttonContainer,
              {
                borderRadius: 25,
                height: height * 0.05,
                backgroundColor: Theme.redButtonColor,
                width: "95%",
                marginTop: 15,
              },
            ]}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

              {
                submitting ?
                  <ActivityIndicator color='white' style={{ marginRight: 10 }} /> : null
              }
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Submit Grade
                  </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {renderHeader()}
          {renderNameAndPrice()}
          {renderTabButtons()}
        </View>
      </TouchableWithoutFeedback>
      {renderContent()}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {renderFooter()}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView >
  );
};

const styles = StyleSheet.create({
  container: {
     flex: 1,
    backgroundColor: "#fff",
  },
  splash: {
    width: wp("100%"),
    height: height * 0.25,
    resizeMode: "cover",
  },
  userInfoSection: {
    paddingLeft: 10,
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),
    paddingBottom: 15,
  },

  viewBack: {
    backgroundColor: "#fff",
     height: height * 0.75,
     flex: 1,
    paddingBottom: 25,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  buttonContainer: {
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: height * 0.05,
    width: "30%",
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
});

export default ProductDetailScreen;
