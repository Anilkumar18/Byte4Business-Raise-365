import React, { useState, useEffect, useContext } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  Keyboard,
  Image,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useTheme, Title, Caption, Drawer } from "react-native-paper";
import { Avatar } from "react-native-elements";
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
  onPress,
  containerStyle,
  buttonStyle,
  titleStyle,
  icon,
  disabled = false,
  ...props
}) => {
  const buttonContainerStyle = {
    color: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 20,
    height: 40,
    backgroundColor: Theme.redButtonColor,
     width: "100%",
    flex: 1,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
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
        <Icon
          type="material-community"
          size={30}
          containerStyle={{
            marginRight: 20,
          }}
          {...icon}
        />
      ) : null}
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              textAlign: "center",
              fontFamily: "Nunito-Bold",
              ...titleStyle,
            }}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PopupPrize = ({ value, onChange, onClose }) => {
  const [name, setName] = useState(value?.current_name || "");
  const [number, setNumber] = useState(value?.current_number || "");
  const [option, setOption] = useState(value?.selected_option || null);

  const showName = !!value?.put_name && _.isEmpty(value?.current_name);
  const showNumber = !!value?.put_number && _.isEmpty(value?.current_number);
  const showOptions = !_.isEmpty(value?.options) && !value?.selected_option;

  const insets = useSafeAreaInsets();

  console.log("state", name, number, option);

  const renderContent = () => {
    const imageStyle = {
      height: wp(30),
      width: wp(30),
      marginBottom: 5,
    };

    const textStyle = {
      fontFamily: "Nunito-Regular",
      fontSize: 18,
      textAlign: "center",
    };

    const inputContainerStyle = {
      flexDirection: "row",
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "space-between",
    };
    const inputLabelStyle = {
      fontSize: 16,
      fontFamily: "Nunito-Regular",
      marginRight: 10,
      flex: 0.3,
    };

    const inputStyle = {
      flex: 1,
      borderWidth: 1,
       marginBottom: 10,
      paddingVertical: 5,
      paddingHorizontal: 10,
      fontSize: 16,
      fontFamily: "Nunito-Regular",
    };

    return (
      <ScrollView style={{ padding: 10 }} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            marginBottom: 20,
            fontFamily: "Nunito-Regular",
            fontSize: 20,
            color: "black",
            textAlign: "center",
          }}
        >
          You have reached prize level {value.level}
        </Text>

        <View
          style={{
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {value.image ? (
            <ImageLoad
              style={imageStyle}
              loadingStyle={{ size: "large", color: "blue" }}
              placeholderStyle={imageStyle}
              resizeMode="contain"
              source={{ uri: value.image }}
            />
          ) : null}
          <Text style={textStyle}>{value.name}</Text>
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 12,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Please add the following information to your reward
          </Text>
        </View>

        {showName && (
          <View style={inputContainerStyle}>
            <Text
              style={inputLabelStyle}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Name
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter a name you want on prize"
              placeholderTextColor='gray'
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        {showNumber && (
          <View style={inputContainerStyle}>
            <Text
              style={inputLabelStyle}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Number
            </Text>
            <TextInput
              style={{ ...inputStyle, flex: 0.5 }}
              placeholder="Enter a number you want on prize"
              placeholderTextColor='gray'
              value={number}
              onChangeText={setNumber}
              keyboardType="number-pad"
            />
          </View>
        )}

        {showOptions && (
          <View style={{ ...inputContainerStyle, alignItems: "flex-start" }}>
            <Text
              style={inputLabelStyle}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Option
            </Text>
            <View
              style={{
                flex: 1,
              }}
            >
              {_.map(value.options, (valueOption) => (
                <TouchableOpacity
                  key={valueOption}
                  onPress={() => setOption(valueOption)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Icon
                      type="material-community"
                      name={
                        option == valueOption
                          ? "radiobox-marked"
                          : "radiobox-blank"
                      }
                      color={
                        option == valueOption ? Theme.redButtonColor : "black"
                      }
                      containerStyle={{
                        marginRight: 10,
                      }}
                    />
                    <Text style={inputLabelStyle}>{valueOption}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          flex: 1,
          padding: 20,
          paddingTop: insets.top,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 15,
            backgroundColor: "white",
            paddingHorizontal: 10,
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ width: 28 }} />
            <Text
              style={{
                flex: 1,
                marginHorizontal: 30,
                fontFamily: "Nunito-Regular",
                fontSize: 20,
                color: "black",
                textAlign: "center",
                borderTopWidth: 1,
                borderTopColor: "lightgray",
                borderBottomWidth: 1,
                borderBottomColor: "lightgray",
                paddingVertical: 5,
              }}
            >
              Congratulations!
            </Text>
            <Icon name="close" color="grey" type="material-community" size={28} onPress={onClose} />
          </View>

          {renderContent()}

          <Button
            containerStyle={{
              paddingHorizontal: 20,
            }}
            title="Confirm"
            onPress={() => onChange(name, number, option)}
          />
        </View>
      </View>
    </View>
  );
};

const FundraiserPrizesScreen = (props) => {
  const user = props?.route?.params?.user;
  const userTeam = props?.route?.params?.userTeam;
  const data = props?.route?.params?.data;
  const fundraiserRole = props?.route?.params?.fundraiserRole;

  const fundraiser = _.first(data);

  const [popupPrize, setPopupPrize] = useState(null);
  const [prizes, setPrizes] = useState(fundraiser.prizes || []);
  const [lastPrizes, setLastPrizes] = useState(fundraiser.prizes || []);

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const myTeam = _.find(fundraiser.leaderboard, (team) =>
    _.find(team.detail, { id: user.id })
  );
  const myDetail = _.find(_.flatMap(fundraiser.leaderboard, "detail"), {
    id: user.id,
  });
  const myProgress = myDetail
    ? _.sumBy(myDetail.customers, (c) => (c.is_refunded ? 0 : c.quantity))
    : 0;

  useEffect(() => {
    const popupPrize = _.first(
      _.sortBy(
        _.filter(
          prizes,
          (prize) =>
            fundraiser.quantity_for_prize >= prize.count &&
            ((prize.put_name && _.isEmpty(prize.current_name)) ||
              (prize.put_number && _.isEmpty(prize.current_number)) ||
              (!_.isEmpty(prize.options) && !prize.selected_option))
        )
      )
    );

    setPopupPrize(popupPrize);
  }, []);

  const onChangePrize = async (prizeIndex, diff, mustUpdate = false) => {
    console.log("onChangePrize", prizeIndex, diff);

    const updatedPrizes = _.map(prizes, (prize, index) =>
      index == prizeIndex ? { ...prize, ...diff } : prize
    );
    setPrizes(updatedPrizes);

    if (mustUpdate) {
      updatePrizeOptions(prizeIndex, updatedPrizes);
    }
  };

  const updatePrizeOptions = async (prizeIndex, updatedPrize) => {
    if (!updatedPrize) {
      console.log("invalid prize index", updatedPrize);
      return;
    }

    Keyboard.dismiss();

    try {
      const payload = {
        prize_index: prizeIndex,
        prize_option: updatedPrize.selected_option,
        prize_put_name: updatedPrize.current_name,
        prize_put_number: updatedPrize.current_number,
      };

      console.log(
        "extraApiService.selectFundraiserPrizeOption payload",
        payload
      );

      const response = await extraApiService.selectFundraiserPrizeOption(
        payload
      );

      console.log(
        "extraApiService.selectFundraiserPrizeOption response",
        response.data
      );

      if (response.data?.success) {
        showMessage({ type: "success", message: response.data.success });
        setLastPrizes(prizes);
      } else {
        showMessage({ type: "danger", message: response.data.error });
        setPrizes(lastPrizes);
      }
    } catch (error) {
      console.log("extraApiService.selectFundraiserPrizeOption error", error);
      showMessage({ type: "danger", message: "Could not select this option" });
      setPrizes(lastPrizes);
    }
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
             paddingLeft: 20,
            paddingTop: 15,
            height: 80,
             alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Icon
              type="material-community"
              name="arrow-left-circle"
              size={32}
              color="gray"
              onPress={() => navigation.goBack()}
            />

            <View
              style={{
                flex: 1,
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
                      backgroundColor: "darkgray",
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
                  </View>
                </>
              )}
            </View>

            <View style={{ minWidth: 32 }} />
          </View>
        </View>
      </View>
    );
  };

  const renderPrizeCustomFields = (prize, prizeIndex) => {
     if (!prize.put_name || !prize.put_number) {
       return null
     }

    return (
      <View
        style={{
          marginTop: 10,
        }}
      >
        {prize.put_number ? (
          <TextInput
            style={{
              borderWidth: 1,
              marginBottom: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              fontSize: 16,
              fontFamily: "Nunito-Regular",
            }}
            placeholder="Enter a number you want on prize"
            placeholderTextColor='gray'
            value={prize.current_number}
            onChangeText={(current_number) =>
              onChangePrize(prizeIndex, { current_number })
            }
            onBlur={() => {
              console.log("blur number", prizeIndex, prize);
              updatePrizeOptions(prizeIndex, prizes[prizeIndex]);
            }}
            keyboardType="number-pad"
          />
        ) : null}

        {prize.put_name ? (
          <TextInput
            style={{
              borderWidth: 1,
              marginBottom: 10,
              paddingVertical: 5,
              paddingHorizontal: 10,
              fontSize: 16,
              fontFamily: "Nunito-Regular",
            }}
            placeholder="Enter a name you want on prize"
            placeholderTextColor='gray'
            value={prize.current_name}
            onChangeText={(current_name) =>
              onChangePrize(prizeIndex, { current_name })
            }
            onBlur={() => {
              console.log("blur name", prizeIndex, prize);
              updatePrizeOptions(prizeIndex, prizes[prizeIndex]);
            }}
          />
        ) : null}
      </View>
    );
  };

  const renderPrize = (prize, prizeIndex) => {
     console.log('renderprize', prize.selected_option)

    const imageStyle = {
      flex: 1,
      width: null,
      height: null,
      minHeight: wp(45),
      marginBottom: 5,
    };

    const textStyle = {
      fontFamily: "nunito-regular",
      fontSize: 18,
      textAlign: "center",
    };

    return (
      <View key={prizeIndex}>
        <Button title={`SELL ${prize.count}`} disabled />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            {prize.image ? (
              <ImageLoad
                style={imageStyle}
                loadingStyle={{ size: "large", color: "blue" }}
                placeholderStyle={imageStyle}
                resizeMode="contain"
                source={{ uri: prize.image }}
              />
            ) : null}
            <Text style={textStyle}>{prize.name}</Text>
          </View>
          <View>
            {_.map(prize.options, (option, optionIndex) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  const updatedPrize = { ...prize, selected_option: option };

                  onChangePrize(prizeIndex, { selected_option: option });

                  updatePrizeOptions(prizeIndex, updatedPrize);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 30,
                  }}
                >
                  <Icon
                    type="material-community"
                    name={
                      prize.selected_option == option
                        ? "radiobox-marked"
                        : "radiobox-blank"
                    }
                    color={
                      prize.selected_option == option
                        ? Theme.redButtonColor
                        : "black"
                    }
                    containerStyle={{
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ ...textStyle, marginBottom: 5 }}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderPrizeCustomFields(prize, prizeIndex)}

        <View
          style={{
            height: 0.5,
            backgroundColor: "black",
            marginHorizontal: 20,
            marginVertical: 15,
          }}
        />
      </View>
    );
  };

  const renderMyProgressBar = () => {
    if (
      !data ||
      !fundraiser ||
      (fundraiserRole != "Player" && fundraiserRole != "Coach") ||
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

  const renderContent = () => {
    return (
      <View
        style={{
          flex: 1,
          marginHorizontal: 20,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderMyProgressBar()}

          {fundraiser ? (
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
          ) : null}

          <View
            style={{
              paddingVertical: 10,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontFamily: "nunito-bold",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              PRIZES
            </Text>
          </View>
          {_.map(prizes, renderPrize)}
          <View
            style={{
              borderTopWidth: 1,
              marginTop: 40,
            }}
          >
            <Image
              source={require("../assets/FramenLogin.png")}
              resizeMode="contain"
              style={{
                width: wp(40),
                height: wp(40),
                alignSelf: "center",
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {renderHeader()}
      {renderContent()}
      {popupPrize && (
        <PopupPrize
          value={popupPrize}
          onChange={(current_name, current_number, selected_option) => {
            const index = _.findIndex(
              prizes,
              (prize) =>
                prize.name == popupPrize.name && prize.image == popupPrize.image
            );
            console.log(
              "on change popup prize",
              current_name,
              current_number,
              selected_option,
              index
            );

            if (index > -1) {
              const updatedPrize = {
                current_name,
                current_number,
                selected_option,
              };

              onChangePrize(index, updatedPrize);

              updatePrizeOptions(index, updatedPrize);
            }
            setPopupPrize(null);
          }}
          onClose={() => setPopupPrize(null)}
        />
      )}
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

export default FundraiserPrizesScreen;
