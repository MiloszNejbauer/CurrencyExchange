import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function Settings() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
      />
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBackground }]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: buttonText }]}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBackground }]}
          onPress={() => router.push("/transactionHistory")}
        >
          <Text style={[styles.buttonText, { color: buttonText }]}>
            Transaction History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("4%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("4%"),
  },
  button: {
    width: "80%",
    paddingVertical: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc", // Można zastąpić kolor z Colors.ts
    marginBottom: hp("2%"),
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: "#000",
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
});
