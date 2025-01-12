import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function HomeScreen() {
  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <View style={styles.container}>
        {/* Nagłówek */}
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: textColor }]}>
          Welcome to Currency Exchange
        </Text>

        {/* Przyciski */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: buttonBackground,
                borderColor: textColor,
                shadowColor: Platform.OS === "android" ? "#000" : undefined, // Cień na Androidzie
              },
            ]}
            onPress={() => router.push("/login")} // Przejście na ekran Log In
          >
            <Text style={[styles.buttonText, { color: buttonText }]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: buttonBackground,
                borderColor: textColor,
                shadowColor: Platform.OS === "android" ? "#000" : undefined, // Cień na Androidzie
              },
            ]}
            onPress={() => router.push("/register")} // Przejście na ekran Register
          >
            <Text style={[styles.buttonText, { color: buttonText }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("5%"),
  },
  logo: {
    width: wp("50%"),
    height: hp("20%"),
    resizeMode: "contain",
    marginBottom: hp("3%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  buttonContainer: {
    flexDirection: "column",
    gap: hp("2%"),
    width: "100%",
  },
  button: {
    paddingVertical: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderWidth: 1,
    width: "100%",
    ...Platform.select({
      android: {
        elevation: 4, // Cień na Androidzie
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
});
