import React, { useState, useEffect, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Theme from "../utils";
import DropDownItem from "react-native-drop-down-item";
import { WebView } from 'react-native-webview';
import { Icon } from 'react-native-elements'
import { useIsFocused } from '@react-navigation/native';

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const zendeskWidget = `
  <html>
  <head>
  </head>
  <body>
  <script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=b4451f45-dd55-49b5-b07e-a7148633f3c2"> </script>
  <script>
  zE(function() {
    zE.activate();
    })
    
    function show() {
    zE.show();
    zE.activate();
    }
  </script>
  </body>
  </html>
`

const NeedHelpScreen = (props) => {

  const [key, setKey] = useState(new Date().toISOString())
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refreshKey()
    }
  }, [isFocused])

  const refreshKey = () => setKey(new Date().toISOString())

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <WebView
          key={key}
          // originWhitelist={['*']}
          // source={
          //   Platform.select({
          //     android: { uri: 'file:///android_asset/zendesk-widget.html' },
          //     ios: require('../assets/zendesk-widget.html')
          //   })
          // }
          // source={require('./page.html')}
          source={{ uri: 'https://raise-365.zendesk.com/hc/en-us' }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
              <ActivityIndicator color="#051533" size="large" />
            </View>
          )}
        >
        </WebView>
        <Icon
          name='arrow-left'
          type='material-community'
          color='#0072EF'
          raised
          reverse
          containerStyle={{
            position: 'absolute',
            left: 20,
            top: 0
          }}
          onPress={() => props.navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#e5e5e5",
    backgroundColor: 'white',
    paddingBottom: 40
  },
  splash: {
    width: wp("100%"),
    resizeMode: "cover",
    height: height * 0.22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  text: {
    fontSize: height * 0.02,
    fontFamily: "Nunito-SemiBold",
    marginLeft: 15,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  line: {
    backgroundColor: "lightgrey",
    height: 1,
    width: width * 0.85,
    alignSelf: "center",
  },
});

export default NeedHelpScreen;
