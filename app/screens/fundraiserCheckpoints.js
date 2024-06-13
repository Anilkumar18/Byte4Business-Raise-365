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
import moment from 'moment'
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
import FundraiserPrizesScreen from './fundraiserPrizes';

const { width, height } = Dimensions.get("screen");

const Button = ({ title, onPress, containerStyle, buttonStyle, titleStyle, icon, ...props }) => {

  const buttonContainerStyle = {
    color: "#fff",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 20,
    height: 40,
    backgroundColor: Theme.redButtonColor,
     width: "100%",
    flex: 1,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
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
        <TouchableOpacity onPress={onPress} >
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
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

const FundraiserCheckpointsScreen = props => {

  const user = props?.route?.params?.user
  const data = props?.route?.params?.data
  const userTeam = props?.route?.params?.userTeam
  const fundraiserRole = props?.route?.params?.fundraiserRole
  const fundraiser = _.first(data)

  const orderedCheckpoints = _.orderBy(
    _.map(fundraiser.checkpoint, (checkpoint, key) => ({ key, date: checkpoint })),
    checkpoint => moment(checkpoint.date)
  )

  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [loadingProfileData, setLoadingProfileData] = useState(false)
  const [team, setTeam] = useState(null)
  const [sharelink, setShareLink] = useState('')
  const [leaderboard, setLeaderBoard] = useState('')
  const [teams, setTeams] = useState([])
  const [preparingShareContent, setPreparingShareContent] = useState(false)
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  const [error, setError] = useState(false)

  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [store, setStore] = useContext(Store.Context)

  const [watchId, setWatchId] = useState(null)

  const insets = useSafeAreaInsets();

  const myTeam = _.find(fundraiser.leaderboard, team => _.find(team.detail, { id: user?.id }))
  const myDetail = _.find(_.flatMap(fundraiser.leaderboard, 'detail'), { id: user?.id })
  const myProgress = myDetail ?
    _.sumBy(myDetail.customers, c => c.is_refunded ? 0 : c.quantity) : 0

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

  const renderCheckpoint = (checkpoint, index) => {

    const now = moment()
    const checkpointMoment = moment(checkpoint.date)

    const done = now.isSameOrAfter(checkpointMoment)
    const isLastItem = index != orderedCheckpoints.length - 1

    return (
      <View
        key={index}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 20,
          paddingHorizontal: 20,
        }}
      >

        <View style={{
          flex: 0.2
        }}>
          <View style={{
            flex: 1,
            alignItems: 'center',
          }}>
            <Icon
              type='material-community'
              name={done ? 'check-circle' : 'radiobox-blank'}
              color={done ? 'green' : 'gray'}
              size={32}
              containerStyle={{ backgroundColor: 'white' }}
            />
            {
              isLastItem && (
                <View style={{
                  flex: 1,
                  width: 2,
                  height: '100%',
                  backgroundColor: 'gray'
                }} />
              )
            }
          </View>
        </View>

        <View style={{
          flex: 0.8,
           marginLeft: 15,
          marginBottom: 20,
        }}>
          <Text style={{
            fontFamily: 'nunito-semibold',
            fontSize: 20,
          }}>{_.startCase(checkpoint.key)}</Text>
          <Text style={{
            fontFamily: 'nunito-semibold',
            fontSize: 20,
          }}>{checkpointMoment.format('ddd - MMM DD, YYYY')}</Text>
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

   // const progressValue = Number(fundraiser.current)
    //const progressMax = Number(fundraiser.card_goal)

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
            marginBottom: 10,
          }}>
            <Text style={{
              fontFamily: 'nunito-bold',
              fontSize: 20,
              textAlign: 'center'
            }}>CHECK POINTS</Text>
          </View>
          {_.map(orderedCheckpoints, renderCheckpoint)}
          <View style={{
            borderTopWidth: 1,
            marginTop: 40
          }}>
            <Image
              source={require("../assets/FramenLogin.png")}
              resizeMode='contain'
              style={{
                width: wp(40),
                height: wp(40),
                alignSelf: 'center',

              }}
            />
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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

export default FundraiserCheckpointsScreen