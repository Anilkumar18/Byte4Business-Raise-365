import React, { useContext } from "react";
import { Dimensions, Alert, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialC from "react-native-vector-icons/MaterialCommunityIcons";
import LoginScreen from "./screens/login";
import SignUpScreen from "./screens/signup";
import SettingScreen from "./screens/setting";
import HomeScreen from "./screens/home";
import FundRaiserScreen from "./screens/fundRaisers";
import ForgotPasswordScreen from "./screens/forgotPassword";
import DiscoverScreen from "./screens/discover";
import { NavigationContainer } from "@react-navigation/native";
import LoadingScreen from "./screens/loading";
import { DrawerContentComponent } from "./components/drawerContent";
import ChangePasswordScreen from "./screens/changePassword";
import NotificationScreen from "./screens/notifications";
import NotificationDetailScreen from "./screens/notificationsDetail";
import MessageDetailScreen from "./screens/messageDetails";
import DealsNearScreen from "./screens/dealsNearMe";
import DealsDetailScreen from "./screens/dealsDetails";
import RewardScreen from "./screens/reward";
import RewardCodeScreen from "./screens/rewardCode";
import SearchLocationScreen from "./screens/searchLocations";
import NearbySearchedScreen from "./screens/nearbySearched";
import MerchantDetailScreen from "./screens/merchantDetail";
import ProductMenuScreen from "./screens/productMenu";
import MenuCategoryScreen from "./screens/menuCategory";
import OrderItemScreen from "./screens/orderItem";
import FavouriteScreen from "./screens/favourites";
import NeedHelpScreen from "./screens/needHelp";
import FaqScreen from "./screens/faq";
import OrderHistoryScreen from "./screens/orderHistory";
import PurchaseHistoryScreen from "./screens/purchaseHistory";
import PrizeScreen from "./screens/prize";
import CollectPhotosScreen from "./screens/collectPhotos";
import GradesScreen from "./screens/grades";
import FeedbackScreen from "./screens/feedback";
import ProductDetailScreen from "./screens/productDetails";
import ShopImageGallery from "./screens/shopImageGallery";
import ProfileScreen from "./screens/profile";
import MerchantFundraisersScreen from "./screens/merchantFundraisers";
import CartScreen from "./screens/cart";
import MoreScreen from "./screens/more";
import SearchFundraiserScreen from "./screens/searchFundraiser";
import UserFundraiserScreen from "./screens/userFundraiser";
import FundraiserLeaderboardScreen from "./screens/fundraiserLeaderboard";
import FundraiserPrizesScreen from "./screens/fundraiserPrizes";
import FundraiserContactsScreen from "./screens/fundraiserContacts";
import FundraiserCheckpointsScreen from "./screens/fundraiserCheckpoints";
import FundraiserMessagesScreen from "./screens/fundraiserMessages";
import FundraiserMessageScreen from "./screens/fundraiserMessage";
import FundraiserMessageComposerScreen from "./screens/fundraiserMessageComposer";
import { utils } from "./Utils/utils";
import Store from "./store";
import _ from "lodash";
import { ClosestBusinessModal } from "./components/closestBusinessModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

let timerId = null;

const AuthNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignUpScreen} />
      <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
const ProfileNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen
        name="searchFundraiser"
        component={SearchFundraiserScreen}
      />
    </Stack.Navigator>
  );
};
const NotificationNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="notifications" component={NotificationScreen} />
      <Stack.Screen name="message" component={NotificationDetailScreen} />
      <Stack.Screen name="messageDetails" component={MessageDetailScreen} />
    </Stack.Navigator>
  );
};

const UserFundraiserNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="userFundraiser" component={UserFundraiserScreen} />
      <Stack.Screen
        name="searchFundraiser"
        component={SearchFundraiserScreen}
      />
      <Stack.Screen
        name="fundraiserLeaderboard"
        component={FundraiserLeaderboardScreen}
      />
      <Stack.Screen
        name="fundraiserPrizes"
        component={FundraiserPrizesScreen}
      />
      <Stack.Screen
        name="fundraiserContacts"
        component={FundraiserContactsScreen}
      />
      <Stack.Screen
        name="fundraiserCheckpoints"
        component={FundraiserCheckpointsScreen}
      />
      <Stack.Screen
        name="fundraiserMessages"
        component={FundraiserMessagesScreen}
      />
      <Stack.Screen
        name="fundraiserMessage"
        component={FundraiserMessageScreen}
      />
      <Stack.Screen
        name="fundraiserMessageComposer"
        component={FundraiserMessageComposerScreen}
      />
    </Stack.Navigator>
  );
};

const DealsNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="dealsNear" component={DealsNearScreen} />
      <Stack.Screen name="dealsDetail" component={DealsDetailScreen} />
    </Stack.Navigator>
  );
};
const NeedHelpNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="needHelp" component={NeedHelpScreen} />
      <Stack.Screen name="faq" component={FaqScreen} />
    </Stack.Navigator>
  );
};
const HomeNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="fundRaiser" component={FundRaiserScreen} />
      <Stack.Screen name="discover" component={DiscoverScreen} />
      <Stack.Screen name="searchLocation" component={SearchLocationScreen} />
      <Stack.Screen name="nearbySearched" component={NearbySearchedScreen} />
      <Stack.Screen name="merchantDetail" component={MerchantDetailScreen} />
      <Stack.Screen name="dealsNear" component={DealsNavigator} />
      <Stack.Screen name="productMenu" component={ProductMenuScreen} />
      <Stack.Screen name="menuCatergory" component={MenuCategoryScreen} />
      <Stack.Screen name="orderItem" component={OrderItemScreen} />
      <Stack.Screen name="reward" component={RewardScreen} />
      <Stack.Screen name="prize" component={PrizeScreen} />
      <Stack.Screen name="message" component={NotificationDetailScreen} />
      <Stack.Screen name="messageDetails" component={MessageDetailScreen} />
      <Stack.Screen name="collectPhotos" component={CollectPhotosScreen} />
      <Stack.Screen name="grades" component={GradesScreen} />
      <Stack.Screen name="feedback" component={FeedbackScreen} />
      <Stack.Screen name="productDetail" component={ProductDetailScreen} />
      <Stack.Screen name="shopGallery" component={ShopImageGallery} />
      <Stack.Screen
        name="merchantFundraisers"
        component={MerchantFundraisersScreen}
      />
    </Stack.Navigator>
  );
};

const SearchNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="searchLocation" component={SearchLocationScreen} />
      <Stack.Screen name="fundRaiser" component={FundRaiserScreen} />
      <Stack.Screen name="discover" component={DiscoverScreen} />
      <Stack.Screen name="nearbySearched" component={NearbySearchedScreen} />
      <Stack.Screen name="merchantDetail" component={MerchantDetailScreen} />
      <Stack.Screen name="dealsNear" component={DealsNavigator} />
      <Stack.Screen name="productMenu" component={ProductMenuScreen} />
      <Stack.Screen name="menuCatergory" component={MenuCategoryScreen} />
      <Stack.Screen name="orderItem" component={OrderItemScreen} />
      <Stack.Screen name="reward" component={RewardScreen} />
      <Stack.Screen name="prize" component={PrizeScreen} />
      <Stack.Screen name="message" component={NotificationDetailScreen} />
      <Stack.Screen name="messageDetails" component={MessageDetailScreen} />
      <Stack.Screen name="collectPhotos" component={CollectPhotosScreen} />
      <Stack.Screen name="grades" component={GradesScreen} />
      <Stack.Screen name="feedback" component={FeedbackScreen} />
      <Stack.Screen name="productDetail" component={ProductDetailScreen} />
      <Stack.Screen name="shopGallery" component={ShopImageGallery} />
      <Stack.Screen
        name="merchantFundraisers"
        component={MerchantFundraisersScreen}
      />
    </Stack.Navigator>
  );
};

