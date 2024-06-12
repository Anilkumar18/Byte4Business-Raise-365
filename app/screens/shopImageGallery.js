import React, { useState, useEffect } from "react";
import { View, Dimensions, Image, TouchableOpacity } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import ImageLoad from 'react-native-image-placeholder';

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const ShopImageGallery = (props) => {
  const [data, setData] = React.useState([]);

  let snapRef = React.createRef();
  const DATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      title: require("../assets/photos1.png"),
    },
    {
      id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
      title: require("../assets/photos2.png"),
    },
    {
      id: "58694a0f-3da1-471f-bd96-145571e29d72",
      title: require("../assets/photos3.png"),
    },
    {
      id: "58694a0f-3dsas1-471f-bd96-145571e29d72",
      title: require("../assets/photos4.png"),
    },
  ];

  useEffect(() => {
    setData(props.route.params.data)


  }, [])
  const renderItem = ({ item, index }) => {
    return (
      <View style={{}}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.pop();
          }}
        >
          <Image
            style={{
              marginBottom: height * 0.3,
              width: 40,
              height: 40,
              margin: 20,
            }}
            source={require("../assets/close.png")}
          />
        </TouchableOpacity>

        <ImageLoad
          style={{
            width: width,
            height: Math.round(width * 8.3) / 16,
            resizeMode: "cover",
          }}
          source={{ uri: item.url }}
          loadingStyle={{ size: 'large', color: 'blue' }}
          placeholderStyle={{width: width,
                  height: Math.round(width * 8.3) / 16,
                  resizeMode: "cover",}}

                />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Carousel
        ref={snapRef}
        data={data}
        renderItem={renderItem}
        sliderWidth={width}
        itemWidth={width}
        itemHeight={height}
      />
      <Pagination
        dotsLength={DATA.length}
        dotColor={"rgba(255, 255, 255, 0.92)"}
        inactiveDotColor={"#fff"}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </View>
  );
};

export default ShopImageGallery;
