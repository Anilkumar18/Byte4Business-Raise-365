import React, { useState, useEffect, useContext, createRef } from 'react'
import { View, Alert, KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback, SectionList, PermissionsAndroid, ScrollView, Modal, Text, Image, ActivityIndicator, TextInput, Keyboard, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native'
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
import { TextInputMask } from 'react-native-masked-text'
import Contacts from 'react-native-contacts';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FlatList, RectButton } from 'react-native-gesture-handler';
import _, { concat } from 'lodash'
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

const Button = ({ title, disabled = false, onPress, containerStyle, buttonStyle, titleStyle, icon, ...props }) => {

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
          <View>
            <Icon
              type='material-community'
              size={30}
              containerStyle={{
                marginRight: 20,
              }}
              {...icon}
            />
            {
              icon.badge ?
                <Badge
                  value={icon.badge > 99 ? '+99' : icon.badge}
                  badgeStyle={{
                    backgroundColor: Theme.redButtonColor,
                  }}
                  containerStyle={{
                    position: 'absolute',
                    top: -5,
                    left: -10
                  }}
                /> :
                null
            }
          </View>
        ) : null
      }
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              textAlign: "center",
              fontFamily: "Nunito-Bold",
              ...titleStyle,
            }}
            adjustsFontSizeToFit
          >{title}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const AddContactModal = ({
  visible,
  initialValues,
  onClose = _.noop,
  onSubmit = _.noop,
  ...props
}) => {

  useEffect(() => {
    if (!visible) {
      setName('')
      setPhone('')
      setEmail('')
    } else {
      if (initialValues) {
        setName(_.trim(initialValues.name) || '')
        setPhone(_.trim(initialValues.phone) || '')
        setEmail(_.trim(initialValues.email) || '')
      }
    }
  }, [visible])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  let phoneRef = React.createRef();
  let emailRef = React.createRef();

  if (!visible) {
    return null
  }

  const canSubmit = !!_.trim(name) && (!!_.trim(phone) || !!_.trim(email))

  const inputStyle = {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  }

  const submit = () => {

    Keyboard.dismiss()

    const isValidEmail = !!_.trim(email) ? /^\w+([\.\-\+]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) : true

    if (isValidEmail) {
      onSubmit({ ...initialValues, name, phone, email })
      onClose()
    } else {
      showMessage({ message: "Please enter a valid email", type: "warning" })
    }
  }

  const actionTitle = initialValues ? 'Update' : 'Add'

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
          borderRadius: 15,
          backgroundColor: 'white',
          paddingVertical: 20,
           alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: height * 0.022,
              color: "grey",
              textAlign: 'center'
            }}
          >{actionTitle} Contact</Text>

          <View style={{
            margin: 20,
          }}>
            <TextInput
              autoFocus
              style={inputStyle}
              placeholder='Contact Name'
              placeholderTextColor='gray'
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.getElement().focus()}
            />
            {/* <TextInput
              ref={phoneRef}
              style={inputStyle}
              placeholder='Phone'
              value={phone}
              onChangeText={setPhone}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current.focus()}
            /> */}
            <TextInputMask
              ref={phoneRef}
              type='custom'
              options={{ mask: '(999) 999-9999' }}
              style={inputStyle}
              placeholder="Phone"
              placeholderTextColor='gray'
              value={phone}
              onChangeText={setPhone}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current.focus()}
              keyboardType='numeric'
            />
            <TextInput
              ref={emailRef}
              style={inputStyle}
              placeholder='E-mail'
              placeholderTextColor='gray'
              value={email}
              onChangeText={setEmail}
              returnKeyType="done"
              keyboardType='email-address'
              onSubmitEditing={() => submit()}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
             marginTop: 25,
          }}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={onClose}
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
              onPress={submit}
              disabled={!canSubmit}
            >
              <View style={{
                marginHorizontal: 20,
                justifyContent: "center",
                borderRadius: 25,
                height: Theme.buttonHeight,
                backgroundColor: canSubmit ? Theme.redButtonColor : 'gray',
              }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    textAlign: "center",
                    fontFamily: "Nunito-Bold",
                  }}
                >{actionTitle}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}