const MoreNavigator = () => {
  return (
    <Stack.Navigator headerMode={"none"}>
      <Stack.Screen name="more" component={MoreScreen} />
      <Drawer.Screen name="favourite" component={FavouriteScreen} />
      <Stack.Screen name="productDetail" component={ProductDetailScreen} />
      <Drawer.Screen name="rewardCode" component={RewardCodeScreen} />
      <Drawer.Screen name="orderHistory" component={OrderHistoryScreen} />
      <Drawer.Screen name="purchaseHistory" component={PurchaseHistoryScreen} />
      <Drawer.Screen name="setting" component={SettingScreen} />
      <Stack.Screen name="notifications" component={NotificationNavigator} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerStyle={{
        width: width * 0.8,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
      }}
      drawerContent={(props) => <DrawerContentComponent {...props} />}
    >
      <Drawer.Screen name="home" component={HomeNavigator} />
      <Drawer.Screen name="notifications" component={NotificationNavigator} />
      <Drawer.Screen name="favourite" component={FavouriteScreen} />
      <Drawer.Screen name="rewardCode" component={RewardCodeScreen} />
      <Drawer.Screen name="orderHistory" component={OrderHistoryScreen} />
      <Drawer.Screen name="needHelp" component={NeedHelpNavigator} />
      <Drawer.Screen name="setting" component={SettingScreen} />
    </Drawer.Navigator>
  );
};

const TabNavigator = () => {
  const [store, setStore] = useContext(Store.Context);
  const unread = _.sumBy(store.notifications, "unread");
  const cartItemsCount = store.cart.items.length;
  const unreadFundraiserMessages = _.filter(store.fundraiserMessages, {
    is_read: 0,
  }).length;
  const unreadPrizesCount = store.prizesCount;

  const fundraiserBadgeCounter = unreadFundraiserMessages + unreadPrizesCount;

  return (
    <Tab.Navigator
      lazy={false}
      tabBarOptions={{
        activeTintColor: "black",
        labelStyle: {
          fontFamily: "Nunito-Regular",
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: (iconProps) => <Icon {...iconProps} name="home" />,
        }}
      />
      <Tab.Screen
        name="search"
        component={SearchNavigator}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: (iconProps) => <Icon {...iconProps} name="text-search" />,
        }}
      />
      <Tab.Screen
        name="cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: (iconProps) => <Icon {...iconProps} name="cart" />,
          tabBarBadge:
            cartItemsCount > 100
              ? "99+"
              : cartItemsCount > 0
              ? cartItemsCount
              : undefined,
        }}
      />
      {/* <Tab.Screen
        name="notifications"
        component={NotificationNavigator}
        options={{
          tabBarLabel: 'Notification',
          tabBarIcon: iconProps => <Icon {...iconProps} name='bell-outline' />,
          tabBarBadge: unread > 100 ? '99+' : unread > 0 ? unread : undefined
        }}
      /> */}
      <Tab.Screen
        name="userFundraiser"
        component={UserFundraiserNavigator}
        options={{
          tabBarLabel: "Fundraisers",
          tabBarIcon: (iconProps) => (
            <View
              style={{
                borderRadius: 32,
                borderWidth: 1,
                borderColor: iconProps.color,
              }}
            >
              <MaterialC
                {...iconProps}
                name="currency-usd"
                size={22}
                // color='#051533'
              />
            </View>
          ),
          tabBarBadge:
            fundraiserBadgeCounter > 100
              ? "99+"
              : fundraiserBadgeCounter > 0
              ? fundraiserBadgeCounter
              : undefined,
        }}
      />
      <Tab.Screen
        name="more"
        component={MoreNavigator}
        options={{
          tabBarLabel: "More",
          tabBarIcon: (iconProps) => <Icon {...iconProps} name="menu" />,
        }}
      />
    </Tab.Navigator>
  );
};

