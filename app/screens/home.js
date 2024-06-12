import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Text,
  ScrollView,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import _ from 'lodash'
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
import { extraApiService } from "../Services/extraApiService"
import { showMessage } from "react-native-flash-message";
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment'

import { utils } from "../Utils/utils";

const HomeScreen = (props) => {

  const [loading, setLoading] = useState(false)

  const [data, setData] = useState([])
  const [error, setError] = useState('')

  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState(1)

  const isFocused = useIsFocused();

  const getRouteData = (data) => {

    const defaultRouteData = {
      route: '',
      params: {}
    }

    const routeData = {
      restaurant: {
        route: 'discover',
        params: { data }
      },
      fundraiser: {
        route: 'fundRaiser',
        params: { data }
      },
      deals_near_me: {
        route: 'dealsNear',
        params: {
          screen: 'dealsNear',
          params: { data }
        }
      },
      fundraiser_business: {
        route: 'discover',
        params: {
          data,
          hideCheckbox: true,
          fundraiserData: {
            fundraiser: data.fundraiser
          },
          fundraiserType: data.fundraiser_type
        }
      },
      fundraiser_near_me: {
        route: 'dealsNear',
        params: {
          screen: 'dealsNear',
          params: { data }
        }
      },
      // contest: ''
    }

    return routeData[data.show_type] || defaultRouteData
  }

  const getTags = (data) => {



    const primaryTags = data.primary_tag ?
      _.map(_.castArray(data.primary_tag), tag => ({ type: 'business_tag', name: tag.name })) : []

    const secondaryTags = data.secondary_tag ?
      _.map(_.castArray(data.secondary_tag), tag => ({ type: 'business_tag', name: tag.name })) : []

    const tagsString = data.tags_string ?
      _.map(_.castArray(data.tags_string), name => ({ type: 'cuisine', name })) : []

    return [...primaryTags, ...secondaryTags, ...tagsString]
  }

  useEffect(() => {
    if (isFocused && data.length < 1) {
      loadData()
    }
  }, [isFocused])

  const loadData = async () => {

    if (loading || loadingMore) {
      console.log('already loading!');
      return
    }

    console.log('loading data...');

    try {

      setError('')
      setLoading(true)

      const myLocation = await utils.getCurrentLocation()

      const payload = {
        lat: myLocation.latitude,
        lng: myLocation.longitude,
        page: 1
      }

      let resp = await extraApiService.getHomeProfile(payload)

      console.log('getHomeProfile response', resp.data);

      if (resp.data?.length > 0) {
        setPage(2)
        setHasMoreData(true)
      } else {
        setHasMoreData(false)
      }

      setData(_.orderBy(resp.data, 'order_num'))
      setLoading(false)
    } catch (error) {

      console.log('error', error);

      setError(error?.message || 'Unknown error')
      setLoading(false)

      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not load your home profile'
          })
        })
    }

  }

  const loadMoreData = async () => {

    if (loading || loadingMore) {
      console.log('already loading!');
      return
    }

    if (!hasMoreData) {
      console.log('no more data!');
      return
    }

    console.log('loading more data... page:', page);

    try {

      setLoadingMore(true)

      const myLocation = await utils.getCurrentLocation()

      const payload = {
        lat: myLocation.latitude,
        lng: myLocation.longitude,
        page
      }

      let resp = await extraApiService.getHomeProfile(payload)

      console.log('getHomeProfile response', resp.data);

      if (resp.data?.length > 0) {
        setPage(page + 1)
        setHasMoreData(true)
      } else {
        setHasMoreData(false)
      }

      setData(_.orderBy(_.uniqBy([...data, ...resp.data], 'id'), 'order_num'))
      setLoadingMore(false)
    }
    catch (error) {

      console.log('error loading more data', error);

      setLoadingMore(false)

      utils.checkAuthorized(error, props.navigation)
        .then(() => {
          showMessage({
            type: 'danger',
            message: 'Could not load your home profile'
          })
        })
    }

  }


  const renderMenuItems = () => {
    let uiItems1 = []



    if (error && !loading) {
      return (
        <View>
          <Text style={{
            color: 'white',
            fontFamily: 'Nunito-Regular',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20
          }}>Could not load your home profile. Try pull down to try again.</Text>
          {error ? <Text style={{
            color: 'white',
            fontFamily: 'Nunito-Regular',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20
          }}>{error}</Text> : null}
        </View>
      )
    }



    if (!loading && data.length < 1) {
      return (
        <Text style={{
          color: 'white',
          fontFamily: 'Nunito-Regular',
          fontSize: 16,
          textAlign: 'center',
          marginTop: 20
        }}>There is no options for you location.</Text>
      )
    }

    for (let data1 of data) {


      uiItems1.push((<TouchableOpacity
        key={data1.id}
        style={{
          marginTop: 8,
          flex: 1,
          backgroundColor: "#fff",
          elevation: 5,
          borderRadius: 25

        }}
        onPress={() => {
          console.log("onclick", data1, getTags(data1))
          const routeData = getRouteData(data1)
          console.log("routeData", routeData)
          props.navigation.navigate(routeData.route, routeData.params);
        }}
      >
        <Image
          style={styles.image}
          source={{ uri: data1.image }}
        />
        {
          data1.name ?
            <Text style={{
              fontSize: height * 0.025,
              fontFamily: "Nunito-Bold",
              textAlign: 'center',
            }}
              adjustsFontSizeToFit
            >{data1.name}</Text> :
            null
        }
      </TouchableOpacity>
      ))
    }

    return uiItems1
  };

  const renderButton = ({ item }) => {

    const unpublishDate = moment(item.unpublish_date, 'DD.MM.YYYY')

    return (
      <>
        <TouchableOpacity
          style={{
            marginTop: 8,
            flex: 1,
            backgroundColor: "#fff",
            elevation: 5,
            borderRadius: 25
          }}
          onPress={() => {
            console.log("onclick", item, getTags(item))
            const routeData = getRouteData(item)
            console.log("routeData", routeData)
            props.navigation.navigate(routeData.route, routeData.params);
          }}
        >
          {item.image ? <Image style={styles.image} source={{ uri: item.image }} /> : <View style={styles.image} />}
          {
            item.name ?
              <Text style={{
                fontSize: height * 0.025,
                fontFamily: "Nunito-Bold",
                textAlign: 'center',
              }}
                adjustsFontSizeToFit
              >{item.name}</Text> :
              null
          }
        </TouchableOpacity>

        {
          unpublishDate.isValid() ?
            <Text style={{
              fontSize: height * 0.018,
              fontFamily: "Nunito-SemiBold",
              textAlign: 'center',
              color: 'white'
            }}>Exp Date {unpublishDate.format('MM/DD/YYYY')}</Text> :
            null
        }
      </>
    )
  }

  const renderEmptyList = () => {

    if (loading || loadingMore) {
      return null
    }

    if (error) {
      return (
        <View>
          <Text style={{
            color: 'white',
            fontFamily: 'Nunito-Regular',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20
          }}>Could not load your home profile. Try pull down to try again.</Text>
          {error ? <Text style={{
            color: 'white',
            fontFamily: 'Nunito-Regular',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20
          }}>{error}</Text> : null}
        </View>
      )
    }

    return (
      <Text style={{
        color: 'white',
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20
      }}>There are no options for your location.</Text>
    )
  }

  const renderLoader = () => {

    if (!loadingMore) {
      return null
    }

    return (
      <ActivityIndicator
        style={{ marginTop: 15 }}
        color="#fff"
        size="large"
      />
    )
  }


  const renderButtonList = () => {
    return (
      <FlatList
        contentContainerStyle={{
          marginHorizontal: 15,
          paddingTop: 10,
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            size='large'
            onRefresh={loadData}
            tintColor='#fff'
            colors={['#000']}
          />
        }
        ListEmptyComponent={renderEmptyList}
        data={data}
        keyExtractor={item => `${item.id}`}
        renderItem={renderButton}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoader}
      />
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/splash.png")}
      >
        <View
          style={{
            flexDirection: "row",
            width: wp("90%"),
            marginLeft: wp("5%"),
            justifyContent: "center",
            marginTop: Platform.OS === "ios" ? hp("5%") : hp("3%"),
          }}
        >
          {/* <Image
            style={{ height: 45, width: 78 }}
            source={require("../assets/homeLogo.png")}
            resizeMode='contain'
          /> */}
        </View>
        {renderButtonList()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splash: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  image: {
    alignSelf: "center",
    width: width * .8,
    // backgroundColor: "#fff",
    resizeMode: "contain",
    // borderWidth: 5,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 15,
    padding: 70,
    // height: Math.round((width * 6.3) / 16),
    marginTop: 5,
  },
  userInfoSection: {
    marginTop: 5,
    width: width,
    height: height > 800 ? height * 0.18 : height * 0.22,
  },
});

export default HomeScreen;
