import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");
  const tileBackground = useThemeColor({}, "tileBackground");
  const tileBorder = useThemeColor({}, "tileBorder");

  const handleRegister = async () => {
    if (!firstName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const user = {
        firstName: firstName.trim(),
        email: email.trim(),
        password: password.trim(),
      };

      const response = await fetch(
        "http://192.168.1.18:8080/api/v1/students/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registered successfully!");
        router.push("/login");
      } else {
        Alert.alert("Failed", data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
      />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[
            styles.tile,
            {
              backgroundColor: tileBackground,
              borderColor: tileBorder,
            },
          ]}
          onPress={() => router.push("/")}
        >
          <AntDesign name="back" size={24} color={tileBorder} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
      >
        <Text style={[styles.title, { color: textColor }]}>Register</Text>
        <TextInput
          style={[styles.input, { borderColor: textColor, color: textColor }]}
          placeholder="First Name"
          placeholderTextColor={textColor}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[styles.input, { borderColor: textColor, color: textColor }]}
          placeholder="Email"
          placeholderTextColor={textColor}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { borderColor: textColor, color: textColor }]}
          placeholder="Password"
          placeholderTextColor={textColor}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: buttonBackground, borderColor: textColor },
          ]}
          onPress={handleRegister}
        >
          <Text style={[styles.buttonText, { color: buttonText }]}>Register</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: wp("4%"),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("5%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: hp("1.5%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  button: {
    paddingVertical: hp("1.8%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderWidth: 1,
    marginTop: hp("2%"),
    width: "100%",
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },
  buttonText: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  tile: {
    width: wp("12%"),
    aspectRatio: 1,
    borderRadius: wp("4%"),
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    marginRight: wp("2%"),
  },
});