export function Routes() {
  const [loading, setLoading] = React.useState(true);
  const [store, setStore] = React.useContext(Store.Context);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [closestList, setClosestList] = React.useState([]);
  const [alertLocation, setAlertLocation] = React.useState({});
  const [counter, setCounter] = React.useState(0);

  let navRef = React.useRef();

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  });

  // React.useEffect(() => {

  //   const userSpeed = store.currentLocation?.speed || 0

  //   if (userSpeed <= 1) {

  //     if (counter == 0) {

  //       console.log('start counter!');

  //       timerId = setInterval(() => {
  //         // console.log('timer callback', timerId, counter);
  //         setCounter(counter => {
  //           if (counter >= 60) {
  //             console.log('timer: stop counter by max value!');
  //             clearInterval(timerId)
  //             return counter
  //           } else {
  //             return counter + 1
  //           }
  //         })
  //       }, 1000)
  //       console.log('timer created!', timerId);

  //     }
  //   } else {

  //     counter > 0 && setCounter(0)

  //     if (timerId) {
  //       console.log('stop timer by user movement!', timerId);
  //       clearInterval(timerId)
  //       timerId = null
  //     }
  //   }

  // }, [store.currentLocation])

  // React.useEffect(() => {

  //   const { currentLocation, nearbyBusiness, nearbyBusinessCenter, ignoredList } = store
  //   console.log('closest business current location', currentLocation);
  //   const notIgnoredBusiness = _.filter(nearbyBusiness, business => !_.find(ignoredList, { id: business.id }))

  //   const closest = _.filter(notIgnoredBusiness,
  //     business => `${utils.calculateDistance(
  //       business.latitude,
  //       business.longitude,
  //       'M',
  //       currentLocation.latitude,
  //       currentLocation.longitude
  //     )}`.replace(' mi', '') <= 0.05
  //   )

  //   console.log('closest business', closest.length, navRef.current?.getCurrentRoute().name);

  //   const viewingBusinessProfile = navRef.current?.getCurrentRoute().name == 'merchantDetail'

  //   const userSpeed = currentLocation?.speed || 0

  //   if (!modalVisible && closest.length > 0 && !viewingBusinessProfile && userSpeed <= 1 && counter >= 60) {

  //     const userMovement = `${utils.calculateDistance(
  //       alertLocation.latitude,
  //       alertLocation.longitude,
  //       'M',
  //       currentLocation.latitude,
  //       currentLocation.longitude
  //     )}`.replace(' mi', '')

  //     if (userMovement <= 0.01) {
  //       console.log('User choose ignore alerts and does not move enough...', `${utils.calculateDistance(
  //         alertLocation.latitude,
  //         alertLocation.longitude,
  //         'M',
  //         currentLocation.latitude,
  //         currentLocation.longitude
  //       )}`.replace(' mi', ''));
  //       return
  //     }

  //     console.log('[!] showing closest dialog to user:', modalVisible, closest.length, viewingBusinessProfile, _.map(ignoredList, 'id'), userMovement, `${utils.calculateDistance(
  //       alertLocation.latitude,
  //       alertLocation.longitude,
  //       'M',
  //       currentLocation.latitude,
  //       currentLocation.longitude
  //     )}`.replace(' mi', ''));

  //     setModalVisible(true)
  //     setClosestList(closest)
  //     setAlertLocation(currentLocation)
  //   }
  // }, [store])

  if (loading) {
    return (
      <NavigationContainer>
        <Stack.Navigator headerMode="none">
          <Stack.Screen name="loading" component={LoadingScreen} />
          <Stack.Screen name="tabs" component={TabNavigator} />
          <Stack.Screen name="login" component={AuthNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer ref={navRef}>
        <Stack.Navigator headerMode="none">
          <Stack.Screen name="login" component={AuthNavigator} />
          <Stack.Screen name="loading" component={LoadingScreen} />
          <Stack.Screen name="tabs" component={TabNavigator} />
          <Stack.Screen name="profile" component={ProfileNavigator} />
          <Stack.Screen
            name="changePasssword"
            component={ChangePasswordScreen}
          />
        </Stack.Navigator>
        {modalVisible ? (
          <ClosestBusinessModal
            data={closestList}
            onCancel={(list) => {
              setModalVisible(false);
              setStore((previous) => ({
                ...previous,
                ignoredList: _.uniqBy([...previous.ignoredList, ...list], "id"),
              }));
            }}
            onConfirm={(selected, list) => {
              setModalVisible(false);
              setStore((previous) => ({
                ...previous,
                ignoredList: _.uniqBy(
                  [...previous.ignoredList, selected],
                  "id"
                ),
              }));
              navRef.current?.navigate("merchantDetail", { data: selected });
            }}
          />
        ) : null}
      </NavigationContainer>
    );
  }
}
