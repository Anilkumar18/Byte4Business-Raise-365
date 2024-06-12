
import moment from "moment"
import { Platform, PermissionsAndroid } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { StackActions } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Theme from '../utils'
import { MaskService } from 'react-native-masked-text'

import _ from 'lodash'

export const utils = {
  calculateGrade,
  formatDate,
  calculateDistance,
  normalizedSearchText,
  getCurrentLocation,
  watchLocation,
  clearWatch,
  checkAuthorized,
  getInitials,
  formatMoney
}

let requestingPermission = false

function formatMoney(value, zeroCents = true) {
  const masked = MaskService.toMask('money', value, {
    unit: '$',
    separator: '.',
    delimiter: ','
  })

  return zeroCents ? masked : masked.replace(/(\.00|0)$/, '')
}

function formatDate(date) {
  var momentobj = moment(date).format('MM-DD-YYYY');
  return momentobj
}

const GRADEDATA = {
  1: {
    title: "A+",
    color: Theme.greenGradeColor,
    image: require('../assets/grade-green.png'),
    badge: require('../assets/badge-green.png')
  },
  2: {
    title: "A",
    color: Theme.greenGradeColor,
    image: require('../assets/grade-green.png'),
    badge: require('../assets/badge-green.png')
  },
  3: {
    title: "A-",
    color: Theme.greenGradeColor,
    image: require('../assets/grade-green.png'),
    badge: require('../assets/badge-green.png')
  },
  4: {
    title: "B+",
    color: Theme.greenGradeColor,
    image: require('../assets/grade-green.png'),
    badge: require('../assets/badge-green.png')
  },
  5: {
    title: "B",
    color: Theme.greenGradeColor,
    image: require('../assets/grade-green.png'),
    badge: require('../assets/badge-green.png')
  },
  6: {
    title: "B-",
    color: Theme.yellowGradeColor,
    image: require('../assets/grade-yellow.png'),
    badge: require('../assets/badge-yellow.png')
  },
  7: {
    title: "C+",
    color: Theme.yellowGradeColor,
    image: require('../assets/grade-yellow.png'),
    badge: require('../assets/badge-yellow.png')
  },
  8: {
    title: "C",
    color: Theme.yellowGradeColor,
    image: require('../assets/grade-yellow.png'),
    badge: require('../assets/badge-yellow.png')
  },
  9: {
    title: "C-",
    color: Theme.yellowGradeColor,
    image: require('../assets/grade-yellow.png'),
    badge: require('../assets/badge-yellow.png')
  },
  10: {
    title: "D+",
    color: Theme.redGradeColor,
    image: require('../assets/grade-pink.png'),
    badge: require('../assets/badge-pink.png')
  },
  11: {
    title: "D",
    color: Theme.redGradeColor,
    image: require('../assets/grade-pink.png'),
    badge: require('../assets/badge-pink.png')
  },
  12: {
    title: "D-",
    color: Theme.redGradeColor,
    image: require('../assets/grade-pink.png'),
    badge: require('../assets/badge-pink.png')
  },
  13: {
    title: "F",
    color: Theme.redGradeColor,
    image: require('../assets/grade-pink.png'),
    badge: require('../assets/badge-pink.png')
  },
}

function calculateGrade(rating) {
  rating = parseInt(rating);

  const EMPTY_GRADE = {
    title: '-',
    color: 'lightgray',
    image: require('../assets/grade.png'),
    badge: require('../assets/badge.png')
  }
  const grade = GRADEDATA[rating]

  return grade || EMPTY_GRADE
}

function calculateDistance(lat1, lon1, unit, lat2, lon2) {
  // let lat2 = 30.5119418
  // let lon2 = -97.8177601
  if (!lat2 || !lon2) {
    return 0
  }

  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "M") { dist = dist * 0.8684 }
    unit == 'ABS' ? dist.toFixed(2) : dist = dist.toFixed(2) + " mi"
    return dist;
  }
}

function normalizedSearchText(text = '', searchTerm = '') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .indexOf(searchTerm.toLowerCase()) > -1
}

