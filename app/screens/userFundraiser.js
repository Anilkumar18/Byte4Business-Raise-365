import React, { useState, useEffect, useContext } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
  Share as RNShare,
  Platform,
} from "react-native";
import { useTheme, Title, Caption, Drawer } from "react-native-paper";
import { Avatar, Badge } from "react-native-elements";
import Geolocation from "react-native-geolocation-service";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../Services/userService";
import messaging from "@react-native-firebase/messaging";
import { StackActions } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import _ from "lodash";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialC from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../utils";
import QRCode from "react-native-qrcode-svg";
import RNFetchBlob from "rn-fetch-blob";
import Share from "react-native-share";
import ImageLoad from "react-native-image-placeholder";
import ProgressBar from "../components/progressBar";

import VersionInfo from "react-native-version-info";
import { useIsFocused } from "@react-navigation/native";

import PushNotification from "react-native-push-notification";
import { utils } from "../Utils/utils";
import { extraApiService } from "../Services/extraApiService";
import Store from "../store";

import * as RNZendesk from "rn-zendesk";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");

const Button = ({
  title,
  disabled = false,
  onPress,
  containerStyle,
  buttonStyle,
  titleStyle,
  icon,
  ...props
}) => {
  const buttonContainerStyle = {
    color: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 30,
    backgroundColor: Theme.redButtonColor,
     width: "100%",
    flex: 1,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 2 },
    elevation: 4,
    marginHorizontal: 6,
    ...buttonStyle,
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        ...containerStyle,
      }}
    >
      {icon ? (
        <View>
          <Icon
            type="material-community"
            size={30}
            containerStyle={{
              marginRight: 20,
            }}
            {...icon}
          />
          {icon.badge ? (
            <Badge
              value={icon.badge > 99 ? "+99" : icon.badge}
              badgeStyle={{
                backgroundColor: Theme.redButtonColor,
              }}
              containerStyle={{
                position: "absolute",
                top: -5,
                left: -10,
              }}
            />
          ) : null}
        </View>
      ) : null}
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              textAlign: "center",
              fontFamily: "Nunito-Bold",
              ...titleStyle,
            }}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QRCodeModal = ({ visible, userTeam, sharelink, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareSession, setShareSession] = useState(null);

  useEffect(() => {
    if (visible) {
      createShareSession();
    } else {
      setLoading(true);
      setError(false);
      setShareSession(null);
    }
  }, [visible]);

  const createShareSession = async () => {
    try {
      const payload = {
        fundraiser_type_id: userTeam?.id,
        link: sharelink,
        device: Platform.OS,
      };
      setLoading(true);
      console.log("extraApiService.createSharingSession payload", payload);
      const response = await extraApiService.createSharingSession(payload);
      console.log(
        "extraApiService.createSharingSession response",
        response.data
      );
      if (response.data?.success) {
        setShareSession(response.data?.data);
      }
      setLoading(false);
    } catch (error) {
      console.log("extraApiService.createSharingSession error", error);
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <ActivityIndicator size="large" color="black" />
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
            Generating QR code...
          </Text>
        </View>
      );
    }

    if (!shareSession || error) {
      return (
        <Text
          style={{
            fontFamily: "Nunito-Regular",
            fontSize: height * 0.022,
            color: "grey",
            textAlign: "center",
          }}
        >
          Error: Couldn't generate your QR Code
        </Text>
      );
    }

    return (
      <QRCode
        value={`${sharelink}?session=${shareSession.id}`}
        size={width * 0.8}
        onError={(error) => {
          console.log("Error generating qr code", error);
          setError(true);
        }}
      />
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            width: width * 0.9,
            borderRadius: 15,
            backgroundColor: "white",
            paddingVertical: 20,
             alignItems: 'center',
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: height * 0.022,
              color: "grey",
              textAlign: "center",
            }}
          >
            {userTeam?.fundraiser_name || "QR Code"}
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 20,
            }}
          >
            {renderContent()}
          </View>
          <TouchableOpacity onPress={onClose}>
            <View style={styles.buttonContainer}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  textAlign: "center",
                  fontFamily: "Nunito-Bold",
                }}
              >
                Close
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const UserFundraiserScreen = (props) => {
//   const user = props?.route?.params?.user
  const refresh = props?.route?.params?.refresh;

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [team, setTeam] = useState(null);
  const [fundraiserRole, setFundraiserRole] = useState("None");
  const [restaurantType, setRestaurantType] = useState("");
  const [sharelink, setShareLink] = useState("");
  const [leaderboard, setLeaderBoard] = useState("");
  const [teams, setTeams] = useState([]);
  const [preparingShareContent, setPreparingShareContent] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [error, setError] = useState(false);

  const isFocused = useIsFocused();

  const { navigation } = props;

  const [store, setStore] = useContext(Store.Context);

  const messages = store.fundraiserMessages;

  const insets = useSafeAreaInsets();

  const userTeam = _.find(teams, { id: team });

  const myTeam = _.find(data?.leaderboard, (team) =>
    _.find(team.detail, { id: user?.id })
  );

  const fundraiser = _.first(data);

  const user = {
    id: userId,
    name: `${firstName} ${lastName}`,
    avatar,
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (isFocused) {
      console.log("screen focused! refreshing...");
      loadData();
      loadMessages();
    } else {
      setQrCodeVisible(false);
    }
  }, [isFocused]);

  const loadData = async () => {
    if (loading) {
      console.log("already loading... abort!");
      return;
    }

    try {
      setError(false);
      setLoading(true);

      const user_id = JSON.parse(await AsyncStorage.getItem("@id"));
      const userfirst_name = JSON.parse(
        await AsyncStorage.getItem("@first_name")
      );
      const userlast_name = JSON.parse(
        await AsyncStorage.getItem("@last_name")
      );
      const userimage = JSON.parse(await AsyncStorage.getItem("@picture"));
      const team = JSON.parse(
        await AsyncStorage.getItem("@fundraiser_type_id")
      );
      const fundraiser_role = JSON.parse(
        await AsyncStorage.getItem("@fundraiser_role")
      );
      const restaurant_type = JSON.parse(
        await AsyncStorage.getItem("@restaurant_type")
      );
      const sharelink = JSON.parse(await AsyncStorage.getItem("@sharelink"));
      const leaderboard = JSON.parse(
        await AsyncStorage.getItem("@leaderboard")
      );

      setUserId(user_id);
      setFirstName(userfirst_name);
      setLastName(userlast_name);
      setAvatar(userimage);
      setFundraiserRole(fundraiser_role || "None");
      setRestaurantType(restaurant_type);

      if (userfirst_name && userlast_name) {
        setName(`${userfirst_name} ${userlast_name}`);
      }
      if (userimage) {
        setAvatar(userimage);
      }

      team && setTeam(team);
      sharelink && setShareLink(sharelink);
      leaderboard && setLeaderBoard(leaderboard);

      console.log(
        "fundraiser_role",
        fundraiser_role,
        fundraiser_role != "Sales Rep"
      );
      if (_.isEmpty(teams)) {
        const resp = await extraApiService.getAllFundraiserGroups();
        console.log("extraApiService.searchFundraiser response", resp.data);
        setTeams(resp.data);
      }

      console.log("getFundraiserAllInfo");
      const response = await extraApiService.getFundraiserAllInfo();
      console.log("getFundraiserAllInfo response", response.data);

      setLoading(false);

      if (response?.data?.error) {
        setError(true);
      } else {
        setData(response.data);
        setStore((previous) => ({
          ...previous,
          prizesCount: _.get(_.first(response.data), "prize_count", 0),
        }));
      }
    } catch (error) {
      console.log("getFundraiserAllInfo error", JSON.stringify(error));
      setLoading(false);
      setError(true);
      utils.checkAuthorized(error, props.navigation).then(() => {
        showMessage({
          type: "danger",
          message:
            "Could not process your request at this time. Please try again later.",
        });
      });
    }
  };

  const loadMessages = async () => {
    try {
      console.log("getFundraiserMessages");
      const messagesResponse = await extraApiService.getFundraiserMessages();
      console.log("getFundraiserMessages response", messagesResponse.data);

      setStore((previous) => ({
        ...previous,
        fundraiserMessages: messagesResponse.data,
      }));
    } catch (error) {
      console.log("getFundraiserMessages error", error);
    }
  };

  const onSharePress = async () => {
    console.log("onSharePress", teams, userTeam);

    if (!userTeam) {
      showMessage({
        type: "danger",
        message: "An unexpected error ocurred on share your fundraiser team",
      });
      return;
    }

    try {
      const imageUrl = userTeam.fundraiser.logo;

      if (!imageUrl) {
        console.log("cannot get image url");
        return;
      }

      setPreparingShareContent(true);

      const resp = await RNFetchBlob.config({ fileCache: true }).fetch(
        "GET",
        imageUrl
      );
      const base64Data = await resp.readFile("base64");

      const fileContent = `data:image/png;base64,${base64Data}`;
       console.log(fileContent);
      setPreparingShareContent(false);

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

        const createSessionResponse = await extraApiService.createSharingSession(
          {
            fundraiser_type_id: team,
            link: sharelink,
            device: Platform.OS,
          }
        );

        console.log("sharingSessionResponse", createSessionResponse.data);

        const sessionShareLink = createSessionResponse.data?.data?.id
          ? `${sharelink}?session=${createSessionResponse.data?.data?.id}`
          : sharelink;

        const message = `Hi, this is ${name} with ${userTeam.fundraiser_name}.\nPlease help us raise money for our fundraiser by clicking the link below. Thank you!\n${userTeam.fundraiser_name} - ${sessionShareLink}`;

        console.log("sessionShareLink", sessionShareLink);

        setTimeout(async () => {
          const shareResponse = await Share.open({
            title: userTeam.fundraiser_name,
            message,
            subject: `${userTeam.fundraiser_name}`,
            url: fileContent,
            failOnCancel: false,
          });
          console.log("share response", shareResponse);

          if (createSessionResponse.data?.data?.id && shareResponse.app) {
            const updateSessionResponse = await extraApiService.updateSharingSession(
              createSessionResponse.data.data.id,
              { shared: 1, app: shareResponse.app }
            );
            console.log(
              "updateSharingSessionResponse",
              updateSessionResponse.data
            );
          }
        }, 100);
      }
    } catch (error) {
      setPreparingShareContent(false);
      console.log("error sharing content", error);
    }
  };

  const openZenDesk = async () => {
    try {
      const username =
        JSON.parse(await AsyncStorage.getItem("@username")) || "app user";
      const email = JSON.parse(await AsyncStorage.getItem("@email")) || "-";

      console.log("set identity", username, email);

      RNZendesk.identifyAnonymous(username, email);
      RNZendesk.showHelpCenter({ subject: "Need help" });
    } catch (error) {
      console.log("open zendesk error", error);
    }
  };

  const onExitFundraiserPress = () => {
    const canExit =
      fundraiser?.status != "Active" || restaurantType == "franchise";

    console.log(
      "can exit?",
      canExit,
      "fundraiser is not active? ",
      fundraiser?.status != "Active",
      "user is a Sales Rep?",
      restaurantType == "franchise"
    );

    if (canExit) {
      Alert.alert("Exit Fundraiser Team", "Are you sure?", [
        { text: "Yes", onPress: exitFundraiser, style: "destructive" },
        { text: "No" },
      ]);
    } else {
      Alert.alert(
        "Exit Fundraiser Team",
        `Sorry you can't exit the fundraiser while it's Active.\n\nIf you need help please open a support ticket by clicking the Need Help button below`,
        [{ text: "Need Help", onPress: openZenDesk }, { text: "Close" }]
      );
    }
  };

  const exitFundraiser = async () => {
    try {
      const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

      const payload = {
        access_token: token,
        exit_fundraiser: 1,
      };

      setLoading(true);
      console.log("userService.exitFundraiser", payload);
      const response = await userService.exitFundraiser(payload);
      console.log("userService.exitFundraiser response", response.data);

      if (response.data?.status == "success") {
        showMessage({
          type: "success",
          message: "Your profile has been updated.",
        });

        await AsyncStorage.removeItem("@fundraiser_type_id");
        await AsyncStorage.setItem(
          "@fundraiser_role",
          JSON.stringify(response.data.fundraiser_role || "None")
        );
        await AsyncStorage.removeItem("@sharelink");
        await AsyncStorage.removeItem("@leaderboard");

        setData(null);
        setTeam(null);
        setFundraiserRole(response.data.fundraiser_role || "None");
        setStore((previous) => ({ ...previous, fundraiserMessages: [] }));
        setLoading(false);

        loadData();
      } else {
        setLoading(false);
        showMessage({
          type: "danger",
          message: "Could not process your request",
        });
      }
    } catch (error) {
      console.log("userService.exitFundraiser error", error);
      setLoading(false);
    }
  };

  const renderShareModal = () => {
    if (!preparingShareContent) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "white",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <ActivityIndicator size="large" color="black" />
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
    );
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ height: 80, paddingTop: 15 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Icon
              type='material-community'
              name='arrow-left-circle'
              size={32}
              color='gray'
              onPress={() => navigation.goBack()}
            /> */}

            <View style={{ width: 32 }} />

            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={() => navigation.navigate("profile")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user && (
                  <>
                    <Avatar
                      rounded
                      size={50}
                      source={user.avatar ? { uri: user.avatar } : undefined}
                      title={utils.getInitials(user.name)}
                      containerStyle={{
                        backgroundColor: "lightgray",
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 15,
                      }}
                    >
                      <Title
                        style={{
                          fontSize: 24,
                          fontFamily: "Nunito-Bold",
                        }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {user.name}
                      </Title>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Nunito-Regular",
                          textDecorationLine: "underline",
                          color: "#999",
                        }}
                      >
                        View profile
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={{ minWidth: 32 }} />
          </View>
        </View>
      </View>
    );
  };

  const renderMyProgressBar = () => {
    if (
      (fundraiserRole != "Player" && fundraiserRole != "Coach") ||
      !data ||
      !fundraiser ||
      !user
    ) {
      return null;
    }

     const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, { id: user?.id }))
     const myDetail = _.find(myTeam?.detail, { id: user?.id })

     const progressValue = !fundraiser.show_dollar_amount ? myDetail?.quantity : myDetail?.sum
     const progressMax = (!fundraiser.show_dollar_amount || fundraiser.template == 'Donation Campaign') ? Number(myTeam?.plan) : Number(myTeam?.plan) * Number(fundraiser.price)