const ImportContactModal = ({ visible, onSubmit, onClose, ...props }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [contacts, setContacts] = useState([])
  const [selected, setSelected] = useState([])

  const insets = useSafeAreaInsets()

  useEffect(() => {

    if (visible) {
      loadData()
    } else {
      setLoading(false)
      setError('')
      setSearchText('')
      setContacts([])
      setSelected([])
    }
  }, [visible])

  const loadData = async () => {

    try {

      setLoading(true)

      const contactsResponse = await Contacts.getAll()

      setContacts(contactsResponse)

      console.log('loadContacts response', contactsResponse);

      setLoading(false)

    } catch (error) {
      console.log('loadContacts error', error);
      setLoading(false)
    }
  }

  const submit = () => {
    Keyboard.dismiss()
    onSubmit(
      _.map(selected, contact => ({
        name: getDisplayName(contact),
        phone: _.get(_.first(contact.phoneNumbers), 'number', ''),
        email: _.get(_.first(contact.emailAddresses), 'email', '')
      }))
    )
    onClose()
  }

  const getDisplayName = ({ displayName, givenName, familyName }) =>
    displayName ? displayName : `${givenName} ${familyName}`

  const renderContact = ({ item }) => {

    const isSelected = !!_.find(selected, { recordID: item.recordID })

    const name = getDisplayName(item)
    const phone = _.get(_.first(item.phoneNumbers), 'number', '')
    const email = _.get(_.first(item.emailAddresses), 'email', '')

    return (
      <TouchableOpacity onPress={() => {
        console.log('item', item);
        setSelected(_.xorBy(selected, [item], 'recordID'))
      }}>
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 10,
          alignItems: 'center',
        }}>


          <Icon
            type='material-community'
            name='check-circle'
            color={isSelected ? 'green' : 'white'}
            containerStyle={{
              marginRight: 15,
            }}
          />

          <Avatar
            rounded
            size={50}
            source={item.thumbnailPath ? { uri: item.thumbnailPath } : undefined}
            title={utils.getInitials(getDisplayName(item))}
            containerStyle={{
              backgroundColor: 'darkgray',
            }}
          />

          <View style={{
            flex: 1,
          }}>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontFamily: 'Nunito-Regular',
              marginLeft: 10
            }}
              numberOfLines={2}
            >{name}</Text>

            <Text style={{
              flex: 1,
              fontSize: 12,
              fontFamily: 'Nunito-Regular',
              marginLeft: 10,
              color: 'gray'
            }}
              numberOfLines={2}
            >{phone} - {email}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const canSubmit = selected.length > 0

  const title = canSubmit ? `${selected.length} selected` : 'Contacts'

  const filteredContacts = !!_.trim(searchText) ?
    _.filter(contacts, contact => {
      return (
        utils.normalizedSearchText(getDisplayName(contact), searchText) ||
        utils.normalizedSearchText(_.get(_.first(contact.phoneNumbers), 'number', ''), searchText) ||
        utils.normalizedSearchText(_.get(_.first(contact.emailAddresses), 'email', ''), searchText)
      )
    }) : contacts

  const groupedContacts = _.sortBy(
    _.map(
      _.groupBy(filteredContacts, contact => getDisplayName(contact)[0]), (data, title) => ({ title, data })
    ),
    'title'
  )

  return (
    <Modal visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingTop: insets.top + 10,
           paddingBottom: insets.bottom,
        }}
      >

        <View style={{
          flexDirection: 'row',
          borderBottomColor: '#ddd',
          borderBottomWidth: 1,
          paddingBottom: 10,
          paddingHorizontal: 10,
        }}>

          <View style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>

            <Icon
              type='material-community'
              name='arrow-left-circle'
              size={32}
              color='gray'
              onPress={onClose}
            />
          </View>

          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Nunito-SemiBold',
              textAlign: 'center',
              color: '#147EFB'
            }}>{title}</Text>
          </View>

          <TouchableOpacity
            style={{ flex: 1, }}
            onPress={() => submit()}
            disabled={!canSubmit}
          >
            <View style={{
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Nunito-Regular',
                color: canSubmit ? '#147EFB' : 'gray'
              }}>Confirm</Text>
            </View>
          </TouchableOpacity>
        </View>
        {
          loading ? (
            <ActivityIndicator
              style={{
                marginTop: 30,
              }}
              color='black'
              size='large'
            />
          ) : (
            <>
              <View style={{
                paddingHorizontal: 10,
                marginHorizontal: 10,
                marginVertical: 10,
                flexDirection: 'row',
                backgroundColor: '#ededed',
                borderColor: '#ededed',
                borderRadius: 5,
                borderWidth: 1,
                alignItems: 'center',
                 justifyContent: 'center'
              }}>

                <Icon type='ionicon' name='search-sharp' color='gray' size={18} />

                <TextInput
                  style={{
                     flex: 1,
                    fontSize: 16,
                    fontFamily: 'Nunito-Regular',
                    paddingVertical: 0,
                  }}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder='Search Contacts'
                />

              </View>

              <SectionList
                sections={groupedContacts}
                keyExtractor={(item, index) => `${item.recordID}`}
                renderItem={renderContact}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={{
                    backgroundColor: '#ddd',
                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    marginBottom: 5,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: 'Nunito-Regular'
                    }}>{_.toUpper(title)}</Text>
                  </View>
                )}
              />

              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#efefef',
                  paddingBottom: insets.bottom
                }}>

                <TouchableOpacity
                  style={{ flex: 0.5, }}
                  onPress={() => setSelected(contacts)}
                >
                  <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: 'Nunito-Regular',
                      color: '#147EFB'
                    }}>Select All Contacts</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 0.5, }}
                  onPress={() => setSelected([])}
                >
                  <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: 'Nunito-Regular',
                      color: '#147EFB'
                    }}>Select None</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )
        }

      </View >
    </Modal >
  )
}

