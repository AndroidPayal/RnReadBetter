import React, {useRef, useState, useContext} from 'react'
import { Button, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { Text , SafeAreaView, StyleSheet, View, Image} from 'react-native'
import PagerView from 'react-native-pager-view';
import {CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { TouchableOpacity } from 'react-native-gesture-handler'
//https://www.npmjs.com/package/react-native-swipe-gestures
import { black, darkGray, primary, red, secondaryBlue, white, thirdLightBlue, fourthGreen, mediumGray } from '../../values/colors';
import { globalStyle } from '../../values/constants';
import { Overlay } from "react-native-elements";
import Chill_Image from '../../assets/onboard1.svg'
import Read_Image from '../../assets/onboard2.svg'
import Papa_Image from '../../assets/onboard3.svg'
import Fun_Image from '../../assets/onboard4.svg'
import Together_Image from '../../assets/onboard5.svg'
import Login_Image from '../../assets/onboard6.svg'
import Gift_Image from '../../assets/onboard7.svg'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Context as AuthContext} from '../../hoc/AuthContext';

export default function OnboardingScreen(props) {

    const {value, onboarding} = useContext(AuthContext);
    const pagerRef = useRef(null);
    const[showDialog, setShowDialog] = useState(false)
    const dialogHeading = 'Would you like to see this introduction the next time you start the app?'
    const windowWidth = useWindowDimensions().width;

    const handlePageChange = e => {
        // pagerRef.current.setPage(pageNumber);
        console.log('page number = ',e.nativeEvent.position);
    };
    const handleFinish = () => {
        console.log('handle finish called');
        setShowDialog(true)
    };
    const handleNoPress = () => {
        setShowDialog(false)
        //AN LOCAL OBJECT THAT WILL SAY " DO NOT SHOW ONBOARDING SCREEN AGAIN "
        AsyncStorage.setItem('@NewUser', JSON.stringify({ isOld: true }))
        onboarding()

        // props.navigation.navigate('Login')
        props.navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{name: 'Login'}],
            }),
        );
    }
    const handleYesPress = () => {
        setShowDialog(false)
        // props.navigation.navigate('Login')
        props.navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{name: 'Login'}],
            }),
        );
    }

    return(
        <View style={{ flex: 1 }}>
            <PagerView 
                style={{ flex: 1 }} 
                ref={pagerRef} 
                onPageSelected={handlePageChange}
                initialPage={0}>
                <View key="1" >
                    <Page1
                        pageNo={1}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="2">
                    <Page2
                        pageNo={2}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="3">
                    <Page3
                        pageNo={3}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="4">
                    <Page4
                        pageNo={4}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="5">
                    <Page5
                        pageNo={5}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="6">
                    <Page6
                        pageNo={6}
                        windowWidth = {windowWidth}
                    />
                </View>
                <View key="7" >
                    <Page7
                        pageNo={7}
                        windowWidth = {windowWidth}
                    />
                    <View style={{position:'absolute', bottom:10, justifyContent:'flex-end', right:10}}>
                        <TouchableOpacity style={styles.loginTouchable}
                            onPress={e => handleFinish() } >
                            <View style={styles.buttonStyle}>
                                <Icon name='arrow-right' style={{margin:5}} color={white} ></Icon>
                                <Text style={[{color:white, fontSize:16}, globalStyle.fontBold]}>FINISH</Text>
                            </View>
                        </TouchableOpacity>
                    </View> 
                </View>
            </PagerView>

            <Overlay isVisible={showDialog} onBackdropPress={ e => setShowDialog(false)}>
                <View style={{width:'85%'}}>
                    <Text style={[{marginTop:10, marginBottom:20, marginHorizontal:10, textAlign:'center', fontSize:17}, globalStyle.font]}>
                        {dialogHeading}
                    </Text>
                    <View style={{flexDirection:'row', justifyContent:'space-around', marginBottom:10}}>
                        <TouchableOpacity style={styles.loginTouchable}
                            onPress={e => handleNoPress()} >
                            <View style={[styles.buttonStyle, {backgroundColor: red}]}>
                                <Text style={[{color:white, fontSize:16}, globalStyle.fontBold]}>No</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginTouchable}
                            onPress={e => handleYesPress()} >
                            <View style={[styles.buttonStyle,  {backgroundColor: fourthGreen}]}>
                                <Text style={[{color:white, fontSize:16}, globalStyle.fontBold]}>Yes</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Overlay>
            
      </View>
    )
}
const PageIndicator = ({
    pageCount = 1
}) => {
    return(
        <View style={styles.indicatorContainer}>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 1 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 2 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 3 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 4 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 5 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 6 ? black : primary, opacity:0.40, margin:2}}/>
            <View style={{height: 2, width:20, backgroundColor:pageCount < 7 ? black : primary, opacity:0.40, margin:2}}/>
        </View>
    )
}

