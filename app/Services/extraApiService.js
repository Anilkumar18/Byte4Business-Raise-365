import { CONSTANTS } from "./Constants"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage";

axios.defaults.timeout = 60000

export const extraApiService = {
  getNotifications,
  getFavorites,
  sendDealsNearMe,
  verifyRewardCode,
  getDealsNearMe,
  getOrders,
  getOrdersById,
  removeOrder,
  changeOrderPaymentStatus,
  removePaymentMethod,
  getFundraisersPurchases,
  getNotificationDetails,
  getLocalBusinesses,
  addViewCount,
  getLocationCategories,
  getMenuByCategory,
  getHomeProfile,
  getFundraisers,
  getAllMenuItem,
  getAllMenuItemRatings,
  getLocationByFundraiserType,
  getTags,
  getLocationComments,
  redeem,
  cancelRedeem,
  getLocationForCustomer,
  addLocationToCustomer,
  addFavoriteMenuItem,
  leaveCommentForMenuItem,
  deleteNotificationMessage,
  replyNotificationMessage,
  getNotificationMessages,
  getFundraiserDealsByLocation,
  rewardPhotoUpload,
  getUserRewards,
  contestPhotoUpload,
  createContestAction,
  getBusiness,
  changeMessageStatus,
  redeemReward,
  getAllFundraiserGroups,
  getFundraisersNearMe,
  checkout,
  shareCount,
  getFundraiserAllInfo,
  selectFundraiserPrizeOption,
  getFundraiserTeamDetail,
  getFundraiserMessages,
  getFundraiserTeamsAndPlayers,
  getFundraiserLeaderBoard,
  readFundraiserMessage,
  sendFundraiserMessage,
  getFundraiserContacts,
  addFundraiserContacts,
  updateFundraiserContact,
  removeFundraiserContact,
  createSharingSession,
  updateSharingSession,
  loadFundraiserTeamStats,
  updateDetailStatus
};


