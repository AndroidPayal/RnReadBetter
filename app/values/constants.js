import { StyleSheet } from "react-native";

const font = 'MyFont'
const font_bold = 'MyFont_Bold'

export const globalStyle = StyleSheet.create({
    font:{
        fontFamily:font
    },
    fontBold:{
        fontFamily: font_bold
    },
    h1Style:{
        fontFamily:font,
        fontSize: 50
    },
    h2Style:{
        fontFamily:font,
        fontSize: 40
    },
    h3Style:{
        fontFamily:font,
        fontSize: 32
    },
    h4Style:{
        fontFamily:font,
        fontSize: 28
    }
})