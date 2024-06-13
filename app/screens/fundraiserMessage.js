import React, { useState, useEffect, useContext } from 'react'
import { View, SafeAreaView, ScrollView, Text, Image, ActivityIndicator, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native'
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


const fakeData = [
  {
    id: 1,
    name: 'Coach test',
    message: 'Hello there'
  },
  {
    id: 2,
    name: 'Sales rep test',
    message: "Hi, I'm sales rep"
  },
]

const { width, height } = Dimensions.get("screen");

const Button = ({ title, onPress, containerStyle, buttonStyle, titleStyle, icon, ...props }) => {

  const buttonContainerStyle = {
    color: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 30,
    backgroundColor: Theme.redButtonColor,
     width: "100%",
    flex: 1,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 2 },
    elevation: 4,
    marginHorizontal: 6,
    ...buttonStyle,
  }
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      ...containerStyle
    }}>
      {
        icon ? (
          <Icon
            type='material-community'
            size={30}
            containerStyle={{
              marginRight: 20,
            }}
            {...icon}
          />
        ) : null
      }
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={onPress} disabled>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              textAlign: "center",
              fontFamily: "Nunito-Bold",
              ...titleStyle,
            }}
          >{title}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const FundraiserMessageScreen = props => {

  const user = props?.route?.params?.user
  const userTeam = props?.route?.params?.userTeam
  const data = props?.route?.params?.data
  const fundraiserRole = props?.route?.params?.fundraiserRole
  const sender = props?.route?.params?.sender
  const message = props?.route?.params?.message

  const fundraiser = _.first(data)

  const [prizes, setPrizes] = useState(fundraiser.prizes || [])

  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, { id: user.id }))
  const myDetail = _.find(_.flatMap(fundraiser.leaderboard, 'detail'), { id: user.id })
  const myProgress = myDetail ?
    _.sumBy(myDetail.customers, c => c.is_refunded ? 0 : c.quantity) : 0

  const selectPrizeOption = async (prize_option, prize_index) => {

    const oldPrizes = prizes

    setPrizes(
      _.map(prizes, (prize, index) => index == prize_index ?
        ({ ...prize, selected_option: prize_option }) : prize
      )
    )

    try {

      const payload = { prize_index, prize_option }

      console.log('extraApiService.selectFundraiserPrizeOption payload', payload);

      const response = await extraApiService.selectFundraiserPrizeOption(payload)

      console.log('extraApiService.selectFundraiserPrizeOption response', response.data);

      if (response.data?.success) {
        showMessage({ type: 'success', message: response.data.success })
      } else {
        setPrizes(oldPrizes)
      }
    }
    catch (error) {

      console.log('extraApiService.selectFundraiserPrizeOption error', error);

      showMessage({ type: 'danger', message: 'Could not select this option' })
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
                      source={{ uri: user.avatar ? user.avatar : undefined }}
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

  const renderPrize = (prize, prizeIndex) => {

     console.log('renderprize', prize.selected_option)

    const imageStyle = {
      flex: 1,
      width: null,
      height: null,
      minHeight: wp(45),
      marginBottom: 5,
    }

    const textStyle = {
      fontFamily: 'nunito-regular',
      fontSize: 18,
      textAlign: 'center'
    }

    return (
      <View key={prizeIndex}>
        <Button
          title={`SELL ${prize.count}`}
        />
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 10,
          marginHorizontal: 20,
          borderBottomWidth: 0.5,
          paddingVertical: 10,
        }}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
          }}>
            {
              prize.image ? (
                <ImageLoad
                  style={imageStyle}
                  loadingStyle={{ size: 'large', color: 'blue' }}
                  placeholderStyle={imageStyle}
                  resizeMode='contain'
                  source={{ uri: prize.image }}
                />
              ) : null
            }
            <Text style={textStyle}>{prize.name}</Text>
          </View>
          <View>
            {_.map(prize.options, (option, optionIndex) => (
              <TouchableOpacity
                key={option}
                onPress={() => selectPrizeOption(option, prizeIndex)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 30,
                  }}
                >
                  <Icon
                    type='material-community'
                    name={
                      prize.selected_option == option ?
                        'radiobox-marked' : 'radiobox-blank'
                    }
                    color={
                      prize.selected_option == option ?
                        Theme.redButtonColor : 'black'
                    }
                    containerStyle={{
                      marginRight: 10
                    }}
                  />
                  <Text style={{ ...textStyle, marginBottom: 5, }}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    )
  }

  const renderMyProgressBar = () => {

    if (!data || !fundraiser || (fundraiserRole != 'Player' && fundraiserRole != 'Coach') || !user) {
      return null
    }

     const myDetail = _.find(_.flatMap(fundraiser.leaderboard, 'detail'), { id: user.id })
     const myProgress = myDetail ?
       _.sumBy(myDetail.customers, c => c.is_refunded ? 0 : c.quantity) : 0

    const progressValue = Number(fundraiser.current)
    const progressMax = Number(fundraiser.card_goal)

    return (
      <ProgressBar
        leftLabel='Sold'
        rightLabel='Goal'
        value={progressValue}
        max={progressMax}
      />
    )
  }

  const renderSender = (sender, index) => {
    return (
      <TouchableOpacity key={index}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            paddingVertical: 15,
            marginHorizontal: 20,
            borderTopWidth: index == 0 ? 0 : 0.5,
          }}
        >
          <Icon name='account-circle' size={40} />
          <Text style={{
            fontFamily: 'nunito-regular',
            fontSize: 18,
            marginLeft: 15,
          }}>{sender.name}</Text>
        </View>

      </TouchableOpacity>
    )
  }

  const renderContent = () => {
    return (
      <View style={{
        flex: 1,
        marginHorizontal: 20,
      }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
            ) : null
          }

          <View style={{
            paddingVertical: 10,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            marginBottom: 10
          }}>
            <Text style={{
              fontFamily: 'nunito-bold',
              fontSize: 20,
              textAlign: 'center'
            }}>{message.sender_name}</Text>
          </View>
          <View style={{
            paddingVertical: 10,
            marginTop: 20,
            marginBottom: 10
          }}>
            <Text style={{
              fontFamily: 'nunito-semibold',
              fontSize: 16,
            }}>{message.message}</Text>
          </View>


          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={{
              color: "#fff",
              marginTop: 25,
              alignSelf: "center",
              justifyContent: "center",
              borderRadius: 25,
              height: 30,
              backgroundColor: Theme.redButtonColor,
               width: "50%",
              paddingHorizontal: 25,
            }}>
              <Text style={{
                color: "#fff",
                fontSize: 16,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}>Close</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
      {renderHeader()}
      {renderContent()}
    </View>
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

export default FundraiserMessageScreen