//    const progressValue = Number(fundraiser.current);
//    const progressMax = Number(fundraiser.card_goal);

    return (
      <ProgressBar
        leftLabel="Sold"
        rightLabel="Goal"
        value={progressValue}
        max={progressMax}
        isMoney={
          fundraiser.show_dollar_amount ||
          fundraiser.template == "Donation Campaign"
        }
      />
    );
  };

  const renderFundraiserTeam = () => {
    if (fundraiserRole == "Sales Rep" || !data || !fundraiser) {
      return null;
    }

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 20,
        }}
      >
        <ImageLoad
          style={{
            width: 40,
            height: 40,
             borderRadius: 15,
            marginRight: 10,
            alignSelf: "center",
            backgroundColor: "#ccc",
          }}
          loadingStyle={{ size: "large", color: "blue" }}
          placeholderStyle={{
            width: 40,
            height: 40,
            alignSelf: "center",
            backgroundColor: "#ccc",
          }}
          resizeMode="contain"
          source={{ uri: fundraiser.logo }}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 18,
            color: "black",
            fontFamily: "nunito-bold",
          }}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {fundraiser.fundraiser_name}
        </Text>
      </View>
    );
  };

  const renderFundraiserButton = () => {
    if (fundraiser?.fundraiser_name && fundraiserRole != "Sales Rep") {
      return null;
    }

    return (
      <Button
        containerStyle={{
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderTopColor: "lightgray",
          borderBottomColor: "lightgray",
          paddingVertical: 15,
        }}
        buttonStyle={{ height: 40 }}
        title="Join A Fundraiser"
        titleStyle={{ fontSize: 22 }}
        onPress={() => {
          props.navigation.navigate("searchFundraiser", {
            teams,
            firstName,
            lastName,
          });
        }}
      />
    );
  };

  const renderButtons = () => {
    if (!data || !fundraiser) {
      return null;
    }

    if (fundraiserRole == "Sales Rep") {
      return (
        <View
          style={{
            marginHorizontal: 20,
            paddingTop: 10,
            borderTopWidth: 0.5,
            borderTopColor: "lightgray",
          }}
        >
          <Button
            icon={{ name: "chart-line" }}
            title="LEADERBOARD"
            onPress={() =>
              navigation.navigate("fundraiserLeaderboard", {
                user,
                data,
                userTeam,
                fundraiserRole,
              })
            }
          />
        </View>
      );
    }

    const unreadCount = _.filter(store.fundraiserMessages, { is_read: 0 })
      .length;

    const hideLeaderboardButton =
      (fundraiserRole == "Player" || fundraiserRole == "None") &&
      !!fundraiser?.hide_leaderboard;

    return (
      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <Button
          icon={{
            type: "ionicon",
            name: "person-circle-outline",
          }}
          title="CONTACTS"
          onPress={() =>
            navigation.navigate("fundraiserContacts", {
              user,
              data,
              userTeam,
              fundraiserRole,
            })
          }
        />
        <Button
          icon={{
            type: "ionicon",
            name: "share-social-outline",
          }}
          title="SHARE"
          buttonStyle={{
            backgroundColor:
              fundraiser?.status == "Active" ? Theme.redButtonColor : "gray",
          }}
          disabled={fundraiser?.status != "Active"}
          onPress={onSharePress}
        />
        <Button
          icon={{
            type: "ionicon",
            name: "qr-code-outline",
          }}
          title="QRCODE"
          buttonStyle={{
            backgroundColor:
              fundraiser?.status == "Active" ? Theme.redButtonColor : "gray",
          }}
          disabled={fundraiser?.status != "Active"}
          onPress={() => setQrCodeVisible(true)}
        />
        {!hideLeaderboardButton && (
          <Button
            icon={{ name: "chart-line" }}
            title="LEADERBOARD"
            onPress={() =>
              navigation.navigate("fundraiserLeaderboard", {
                user,
                data,
                userTeam,
                fundraiserRole,
              })
            }
          />
        )}
        <Button
          icon={{ name: "trophy-outline", badge: store.prizesCount }}
          title="PRIZES"
          buttonStyle={{
            backgroundColor: !_.isEmpty(fundraiser.prizes)
              ? Theme.redButtonColor
              : "gray",
          }}
          disabled={_.isEmpty(fundraiser.prizes)}
          onPress={() =>
            navigation.navigate("fundraiserPrizes", {
              user,
              data,
              userTeam,
              fundraiserRole,
            })
          }
        />
        <Button
          icon={{
            type: "ionicon",
            name: "calendar-sharp",
          }}
          title="CHECKPOINTS"
          buttonStyle={{
            backgroundColor: fundraiser.checkpoint
              ? Theme.redButtonColor
              : "gray",
          }}
          disabled={!fundraiser.checkpoint}
          onPress={() =>
            navigation.navigate("fundraiserCheckpoints", {
              user,
              data,
              userTeam,
              fundraiserRole,
            })
          }
        />
        <Button
          icon={{
            name: "email-outline",
            badge: unreadCount,
          }}
          title="MESSAGES"
          onPress={() =>
            navigation.navigate("fundraiserMessages", {
              user,
              data,
              userTeam,
              fundraiserRole,
            })
          }
        />
        {!fundraiser?.hide_cash_check && (
          <Button
            icon={{ name: "cart-arrow-right" }}
            title="CASH/CHECK ORDERS"
            onPress={async () => {
              try {
                const createSessionResponse = await extraApiService.createSharingSession(
                  {
                    fundraiser_type_id: team,
                    link: sharelink,
                    device: Platform.OS,
                  }
                );

                console.log(
                  "createSharingSession resposse",
                  createSessionResponse.data
                );

                if (createSessionResponse.data?.data?.id) {
                  const shareLinkWithParams = `${sharelink}?session=${createSessionResponse.data.data.id}&fr=m`;
                  console.log("shareLinkWithParams", shareLinkWithParams);

                  await Linking.openURL(shareLinkWithParams);
                  console.log("url opened");
                  const updateSessionResponse = await extraApiService.updateSharingSession(
                    createSessionResponse.data.data.id,
                    { shared: 1 }
                  );
                  console.log(
                    "updateSharingSessionResponse",
                    updateSessionResponse.data
                  );
                }
              } catch (error) {
                console.log("open url error:", error);
                showMessage({
                  type: "warning",
                  message: "Could not open your order link",
                });
              }
            }}
          />
        )}
        <Button title="Exit Fundraiser" onPress={onExitFundraiserPress} />
      </View>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <View
          style={{
            alignItems: "center",
            marginHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "nunito-regular",
              fontSize: 20,
              color: "gray",
              marginBottom: 20,
            }}
          >
            Could not load your fundraiser data.
          </Text>

          <Button title="Try again" onPress={loadData} />
        </View>
      );
    }

    if (loading) {
      return (
        <ActivityIndicator
          style={{
            justifyContent: "center",
            marginTop: "50%",
            backgroundColor: "#fff",
          }}
          size="large"
          color="#000"
        />
      );
    }

    return (
      <View style={{ flex: 1, marginHorizontal: 20 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderMyProgressBar()}
          {renderFundraiserTeam()}
          {renderFundraiserButton()}
          {renderButtons()}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {renderHeader()}
      {renderContent()}
      {renderShareModal()}
      <QRCodeModal
        visible={qrCodeVisible}
        sharelink={sharelink}
        userTeam={userTeam}
        onClose={() => setQrCodeVisible(false)}
      />
    </View>
  );
};

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
});

export default UserFundraiserScreen;
