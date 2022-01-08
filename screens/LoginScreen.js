import { useNavigation } from '@react-navigation/core';
import React from 'react'
import { View, Text, Button, ImageBackground, TouchableOpacity } from 'react-native'
import useAuth from '../hooks/useAuth';
import tw from "tailwind-rn";

export default function LoginScreen() {
    const {signInWithGoogle, loading} = useAuth();
    const navigation = useNavigation();
    
    return (
        <View style={tw("flex-1")}>
            <ImageBackground
            resizeMode="cover"
            style={tw("flex-1")}
            source={{uri: "https://tinder.com/static/tinder.png"}}>
                <TouchableOpacity style={
                    [tw("absolute bottom-40 w-52 bg-white p-4 rounded-2xl"),
                    {marginHorizontal: "25%"}]}
                    onPress={signInWithGoogle}>
                    <Text 
                    style={tw("font-semibold text-center")}>
                    Sign In & get Swiping
                    </Text>
                </TouchableOpacity>
            </ImageBackground>   
        </View>
    )
}