const ENDPOINTS = {

  GET_NOTIFICATIONS: "message_global.json?access_token=",
  GET_FAVORITES: CONSTANTS.BASE_URL + "api/v2/favorites",
  SEND_DEALS_NEAR_ME: CONSTANTS.BASE_URL + "api/v2/rewards/send_deals_near_me",
  VERIFY_REWARD_CODE: CONSTANTS.BASE_URL + "api/v2/rewards/send_code",
  GET_DEALS_NEAR_ME: CONSTANTS.BASE_URL + "api/v2/rewards/get_deals_near_me_new",
  GET_FUNDRAISERS_NEAR_ME: CONSTANTS.BASE_URL + "api/v2/rewards/get_fundraiser_near_me",
  GET_ORDERS: CONSTANTS.BASE_URL + "api/v2/orders",
  REMOVE_ORDER: CONSTANTS.BASE_URL + "api/v2/orders",
  CHANGE_ORDER_PAYMENT_STATUS: CONSTANTS.BASE_URL + "api/v2/orders",
  REMOVE_PAYMENT_METHOD: CONSTANTS.BASE_URL + "api/v2/orders/remove_method",
  GET_FUNDRAISERS_PURCHASES: CONSTANTS.BASE_URL + "api/v2/fundraisers/purchases",
  GET_NOTIFICATION_DETAILS: CONSTANTS.BASE_URL + "get_message.json?access_token=",
  DISCOVER_BUSINESS_PATH: CONSTANTS.BASE_URL + "api/v2/locations",
  ADD_VIEW_COUNT: CONSTANTS.BASE_URL + "api/v2/views/add",
  GET_LOCATION_CATEGORIES: CONSTANTS.BASE_URL + "api/v2/tags/",
  GET_MENU_BY_CAT_LOC: CONSTANTS.BASE_URL + "api/v2/menu_items/",
  GET_HOME_PROFILE: CONSTANTS.BASE_URL + "api/v2/menu_profiles",
  GET_FUNDRAISERS: CONSTANTS.BASE_URL + "api/v2/locations/get_fundraisers",
  GET_ALL_MENU_ITEMS: CONSTANTS.BASE_URL + "api/v2/menu_items/",
  GET_ALL_RATINGS: CONSTANTS.BASE_URL + "api/v2/ratings/",
  GET_DATA_BY_FUNDRAISER_TYPE: CONSTANTS.BASE_URL + "api/v2/locations/get_locations",
  GET_COMMENTS_BY_LOCATION: CONSTANTS.BASE_URL + "api/v2/comments/",
  REDEEM: CONSTANTS.BASE_URL + "api/v2/rewards/redeem_new",
  REDEEM_REWARD: CONSTANTS.BASE_URL + "api/v2/rewards/redeem",
  CANCEL_REDEEM: CONSTANTS.BASE_URL + "api/v2/rewards/cancel_redeem",
  GET_LOCATIONS_FOR_CUSTOMER: CONSTANTS.BASE_URL + 'api/v2/locations/get_for_customer',
  ADD_LOCATION_TO_CUSTOMER: CONSTANTS.BASE_URL + 'api/v2/locations',
  ADD_FAVORITE_MENU_ITEM: CONSTANTS.BASE_URL + 'items',
  LEAVE_COMMENT_FOR_MENU_ITEM: CONSTANTS.BASE_URL + 'items',
  DELETE_NOTIFICATION_MESSAGE: CONSTANTS.BASE_URL + 'delete_message.json',
  REPLY_NOTIFICATION_MESSAGE: CONSTANTS.BASE_URL + 'points/reply_message',
  GET_NOTIFICATION_MESSAGES: CONSTANTS.BASE_URL + 'get_detail_message.json',
  GET_FUNDRAISER_DEALS_BY_LOCATION: CONSTANTS.BASE_URL + 'api/v2/rewards/get_fundraiser_deals',
  REWARD_PHOTO_UPLOAD: CONSTANTS.BASE_URL + 'api/v2/locations/ocr_capture',
  GET_USER_REWARDS: CONSTANTS.BASE_URL + 'api/v2/rewards/get_rewards',
  CONTEST_PHOTO_UPLOAD: CONSTANTS.BASE_URL + 'api/v2/contest_image',
  CREATE_CONTEST_ACTION: CONSTANTS.BASE_URL + 'api/v2/contest_actions',
  GET_BUSINESS: CONSTANTS.BASE_URL + 'api/v2/locations',
  CHANGE_MESSAGE_STATUS: CONSTANTS.BASE_URL + 'invited/change_status_message.json',
  GET_ALL_FUNDRAISER_GROUPS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/all_groups',
  CHECKOUT: CONSTANTS.BASE_URL + 'order/new_order_v1',
  SHARE_COUNT: CONSTANTS.BASE_URL + 'pagestats/count',
  GET_FUNDRAISER_ALLINFO: CONSTANTS.BASE_URL + 'api/v2/fundraisers/allinfo',
  GET_FUNDRAISER_ALLINFO2: CONSTANTS.BASE_URL + 'api/v2/fundraisers/allinfo2',
  LOAD_FUNDRAISER_TEAM_STATS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/stats',
  SELECT_FUNDRAISER_PRIZE_OPTION: CONSTANTS.BASE_URL + 'api/v2/fundraisers/prize',
  GET_FUNDRAISER_TEAM_DETAIL: CONSTANTS.BASE_URL + 'admin/fundraisers/detail',
  GET_FUNDRAISER_MESSAGES: CONSTANTS.BASE_URL + 'api/v2/fundraisers/messages',
  GET_FUNDRAISER_TEAMS_AND_PLAYERS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/teams_players',
  GET_FUNDRAISER_LEADERBOARD: CONSTANTS.BASE_URL + 'api/v2/fundraisers/leaderboard',
  SEND_FUNDRAISER_MESSAGE: CONSTANTS.BASE_URL + 'api/v2/fundraisers/send_message',
  READ_FUNDRAISER_MESSAGE: CONSTANTS.BASE_URL + 'api/v2/fundraisers/read_message',
  GET_FUNDRAISER_CONTACTS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/get_contacts',
  ADD_FUNDRAISER_CONTACTS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/add_contact',
  UPDATE_FUNDRAISER_CONTACT: CONSTANTS.BASE_URL + 'api/v2/fundraisers/update_contact',
  REMOVE_FUNDRAISER_CONTACT: CONSTANTS.BASE_URL + 'api/v2/fundraisers/remove_contact',
  CREATE_SHARING_SESSION: CONSTANTS.BASE_URL + 'api/v2/fundraisers/sharing',
  UPDATE_SHARING_SESSION: CONSTANTS.BASE_URL + 'api/v2/fundraisers/sharing',
  UPDATE_DETAIL_STATUS: CONSTANTS.BASE_URL + 'api/v2/fundraisers/update_player_status'
}

