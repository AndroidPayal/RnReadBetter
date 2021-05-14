import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {black, darkGray, lightGray, tintDarkBackground, white} from './colors';
import {Searchbar, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/FontAwesome';

const font = 'Roboto-Regular_400'; // 400 IS FONT WEIGHT
const font_medium = 'Roboto-Medium_500';
const font_bold = 'Roboto-Bold_700';

export const globalStyle = StyleSheet.create({
  font: {
    fontFamily: font,
  },
  fontBold: {
    fontFamily: font_bold,
  },
  fontMedium: {
    fontFamily: font_medium,
  },
  nameHeading: {
    fontFamily: font_bold,
    fontSize: 30,
  },
  subHeading: {
    fontFamily: font_medium,
    fontSize: 18,
  },
  readerName: {
    fontFamily: font_medium,
    fontSize: 20,
  },
});

export function globalTitleBar(userName, name, credit, navigation, dataLeft) {

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };
  const goBack = () => {
    navigation.goBack();
  };

  return (name || credit || navigation || dataLeft) ? {
    // headerTitle: (
    //   <Text style={[globalStyle.fontMedium, {color: white}]}>{name+'123456789'}</Text>
    // ),
    headerStyle: {
      backgroundColor: black,
    },
    headerRight: () => (
      <View style={stylesHeader.rightContainer}>
        <View style={stylesHeader.userName}>
          <Text style={[{color: white}, globalStyle.fontBold]}>
            {userName}
          </Text>
        </View>
        {/*Credit Image */}
        <Image
          style={stylesHeader.creditIcon}
          source={{
            uri:
              'https://thereadbettercompany.com/public/cdn/assets/media/avatars/credit.png',
          }}></Image>
        <View style={stylesHeader.creditText}>
          <Text>{'' + credit}</Text>
        </View>
      </View>
    ),
    headerLeft: () =>
      dataLeft ? (
        <View style={{flexDirection: 'row', flex: 1}}>
          <TouchableOpacity
            onPress={() => toggleDrawer()}
            style={{justifyContent: 'center'}}>
            {/*Donute Button Image */}
            <Image
              source={{
                uri:
                  'https://raw.githubusercontent.com/AboutReact/sampleresource/master/drawerWhite.png',
              }}
              style={stylesHeader.drawerImage}
            />
          </TouchableOpacity>
          {/* <View
            style={{
              height: 40,
              backgroundColor: lightGray,
              borderRadius: 10,
              marginLeft: 10,
              marginTop: 10,
              width: 200,
              flexDirection: 'row',
            }}> */}
            <TouchableOpacity style={{justifyContent: 'center', marginHorizontal: 10}}>
              <Icon1 name="search" size={18} color={white} />
            </TouchableOpacity>
            {/* <View style={{width: '100%',justifyContent: 'center'}}>
              <Text style={[{opacity:0.60}, globalStyle.font]} >Search Here...</Text>
            </View>
          </View> */} 
        </View>
      ) : (
        <View style={{flexDirection: 'row', flex: 1}}>
          <TouchableOpacity
            onPress={() => goBack()}
            style={{justifyContent: 'center'}}>
            <Icon
              name="arrowleft"
              size={25}
              color={white}
              style={{marginLeft: 5}}
            />
          </TouchableOpacity>
          {/* ADDED TEXT INSTED OF TITLE BCZ TITLE TOOK BIG MARGIN START AS DEFAULT */}
          <View style={{justifyContent:'center', margin:5}}>
            <Text style={[globalStyle.fontMedium, {color: white, fontSize:20}]}>{name}</Text>
          </View>
        </View>
      ),
  }
  :{ // BLACK HEADER FOR LOADING SCREEN
    headerTitle: null,
    headerStyle: {
      backgroundColor: white,
    },
    headerRight: null,
    headerLeft: null
  };
}
const stylesHeader = StyleSheet.create({
  drawerImage: {
    width: 25,
    height: 25,
    marginLeft: 5,
  },
  rightContainer: {margin: 10, flexDirection: 'row', alignItems: 'center'},
  creditIcon: {width: 15, height: 15, margin: 1},
  creditText: {
    backgroundColor: tintDarkBackground,
    padding: 3,
    borderRadius: 10,
  },
  userName: {
    borderColor: white,
    borderRadius: 7,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 10,
  },
});
