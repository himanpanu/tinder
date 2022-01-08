import { NavigationContainer } from '@react-navigation/native';
import React,{useEffect, useLayoutEffect, useRef, useState} from 'react'
import { View, Text, Button, SafeAreaView, StatusBar, TouchableOpacity, Image, StyleSheet } from 'react-native'
import tw from 'tailwind-rn';
import { useNavigation } from '@react-navigation/core';
import useAuth from '../hooks/useAuth';
import { AntDesign, Entypo, Ionicons } from "react-native-vector-icons";
import Swiper from "react-native-deck-swiper";
import { collection, doc, DocumentSnapshot, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from '@firebase/firestore';
import { db } from '../firebase';
import generateId from '../lib/generateId';

const DUMMY_DATA = [
  {
    firstName: "Sonny",
    lastName: "Sangha",
    occupation: "Software Developer",
    photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
    age: 27,
    id: 123,
  },
  {
    firstName: "Elon",
    lastName: "Musk",
    occupation: "Software Developer",
    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Elon_Musk_Royal_Society_%28crop1%29.jpg/400px-Elon_Musk_Royal_Society_%28crop1%29.jpg",
    age: 40,
    id: 124,
  },
  {
    firstName: "Sonny",
    lastName: "Sangha",
    occupation: "Software Developer",
    photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
    age: 27,
    id: 126,
  }
];

export default function HomeScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const swipeRef = useRef(null);                                      

    useLayoutEffect(() => {
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if(!snapshot.exists()){
          navigation.navigate("Modal");
        }
      })
    }, []);

    useEffect(() => {
      let unsub;

      const fetchCards = async () => {

        const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then
        (snapshot => snapshot.docs.map(doc => doc.id));

        const swipes = await getDocs(collection(db, 'users', user.uid, 'swipes')).then
        (snapshot => snapshot.docs.map(doc => doc.id));

        const passedUserIds = passes.length > 0 ? passes : ['test'];
        const swipedUserIds = swipes.length > 0 ? swipes : ['test'];

        unsub = onSnapshot(query(collection(db, 'users'),where('id', 'not-in', [...passedUserIds, ...swipedUserIds])), (snapshot) => {
          setProfiles(
            snapshot.docs
            .filter((doc) => doc.id !== user.uid)
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
        })
      };
      fetchCards();
      return unsub;
    },[db])

    // console.log(profiles);

    const swipeLeft = (cardIndex) => {
        if(!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        console.log(`You swiped Pass on ${userSwiped.displayName}`);

        setDoc(doc(db, 'users', user.uid, 'passes', userSwiped.id), userSwiped);
    }

    const swipeRight = async(cardIndex) => {
      if(!profiles[cardIndex]) return;

      const userSwiped = profiles[cardIndex];
      const loggedInProfile = await (
        await getDoc(doc(db, "users", user.uid))
      ).data();

        getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
          (documentSnapshot) => {
            if(documentSnapshot.exists()) {
              // user has matched with you before you matched with them ...
              // Create a Match!
              console.log(`Horray, You MATCHED with ${userSwiped.displayName}`);

              setDoc(doc(db, 'users', user.uid, 'swipes', userSwiped.id), userSwiped);

              // Create a Match
              setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)),{
                users: {
                  [user.uid]: loggedInProfile,
                  [userSwiped.id]:  userSwiped
                },
                usersMatched: [user.uid, userSwiped.id],
                timestamp: serverTimestamp(),
              });


              navigation.navigate("Match", {
                loggedInProfile,
                userSwiped,
              });
            } else {
              // User has swiped as first interaction between the two or didn't get swiped on...
              console.log(`You swiped Pass on ${userSwiped.displayName} (${userSwiped.job})`);

              setDoc(doc(db, 'users', user.uid, 'swipes', userSwiped.id), userSwiped);
            }
          }
        )
      
    }

    return (
      <SafeAreaView style={{flex: 1, marginTop: StatusBar.currentHeight}}>
        <View style={tw("flex-row items-center justify-between relative px-5")}>
          <TouchableOpacity onPress={logout}>
            <Image style={tw("h-10 w-10 rounded-full")} source={{uri: user.photoURL}}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image style={tw("h-14 w-14")} source={require("../logo.png")}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={()  => navigation.navigate("Chat")}>
            <Ionicons name="chatbubbles-sharp" size={30}
              color="#FF5864"
            />
          </TouchableOpacity>
        </View>

        <View style={tw("flex-1 -mt-6")}>
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent"}}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={(cardIndex) => {
            console.log("Swipe PASS");
            swipeLeft(cardIndex);
          }}
          onSwipedRight={(cardIndex) => {
            console.log("Swipe MATCH");
            swipeRight(cardIndex);
          }}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red"
                }
              } 
              },
            right: {
              title: "MATCH",
              style: {
                label: {
                  color: "#4DED30"
                }
              }
            }
          }}
          renderCard={(card) => card ? (
            <View key={card.id} style={tw("relative bg-white h-3/4 rounded-xl")}>
              <Image
                style={tw("absolute top-0 h-full w-full rounded-xl")}
               source={{uri: card.photoURL}}/>

               <View style={[tw(
                 "absolute bottom-0 bg-white w-full justify-between flex-row items-center h-20 px-6 py-2 rounded-b-xl"),styles.cardShadow,]}>
                  <View>
                    <Text style={tw("text-xl font-bold")}>
                      {card.displayName} 
                    </Text>
                    <Text>{card.occupation}</Text>
                  </View>
                  <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
               </View>
            </View>
          ) : (
            <View style={[tw(
                 "relative bg-white h-3/4 rounded-xl justify-center items-center"),styles.cardShadow,]}>
          
                  <Text style={tw("font-bold pb-5")}>No more profiles</Text>
                  <Image
                style={tw("h-20 w-full")}
                maxHeight={80}
                maxWidth={80}
               source={{uri: "https://links.papareact.com/6gb"}}/>
               </View>
          )}
        />
        </View>
        
        <View style={tw("flex flex-row justify-evenly mb-4")}>
          <TouchableOpacity
            onPress={() => swipeRef.current.swipeLeft()}
            style={tw("items-center justify-center rounded-full w-16 h-16 bg-red-200")}
          >
            <Entypo name="cross" size={24} color="red"/>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => swipeRef.current.swipeRight()}
            style={tw("items-center justify-center rounded-full w-16 h-16 bg-green-200")}
          >
            <AntDesign name="heart" size={24} color="green"/>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
       
    )
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  }
})