const Page1 = ({
    windowWidth
    }) => {
    return(
        <View style={{backgroundColor:white, flex:1}}>
            <View style={{position:'absolute', bottom:50, left:27 }}>
                <Chill_Image width={windowWidth} />
            </View>
            <PageIndicator
                pageCount = {1}
            />

            <View style={styles.textContainer}>
                <Text style={[styles.textGray,globalStyle.font]}>
                    Those who
                    <Text style={[{color: primary}, globalStyle.fontBold]}>{' read more, know more'}</Text>
                </Text>
            </View>

        </View>
    )
}
const Page2 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:0 , left:30}}>
            <Read_Image width={windowWidth} />
        </View>
        <PageIndicator
            pageCount = {2}
        />
        <View style={styles.textContainer}>
            <Text style={[styles.textGray,globalStyle.font]}>
                Don't like reading? You just haven't found a good book yet.
            </Text>
            <View style={{marginTop:50}}>
                <Text style={[styles.textGray,globalStyle.font]}>
                    Our 
                    <Text style={[{color: primary}, globalStyle.fontBold]}>{' artificially intelligent reading coach '}</Text>
                    will find a book for you to read
                </Text>
            </View>
        </View>
       
    </View>
)
}
const Page3 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:0 , left:50}}>
            <Papa_Image width={windowWidth} />
        </View>
        <PageIndicator
                pageCount = {3}
            />
        <View style={styles.textContainer}>
            
            <Text style={[styles.textGray,globalStyle.font]}>
                We present you with a  
                <Text style={[{color: primary}, globalStyle.fontBold]}>{' choice of books.'}</Text>
            </Text>
            <Text>
                <Text style={[styles.textGray,globalStyle.font]}>{'You decide which one you want to read.'}</Text>
            </Text>
        </View>

    </View>
)
}
const Page4 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:0 }}>
            <Fun_Image width={windowWidth} />
        </View>
        <PageIndicator
            pageCount = {4}
        />
        <View style={styles.textContainer}>
            <View style={{ marginBottom:30}}>
                <Text >
                    <Text style={[{color: primary, fontSize: 30}, globalStyle.fontBold]}>
                        {'...go ahead and get the book '}   
                    </Text>
                </Text>
                <View style={{marginTop:50}}>
                    <Text style={[styles.textGray,globalStyle.font]}>New or Used book. E-book or a hard copy. Buy or borrow from a friend</Text>
                </View>
                <Text style={[{color: primary, fontSize: 30}, globalStyle.fontBold]}>
                    {'Your choice!'}   
                </Text>
            </View>
        </View>
    </View>
)
}
const Page5 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:-20}}>
            <Together_Image width={windowWidth} />
        </View>
        <PageIndicator
            pageCount = {5}
        />
        <View style={styles.textContainer}>
            <Text style={[styles.textGray,globalStyle.font]}>Write a log every time you read. We'll remind you to read every day</Text>
            <View style={{marginTop:50}}>
                <Text style={[styles.textGray,globalStyle.font]}>
                    Reading 
                    <Text style={[{color: primary, fontSize:30}, globalStyle.fontBold]}>{' 21 minutes or more daily '}</Text>
                    makes an amazing difference
                </Text>
            </View>
        </View>

    </View>
)
}
const Page6 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:0 }}>
            <Login_Image width={windowWidth} />
        </View>
        <PageIndicator
            pageCount = {6}
        />
        <View style={styles.textContainer}>
         
            <Text style={[styles.textGray,globalStyle.font]}>
                <Text style={[{color: primary, fontSize:30}, globalStyle.fontBold]}>{'Join a reading club to read '}</Text>
                with friends
            </Text>
        
            <Text style={[styles.textGray,globalStyle.font]}>
                ...or you can read by yourself 
            </Text>
            <Text style={{marginTop:50}}>
            </Text>
        </View>

    </View>
)
}
const Page7 = ({
    windowWidth
}) => {
return(
    <View style={{backgroundColor:white, flex:1}}>
        <View style={{position:'absolute', bottom:57 }}>
            <Gift_Image width={windowWidth} />
        </View>
        <PageIndicator
            pageCount = {7}
        />
        <View style={styles.textContainer}>
            <Text style={[styles.textGray,globalStyle.font]}>
                Read every day to
            </Text>
            <Text style={[styles.textGray,globalStyle.font]}>
                win cool reading
            </Text>
            <Text style={[{color: primary, fontSize:30}, globalStyle.fontBold]}>rewards</Text>
        </View>

    </View>
)
}
const styles = StyleSheet.create({
    loginTouchable:{flexDirection:'row', justifyContent:'center'},
    buttonStyle:{flexDirection:'row',width:100, height:45, backgroundColor:secondaryBlue, borderRadius:30, justifyContent:'center', alignItems:'center'},
    safeArea: {
      flex: 1,
      backgroundColor: white,
    },
    indicatorContainer:{height:70, width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row'},
    textContainer:{position:'absolute', top:60, left:27, right:27},
    textGray:{color: mediumGray, fontSize:30},
    background: {
      width: '100%',
      height: '100%',
      backgroundColor: white,
      justifyContent: 'center',
      alignItems: 'center',
    },
})