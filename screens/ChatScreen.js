import React from 'react'
import { View, Text, StatusBar} from 'react-native'
import ChatList from '../components/ChatList'
import Header from '../components/Header'

export default function ChatScreen() {
    return (
        <View style={{flex: 1, marginTop: StatusBar.currentHeight}}>
            <Header title="Chats"/>
            <ChatList/>
        </View>
    )
}
