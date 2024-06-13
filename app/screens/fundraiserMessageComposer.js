import React, { useState, useEffect, useContext, useCallback } from 'react'
import { View, Keyboard, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput, Image, ActivityIndicator, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Linking, TouchableWithoutFeedback } from 'react-native'
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
import ImageLoad from 'react-native-image-placeholder';
import ProgressBar from '../components/progressBar'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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

const FundraiserMessageComposerScreen = props => {

  const [store, setStore] = useContext(Store.Context)

  const user = props?.route?.params?.user
  const userTeam = props?.route?.params?.userTeam
  const data = props?.route?.params?.data
  const fundraiserRole = props?.route?.params?.fundraiserRole

  const fundraiser = _.first(data)

  const [prizes, setPrizes] = useState(fundraiser.prizes || [])

  const [suggestions, setSuggestions] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [edittingRecipient, setEdittingRecipient] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [lastSearchTerm, setLastSearchTerm] = useState('')
  const [message, setMessage] = useState('')

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, { id: user.id }))
  const myDetail = _.find(_.flatMap(fundraiser.leaderboard, 'detail'), { id: user.id })
  const myProgress = myDetail ?
    _.sumBy(myDetail.customers, c => c.is_refunded ? 0 : c.quantity) : 0

   //const showSuggestions = edittingRecipient && _.trim(searchTerm).length > 2 && (loadingSuggestions || suggestions.length > 0)
  const canSend = recipient && !!_.trim(message)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {

    try {

      setLoadingSuggestions(true)
      console.log('extraApiService.getFundraiserTeamsAndPlayers');
      const response = await extraApiService.getFundraiserTeamsAndPlayers()
      console.log('extraApiService.getFundraiserTeamsAndPlayers response', response.data);
      setSuggestions(response.data)
      setLoadingSuggestions(false)
    }
    catch (error) {
      console.log('extraApiService.getFundraiserTeamsAndPlayers error', error);
      setLoadingSuggestions(false)
    }
  }

  const searchTeamsAndPlayers = async currentSearchTerm => {

    if (loadingSuggestions) {
      console.log('already loading');
      return
    }

    if (!_.trim(currentSearchTerm) || currentSearchTerm.length < 3) {
      console.log('invalid search term', currentSearchTerm);
      return
    }

    if (currentSearchTerm == lastSearchTerm) {
      console.log('duplicated search');
      return
    }

    try {

      setLoadingSuggestions(true)
      console.log('extraApiService.getFundraiserTeamsAndPlayers', currentSearchTerm);
      const response = await extraApiService.getFundraiserTeamsAndPlayers(currentSearchTerm)
      console.log('extraApiService.getFundraiserTeamsAndPlayers response', response.data);
      setSuggestions(response.data)
      setLastSearchTerm(currentSearchTerm)
      setLoadingSuggestions(false)
    }
    catch (error) {
      console.log('extraApiService.getFundraiserTeamsAndPlayers error', error);
      setLoadingSuggestions(false)
    }
  }

  const sendMessage = async () => {

    Keyboard.dismiss()

    try {

      const payload = {
        message,
        fundraiser_type_id: recipient.fundraiser_type_id,
        message_type: recipient.message_type,
        team: recipient.fundraiser_team,
        player_id: recipient.player_id,
      }

      setSubmitting(true)
      console.log('extraApiService.sendFundraiserMessage', payload);
      const response = await extraApiService.sendFundraiserMessage(payload)
      console.log('extraApiService.sendFundraiserMessage response', response.data);
      setSubmitting(false)

      showMessage({ type: 'success', message: response.data.success })
      navigation.goBack()
    }
    catch (error) {
      console.log('extraApiService.sendFundraiserMessage error', error);
      setSubmitting(false)
      showMessage({ type: 'danger', message: 'Could not send your message' })
    }
  }

  const renderHeader = () => {

    return (
      <View style={{
        paddingTop: insets.top,
        paddingHorizontal: 20,
      }}>
        <View style={{
           paddingLeft: 20,
          paddingTop: 15,
          height: 80,
           alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>

            <Icon
              type='material-community'
              name='arrow-left-circle'
              size={32}
              color='gray'
              onPress={() => navigation.goBack()}
            />

            <View style={{
              flex: 1,
              flexDirection: "row",
              alignItems: 'center',
              justifyContent: 'center'
            }} >
              {
                user && (
                  <>
                    <Avatar
                      rounded
                      size={50}
                      source={user.avatar ? { uri: user.avatar } : undefined}
                      title={utils.getInitials(user.name)}
                      containerStyle={{
                        backgroundColor: 'darkgray',
                      }}
                    />
                    <View style={{
                      flex: 1,
                      marginLeft: 15,
                    }} >

                      <Title style={{
                        fontSize: 24,
                        fontFamily: "Nunito-Bold",
                      }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >{user.name}</Title>

                    </View>
                  </>
                )
              }
            </View>

            <View style={{ minWidth: 32 }} />

          </View>
        </View>


      </View>
    )
  }

  const renderMyProgressBar = () => {

    if (!data || !fundraiser || (fundraiserRole != 'Player' && fundraiserRole != 'Coach') || !user) {
      return null
    }

     const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, { id: user?.id }))
     const myDetail = _.find(myTeam?.detail, { id: user?.id })

     const progressValue = !fundraiser.show_dollar_amount ? myDetail?.quantity : myDetail?.sum
     const progressMax = (!fundraiser.show_dollar_amount || fundraiser.template == 'Donation Campaign') ? Number(myTeam?.plan) : Number(myTeam?.plan) * Number(fundraiser.price)

//    const progressValue = Number(fundraiser.current)
//    const progressMax = Number(fundraiser.card_goal)

    return (
      <ProgressBar
        leftLabel='Sold'
        rightLabel='Goal'
        value={progressValue}
        max={progressMax}
        isMoney={fundraiser.show_dollar_amount || fundraiser.template == 'Donation Campaign'}
      />
    )
  }

  const renderRecipientBar = () => {

    if (submitting || loadingSuggestions) {
      return <View />
    }

    return (
      <View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          marginBottom: 5,
          backgroundColor: 'white',
        }}>

          <Text style={{
            fontFamily: 'Nunito-Semibold',
            fontSize: 18,
          }}>To:</Text>

          {
            edittingRecipient ?
              <TextInput
                autoFocus
                style={{
                  flex: 1,
                  fontFamily: 'Nunito-Regular',
                  fontSize: 16,
                  marginHorizontal: 10,
                  paddingVertical: 0,
                  paddingHorizontal: 10,
                  borderColor: '#aaa',
                  borderWidth: 1,
                  borderRadius: 5,
                }}
                placeholder='Type to search (min 3)'
                value={searchTerm}
                onChangeText={setSearchTerm}
              /> :
              <TouchableOpacity
                style={{ flex: 1, }}
                onPress={() => setEdittingRecipient(true)}
              >
                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#eee',
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginHorizontal: 10
                }}>
                  <Text style={{
                    flex: 1,
                    fontFamily: recipient?.displayname ? 'Nunito-Bold' : 'Nunito-Regular',
                    fontSize: 16,
                  }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >{recipient?.displayname || 'Tap here to select'}</Text>
                </View>
              </TouchableOpacity>
          }
          <Icon
            type='ionicon'
            name={edittingRecipient ? 'close' : 'search-sharp'}
            onPress={() => setEdittingRecipient(!edittingRecipient)}
          />
        </View>
      </View>
    )
  }

  const renderSuggestion = (suggestion, index) => {

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          setRecipient(suggestion)
          setEdittingRecipient(false)
        }}
      >
        <View
          style={{
            backgroundColor: index % 2 == 0 ? '#ddd' : 'white',
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}>
          <Text style={{
            fontSize: 16,
            fontFamily: 'Nunito-Regular',
            color: 'black'
          }}>{suggestion.displayname}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderSuggestions = () => {

    if (loadingSuggestions || !edittingRecipient) {
      return <View />
    }

    const filteredSuggestions = _.filter(suggestions, suggestion => utils.normalizedSearchText(suggestion.displayname, searchTerm))

    if (filteredSuggestions.length < 1) {
      return (
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Nunito-Regular',
            color: 'black',
            textAlign: 'center'
          }}
        >No results.</Text>
      )
    }

    return (
      <View style={{ marginBottom: 30, }}>
        {_.map(filteredSuggestions, renderSuggestion)}
      </View>
    )
  }

  const renderMessageInput = () => {

    if (submitting) {
      return (
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
        }}>
          <ActivityIndicator size='large' color='black' />
          <Text style={{
            marginLeft: 5,
            fontSize: 16,
            fontFamily: 'Nunito-Regular'
          }}>Sending your message...</Text>
        </View>
      )
    }

    if (edittingRecipient || loadingSuggestions) {
      return null
    }

    return (
      <TextInput
        style={{
           flex: 1,
          fontSize: 16,
          fontFamily: 'Nunito-Regular',
          borderTopWidth: 1,
          borderBottomWidth: 1,
        }}
        placeholder='Type your message...'
        multiline
        scrollEnabled={false}
        value={message}
        onChangeText={setMessage}
      />
    )
  }

  const renderContent = () => {
    return (
      <KeyboardAvoidingView
        style={{
          flex: 1,
          marginHorizontal: 20,
        }}
        behavior='padding'
        keyboardVerticalOffset={20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
             paddingBottom: 40,
             backgroundColor: 'yellow',
            flexGrow: 1
          }}
        >

          <View style={{ flex: 1, }}>
            {renderMyProgressBar()}

            {
              fundraiser ? (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 20,
                }}>
                  <ImageLoad
                    style={{
                      width: 40,
                      height: 40,
                       borderRadius: 15,
                      marginRight: 10,
                      alignSelf: "center",
                      backgroundColor: '#ccc'
                    }}
                    loadingStyle={{ size: 'large', color: 'blue' }}
                    placeholderStyle={{
                      width: 40,
                      height: 40,
                      alignSelf: "center",
                      backgroundColor: '#ccc',
                    }}
                    resizeMode='contain'
                    source={{ uri: fundraiser.logo }}
                  />
                  <Text style={{
                    flex: 1,
                    fontSize: 18,
                    color: "black",
                    fontFamily: "nunito-bold",
                  }}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >{fundraiser.fundraiser_name}</Text>
                </View>
              ) : <View />
            }

            {
              loadingSuggestions ? (
                <ActivityIndicator
                  size='large'
                  color='black'
                  style={{
                    marginTop: 30
                  }}
                />
              ) : null
            }

            {renderRecipientBar()}
            {renderMessageInput()}
            {renderSuggestions()}
          </View>
        </ScrollView>
        {renderFooter()}
      </KeyboardAvoidingView>
    )
  }

  const renderFooter = () => {

    if (edittingRecipient || submitting || loadingSuggestions) {
      return null
    }

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
      }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.goBack()}
        >
          <View style={{
            marginHorizontal: 20,
            justifyContent: "center",
            borderRadius: 25,
            height: 40,
            backgroundColor: Theme.screenBackground,
          }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}
            >Cancel</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, }}
          onPress={sendMessage}
          disabled={!canSend}
        >
          <View style={{
            marginHorizontal: 20,
            justifyContent: "center",
            borderRadius: 25,
            height: 40,
            backgroundColor: canSend ? Theme.redButtonColor : 'lightgray',
          }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}
            >Send</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback
      style={{
        flex: 1,
        backgroundColor: 'white'
      }}
      onPress={Keyboard.dismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'white'
        }}>
        {renderHeader()}
        {renderContent()}
        {/* {renderFooter()} */}
      </View>
    </TouchableWithoutFeedback>
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

export default FundraiserMessageComposerScreen