const FundraiserContactsScreen = props => {

  const user = props?.route?.params?.user
  const data = props?.route?.params?.data
  const userTeam = props?.route?.params?.userTeam
  const fundraiserRole = props?.route?.params?.fundraiserRole
  const fundraiser = _.first(data)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)

  const [contacts, setContacts] = useState([])

  const [updateValues, setUpdateValues] = useState(null)

  const isFocused = useIsFocused();

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  let refs = {}

  useEffect(() => {
    if (isFocused) {
      loadData()
    } else {
      setAddModalVisible(false)
    }
  }, [isFocused]);

  const loadData = async () => {
    try {

      setLoading(true)
      console.log('extraApiService.getFundraiserContacts');
      const response = await extraApiService.getFundraiserContacts()
      console.log('extraApiService.getFundraiserContacts response', response.data);
      setContacts(response.data)
      setLoading(false)

    } catch (error) {
      console.log('extraApiService.getFundraiserContacts error', error);
      setLoading(false)
    }
  }

  const onAddContacts = async selectedContacts => {

    const selectedContactList = _.castArray(selectedContacts)

    try {

      setSubmitting(true)

      const payload = { contacts: selectedContactList }

      console.log('extraApiService.addFundraiserContacts', payload);
      const response = await extraApiService.addFundraiserContacts(payload)
      console.log('extraApiService.addFundraiserContacts response', response.data);

      setSubmitting(false)

      if (response.data?.success) {

        const addedContacts = _.castArray(response.data.data)

        if (addedContacts.length > 0) {
          setContacts([...contacts, ...addedContacts])
          showMessage({ type: 'success', message: response.data.success })
        } else {
          showMessage({ type: 'warning', message: response.data.error || 'Could not add this contact' })
        }
      } else {
        showMessage({ type: 'danger', message: response.data.error || 'Could not add this contact' })
      }
    } catch (error) {
      console.log('extraApiService.addFundraiserContacts error', error);
      setSubmitting(false)
    }
  }

  const onUpdateContact = async selectedContact => {

    try {

      setSubmitting(true)

      const payload = {
        id: selectedContact.id,
        name: selectedContact.name,
        phone: selectedContact.phone,
        email: selectedContact.email
      }

      console.log('extraApiService.updateFundraiserContact', payload);
      const response = await extraApiService.updateFundraiserContact(payload)
      console.log('extraApiService.updateFundraiserContact response', response.data);

      setSubmitting(false)

      if (response.data?.success) {

        showMessage({ type: 'success', message: response.data.success })

        setContacts(_.map(contacts, contact => contact.id == selectedContact.id ? selectedContact : contact))
      } else {
        showMessage({ type: 'danger', message: response.data.error || 'Could not upadte this contact' })
      }
    } catch (error) {
      console.log('extraApiService.updateFundraiserContact error', error);
      setSubmitting(false)
    }
  }

  const removeFundraiserContact = async contact => {

    const oldContacts = contacts

    try {

      setContacts(_.filter(oldContacts, ({ id }) => id != contact.id))

      console.log('extraApiService.removeFundraiserContact', contact.id);
      const response = await extraApiService.removeFundraiserContact(contact.id)
      console.log('extraApiService.removeFundraiserContact response', response.data);

      if (response.data?.success) {
        showMessage({ type: 'success', message: response.data.success })
      } else {
        setContacts(oldContacts)
        showMessage({ type: 'danger', message: response.data.error || 'Could not remove this contact' })
      }
    } catch (error) {
      setContacts(oldContacts)
      console.log('extraApiService.removeFundraiserContact error', error);
    }
  }

  const removeAllFundraiserContacts = async () => {

    const oldContacts = contacts

    try {

      const contactIds = _.join(_.map(oldContacts, 'id'), '-')

      setContacts([])

      console.log('extraApiService.removeFundraiserContact', contactIds);
      const response = await extraApiService.removeFundraiserContact(contactIds)
      console.log('extraApiService.removeFundraiserContact response', response.data);

      if (response.data?.success) {
        showMessage({ type: 'success', message: response.data.success })
      } else {
        setContacts(oldContacts)
        showMessage({ type: 'danger', message: response.data.error || 'Could not remove your contacts' })
      }
    } catch (error) {
      setContacts(oldContacts)
      console.log('extraApiService.removeFundraiserContact error', error);
    }
  }

  const closeRow = contact => {
    refs[contact.id] && refs[contact.id].close()
  }

  const onDeleteContactPrompt = contact => {
    Alert.alert(
      'Delete contact',
      'Are you sure?',
      [
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => removeFundraiserContact(contact),
        },
        {
          text: 'No',
          style: 'cancel',
          onPress: () => closeRow(contact)
        }
      ]
    )
  }

  const onDeleteAllContactsPrompt = () => {
    Alert.alert(
      'Delete all contacts',
      'Are you sure?',
      [
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => removeAllFundraiserContacts(),
        },
        {
          text: 'No',
          style: 'cancel',
        }
      ]
    )
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

    //const progressValue = Number(fundraiser.current)
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

  const renderRightActions = contact => {
    return (
      <RectButton
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: 'darkgrey',
          flex: 1,
          justifyContent: 'flex-end'
        }}
        onPress={() => closeRow(contact)}
      >
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 20
        }}>
          <MaterialC
            name='delete'
            color='white'
            size={30}
          />
          <Text style={{
            fontSize: 16,
            fontFamily: 'Nunito-Semibold',
            color: 'white',
          }}>Delete</Text>
        </View>
      </RectButton>
    )
  }

  const renderContact = (contact, index) => {

    const name = `${contact.name}`

    return (
      <Swipeable
        key={contact.id}
        ref={e => refs[contact.id] = e}
        rightThreshold={60}
        renderRightActions={() => renderRightActions(contact)}
        onSwipeableRightWillOpen={() => onDeleteContactPrompt(contact)}
      >
        <TouchableOpacity
          key={index}
          onPress={() => {
            console.log('update contact', contact);
            setUpdateValues(contact)
            setAddModalVisible(true)
          }}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              paddingVertical: 10,
              marginHorizontal: 0,
              borderTopWidth: index == 0 ? 0 : 0.5,
            }}
          >
            <Icon type='material-community' name='account-circle' size={40} />
            <Text style={{
              fontFamily: 'Nunito-Regular',
              fontSize: 18,
              marginLeft: 15,
            }}>{name}</Text>
          </View>

        </TouchableOpacity>
      </Swipeable>
    )
  }

  const renderContactList = () => {

    if (contacts.length < 1) {
      return null
    }

    return (
      <>
        <Button
          containerStyle={{
            alignSelf: 'center',
          }}
          title='Delete All'
          titleStyle={{
            fontSize: 14
          }}
          buttonStyle={{
            marginHorizontal: 0,
            paddingHorizontal: 8,
            height: 25,
            flex: 0,
          }}
          onPress={onDeleteAllContactsPrompt}
        />
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "Nunito-Bold",
            color: '#555',
          }}>Swipe ← to delete a contact</Text>
        {_.map(contacts, renderContact)}
      </>
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

          {
            (loading || submitting) ? (
              <ActivityIndicator
                style={{
                  marginTop: "30%",
                }}
                size="large"
                color="#000"
              />
            ) : (
              <>
                <View style={{ flexDirection: 'row', }}>

                  <Button
                    title='ADD'
                    containerStyle={{ flex: 0.5 }}
                    onPress={() => {
                      setUpdateValues(null)
                      setAddModalVisible(true)
                    }}
                  />
                  <Button
                    title='IMPORT'
                    containerStyle={{ flex: 0.5 }}
                    onPress={async () => {

                      try {

                        if (Platform.OS == 'android') {
                          const status = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                            {
                              'title': 'Contacts',
                              'message': 'Allow this app to access your contacts?',
                              'buttonPositive': 'Yes',
                              'buttonNegative': 'No'
                            }
                          )
                          console.log('read contacts permission status', status);
                          if (status == 'granted') {
                            setImportModalVisible(true)
                          } else {
                            showMessage({
                              type: 'warning',
                              message: 'Permission required'
                            })
                          }
                        } else {

                          let status = 'denied'

                          status = await Contacts.checkPermission()

                          if (status === 'undefined') {
                            status = await Contacts.requestPermission()
                          }

                          if (status === 'authorized') {
                            setImportModalVisible(true)
                          } else {
                            showMessage({
                              type: 'warning',
                              message: 'Permission required'
                            })
                          }
                        }
                      }
                      catch (error) {
                        console.log('permission error', error);
                      }
                    }}
                  />
                </View>

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
                  }}>{`${contacts.length} CONTACTS`}</Text>
                </View>
                {renderContactList()}
              </>
            )
          }
        </ScrollView>
      </View>
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
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {renderHeader()}
          {renderContent()}

          <AddContactModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onSubmit={values => values.id ? onUpdateContact(values) : onAddContacts(values)}
            initialValues={updateValues}
          />

          <ImportContactModal
            visible={importModalVisible}
            onClose={() => setImportModalVisible(false)}
            onSubmit={onAddContacts}
          />

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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

export default FundraiserContactsScreen
