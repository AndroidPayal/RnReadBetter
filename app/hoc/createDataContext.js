import React,{ useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default (reducer, action, defaultValue) =>{
    const Context = React.createContext();

    // let promise = new Promise((resolve, reject) => {
    //     try {
    //         let storageVal = AsyncStorage.getItem('@CurrentUser')
    //         resolve(storageVal)
    //     } catch (error) {
    //         reject(error)
    //     }
    //   });
    
    // async function defaultUser(){
    //      return await promise
    //     };
    console.log('default val = ', defaultValue);

    const Provider = ({children}) => {
       
        const[state,dispatch] = useReducer(reducer, defaultValue);

        const boundActions = {}

        for (let key in action){
            boundActions[key] = action[key](dispatch);
        }

        return(
            <Context.Provider value={{state, ...boundActions}}>
                {children}
            </Context.Provider>
        )
    }
    return {Context: Context, Provider: Provider};
}