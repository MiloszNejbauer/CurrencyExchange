import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect } from "expo-router";

interface Transaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const fetchTransactionHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await fetch(
        `http://192.168.1.18:8080/api/v1/students/${userId}/transactions`
      );
      if (!response.ok) throw new Error("Failed to fetch transaction history");

      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      Alert.alert("Error", "Could not load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const { fromAmount, fromCurrency, toAmount, toCurrency, timestamp } = item;

    return (
      <View style={[styles.transactionItem, { borderBottomColor: textColor }]}>
        <Text style={[styles.transactionText, { color: textColor }]}>
          {fromAmount.toFixed(2)} {fromCurrency} → {toAmount.toFixed(2)} {toCurrency}
        </Text>
        <Text style={[styles.timestamp, { color: textColor }]}>
          {new Date(timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactionHistory();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (transactions.length === 0) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
        <View style={styles.container}>
          <Text style={[styles.noTransactionsText, { color: textColor }]}>
            No transactions found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
      />
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Transaction History</Text>
        <FlatList
          data={[...transactions].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("2%"),
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  transactionItem: {
    padding: hp("2%"),
    borderBottomWidth: 1,
    marginBottom: hp("1%"),
    borderRadius: wp("2%"),
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
    }),
  },
  transactionText: {
    fontSize: wp("4.5%"),
  },
  timestamp: {
    fontSize: wp("3.5%"),
    marginTop: hp("0.5%"),
  },
  noTransactionsText: {
    fontSize: wp("5%"),
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: hp("8%"),
  },
});
