import React,{useEffect} from 'react'
import { View, StyleSheet, SafeAreaView, Image} from "react-native";
import { CommonActions } from '@react-navigation/native';

export default function SplashScreen(props) {

    useEffect(()=>{
        setTimeout(() => {
            //SEND TO (HAVE SESSION ? HOME : LOGIN)  SCREEN
            // props.navigation.navigate('Login')

            props.navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: 'Login' },
                  ],
                })
              );
        }, 3000);
    },[])

    return(
        <SafeAreaView style={styles.background}>
            <View
                style={styles.background}
            >
                <Image
                    style={styles.logo}
                    source={require("../assets/loader.gif")}
                >
                </Image>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    background:{
        width:'100%',
        height:'100%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo:{
        width:'70%',
        height:'50%',
    }
})