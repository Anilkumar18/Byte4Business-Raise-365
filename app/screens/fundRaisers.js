import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  SafeAreaView,
  Linking
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import DropDownItem from "react-native-drop-down-item";
import { extraApiService } from "../Services/extraApiService";
import ImageLoad from 'react-native-image-placeholder';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import { Icon, Button } from 'react-native-elements'
import { utils } from '../Utils/utils'
import _ from 'lodash'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const FundRaiserScreen = (props) => {
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [activeSections, setActiveSections] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')

  const [visible, setVisible] = useState(true)
  const [sections, setSections] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    (async () => {
      try {

        const fundraiser_ids = props.route.params?.data?.tags || []
        console.log('FundRaiserScreen params', props.route.params);

        const payload = {
          fundraiser_ids
        }

        console.log("extraApiService.getFundraisers payload", payload)
        let resp = await extraApiService.getFundraisers(payload)
        setLoading(false)
        console.log("extraApiService.getFundraisers", resp.data)
        setData(resp.data.fundraisers)

      } catch (error) {
        console.log("erroro", error)
        setLoading(false);
        utils.checkAuthorized(error, props.navigation)
      }
    })();
  }, []);

  const toggleSearch = () => {
    setSearching(!searching)
    setSearchText('')
  }

  const renderFundraiserType = fundraiserData => {
    return _.map(fundraiserData.fundraiser_types, item => (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("discover", { fundraiserType: item, fundraiserData, hideCheckbox: true });
        }}
        key={item.id}
        style={{
          width: wp("30%"),
          justifyContent: "center",
        }}
      >

        <ImageLoad
          style={{ width: 30, height: 30, alignSelf: "center" }}

          loadingStyle={{ size: 'large', color: 'blue' }}
          placeholderStyle={{ width: 30, height: 30, alignSelf: "center" }}

          source={item.image ? { uri: item.image } : require("../assets/pizza.png")}
        />

        <Text
          style={{
            fontSize: 12,
            color: "#051533",
            fontFamily: "Nunito-Regular",
            textAlign: "center",
          }}
        >
          {item.name}
        </Text>

        <View
          style={{
            height: 1,
            width: wp("30%"),
            backgroundColor: "lightgrey",
            alignSelf: "center",
            marginLeft: 10,
            marginTop: 15,
            marginBottom: 15,
          }}
        ></View>


      </TouchableOpacity >
    ))
  }

  const _updateSections = activeSections => {
    setActiveSections(activeSections)
  };

  const _renderHeader = (item, index, isActive) => {
    if (searching &&
      !utils.normalizedSearchText(item.fundraiser.fundraiser_name, searchText) &&
      !_.some(item.fundraiser_types, type => utils.normalizedSearchText(type.name, searchText))
    ) {
      return <View />
    }
    return <View style={styles.userInfoSection}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: 'center',
          marginTop: 9,
        }}
      >
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <ImageLoad
            style={{
              width: 50,
              height: 50,
              alignSelf: "center"
            }}
            loadingStyle={{ size: 'large', color: 'blue' }}
            placeholderStyle={{
              width: 50,
              height: 50,
              alignSelf: "center"
            }}
            resizeMode='contain'
            source={item.fundraiser.logo ? { uri: item.fundraiser.logo } : require("../assets/tea.png")}
          />
          <View
            style={{
              marginLeft: 15,
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: "Nunito-SemiBold" }}>
              {item.fundraiser.fundraiser_name}
            </Text>

          </View>
        </View>

        {
          !selectedItem ? (
            <TouchableOpacity onPress={() => setSelectedItem(item)}>
              <View style={{
                justifyContent: "center",
                paddingHorizontal: 15,
              }}>
                <Icon
                  name='information-outline'
                  type='material-community'
                  size={36}
                />
              </View>
            </TouchableOpacity>
          ) : null
        }
      </View>
    </View>
  }

  const _renderContent = (item) => {
    return (
      <View style={styles.dropdwonSection}>
        <View style={{
          flexDirection: "row",
          flexWrap: 'wrap',
        }}>
          {renderFundraiserType(item)}
        </View>
      </View >
    )
  }

  const renderContent = () => {

    if (isLoading) {
      return <ActivityIndicator color="#000" size="large" />
    }

    if (selectedItem) {
      const { name, phone, email, description } = selectedItem.fundraiser
      return (
        <SafeAreaView style={{
          flex: 1,
        }}>
          {_renderHeader(selectedItem)}
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            margin: 15,
          }}>

            <ScrollView
              contentContainerStyle={{
                padding: 30
              }}
            >

              {name ? <Text style={styles.infoText}>{`Contact: ${name}`}</Text> : null}
              {phone ? <Text style={styles.infoText}>{`Phone: ${phone}`}</Text> : null}
              {email ? <Text style={styles.infoText}>E-mail: <Text style={{ color: '#0B0080', textDecorationLine: 'underline' }}>{email}</Text></Text> : null}
              {description ? <Text style={styles.infoText}>{`\nDescription:\n${description}`}</Text> : null}

            </ScrollView>

            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <View style={{
                borderWidth: 1,
                borderColor: 'black',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                alignSelf: 'center',
                marginVertical: 15
              }}>
                <Text style={{
                  fontFamily: 'Nunito-Semibold',
                  fontSize: 18
                }}>
                  close
            </Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )
    }

    return (
      <ScrollView>
        <Accordion
          sections={data}
          activeSections={activeSections}
          onChange={_updateSections}
          renderHeader={_renderHeader}
          renderContent={_renderContent}
        />
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.splash}
        source={require("../assets/topNew.png")}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <Image
            style={{
              marginTop: hp("5"),
              left: 20,
            }}
            source={require("../assets/back.png")}
          />
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: wp("90%"),
          marginLeft: wp("5%"),
          marginTop: hp(2),
        }}>

          <View style={{ minWidth: 40 }} />

          {
            searching ?
              <TextInput
                style={{
                  fontSize: height * 0.032,
                  fontFamily: "Nunito-Bold",
                  color: "#fff",
                  borderBottomColor: '#fff',
                  borderBottomWidth: 0.5,
                  flex: 1,
                  marginHorizontal: 20,
                  textAlign: 'center',
                }}
                autoFocus
                autoCorrect={false}
                value={searchText}
                onChangeText={setSearchText}
                selectionColor='white'
              /> :
              <Text
                style={{
                  fontSize: height * 0.032,
                  fontFamily: "Nunito-Bold",
                  // position: "absolute",
                  // top: height * 0.12,
                  // left: 20,
                  color: "#fff",
                }}
              > Local Fundraisers </Text>
          }
          {
            isLoading ?
              <View style={{ minWidth: 40 }} /> : (
                <TouchableOpacity onPress={toggleSearch}>
                  {
                    searching ?
                      <Image
                        style={{ height: 40, width: 40 }}
                        source={require("../assets/close.png")}
                      /> :
                      <Image
                        style={{ height: 40, width: 40 }}
                        source={require("../assets/search.png")}
                      />
                  }
                </TouchableOpacity>
              )
          }
        </View>
      </ImageBackground>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    height: hp("20%"),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  userInfoSection: {
    paddingLeft: 10,
    height: 70,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),

    borderRadius: 10,
  },
  dropdwonSection: {
    // height: 115,
    alignSelf: "center",
    marginTop: 13,
    width: wp("93%"),
    borderRadius: 10,
  },
  logo: {
    //position: "absolute",
    //top: hp("30%"),
  },
  infoText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18
  },
  viewBack: {
    backgroundColor: "#fff",
    bottom: hp("5%"),
    height: hp("70%"),
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  inputStyle: {
    marginLeft: 15,
    color: "#051533",
    fontFamily: "Nunito-Regular",
    fontSize: 19,
  },
  inputContainer: {
    color: "#051533",
    marginTop: 20,
    alignSelf: "center",
    justifyContent: "center",
    height: Theme.textInputHeight,

    width: "85%",
  },
  inputNameContainer: {
    color: "#051533",
    marginTop: 30,
    alignSelf: "center",
    width: "85%",
  },
  buttonContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: 30,
    backgroundColor: Theme.redButtonColor,
    width: "35%",
  },
  buttonDeleteContainer: {
    color: "#fff",
    marginTop: 25,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 25,
    height: 30,
    borderWidth: 1,
    borderColor: Theme.redButtonColor,
    width: "35%",
  },
});

export default FundRaiserScreen;
