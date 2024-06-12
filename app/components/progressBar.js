import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import _ from 'lodash'

import { utils } from '../Utils/utils'

const ProgressBar = ({
  leftLabel,
  rightLabel,
  min = 0,
  max = 1,
  value = 0,
  showValues = true,
  label = '',
  maxLabel = '',
  height = 24,
  backgroundColor = '#E3160B',
  isMoney = false,
  maxVisible = true
}) => {

  const shadowStyle = {
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5
  }

  const textStyle = {
    fontFamily: 'nunito-regular',
    fontSize: 16,
  }

  const fixedValue = _.isNil(value) ? 0 : value
  const fixedMax = _.isNil(max) ? 0 : max

  const canDivide = (fixedMax - min) != 0

  const progress = canDivide ?
    Math.round(fixedValue / (fixedMax - min) * 100) / 100 : 0

  const valueText = `${label ? `${label}   ` : ''}${isMoney ? utils.formatMoney(fixedValue, false) : fixedValue}`

  const fullFilled = !isNaN(progress) && (fixedValue >= fixedMax) && fixedMax > 0

  return (
    <View style={{
      flexDirection: 'row',
      // paddingHorizontal: 20,
      paddingVertical: 5,
      paddingHorizontal: 5,
      alignItems: 'center',
    }}>

      {leftLabel ? <Text style={{
        ...textStyle,
        marginRight: 15,
      }}>{leftLabel}</Text> : null}

      <View style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        borderColor: 'lightgray',
        height,
        ...shadowStyle
      }}>

        <View style={{
          flex: !isNaN(progress) ? (fixedValue < fixedMax ? progress : 1) : 0,
          flexDirection: 'row',
          backgroundColor: fullFilled ? '#296e01' : backgroundColor,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        </View>
        <View style={{
          height,
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          justifyContent: 'center',
          borderRadius: 8,
          backgroundColor: fullFilled ? '#296e01' : 'transparent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          ...(fullFilled ? shadowStyle : {})
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 8,
          }}>

            <View style={{
              flex: 1,
              // paddingHorizontal: 10,
              backgroundColor: 'transparent',
              flexDirection: 'row'
            }}>
              <View style={{
                paddingHorizontal: 10,
                backgroundColor: fullFilled ? '#296e01' : backgroundColor,
                borderRadius: 8,
                height,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text
                  style={{
                    ...textStyle,
                    fontFamily: 'nunito-bold',
                    color: 'white',
                    // flex: 1,
                  }}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >{valueText}</Text>
              </View>
            </View>
            {
              maxVisible && (fixedValue < fixedMax) ?
                <View style={{
                  paddingHorizontal: 10,
                }}>
                  <Text style={{
                    ...textStyle,
                    fontFamily: 'nunito-bold',
                    color: 'gray',
                  }}>{isMoney ? utils.formatMoney(fixedMax, false) : fixedMax}</Text>
                </View>
                : null
            }
          </View>
        </View>

      </View>
      {
        rightLabel ? <Text style={{
          ...textStyle,
          marginLeft: 15,
        }}>{rightLabel}</Text> : null
      }
    </View >
  )
}

export default ProgressBar