import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native'
import { Icon } from 'react-native-elements'
import ImageLoad from 'react-native-image-placeholder';

import _ from 'lodash'

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export function ClosestBusinessModal(props) {

  const [selected, setSelected] = useState(null)
  useEffect(() => {
    if (props.data && props.data.length > 0) {
      setSelected(props.data[0])
    }
  }, [])

  if (!props.data) {
    return null
  }

  const subtitle = props.data.length > 1 ?
    `We noticed you are now close to some business. Select a business to view their profile` :
    `We noticed you are now at ${props.data[0].name}. Would you like to view their profile?`

  return (
    <Modal visible transparent>
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)'
      }}>
        <View style={{
          backgroundColor: 'white',
          // alignItems: 'center',
          justifyContent: 'center',
          maxWidth: width * 0.85,
          maxHeight: height * 0.8,
          paddingTop: 20,
          borderRadius: 15
        }}>
          <Text style={{
            fontFamily: 'Nunito-bold',
            fontSize: 20,
            marginBottom: 10,
            marginHorizontal: 20,
            textAlign: 'center'
          }}>Business Found</Text>
          <Text style={{
            fontFamily: 'Nunito-Regular',
            paddingHorizontal: 20,
            marginBottom: 15,
            textAlign: 'center'
          }}>{subtitle}</Text>

          {
            props.data.length > 1 ? (
              <FlatList
                bounces={false}
                data={props.data}
                style={{ flex: 1 }}
                style={{ flexGrow: 0, marginBottom: 15 }}
                keyExtractor={(item, index) => `${index}`}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 0.5,
                      backgroundColor: '#ccc',
                      marginRight: 20,
                      marginLeft: 50
                    }}
                  />
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelected(item)} >
                    <View style={{
                      marginVertical: 10,
                      marginHorizontal: 15,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Icon
                        name='check'
                        type='material-community'
                        color={selected && selected.id == item.id ? 'green' : 'transparent'}
                        size={24}
                        style={{ marginRight: 10 }}
                      />
                      <ImageLoad
                        style={{
                          width: 30,
                          height: 30,
                          // borderRadius: 15,
                          marginRight: 10,
                          alignSelf: "center",
                          // backgroundColor: '#ccc'
                        }}
                        loadingStyle={{ size: 'large', color: 'blue' }}
                        placeholderStyle={{
                          width: 30,
                          height: 30,
                          // borderRadius: 15,
                          alignSelf: "center"
                        }}
                        resizeMode='contain'
                        source={{ uri: item.logo }}
                      />
                      <Text style={{
                        fontFamily: 'Nunito-Semibold',
                        fontSize: 18,
                      }}
                        numberOfLines={2}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : null
          }
          <View style={{
            flexDirection: 'row',
            // alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
              borderWidth: 0.5,
              borderColor: '#ccc',
              padding: 10,
              borderBottomLeftRadius: 15
            }}>
              <Text
                style={{
                  fontFamily: 'Nunito-Semibold',
                  fontSize: 18,
                  color: 'rgb(0,122,255)',
                  textAlign: 'center'
                }}
                onPress={() => props.onCancel(props.data)}>Cancel</Text>
            </View>
            <View style={{
              flex: 1,
              alignItems: 'center',
              borderWidth: 0.5,
              borderColor: '#ccc',
              padding: 10,
              borderBottomRightRadius: 15
            }}>

              <Text
                style={{
                  fontFamily: 'Nunito-Regular',
                  fontSize: 18,
                  color: 'rgb(0,122,255)',
                  textAlign: 'center'
                }}
                onPress={() => props.onConfirm(selected, props.data)}>View</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal >
  )
}