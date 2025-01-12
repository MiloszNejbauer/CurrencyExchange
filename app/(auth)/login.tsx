import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function HomeScreen() {
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");
  const tileBackground = useThemeColor({}, "tileBackground");
  const tileBorder = useThemeColor({}, "tileBorder");

  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!firstName || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const url = `http://192.168.1.18:8080/api/v1/students/login?firstName=${encodeURIComponent(
        firstName
      )}&password=${encodeURIComponent(password)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const userId = await response.text();

      if (response.ok) {
        await AsyncStorage.setItem("userId", userId);
        Alert.alert("Success", "Logged in successfully!");
        router.push("/(tabs)/home");
      } else {
        Alert.alert("Error", "Invalid login credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
      />
      <View style={[styles.headerContainer]}>
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
      >
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: textColor }]}>
          Welcome to Currency Exchange
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { borderColor: textColor, color: textColor }]}
            placeholder="First Name"
            placeholderTextColor={textColor}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { borderColor: textColor, color: textColor }]}
            placeholder="Password"
            placeholderTextColor={textColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: buttonBackground, borderColor: textColor },
            ]}
            onPress={handleLogin}
          >
            <Text style={[styles.buttonText, { color: buttonText }]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: buttonBackground, borderColor: textColor },
            ]}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.buttonText, { color: buttonText }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: wp("50%"),
    height: hp("20%"),
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: hp("3%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  formContainer: {
    width: "100%",
    maxWidth: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: hp("2%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  button: {
    paddingVertical: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderWidth: 1,
    marginBottom: hp("2%"),
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
    fontSize: wp("4%"),
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