async function getBusiness(locationId) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  const URL = `${ENDPOINTS.GET_BUSINESS}/${locationId}`;
  console.log('getBusiness payload', URL);
  return axios.get(URL, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  });
}

async function getNotifications() {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  const URL = CONSTANTS.BASE_URL + ENDPOINTS.GET_NOTIFICATIONS + token;

  return axios.get(URL);
}


async function getFavorites(accessToken) {
  const URL = ENDPOINTS.GET_FAVORITES
  return axios.get(URL, {
    headers: {
      authorization: accessToken
    }
  });
}


async function sendDealsNearMe(accessToken) {
  const URL = ENDPOINTS.SEND_DEALS_NEAR_ME
  return axios.get(URL, {
    headers: {
      authorization: accessToken
    }
  });
}

async function getOrders() {
  const URL = ENDPOINTS.GET_ORDERS
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  return axios.get(URL, {
    headers: {
      authorization: token
    }
  });
}

async function getOrdersById(orderId) {
  const URL = `${ENDPOINTS.GET_ORDERS}/${orderId}`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  return axios.get(URL, {
    headers: {
      authorization: token
    }
  });
}

async function removeOrder(id) {

  const URL = `${ENDPOINTS.REMOVE_ORDER}/${id}/remove_order`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log('removeOrder token', token);

  return axios.post(URL, {}, {
    headers: {
      authorization: token
    }
  });
}

async function changeOrderPaymentStatus(id) {

  const URL = `${ENDPOINTS.CHANGE_ORDER_PAYMENT_STATUS}/${id}/paid`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log('changeOrderPaymentStatus token', token, URL);

  return axios.get(URL, {
    headers: {
      authorization: token
    }
  });
}

async function removePaymentMethod(id) {

  const URL = `${ENDPOINTS.REMOVE_PAYMENT_METHOD}/${id}`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log('removePaymentMethod token', token, id);

  return axios.delete(URL, {
    headers: {
      authorization: token
    }
  });
}

async function getFundraisersPurchases() {
  const URL = ENDPOINTS.GET_FUNDRAISERS_PURCHASES
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  return axios.get(URL, {
    headers: {
      authorization: token
    }
  });
}


async function getLocationComments(locationId) {
  const URL = ENDPOINTS.GET_COMMENTS_BY_LOCATION + locationId
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  return axios.get(URL, {
    headers: {
      authorization: token
    }
  });
}




async function getDealsNearMe(payload) {
  const URL = ENDPOINTS.GET_DEALS_NEAR_ME
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log('getDealsNearMe payload', token, URL, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  });
}


async function verifyRewardCode(code) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  const URL = ENDPOINTS.VERIFY_REWARD_CODE
  const payload = {
    code: code
  }
  console.log("verifyRewardCode", token, URL, JSON.stringify(payload))
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    }
  });
}


async function getNotificationDetails(locationId) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("tokenee", token)
  const URL = ENDPOINTS.GET_NOTIFICATION_DETAILS + token + "&location_id=" + locationId

  return axios.get(URL);
}


async function getLocalBusinesses(payload) {
  let URL = ENDPOINTS.DISCOVER_BUSINESS_PATH
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("getLocalBusinesses token", token, JSON.stringify(payload))
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}


