import React, { useState, useEffect, useCallback } from 'react'
import { Platform, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, Image, ImageBackground, Dimensions, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import _ from 'lodash'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { utils } from '../Utils/utils'

import { extraApiService } from '../Services/extraApiService';
import { showMessage } from 'react-native-flash-message';
import { userService } from '../Services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox, Icon } from 'react-native-elements';
import moment from 'moment';

const { width, height } = Dimensions.get("screen");

const SearchFundraiserScreen = props => {

  const [passwordFormVisible, setPasswordFormVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectingTeam, setSelectingTeam] = useState(false)

  const [firstName, setFirstName] = useState(props.route.params?.firstName || '')
  const [lastName, setLastName] = useState(props.route.params?.lastName || '')
   const [role, setRole] = useState('Player')
  const [password, setPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [data, setData] = useState([])

  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log(props.route.params);
    setData(props.route.params?.teams)
  }, [])

  const onFundraiserTeamPress = team => {

    console.log('onFundraiserTeamPress', team);

    setSelected(team)
    setSelectedTeam(null)
    setPassword('')
     setRole('Player')
    setPasswordFormVisible(true)
  }

  const onJoinFundraiser = async () => {

    Keyboard.dismiss()

    if (!selectedTeam) {
      showMessage({
        type: 'warning',
        message: 'You need to select a Sub-Team'
      })
      return
    }

    if (!_.trim(firstName) || !_.trim(lastName)) {
      showMessage({
        type: 'warning',
        message: 'Enter your name'
      })
      return
    }

    if (_.trim(selected.admin_password) || _.trim(selected.team_password)) {

      if (!_.trim(password)) {
        console.log('empty password');
        showMessage({
          type: 'warning',
          message: 'Enter the password'
        })
        return
      }

      if ((password !== _.trim(selected.admin_password)) && (password !== _.trim(selected.team_password))) {
        console.log('wrong password', selected.admin_password, selected.team_password);
        showMessage({
          type: 'danger',
          message: 'Wrong password! Try again'
        })
        return
      }
    }

    setPasswordFormVisible(false)

    try {

      setSubmitting(true)

      const access_token = JSON.parse(await AsyncStorage.getItem('TOKEN'));
      const role = password == _.trim(selected.admin_password) ? 'Coach' : 'Player'

      const payload = {
        access_token,
        fundraiser_type_id: selected.id,
        first_name: firstName,
        last_name: lastName,
        fundraiser_role: role,
        fundraiser_team: selectedTeam
      }

      const resp = await userService.updateProfile(payload);

      console.log("userService.updateProfile", resp)

      setSubmitting(false)

      if (resp.data?.status == 'success') {

        showMessage({
          type: "success",
          message: "Your profile has been updated.",
        });

        AsyncStorage.setItem("@fundraiser_type_id", JSON.stringify(selected.id));
        AsyncStorage.setItem("@fundraiser_role", JSON.stringify(role));
        firstName && AsyncStorage.setItem("@first_name", JSON.stringify(firstName));
        lastName && AsyncStorage.setItem("@last_name", JSON.stringify(lastName));
        resp.data?.sharelink && AsyncStorage.setItem("@sharelink", JSON.stringify(resp.data?.sharelink));
        resp.data?.leaderboard && AsyncStorage.setItem("@leaderboard", JSON.stringify(resp.data?.leaderboard));

         props.navigation.navigate({
           name: 'userFundraiser',
           params: { refresh: moment().toISOString() },
           merge: true
         })
        props.navigation.goBack()
      } else {

        showMessage({
          type: "danger",
          message: 'Could not update your profile'
        });
      }

    } catch (error) {
      console.log('userService.updateProfile error', error);
      setSubmitting(false)
      showMessage({
        type: "danger",
        message: 'Could not update your profile'
      });
    }
  };

  const renderFormHeader = () => {

    if (selectingTeam) {

      return (
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20
        }}>
          <Icon
            type='material-community'
            name='arrow-left'
            color='#555'
            onPress={() => setSelectingTeam(false)}
          />
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: height * 0.022,
              color: "grey",
              textAlign: 'center',
              marginHorizontal: 20,
            }}
          >Select a team</Text>
        </View>
      )
    }

    return (
      <Text
        style={{
          fontFamily: "Nunito-Regular",
          fontSize: height * 0.022,
          color: "grey",
          textAlign: 'center',
          marginHorizontal: 20,
        }}
      >{`Enter your name, fundraiser password and select role to join the\n${selected.fundraiser_name}`}</Text>
    )
  }

  const renderFormContent = () => {

    if (selectingTeam) {
      return (
        <ScrollView style={{ margin: 20, }}>
          {
            _.map(selected.team, (team, index) => (
              <TouchableOpacity
                key={`${index}`}
                onPress={() => {
                  setSelectedTeam(team)
                  setSelectingTeam(false)
                }}>
                <View>
                  <Text
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 15,
                      backgroundColor: 'white',
                      fontFamily: 'Nunito-Semibold',
                      fontSize: 18,
                      color: '#555'
                    }}
                    numberOfLines={1}
                  >{team}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </ScrollView>
      )
    }

    return (
      <View
        style={{
          marginHorizontal: 20,
          marginVertical: 30
        }}
      >
        {
          !_.isEmpty(selected.team) ? (
            <TouchableOpacity onPress={() => {
              Keyboard.dismiss()
              setSelectingTeam(true)
            }}>
              <View
                style={{
                  flexDirection: 'row',
                  borderColor: '#555',
                  borderWidth: 1,
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 10
                }}
              >
                <Text style={{
                  flex: 1,
                  fontFamily: 'Nunito-Regular',
                  fontSize: height * 0.02,
                  color: selectedTeam ? 'black' : '#ccc',
                  textAlign: 'center',
                }}>{selectedTeam ? selectedTeam : 'Select a team'}</Text>
                <Icon
                  type='material-community'
                  name='arrow-right'
                  color='#555'
                />
              </View>
            </TouchableOpacity>
          ) : null
        }
        <TextInput
          style={{
            fontFamily: 'Nunito-Regular',
            fontSize: height * 0.02,
            color: 'black',
            textAlign: 'center',
            borderColor: '#555',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginBottom: 10
          }}
          placeholder='First name'
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={{
            fontFamily: 'Nunito-Regular',
            fontSize: height * 0.02,
            color: 'black',
            textAlign: 'center',
            borderColor: '#555',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginBottom: 10
          }}
          placeholder='Last name'
          value={lastName}
          onChangeText={setLastName}
        />
        {
          (_.trim(selected.admin_password) || _.trim(selected.team_password)) ? (
            <TextInput
              style={{
                fontFamily: 'Nunito-Regular',
                fontSize: height * 0.02,
                color: 'black',
                textAlign: 'center',
                borderColor: '#555',
                borderWidth: 1,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10
              }}
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
            />
          ) : null
        }
        {/* <View style={{
          flexDirection: 'row'
        }}>

          <CheckBox
            containerStyle={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 0
            }}
            title='Admin'
            textStyle={{
              fontFamily: 'Nunito-Regular',
              fontSize: height * 0.02,
              fontWeight: 'normal',
              color: 'black',
            }}
            center
            iconType='material-community'
            checked={role == 'Coach'}
            onPress={() => setRole('Coach')}
            checkedIcon='checkbox-marked-outline'
            checkedColor='#555'
            uncheckedIcon='checkbox-blank-outline'
          />
          <CheckBox
            containerStyle={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 0
            }}
            title='Participant'
            textStyle={{
              fontFamily: 'Nunito-Regular',
              fontSize: height * 0.02,
              fontWeight: 'normal',
              color: 'black',
            }}
            iconType='material-community'
            checked={role == 'Player'}
            onPress={() => setRole('Player')}
            checkedColor='#555'
            checkedIcon='checkbox-marked-outline'
            uncheckedIcon='checkbox-blank-outline'
          />
        </View> */}
      </View>
    )
  }

  const renderFormFooter = () => {

    if (selectingTeam) {
      return (
        <TouchableOpacity onPress={() => setSelectingTeam(false)}>
          <View style={{
            marginHorizontal: 20,
            justifyContent: "center",
            borderRadius: 25,
            height: Theme.buttonHeight,
            backgroundColor: Theme.screenBackground,
          }}>
            <Text style={{
              color: "#fff",
              fontSize: 14,
              textAlign: "center",
              fontFamily: "Nunito-Bold",
            }}>Back</Text>
          </View>
        </TouchableOpacity>
      )
    }

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
         marginTop: 25,
      }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setPasswordFormVisible(false)}
        >
          <View style={{
            marginHorizontal: 20,
            justifyContent: "center",
            borderRadius: 25,
            height: Theme.buttonHeight,
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
          onPress={onJoinFundraiser}
        >
          <View style={{
            marginHorizontal: 20,
            justifyContent: "center",
            borderRadius: 25,
            height: Theme.buttonHeight,
            backgroundColor: Theme.redButtonColor,
          }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "Nunito-Bold",
              }}
            >Join</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderPasswordForm = () => {

    if (!passwordFormVisible || !selected) {
      return null
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <SafeAreaView style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{
            width: width * 0.9,
            maxHeight: height * 0.7,
            borderRadius: 15,
            backgroundColor: 'white',
            paddingVertical: 20,
          }}>
            {renderFormHeader()}
            {renderFormContent()}
            {renderFormFooter()}
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const renderEmptyList = () => {

    if (!searchText.trim()) {
      return null
    }

    return (
      <View style={{ paddingLeft: 15 }}>
        <Text
          style={{
            fontFamily: "Nunito-Italic",
            fontSize: 16,
            color: "#051533",
            margin: 15
          }}
        >No results found.</Text>
      </View>
    )
  }

  const renderSeparator = () => (
    <View
      style={{
        height: 0.5,
         width: '100%',
        flex: 1,
        backgroundColor: "lightgrey",
         alignSelf: "center",
        marginHorizontal: 30
      }}
    />
  )

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => onFundraiserTeamPress(item)}>
        <Text
          style={{
            paddingHorizontal: 30,
            paddingVertical: 15,
            backgroundColor: 'white',
            fontFamily: 'Nunito-Semibold',
            fontSize: 18,
            color: '#555'
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >{item.fundraiser_name}</Text>
      </TouchableOpacity>
    )
  }

  const renderList = () => {

    const filtered = !searchText.trim() ?
      data : _.filter(data, item => utils.normalizedSearchText(item.fundraiser_name, searchText))

    if (submitting) {
      return (
        <ActivityIndicator
          style={{
            justifyContent: "center",
            marginTop: "50%",
            backgroundColor: '#fff'
          }}
          size="large"
          color="#000"
        />
      )
    }

    return (
      <FlatList
        contentContainerStyle={{
          paddingBottom: insets.bottom
        }}
        data={filtered}
        keyExtractor={(item, index) => `${index}`}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ItemSeparatorComponent={renderSeparator}
        keyboardShouldPersistTaps='always'
        ListHeaderComponent={(
          <Text style={{
            fontSize: 14,
            fontFamily: "Nunito-Regular",
            textAlign: "center",
            marginVertical: 10,
            color: "#555",
          }}>Select a fundraiser team to join</Text>
        )}
      />
    )
  }

  return (
    <KeyboardAvoidingView style={{
      flex: 1,
      backgroundColor: '#fff',
    }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ImageBackground
            style={{
              width: wp("100%"),
              resizeMode: "cover",
               height: hp("18%"),
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 15,
              paddingBottom: 20
            }}
            source={require("../assets/topNew.png")}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp("5"),
              marginHorizontal: 20
            }}>

              <TouchableOpacity
                onPress={() => props.navigation.goBack()}
              >
                <Image
                  style={{
                  }}
                  source={require("../assets/back.png")}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Nunito-Bold",
                  color: "#fff",
                }}
              >Search Fundraisers</Text>
              <View style={{ width: 32 }} />
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              marginHorizontal: 20,
            }}>

              <TextInput
                editable={!submitting}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                   marginRight: 10,
                  fontSize: 18,
                  fontFamily: 'Nunito-Regular',
                  borderRadius: 8,
                  color: '#555'
                }}
                placeholder='Type to search...'
                autoFocus
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </ImageBackground>
          {renderList()}
          {renderPasswordForm()}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default SearchFundraiserScreen