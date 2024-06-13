import React, { useState, useEffect, useContext } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput as RNTextInput,
  RefreshControl,
} from "react-native";
import {
  useTheme,
  Title,
  Caption,
  Drawer,
  TextInput,
} from "react-native-paper";
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

const SORT_TYPES = {
  ALPHA: "alpha",
  PROGRESS: "progress",
};

const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
};

const TEAM_OPTIONS = {
  SHOW_ALL: "SHOW_ALL",
  SHOW_OPEN: "SHOW_OPEN",
  SHOW_CLOSED: "SHOW_CLOSED",
  HIDE_ALL: "HIDE_ALL",
};

const Button = ({
  title,
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
    height: 40,
    backgroundColor: "black",
     width: "100%",
    flex: 1,
    marginHorizontal: 6,
    ...buttonStyle,
  };
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
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
        <TouchableOpacity onPress={onPress}>
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

const TeamStatsTable = ({ group, team }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (team.showStats && _.isEmpty(data)) {
      loadData();
    }
  }, [team]);

  const loadData = async () => {
    try {
      setLoading(true);

      const payload = {
        fundraiser_type_id: group.fundraiser_type_id,
        team: team.name,
      };

      console.log("extraApiService.loadFundraiserTeamStats payload", payload);
      const response = await extraApiService.loadFundraiserTeamStats(payload);
      console.log(
        "extraApiService.loadFundraiserTeamStats response",
        response.data
      );

      setLoading(false);

      if (_.isArray(response.data)) {
        setData(response.data);
      }
    } catch (error) {
      console.log(
        "extraApiService.loadFundraiserTeamStats error",
        JSON.stringify(error)
      );
      setLoadingDetailStats(false);
    }
  };

  const rowStyle = {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    marginRight: 5,
  };

  const columnStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.5,
  };

  const textStyle = {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Nunito-Regular",
  };

  if (!team.showStats) {
    return null;
  }

  if (loading) {
    return <ActivityIndicator color="black" />;
  }

  if (_.isEmpty(data)) {
    return (
      <View style={{ padding: 10 }}>
        <Text style={textStyle}>No stats.</Text>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          borderTopColor: "gray",
          paddingVertical: 5,
        }}
      >
        <View
          style={{
            borderWidth: 0.5,
            borderRadius: 5,
            alignSelf: "center",
            paddingHorizontal: 5,
            marginBottom: 5,
          }}
        >
          <Text
            style={{
              fontFamily: "Nunito-Regular",
            }}
          >
            Total Team Members: {data.length}
          </Text>
        </View>

        <View style={{ ...rowStyle, borderTopWidth: 0.5 }}>
          <View style={{ ...columnStyle, borderLeftWidth: 0.5 }}>
            <Text style={textStyle}>Participant</Text>
          </View>
          <View style={columnStyle}>
            <Text style={textStyle}>Email Shared</Text>
          </View>
          <View style={columnStyle}>
            <Text style={textStyle}>SMS Shared</Text>
          </View>
          <View style={columnStyle}>
            <Text style={textStyle}>$Total Raised</Text>
          </View>
        </View>

        {_.map(data, (row, rowKey) => (
          <View key={rowKey} style={rowStyle}>
            {_.map(row, (column, columnKey) => (
              <View
                key={columnKey}
                style={{
                  ...columnStyle,
                  borderLeftWidth: columnKey == 0 ? 0.5 : 0,
                }}
              >
                <Text style={textStyle}>
                  {columnKey == row.length - 1 ? "$" : ""}
                  {column}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const FundraiserLeaderboardScreen = (props) => {
  const user = props?.route?.params?.user;
  const userTeam = props?.route?.params?.userTeam;
  const data = props?.route?.params?.data || [];
  const fundraiserRole = props?.route?.params?.fundraiserRole || "None";

  const [fundraiserGroups, setFundraiserGroups] = useState(
    fundraiserRole == "Sales Rep" ? [] : data
  );

  const fundraiser =
    fundraiserRole == "Sales Rep" ? null : _.first(fundraiserGroups);

  const [sortType, setSortType] = useState(SORT_TYPES.ALPHA);
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);

  const [tabIndex, setTabIndex] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [loadingDetail, setLoadingDetail] = useState({});
  const [updatingDetailStatus, setUpdatingDetailStatus] = useState({});
  const [teamOption, setTeamOption] = useState({});
  const [teamSearch, setTeamSearch] = useState({});

  const [activeTeamOption, setActiveTeamOption] = useState(null);

  const [loadingDetailStats, setLoadingDetailStats] = useState({});

  const [loadingCustomer, setLoadingCustomer] = useState({});
  const [updatingCustomer, setUpdatingCustomer] = useState({});

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();
  console.log(
    "[LEADERBOARD] loading?",
    loading,
    "refreshing?",
    refreshing,
    "size=",
    fundraiserGroups.length
  );

  useEffect(() => {
    loadLeaderBoard();
  }, []);

  const loadLeaderBoard = async (refresh = false) => {
    if (loading) {
      console.log("already loading!");
      return;
    }

    if (!hasMoreData) {
      console.log("no more data to load");
      return;
    }

    try {
      const currentPage = refresh ? 1 : page;
      const currentFundraiserGroups = refresh ? [] : fundraiserGroups;

      refresh && setRefreshing(true);
      setLoading(true);

      console.log("extraApiService.loadLeaderBoard page=", currentPage);
      const response = await extraApiService.getFundraiserLeaderBoard(
        currentPage
      );
      console.log("extraApiService.loadLeaderBoard response", response.data);

      setLoading(false);
      setRefreshing(false);

      if (!_.isEmpty(response.data)) {
        console.log("updating groups");
        setFundraiserGroups(
          _.uniqBy(
            [...response.data, ...currentFundraiserGroups],
            "fundraiser_type_id"
          )
        );
        setPage(currentPage + 1);
        setHasMoreData(true);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
      console.log("extraApiService.loadLeaderBoard error", error);
    }
  };

  const loadTeamDetail = async (group, team, updatedFundraiserGroups) => {
    console.log("loadTeamDetail", group.fundraiser_name, team.name);

    const teamKey = `${team.name}-${group.fundraiser_type_id}`;
    try {
      setLoadingDetail({ ...loadingDetail, [teamKey]: true });

      const payload = {
        fundraiser_type_id: group.fundraiser_type_id,
        team_name: team.name,
      };

      console.log("extraApiService.getFundraiserTeamDetail payload", payload);
      const response = await extraApiService.getFundraiserTeamDetail(payload);
      console.log(
        "extraApiService.getFundraiserTeamDetail response",
        response.data
      );

      setLoadingDetail({ ...loadingDetail, [teamKey]: false });

      if (response.data?.success) {
        setFundraiserGroups(
          _.map(updatedFundraiserGroups, (fundraiserGroup) => ({
            ...fundraiserGroup,
            leaderboard: _.map(fundraiserGroup.leaderboard, (groupTeam) =>
              fundraiserGroup.fundraiser_name == group.fundraiser_name &&
              groupTeam.name == team.name
                ? { ...groupTeam, detail: response.data.users }
                : groupTeam
            ),
          }))
        );
      }
    } catch (error) {
      console.log(
        "extraApiService.getFundraiserTeamDetail error",
        JSON.stringify(error)
      );
      setLoadingDetail({ ...loadingDetail, [teamKey]: false });
    }
  };

  const loadDetailStats = async (group, detail, updatedFundraiserGroups) => {
    console.log("loadDetailStats", group.fundraiser_name, detail.id);

    try {
      setLoadingDetailStats({ ...loadingDetail, [detail.id]: true });

      const payload = {
        fundraiser_type_id: group.fundraiser_type_id,
        user_id: detail.id,
      };

      console.log("extraApiService.loadFundraiserDetailStats payload", payload);
      const response = await extraApiService.loadFundraiserTeamStats(payload);
      console.log(
        "extraApiService.loadFundraiserDetailStats response",
        response.data
      );

      setLoadingDetailStats({ ...loadingDetail, [detail.id]: false });

      if (!!response.data?.total) {
        setFundraiserGroups(
          _.map(updatedFundraiserGroups, (group) => ({
            ...group,
            leaderboard: _.map(group.leaderboard, (team) => ({
              ...team,
              detail: _.map(team.detail, (teamDetail) =>
                teamDetail.id == detail.id
                  ? { ...teamDetail, stats: response.data }
                  : teamDetail
              ),
            })),
          }))
        );
      }
    } catch (error) {
      console.log(
        "extraApiService.loadFundraiserDetailStats error",
        JSON.stringify(error)
      );
      setLoadingDetailStats({ ...loadingDetail, [detail.id]: false });
    }
  };

  const loadCustomerDetail = async (customer, updatedFundraiserGroups) => {
    console.log(
      "loadCustomerDetail",
      customer.id,
      "order id:",
      customer.order_id
    );

    if (!customer.order_id) {
      console.log("no orders from this customer");
      return;
    }

    try {
      setLoadingCustomer({ ...loadingCustomer, [customer.id]: true });

      const response = await extraApiService.getOrdersById(customer.order_id);
      console.log("extraApiService.getOrdersById response", response.data);

      setLoadingCustomer({ ...loadingCustomer, [customer.id]: false });

      if (response.data?.status == "success") {
        setFundraiserGroups(
          _.map(updatedFundraiserGroups, (group) => ({
            ...group,
            leaderboard: _.map(group.leaderboard, (team) => ({
              ...team,
              detail: _.map(team.detail, (detail) => ({
                ...detail,
                customers: _.map(detail.customers, (detailCustomer) =>
                  detailCustomer.id == customer.id
                    ? { ...detailCustomer, orderData: response.data.data }
                    : detailCustomer
                ),
              })),
            })),
          }))
        );
      }
    } catch (error) {
      console.log("extraApiService.getOrdersById error", JSON.stringify(error));
      setLoadingCustomer({ ...loadingCustomer, [customer.id]: false });
    }
  };

  const updateTeam = (group, team, diff) => {
    const updatedFundraiserGroups = _.map(
      fundraiserGroups,
      (fundraiserGroup) => ({
        ...fundraiserGroup,
        leaderboard: _.map(fundraiserGroup.leaderboard, (groupTeam) =>
          fundraiserGroup.fundraiser_name == group.fundraiser_name &&
          groupTeam.name == team.name
            ? { ...groupTeam, ...diff }
            : groupTeam
        ),
      })
    );

    setFundraiserGroups(updatedFundraiserGroups);
  };

  const onFundraiserGroupPress = (pressedGroup) => {
    console.log("on press fundraiser group", pressedGroup);

    setFundraiserGroups(
      _.map(fundraiserGroups, (group) =>
        pressedGroup.fundraiser_type_id == group.fundraiser_type_id
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const onTeamPress = (group, pressedTeam) => {
    console.log("on press team", pressedTeam);

    const updatedFundraiserGroups = _.map(
      fundraiserGroups,
      (fundraiserGroup) => ({
        ...fundraiserGroup,
        leaderboard: _.map(fundraiserGroup.leaderboard, (team) =>
          fundraiserGroup.fundraiser_name == group.fundraiser_name &&
          team.name == pressedTeam.name
            ? { ...team, expanded: !team.expanded }
            : team
        ),
      })
    );

    setFundraiserGroups(updatedFundraiserGroups);

    console.log(
      "pressedTeam already expanded?",
      pressedTeam.expanded,
      "there are team members?",
      pressedTeam.size > 0,
      "team members loaded?",
      !_.isEmpty(pressedTeam.detail),
      "should load team members?",
      !pressedTeam.expanded &&
        pressedTeam.size > 0 &&
        _.isEmpty(pressedTeam.detail)
    );

    if (
      !pressedTeam.expanded &&
      pressedTeam.size > 0 &&
      _.isEmpty(pressedTeam.detail)
    ) {
      loadTeamDetail(group, pressedTeam, updatedFundraiserGroups);
    }
  };

  const onDetailPress = (group, pressedDetail) => {
    console.log("onDetailPress", user.id, pressedDetail);

    if (
      fundraiserRole != "Sales Rep" &&
      fundraiserRole != "Coach" &&
      pressedDetail.id != user.id
    ) {
      console.log("not authorized", user.id, pressedDetail.id);
      return;
    }

    const updatedFundraiserGroups = _.map(fundraiserGroups, (group) => ({
      ...group,
      leaderboard: _.map(group.leaderboard, (team) => ({
        ...team,
        detail: _.map(team.detail, (detail) =>
          detail.id == pressedDetail.id
            ? { ...detail, expanded: !detail.expanded }
            : detail
        ),
      })),
    }));

    setFundraiserGroups(updatedFundraiserGroups);

     if (!pressedDetail.expanded && _.isEmpty(pressedDetail.stats)) {
       loadDetailStats(group, pressedDetail, updatedFundraiserGroups)
     }
  };

  const onCustomerPress = (pressedCustomer) => {
    const updatedFundraiserGroups = _.map(fundraiserGroups, (group) => ({
      ...group,
      leaderboard: _.map(group.leaderboard, (team) => ({
        ...team,
        detail: _.map(team.detail, (detail) => ({
          ...detail,
          customers: _.map(detail.customers, (customer) =>
            customer.id == pressedCustomer.id
              ? { ...customer, expanded: !customer.expanded }
              : customer
          ),
        })),
      })),
    }));

    setFundraiserGroups(updatedFundraiserGroups);

    if (!pressedCustomer.expanded && !pressedCustomer.orderData) {
      loadCustomerDetail(pressedCustomer, updatedFundraiserGroups);
    }
  };

  const changePaymentStatus = async (customer) => {
    console.log("changePaymentStatus", customer.orderData?.is_paid);

    try {
      setUpdatingCustomer({ ...updatingCustomer, [customer.id]: true });
      console.log(
        "extraApiService.changeOrderPaymentStatus",
        customer.order_id
      );
      const response = await extraApiService.changeOrderPaymentStatus(
        customer.order_id
      );
      console.log(
        "extraApiService.changeOrderPaymentStatus response",
        response.data
      );
      setUpdatingCustomer({ ...updatingCustomer, [customer.id]: false });

      if (response.data?.status == "success") {
        setFundraiserGroups(
          _.map(fundraiserGroups, (group) => ({
            ...group,
            leaderboard: _.map(group.leaderboard, (team) => ({
              ...team,
              detail: _.map(team.detail, (detail) => ({
                ...detail,
                customers: _.map(detail.customers, (detailCustomer) =>
                  detailCustomer.id == customer.id
                    ? {
                        ...detailCustomer,
                        is_paid: 1,
                        orderData: { ...detailCustomer.orderData, is_paid: 1 },
                      }
                    : detailCustomer
                ),
              })),
            })),
          }))
        );

        showMessage({
          type: "success",
          message: "Payment status has been changed",
        });
      } else {
        showMessage({
          type: "danger",
          message: "Could not change the payment status",
        });
      }
    } catch (error) {
      console.log(
        "extraApiService.changeOrderPaymentStatus error",
        JSON.stringify(error)
      );
      setUpdatingCustomer({ ...updatingCustomer, [customer.id]: false });
      showMessage({
        type: "danger",
        message: "Could not change the payment status",
      });
    }
  };

  const onPaymentStatusPress = (customer) => {
    console.log(
      "onPaymentStatusPress",
      customer,
      customer.parent_user_id,
      user.id
    );

    if (
      fundraiserRole != "Sales Rep" &&
      fundraiserRole != "Coach" &&
      customer.parent_user_id != user.id
    ) {
      console.log("not authorized", customer.parent_user_id, user.id);
      return;
    }

    Alert.alert("Change Payment Status", "Are you sure?", [
      {
        text: "Yes",
        onPress: () => changePaymentStatus(customer),
        style: "destructive",
      },
      { text: "No" },
    ]);
  };

  const onDetailStatusPress = async (detail) => {
    console.log("onDetailStatusPress", detail);

    try {
      const updatedStatus = detail.status == "Open" ? "Closed" : "Open";

      const payload = {
        user_id: detail.id,
        status: updatedStatus,
      };

      setUpdatingDetailStatus({ ...updatingDetailStatus, [detail.id]: true });

      console.log("extraApiService.updateDetailStatus", payload);
      const response = await extraApiService.updateDetailStatus(payload);
      console.log("extraApiService.updateDetailStatus response", response.data);

      setUpdatingDetailStatus({ ...updatingDetailStatus, [detail.id]: false });

      if (response.data?.success) {
        setFundraiserGroups(
          _.map(fundraiserGroups, (group) => ({
            ...group,
            leaderboard: _.map(group.leaderboard, (team) => ({
              ...team,
              detail: _.map(team.detail, (teamDetail) =>
                detail.id == teamDetail.id
                  ? { ...teamDetail, status: updatedStatus }
                  : teamDetail
              ),
            })),
          }))
        );

        showMessage({
          type: "success",
          message: response.data?.success,
        });
      } else {
        showMessage({
          type: "danger",
          message: "Could not update player status",
        });
      }
    } catch (error) {
      console.log(
        "extraApiService.updateDetailStatus error",
        JSON.stringify(error)
      );
      setUpdatingDetailStatus({ ...updatingDetailStatus, [detail.id]: false });
      showMessage({
        type: "danger",
        message: "Could not update player status",
      });
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
        <View style={{ height: 80, paddingTop: 15 }}>
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

  const renderCustomerOrders = (customer) => {
    const textStyle = {
      fontFamily: "Nunito-Semibold",
      fontSize: 16,
    };

    const orderTextStyle = {
      fontFamily: "Nunito-Regular",
      fontSize: 12,
      color: "black",
    };

    if (!!loadingCustomer[customer.id]) {
      return <ActivityIndicator color="black" />;
    }

    if (!customer.expanded || !customer.orderData) {
      return null;
    }

    const isPaid = customer.orderData.is_paid || false;

    return (
      <View>
        {_.map(_.get(customer, "orderData.items", []), (orderItem, index) => (
          <View
            key={`customer-${customer.id}-order-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
               borderTopWidth: 0.5,
               borderTopColor: 'gray',
              paddingVertical: 5,
              marginLeft: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...orderTextStyle, marginLeft: 24 }}>
                {orderItem.name}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ ...orderTextStyle, marginHorizontal: 10 }}>
                {orderItem.quantity}x
              </Text>
              <Text style={orderTextStyle}>
                ${Number(orderItem.unitPrice) * orderItem.quantity}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={!isPaid ? () => onPaymentStatusPress(customer) : null}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
               borderTopWidth: 0.5,
               borderTopColor: 'gray',
              paddingVertical: 5,
               marginLeft: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...orderTextStyle, marginLeft: 24 }}>
                Payment Status
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ ...orderTextStyle, marginHorizontal: 10 }}>
                {customer.orderData.payment_type}
              </Text>
              {!!updatingCustomer[customer.id] ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text
                  style={{
                    ...orderTextStyle,
                    color: isPaid ? "green" : "red",
                  }}
                >
                  {isPaid ? "PAID" : "DUE"}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetailCustomer = (group, customer, index) => {
    const textStyle = {
      fontFamily: "Nunito-Semibold",
      fontSize: 16,
    };

    const orderTextStyle = {
      fontFamily: "Nunito-Regular",
      fontSize: 12,
      color: "black",
    };

    const customerName = `${customer.first_name} ${customer.last_name}`;

    const groupPrice = isNaN(Number(group.price)) ? 0 : Number(group.price);

    const totalPrice =
      customer.order_id || group.template == "Donation Campaign"
        ? customer.sub_price + customer.total_tip
        : customer.quantity * groupPrice;

    const refundValue = totalPrice + customer.donation;

    return (
      <View key={index}>
        <TouchableOpacity onPress={() => onCustomerPress(customer)}>
          <View
            style={{
              borderTopWidth: index == 0 ? 0 : 0.5,
              borderTopColor: "gray",
               borderBottomWidth: 0.5,
               borderBottomColor: 'gray',
              paddingVertical: 5,
               marginVertical: 10
            }}
          >
            {group.template != "Donation Campaign" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 5,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 32,
                      borderWidth: 1,
                      borderColor: "#051533",
                      marginRight: 10,
                       marginTop: 4,
                    }}
                  >
                    <MaterialC name="currency-usd" color="#051533" />
                  </View>
                  <Text
                    style={{
                      ...textStyle,
                      flex: 1,
                    }}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {customerName}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ ...textStyle, marginHorizontal: 10 }}
                  >{`${customer.quantity}x `}</Text>
                  <Text
                    style={{
                      ...textStyle,
                      fontSize: 14,
                      marginRight: 5,
                      color: customer.is_paid ? "green" : "red",
                    }}
                  >
                    {customer.is_paid ? "PAID" : "DUE"}
                  </Text>
                  <Text
                    style={{
                      ...textStyle,
                      flex: 1,
                      textAlign: "right",
                    }}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >{`$${totalPrice}`}</Text>
                </View>
              </View>
            )}

            {customer.donation ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                   borderTopWidth: 0.5,
                   borderTopColor: 'gray',
                  paddingVertical: 5,
                   marginLeft: 24,
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={{ ...textStyle, marginLeft: 24 }}>
                    {customerName}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ ...textStyle, marginHorizontal: 10 }}>
                    Donation
                  </Text>
                  <Text style={textStyle}>{`$${customer.donation}`}</Text>
                </View>
              </View>
            ) : null}
            {customer.is_refunded ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                   borderTopWidth: 0.5,
                   borderTopColor: 'gray',
                  paddingVertical: 5,
                   marginLeft: 24,
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={{ ...textStyle, marginLeft: 24 }}>
                    {customerName}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ ...textStyle, marginHorizontal: 10 }}>
                    Refund
                  </Text>
                  <Text
                    style={{ ...textStyle, color: "red" }}
                  >{`-$${refundValue}`}</Text>
                </View>
              </View>
            ) : null}

            {renderCustomerOrders(customer)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatsTable = (stats, index) => {
    const rowStyle = {
      flexDirection: "row",
      borderWidth: 0.5,
      alignItems: "center",
      justifyContent: "center",
    };
    const rowTextStyle = {
      flex: 1,
      borderWidth: 0.5,
      textAlign: "center",
      fontSize: 10,
      fontFamily: "Nunito-Regular",
    };

    return (
      <View key={index}>
        <View
          style={{
             borderTopWidth: (index == 0) ? 0 : 0.5,
            borderTopColor: "gray",
             borderBottomWidth: 0.5,
             borderBottomColor: 'gray',
            paddingVertical: 5,
             marginVertical: 10
          }}
        >
          <View style={rowStyle}>
            <Text style={rowTextStyle}>Participant</Text>
            <Text style={rowTextStyle}>Email Shared</Text>
            <Text style={rowTextStyle}>SMS Shared</Text>
            <Text style={rowTextStyle}>$Total Raised</Text>
          </View>

          {_.map(stats, (row, rowKey) => (
            <View key={rowKey} style={rowStyle}>
              <Text style={rowTextStyle}>{rowKey}</Text>
              {_.map(row, (column, columnKey) => (
                <Text key={columnKey} style={rowTextStyle}>
                  {column}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const isDetailPaymentVisible = (teamOption, detail) => {
    switch (teamOption) {
      case TEAM_OPTIONS.SHOW_ALL:
        return true;
      case TEAM_OPTIONS.SHOW_OPEN:
        return detail.status == "Open";
      case TEAM_OPTIONS.SHOW_CLOSED:
        return detail.status == "Closed";
      default:
        return false;
    }
  };

  const renderDetailPayments = (teamKey, detail) => {
    const showDots = fundraiserRole == "Sales Rep" || fundraiserRole == "Coach";

    const fixedTeamOption = teamOption[teamKey] || TEAM_OPTIONS.HIDE_ALL;

    if (showDots && isDetailPaymentVisible(fixedTeamOption, detail)) {
      const paymentTextStyle = {
        fontFamily: "Nunito-Bold",
        fontSize: 12,
      };
      const paymentContainerStyle = {
        justifyContent: "space-between",
        alignItems: "center",
        height: 42,
      };

      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 10,
            marginRight: 5,
          }}
        >
          <View style={paymentContainerStyle}>
            <Text style={paymentTextStyle}>Cash</Text>
            <Text style={paymentTextStyle}>
              {utils.formatMoney(detail.cash)}
            </Text>
          </View>
          <View style={paymentContainerStyle}>
            <Text style={paymentTextStyle}>Check</Text>
            <Text style={paymentTextStyle}>
              {utils.formatMoney(detail.check)}
            </Text>
          </View>
          <View style={paymentContainerStyle}>
            <Text style={paymentTextStyle}>Credit Card</Text>
            <Text style={paymentTextStyle}>
              {utils.formatMoney(detail.credit_card)}
            </Text>
          </View>
          <View style={paymentContainerStyle}>
            <Text style={paymentTextStyle}>Total</Text>
            <Text style={paymentTextStyle}>
              {utils.formatMoney(detail.sum)}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderDetail = (
    group,
    team,
    detail,
    index,
    backgroundColor = "#E3160B"
  ) => {
    const label = `${detail.first_name} ${detail.last_name}`;

    const detailWidth = fundraiserRole == "Sales Rep" ? width - 80 : width - 60;

    const progressValue =
      !group.show_dollar_amount || group.template == "Donation Campaign"
        ? detail.quantity
        : detail.sum;
    const progressMax =
      !group.show_dollar_amount || group.template == "Donation Campaign"
        ? Number(team.plan)
        : Number(team.plan) * Number(group.price);

    const teamKey = `${team.name}-${group.fundraiser_type_id}`;
    const fixedTeamOption = teamOption[teamKey] || TEAM_OPTIONS.HIDE_ALL;

    const showDots = fundraiserRole == "Sales Rep" || fundraiserRole == "Coach";

    const paymentTextStyle = {
      fontFamily: "Nunito-Bold",
      fontSize: 12,
    };
    const paymentContainerStyle = {
      justifyContent: "space-between",
      alignItems: "center",
      height: 42,
    };

    const fullName = `${detail.first_name} ${detail.last_name}`;

    const searchTerm = teamSearch[teamKey] || "";

    const match = utils.normalizedSearchText(fullName, searchTerm);

    if (!match) {
      return null;
    }

    return (
      <View key={index}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {showDots &&
              (!!updatingDetailStatus[detail.id] ? (
                <ActivityIndicator
                  style={{ marginHorizontal: 10 }}
                  size="small"
                  color="black"
                />
              ) : (
                <Text
                  style={{
                    ...paymentTextStyle,
                    color: detail.status == "Closed" ? "red" : "blue",
                    marginRight: 5,
                    padding: 5,
                  }}
                  onPress={() => onDetailStatusPress(detail)}
                >
                  {detail.status}
                </Text>
              ))}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onDetailPress(group, detail)}
            >
              <ProgressBar
                label={label}
                value={progressValue}
                max={progressMax}
                height={32}
                backgroundColor={backgroundColor}
                isMoney={
                  group.show_dollar_amount ||
                  group.template == "Donation Campaign"
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        {renderDetailPayments(teamKey, detail)}
        {detail.expanded && !_.isEmpty(detail.customers) ? (
          <View style={{ marginVertical: 10 }}>
            {_.map(detail.customers, (customer, index) =>
              renderDetailCustomer(group, customer, index)
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderTeam = (group, team, index, backgroundColor = "#E3160B") => {
    const progressValue =
      !group.show_dollar_amount || group.template == "Donation Campaign"
        ? team.count
        : group.template == "Digital Card"
        ? team.count * Number(group.price) + team.donation
        : team.order + team.donation;
    const progressMax =
      !group.show_dollar_amount || group.template == "Donation Campaign"
        ? team.size * Number(team.plan)
        : team.size * Number(team.plan) * Number(group.price);

    const teamKey = `${team.name}-${group.fundraiser_type_id}`;

    const showDots = fundraiserRole == "Sales Rep" || fundraiserRole == "Coach";

    const textStyle = {
      fontFamily: "Nunito-Semibold",
      fontSize: 10,
      textAlign: "center",
      paddingVertical: 5,
    };

    const fixedTeamOption = teamOption[teamKey] || TEAM_OPTIONS.HIDE_ALL;

    const teamOptions = [
      { key: TEAM_OPTIONS.SHOW_ALL, text: "Show All" },
      { key: TEAM_OPTIONS.SHOW_OPEN, text: "Show Open" },
      { key: TEAM_OPTIONS.SHOW_CLOSED, text: "Show Closed" },
      { key: TEAM_OPTIONS.HIDE_ALL, text: "Hide All" },
    ];

    const isActiveTeamOption = activeTeamOption === teamKey;

    const groupGoal = Number(group.fundraiser_goal);

    return (
      <View key={index}>
        <View
          style={{
            flexDirection: "row",
            alignItems: isActiveTeamOption ? "flex-start" : "center",
          }}
        >
          {showDots && (
            <Icon
              type="material-community"
              name="dots-vertical"
              color="gray"
              containerStyle={{
                marginTop: isActiveTeamOption ? 10 : 0,
                marginRight: 5,
              }}
              onPress={() => {
                if (isActiveTeamOption) {
                  setActiveTeamOption(null);
                  setTeamSearch({ ...teamSearch, [teamKey]: "" });
                } else {
                  setActiveTeamOption(teamKey);
                  if (!team.expanded) {
                    onTeamPress(group, team);
                  }
                }
              }}
            />
          )}
          <TouchableOpacity
            style={{
              flex: 1,
            }}
            onPress={() => onTeamPress(group, team)}
          >
            <ProgressBar
              value={progressValue}
              max={progressMax}
              height={36}
              label={team.name}
              backgroundColor={backgroundColor}
              isMoney={
                group.show_dollar_amount ||
                group.template == "Donation Campaign"
              }
              maxVisible={isNaN(groupGoal) || groupGoal <= 0}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginLeft: showDots ? 30 : 20 }}>
          {showDots && isActiveTeamOption ? (
            <View
              style={{
                flex: 1,
                borderWidth: 0.5,
                borderRadius: 8,
                paddingVertical: 15,
                paddingHorizontal: 15,
                marginVertical: 10,
                marginRight: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Icon
                  type="material-community"
                  name="close"
                  size={20}
                  color="transparent"
                />
                <Text
                  style={{
                    ...textStyle,
                    color: "red",
                  }}
                >
                  Reconcile Payments
                </Text>
                <Icon
                  type="material-community"
                  name="close"
                  size={20}
                  onPress={() => {
                    setActiveTeamOption(null);
                    setTeamSearch({ ...teamSearch, [teamKey]: "" });
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 8,
                  borderWidth: 0.5,
                  borderColor: "gray",
                  paddingHorizontal: 10,
                }}
              >
                <RNTextInput
                  style={{
                    flex: 1,
                    fontFamily: "Nunito-Semibold",
                    fontSize: 12,
                    textAlign: "center",
                    paddingVertical: 0,
                  }}
                  placeholder="Search by name"
                  value={teamSearch[teamKey] || ""}
                  onChangeText={(value) =>
                    setTeamSearch({ ...teamSearch, [teamKey]: value })
                  }
                />
                {!!_.trim(teamSearch[teamKey] || "") && (
                  <Icon
                    type="material-community"
                    name="delete"
                    size={18}
                    color="gray"
                    onPress={() =>
                      setTeamSearch({ ...teamSearch, [teamKey]: "" })
                    }
                  />
                )}
              </View>
              {_.map(teamOptions, (option) => (
                <Text
                  key={option.key}
                  style={{
                    ...textStyle,
                    backgroundColor:
                      fixedTeamOption == option.key ? "lightgray" : "white",
                  }}
                  onPress={() => setTeamOption({ [teamKey]: option.key })}
                >
                  {option.text}
                </Text>
              ))}
            </View>
          ) : null}
          {team.expanded ? (
            !!loadingDetail[teamKey] ? (
              <ActivityIndicator color="black" />
            ) : fundraiserRole == "Player" ? (
              _.map(team.detail, (detail, index) =>
                renderDetail(group, team, detail, index)
              )
            ) : (
              <View>
                {!team.showStats ? (
                  <TouchableOpacity
                    onPress={() => updateTeam(group, team, { showStats: true })}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 15,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginVertical: 5,
                        alignItems: "center",
                        alignSelf: "center",
                         justifyContent: 'center'
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          textAlign: "center",
                          color: "black",
                        }}
                      >
                        Tap to view team stats
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      updateTeam(group, team, { showStats: false })
                    }
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 15,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginVertical: 5,
                        alignItems: "center",
                        alignSelf: "center",
                         justifyContent: 'center'
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito-Bold",
                          textAlign: "center",
                          color: "black",
                        }}
                      >
                        Tap to view team members
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {!team.showStats ? (
                  _.isEmpty(team.detail) ? (
                    <View style={{ padding: 10 }}>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          fontFamily: "Nunito-Regular",
                        }}
                      >
                        No members.
                      </Text>
                    </View>
                  ) : (
                    _.map(team.detail, (detail, index) =>
                      renderDetail(group, team, detail, index)
                    )
                  )
                ) : null}
                <TeamStatsTable group={group} team={team} />
              </View>
            )
          ) : null}
        </View>
      </View>
    );
  };

  const renderFundraiserGroup = ({ item: group, index }) => {
    const progressValue = _.sumBy(
      group.leaderboard,
      !group.show_dollar_amount || group.template == "Donation Campaign"
        ? "count"
        : group.template == "Digital Card"
        ? (team) => team.count * Number(group.price) + team.donation
        : (team) => team.order + team.donation
    );

    const groupGoal = Number(group.fundraiser_goal);
    const progressMax =
      !isNaN(groupGoal) && groupGoal > 0
        ? groupGoal
        : _.sumBy(group.leaderboard, (team) =>
            !group.show_dollar_amount || group.template == "Donation Campaign"
              ? team.size * Number(team.plan)
              : team.size * Number(team.plan) * Number(group.price)
          );

    const backgroundColor = index % 2 == 0 ? "#E3160B" : "black";

    return (
      <View key={group.fundraiser_type_id}>
        <TouchableOpacity onPress={() => onFundraiserGroupPress(group)}>
          <ProgressBar
            value={progressValue}
            max={progressMax}
            height={36}
            label={group.fundraiser_name}
            backgroundColor={backgroundColor}
            isMoney={
              group.show_dollar_amount || group.template == "Donation Campaign"
            }
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 20 }}>
          {group.expanded
            ? _.map(group.leaderboard, (team, index) =>
                renderTeam(group, team, index, backgroundColor)
              )
            : null}
        </View>
      </View>
    );
  };

  const renderTab = () => {
    if (tabIndex == 1) {
      const myTeam = _.find(fundraiser?.leaderboard, (team) =>
        _.find(team.detail, { id: user?.id })
      );

      if (!fundraiser || !myTeam) {
        return null;
      }

      return renderTeam(fundraiser, { ...myTeam, expanded: true }, 0);
    }

    const allTeamsProgressValue = _.sumBy(
      fundraiser.leaderboard,
      !fundraiser.show_dollar_amount ||
        fundraiser.template == "Donation Campaign"
        ? "count"
        : fundraiser.template == "Digital Card"
        ? (team) => team.count * Number(fundraiser.price) + team.donation
        : (team) => team.order + team.donation
    );

    const fundraiserGoal = Number(fundraiser.fundraiser_goal);
    const allTeamsProgressMax =
      !isNaN(fundraiserGoal) && fundraiserGoal > 0
        ? fundraiserGoal
        : _.sumBy(fundraiser.leaderboard, (team) =>
            !fundraiser.show_dollar_amount ||
            fundraiser.template == "Donation Campaign"
              ? team.size * Number(team.plan)
              : team.size * Number(team.plan) * Number(fundraiser.price)
          );

    return (
      <>
        <ProgressBar
          value={allTeamsProgressValue}
          max={allTeamsProgressMax}
          height={36}
          label={fundraiser.name}
          backgroundColor="black"
          isMoney={
            fundraiser.show_dollar_amount ||
            fundraiser.template == "Donation Campaign"
          }
        />
        {_.map(fundraiser.leaderboard, (team, index) =>
          renderTeam(fundraiser, team, index)
        )}
      </>
    );
  };

  const renderMyProgressBar = () => {
    if (
      (fundraiserRole != "Player" && fundraiserRole != "Coach") ||
      !data ||
      !fundraiser
    ) {
      return null;
    }

     const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, {id: user?.id }))
     const myDetail = _.find(myTeam?.detail, {id: user?.id })

     const progressValue = !fundraiser.show_dollar_amount ? myDetail?.quantity : myDetail?.sum
     const progressMax = (!fundraiser.show_dollar_amount || fundraiser.template == 'Donation Campaign') ? Number(myTeam?.plan) : Number(myTeam?.plan) * Number(fundraiser.price)
    //const progressValue = Number(fundraiser.current);
    //const progressMax = Number(fundraiser.card_goal);

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
    if (fundraiserRole == "Sales Rep" || !data) {
      return null;
    }

    const fundraiser = _.first(data);

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

  const renderTabButtons = () => {
    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Button
          title="All Teams"
          buttonStyle={{
            backgroundColor: tabIndex == 0 ? "black" : "gray",
          }}
          onPress={() => setTabIndex(0)}
        />
        <Button
          title="My Team"
          buttonStyle={{
            backgroundColor: tabIndex == 1 ? "black" : "gray",
          }}
          onPress={() => setTabIndex(1)}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (fundraiserRole == "Sales Rep") {
      const orderedData =
        sortType == SORT_TYPES.ALPHA
          ? _.orderBy(fundraiserGroups, "fundraiser_name", sortDirection)
          : _.orderBy(
              fundraiserGroups,
              (group) => _.sumBy(group.leaderboard, "count"),
              sortDirection
            );

      return (
        <FlatList
          contentContainerStyle={{
            marginHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              size="large"
              onRefresh={() => loadLeaderBoard(true)}
              tintColor="#fff"
              colors={["#000"]}
            />
          }
          data={orderedData}
          keyExtractor={(item) => `${item.fundraiser_type_id}`}
          renderItem={renderFundraiserGroup}
          onEndReached={() => loadLeaderBoard()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={() => (
            <View
              style={{
                paddingVertical: 10,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                marginBottom: 10,
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
                  name={
                    sortDirection == SORT_DIRECTIONS.ASC
                      ? "sort-alphabetical-ascending"
                      : "sort-alphabetical-descending"
                  }
                  onPress={() => {
                    if (sortType == SORT_TYPES.ALPHA) {
                      setSortDirection(
                        sortDirection == SORT_DIRECTIONS.ASC
                          ? SORT_DIRECTIONS.DESC
                          : SORT_DIRECTIONS.ASC
                      );
                    } else {
                      setSortType(SORT_TYPES.ALPHA);
                    }
                  }}
                />
                <Text
                  style={{
                    fontFamily: "nunito-bold",
                    fontSize: 20,
                    textAlign: "center",
                  }}
                >
                  LEADER BOARD
                </Text>
                <Icon
                  type="material-community"
                  name={
                    sortDirection == SORT_DIRECTIONS.ASC
                      ? "sort-ascending"
                      : "sort-descending"
                  }
                  onPress={() => {
                    if (sortType == SORT_TYPES.PROGRESS) {
                      setSortDirection(
                        sortDirection == SORT_DIRECTIONS.ASC
                          ? SORT_DIRECTIONS.DESC
                          : SORT_DIRECTIONS.ASC
                      );
                    } else {
                      setSortType(SORT_TYPES.PROGRESS);
                    }
                  }}
                />
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <>
              {loading && (
                <ActivityIndicator style={{ marginTop: 15 }} color="#000" />
              )}
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
            </>
          )}
        />
      );
    }

    return (
      <View
        style={{
          flex: 1,
          marginHorizontal: 20,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              size="large"
              onRefresh={() => loadLeaderBoard(true)}
              tintColor="#fff"
              colors={["#000"]}
            />
          }
        >
          {renderMyProgressBar()}
          {renderFundraiserTeam()}

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
              LEADER BOARD
            </Text>

            {loading ? null : renderTabButtons()}
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 15 }} color="#000" />
          ) : (
            renderTab()
          )}

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        {renderHeader()}
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
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

export default FundraiserLeaderboardScreen;