async function addViewCount(locationId) {
  let URL = ENDPOINTS.ADD_VIEW_COUNT
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)
  const payload = {
    location_id: locationId
  }
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function shareCount(payload) {
  let URL = ENDPOINTS.SHARE_COUNT
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function getLocationCategories(locationId) {
  let URL = ENDPOINTS.GET_LOCATION_CATEGORIES + locationId
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.get(URL, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}




async function getMenuByCategory(categoryName, locationId) {
  let URL = ENDPOINTS.GET_MENU_BY_CAT_LOC + locationId
  let payload = {
    "tags": [
      {
        "name": categoryName,
        "type": "category"
      }
    ]
  }
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}



async function getHomeProfile(payload) {
  let URL = ENDPOINTS.GET_HOME_PROFILE
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  console.log('getHomeProfile payload', payload);
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}


async function getLocationByFundraiserType(payload) {
  let URL = ENDPOINTS.GET_DATA_BY_FUNDRAISER_TYPE
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}



async function getFundraisers(payload) {
  // let fundraiserIds = []
  // try {
  //   let resp = await getHomeProfile();
  //   for (var data of resp.data) {
  //     if (data.show_type === "fundraiser") {
  //       fundraiserIds = [...fundraiserIds, ...data.tags]
  //     }
  //   }
  // } catch (error) {
  //   return error
  // }

  // if (fundraiserIds.length == 0) {
  //   return []
  // }

  let URL = ENDPOINTS.GET_FUNDRAISERS
  // let payload = {
  //   fundraiser_ids: fundraiserIds
  // }
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  console.log('getFundraisers payload', payload);
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}




async function getAllMenuItem(locationId) {
  let URL = ENDPOINTS.GET_ALL_MENU_ITEMS + locationId
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.get(URL, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}


async function getAllMenuItemRatings(locationId, menuItemId) {
  let URL = ENDPOINTS.GET_ALL_RATINGS + locationId + "/" + menuItemId

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.get(URL, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}


async function getTags(payload) {
  // let URL = ENDPOINTS.GET_ALL_RATINGS +locationId+"/"+menuItemId
  let URL = `${CONSTANTS.BASE_URL}api/v2/tags?latitude=${payload.latitude}&longitude=${payload.longitude}&zip=&radius=20`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)

  return axios.get(URL, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}



async function redeem(payload) {

  let URL = ENDPOINTS.REDEEM

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("redeem", token, payload)

  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  });
}

async function cancelRedeem(payload) {

  let URL = ENDPOINTS.CANCEL_REDEEM

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("cancel redeem", token, payload)

  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  });
}

async function redeemReward(payload) {

  let URL = ENDPOINTS.REDEEM_REWARD

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("redeem REWARD!", token, payload)

  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  });
}

async function getLocationForCustomer() {
  let URL = ENDPOINTS.GET_LOCATIONS_FOR_CUSTOMER
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("getLocationForCustomer token", token)

  return axios.post(URL, {}, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function addLocationToCustomer(location, value) {
  let URL = `${ENDPOINTS.ADD_LOCATION_TO_CUSTOMER}/${location.id}/customer/${value}`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log("token", token)
  return axios.post(URL, {}, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function addFavoriteMenuItem(item, is_favourite) {

  const URL = `${ENDPOINTS.ADD_FAVORITE_MENU_ITEM}/${item.id}/add_favourite.json`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  const payload = {
    "access_token": token,
    "is_favourite": is_favourite ? 1 : 0,
    "category_id": item.category_id,
    "menu_id": item.menu_id
  }

  console.log("addFavoriteMenuItem", URL, payload)
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function leaveCommentForMenuItem(item, rating, comment) {

  const URL = `${ENDPOINTS.ADD_FAVORITE_MENU_ITEM}/${item.id}/comment.json`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));

  const payload = {
    "access_token": token,
    "rating": rating,
    "comment": comment,
    "category_id": item.category_id,
    "menu_id": item.menu_id,
    "order_item_id": 0
  }

  console.log("leaveCommentForMenuItem", URL, payload)
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

async function deleteNotificationMessage(message_id) {

  const URL = `${ENDPOINTS.DELETE_NOTIFICATION_MESSAGE}`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const payload = {
    "access_token": token,
    "message_id": message_id
  }

  console.log('deleteNotificationMessage payload', payload);
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  })
}

async function replyNotificationMessage(data) {

  const URL = `${ENDPOINTS.REPLY_NOTIFICATION_MESSAGE}`
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const payload = {
    "access_token": token,
    "from_user": data.userId,
    "msg_id": data.msg_id,
    "location_id": data.location_id,
    "message": data.message,
    "alert_type": "Points Message"
  }

  console.log('replyNotificationMessage payload', payload);
  return axios.post(URL, JSON.stringify(payload), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  })
}

async function getNotificationMessages(message_id) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.GET_NOTIFICATION_MESSAGES}?access_token=${token}&message_id=${message_id}`
  console.log('getNotificationMessages', URL);
  return axios.get(URL)
}

async function getFundraiserDealsByLocation(location_id, fundraiserType = null) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = ENDPOINTS.GET_FUNDRAISER_DEALS_BY_LOCATION
  const payload = {
    location_id,
    fundraiser_type_id: fundraiserType ? fundraiserType.id : undefined
  }

  console.log('getFundraiserDealsByLocation', URL, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token,
    }
  })
}

async function rewardPhotoUpload(data, onProgress) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = ENDPOINTS.REWARD_PHOTO_UPLOAD;

  const payload = new FormData();

  payload.append("photo", data.photo);
  payload.append("user_reward_id", data.user_reward_id);
  payload.append("amount", data.amount);
  payload.append("date", data.date);

  console.log('rewardPhotoUpload', payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  });
}

async function getUserRewards() {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = ENDPOINTS.GET_USER_REWARDS
  return axios.post(URL, {}, {
    headers: {
      Authorization: token
    }
  })
}

async function contestPhotoUpload(data, onProgress) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = ENDPOINTS.CONTEST_PHOTO_UPLOAD;

  const payload = new FormData();

  payload.append("location_id", data.location_id);
  payload.append("contest_id", data.contest_id);
  payload.append("contest", data.contest);

  console.log('contestPhotoUpload payload', token, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  });
}

async function createContestAction(payload) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = ENDPOINTS.CREATE_CONTEST_ACTION;

  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  })
}
async function changeMessageStatus(message_id) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.CHANGE_MESSAGE_STATUS}?access_token=${token}&message_id=${message_id}`;

  return axios.get(URL)
}
async function getAllFundraiserGroups() {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.GET_ALL_FUNDRAISER_GROUPS}`;

  return axios.get(URL, {
    headers: {
      Authorization: token
    }
  })
}

async function getFundraisersNearMe(payload) {
  const URL = ENDPOINTS.GET_FUNDRAISERS_NEAR_ME
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  console.log('getFundraisersNearMe payload', token, URL, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token
    }
  });
}

async function checkout(payload) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  const URL = `${ENDPOINTS.CHECKOUT}?access_token=${token}`
  console.log('checkout payload', token, URL, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token,
      Accept: 'application/json',
    }
  });
}

async function getFundraiserAllInfo() {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.GET_FUNDRAISER_ALLINFO2}`;
  return axios.get(URL, { headers: { Authorization: token } })
}