function getCurrentLocation(defaultLocation) {

  const { ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION } = PermissionsAndroid.PERMISSIONS
  const { GRANTED } = PermissionsAndroid.RESULTS

  const requestLocationPermission = Platform.select({
    ios: () => Geolocation.requestAuthorization('always')
      .then(result => result == 'granted'),
    android: () => PermissionsAndroid.requestMultiple([ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION])
      .then(results => results[ACCESS_FINE_LOCATION] == GRANTED && results[ACCESS_COARSE_LOCATION] == GRANTED)
  })

  requestingPermission = true

  return requestLocationPermission()
    .then(granted => {

      requestingPermission = false

      if (!granted) {
        throw new Error('Please make sure location services is enable for this app')
      }

      return new Promise((resolve, reject) => {
        // if (process.env.NODE_ENV == 'development') {
        //   if (defaultLocation) {
        //     console.log('getCurrentLocation mocked: default location passed');
        //     resolve(defaultLocation)
        //   } else {
        //     console.log('getCurrentLocation mocked: hardcoded location');
        //     resolve({
        //       "latitude": 30.4807881,
        //       "longitude": -97.8532589
        //     })
        //     // resolve({ latitude: 30.519148, longitude: -97.837463 })
        //     // 30.519148, -97.837463 CEDAR PARK, TX
        //   }
        // } else {
        const options = { timeout: 10000, maximumAge: 20000 }
        Geolocation.getCurrentPosition(
          geoInfo => {
            console.log('getCurrentLocation', geoInfo.coords);
            resolve(geoInfo.coords)
          },
          error => {
            console.log('Unable to retrieve your location', error);
            reject('Unable to retrieve your location')
          },
          options
        )
        // }
      })
    })
}

function watchLocation(onSuccess, onError) {

  const { ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION } = PermissionsAndroid.PERMISSIONS
  const { GRANTED } = PermissionsAndroid.RESULTS

  const requestLocationPermission = Platform.select({
    ios: () => Geolocation.requestAuthorization('always')
      .then(result => result == 'granted'),
    android: () => PermissionsAndroid.requestMultiple([ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION])
      .then(results => results[ACCESS_FINE_LOCATION] == GRANTED && results[ACCESS_COARSE_LOCATION] == GRANTED)
  })

  if (requestingPermission) {
    throw new Error('TRY_AGAIN')
  }

  requestingPermission = true

  return requestLocationPermission()
    .then(granted => {

      requestingPermission = false

      if (!granted) {
        return null
      }

      const options = Platform.select({
        android: {
          distanceFilter: 10,
          interval: 10000,
          fastestInterval: 5000
        },
        ios: {
          accuracy: {
            android: 'high',
            ios: 'nearestTenMeters'
          },
          distanceFilter: 10,
          interval: 10000,
          fastestInterval: 5000
        }
      })

      return Geolocation.watchPosition(
        geoInfo => {
          console.log('watchPosition', geoInfo.coords);
          onSuccess(geoInfo.coords)
        },
        error => {
          console.log('Unable to watch your location', error);
          onError(error)
        },
        options
      )
    })
}

function clearWatch(id) {
  Geolocation.clearWatch(id)
}

function checkAuthorized(error, navigation) {

  const originalToken = _.get(error, 'config.headers.Authorization', '') ||
    _.get(_.get(error, 'config.url', '').match('[?&]access_token=([^&]+)'), '[1]')

  return new Promise((resolve, reject) => {
    if (error?.response?.status == 401) {
      console.log('UNAUTHORIZED 401 ORIGINAL TOKEN:', originalToken, error.config);
      if (navigation) {
        AsyncStorage.getItem('TOKEN')
          .then(token => {
            if (JSON.parse(token) === originalToken) {
              console.log('UNAUTHORIZED 401 CURRENT TOKEN:', token, 'Redirecting to login screen...');
              AsyncStorage.clear().catch(console.log);
              navigation.dispatch(StackActions.replace("login"));
              showMessage({ type: 'warning', message: 'Please login again', })
            }
          })
      }
      reject('Please login again')
    } else {
      resolve()
    }
  })
}

function getInitials(name) {

  if (!name) {
    return ''
  }

  const splitName = name.toUpperCase().split(' ')

  if (splitName.length === 1) {
    return `${splitName[0].charAt(0)}`
  }

  if (splitName.length > 1) {
    return `${splitName[0].charAt(0)}${splitName[1].charAt(0)}`
  }

  return ''
}