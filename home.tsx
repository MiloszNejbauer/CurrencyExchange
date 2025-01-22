import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

interface ExchangeRate {
  currency: string;
  rate: number;
}

export default function HomeScreen() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tileBackground = useThemeColor({}, "tileBackground");
  const tileText = useThemeColor({}, "tileText");
  const tileBorder = useThemeColor({}, "tileBorder");
  const router = useRouter();

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          "https://api.nbp.pl/api/exchangerates/tables/A/?format=json"
        );
        if (!response.ok) throw new Error("Failed to fetch exchange rates");

        const data = await response.json();
        const popularCurrencies = ["USD", "EUR", "GBP"];
        const rates = data[0].rates.filter((rate: any) =>
          popularCurrencies.includes(rate.code)
        );
        setExchangeRates(
          rates.map((rate: any) => ({ currency: rate.code, rate: rate.mid }))
        );
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        Alert.alert("Error", "Could not load exchange rates");
      }
    };

    fetchExchangeRates();
  }, []);

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <Text style={[styles.header, { color: textColor }]}>
          Welcome to Currency Exchange
        </Text>

        {/* Exchange Rates */}
        <View style={styles.exchangeRatesContainer}>
          <Text style={[styles.subHeader, { color: textColor }]}>
            Popular Exchange Rates
          </Text>
          {exchangeRates.map((rate) => (
            <View
              key={rate.currency}
              style={[
                styles.rateRow,
                { borderBottomColor: textColor === "#fff" ? "#ccc" : "#333" },
              ]}
            >
              <Text style={[styles.rateText, { color: textColor }]}>
                {rate.currency}
              </Text>
              <Text style={[styles.rateText, { color: textColor }]}>
                {rate.rate.toFixed(2)} PLN
              </Text>
            </View>
          ))}
        </View>

        {/* Navigation Tiles */}
        <View style={styles.tilesContainer}>
          <TouchableOpacity
            style={[
              styles.tile,
              {
                backgroundColor: tileBackground,
                borderColor: tileBorder,
              },
            ]}
            onPress={() => router.push("/exchange")}
          >
            <AntDesign name="sync" size={wp("8%")} color={tileText} />
            <Text style={[styles.tileText, { color: tileText }]}>
              Currency Exchange
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tile,
              {
                backgroundColor: tileBackground,
                borderColor: tileBorder,
              },
            ]}
            onPress={() => router.push("/currencyChart")}
          >
            <AntDesign name="linechart" size={wp("8%")} color={tileText} />
            <Text style={[styles.tileText, { color: tileText }]}>
              Currency Charts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tile,
              {
                backgroundColor: tileBackground,
                borderColor: tileBorder,
              },
            ]}
            onPress={() => router.push("/userPanel")}
          >
            <AntDesign name="wallet" size={wp("8%")} color={tileText} />
            <Text style={[styles.tileText, { color: tileText }]}>
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tile,
              {
                backgroundColor: tileBackground,
                borderColor: tileBorder,
              },
            ]}
            onPress={() => router.push("/currencyRate")}
          >
            <AntDesign name="profile" size={wp("8%")} color={tileText} />
            <Text style={[styles.tileText, { color: tileText }]}>
              Currency Rates
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: wp("4%"),
  },
  header: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  exchangeRatesContainer: {
    marginBottom: hp("4%"),
  },
  subHeader: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
  },
  rateText: {
    fontSize: wp("4%"),
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: wp("4%"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
  },
  tileText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("1%"),
  },
});
