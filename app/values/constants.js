import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {black, primary, white} from './colors';
import {Searchbar, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/Entypo';

const font = 'Open Sans Regular'; // 400 IS FONT WEIGHT
const font_medium = 'Open Sans SemiBold';//'Roboto-Medium_500';
const font_bold = 'Open Sans Bold';
const font_Headings = 'Bubblegum Sans Regular';

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
  subHeading: {
    fontFamily: font_Headings,//font_medium,
    fontSize: 22,
  },
});

export function globalTitleBar(userName, name, credit, navigation, dataLeft, logOut) {

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };
  const goBack = () => {
    navigation.goBack();
  };
  const handleLogOut = () => {
    logOut()
  }

  return (name || credit || navigation || dataLeft) ? {
    // headerTitle: (
    //   <Text style={[globalStyle.fontMedium, {color: white}]}>{name+'123456789'}</Text>
    // ),
    headerStyle: {
      backgroundColor: black,
    },
    headerRight: () => (
      <View style={stylesHeader.rightContainer}>
        {/* <View style={stylesHeader.userName}>
          <Text style={[{color: white}, globalStyle.fontBold]}>
            {userName}
          </Text>
        </View> */}
        {/*Credit Image */}
        {credit != null ?
          <View style={{flexDirection:'row', alignItems:'center'}}>
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
        :null
        }

      {dataLeft ? (
        <TouchableOpacity
          style={{justifyContent: 'center', marginHorizontal:5}}
          onPress={e=>handleLogOut()}>
          <Icon2 name='logout' size={25} color={white}/>
        </TouchableOpacity>
      ):null}
       
      </View>
    ),
    headerLeft: () =>
      dataLeft ? (
        <View style={{flexDirection: 'row', flex: 1}}>
          <TouchableOpacity
            // onPress={() => toggleDrawer()}
            style={{justifyContent: 'center'}}>
            {/* <Image
              source={{
                uri:
                  'https://raw.githubusercontent.com/AboutReact/sampleresource/master/drawerWhite.png',
              }}
              style={stylesHeader.drawerImage}
            /> */}
            <Icon3 name='home' size={25} color={white} style={{marginLeft:10}}/>
          </TouchableOpacity>
        <View style={stylesHeader.rightContainer}>
            <View style={stylesHeader.userName}>
              <Text style={[{color: white}, globalStyle.fontBold]}>
                {userName}
              </Text>
            </View>
          </View>
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
            {/* <TouchableOpacity style={{justifyContent: 'center', marginHorizontal: 10}}>
              <Icon1 name="search" size={18} color={white} />
            </TouchableOpacity> */}
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
            <Text style={[{color: white, fontSize:20, fontFamily:font_Headings}]}>{name}</Text>
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
    backgroundColor: primary,
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