async function loadFundraiserTeamStats(payload) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.LOAD_FUNDRAISER_TEAM_STATS}`;
  return axios.post(URL, payload, { headers: { Authorization: token } })
}

async function selectFundraiserPrizeOption(payload) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"));
  const URL = `${ENDPOINTS.SELECT_FUNDRAISER_PRIZE_OPTION}`
  console.log('selectFundraiserPrizeOption payload', token, URL, payload);
  return axios.post(URL, payload, {
    headers: {
      Authorization: token,
      Accept: 'application/json',
    }
  });
}

async function getFundraiserTeamDetail(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.GET_FUNDRAISER_TEAM_DETAIL}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}

async function getFundraiserMessages() {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.GET_FUNDRAISER_MESSAGES}`;

  return axios.get(URL, { headers: { Authorization: token, } })
}

async function getFundraiserTeamsAndPlayers(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  // const URL = `${ENDPOINTS.GET_FUNDRAISER_TEAMS_AND_PLAYERS}?search=${payload}`;
  const URL = `${ENDPOINTS.GET_FUNDRAISER_TEAMS_AND_PLAYERS}`;
  return axios.get(URL, { headers: { Authorization: token, } })
}

async function getFundraiserLeaderBoard(page = 1) {
  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))
  const URL = `${ENDPOINTS.GET_FUNDRAISER_LEADERBOARD}?page=${page}`;
  return axios.get(URL, { headers: { Authorization: token, } })
}

async function readFundraiserMessage(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.READ_FUNDRAISER_MESSAGE}/${payload}`;
  return axios.get(URL, { headers: { Authorization: token, } })
}

async function sendFundraiserMessage(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.SEND_FUNDRAISER_MESSAGE}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}

async function getFundraiserContacts() {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.GET_FUNDRAISER_CONTACTS}`;

  return axios.get(URL, { headers: { Authorization: token, } })
}

async function addFundraiserContacts(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.ADD_FUNDRAISER_CONTACTS}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}

async function updateFundraiserContact(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.UPDATE_FUNDRAISER_CONTACT}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}

async function removeFundraiserContact(id) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.REMOVE_FUNDRAISER_CONTACT}/${id}`;

  return axios.post(URL, {}, { headers: { Authorization: token, } })
}

async function createSharingSession(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.CREATE_SHARING_SESSION}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}

async function updateSharingSession(id, payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.UPDATE_SHARING_SESSION}/${id}`;

  return axios.put(URL, payload, { headers: { Authorization: token, } })
}

async function updateDetailStatus(payload) {

  const token = JSON.parse(await AsyncStorage.getItem("TOKEN"))

  const URL = `${ENDPOINTS.UPDATE_DETAIL_STATUS}`;

  return axios.post(URL, payload, { headers: { Authorization: token, } })
}