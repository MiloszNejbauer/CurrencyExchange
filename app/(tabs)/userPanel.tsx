import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";

interface User {
  firstName: string;
  balances: { [currency: string]: number };
}

export default function UserPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputBalance, setInputBalance] = useState<string>("");

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await fetch(
        `http://192.168.1.18:8080/api/v1/students/${userId}`
      );
      if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);

      const data: User = await response.json();
      if (!data.balances["PLN"]) {
        data.balances["PLN"] = 0.0;
      }

      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Could not load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const amount = parseFloat(inputBalance.trim());
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Error", "Please enter a valid positive number");
        return;
      }

      const response = await fetch(
        `http://192.168.1.18:8080/api/v1/students/${userId}/balance?currency=PLN&amount=${amount}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update balance: ${response.status}, ${errorText}`);
      }

      const updatedBalance = await response.json();
      setUser((prevUser) =>
        prevUser
          ? { ...prevUser, balances: { ...prevUser.balances, PLN: updatedBalance } }
          : null
      );

      Alert.alert("Success", "Balance updated successfully");
      setModalVisible(false);
      setInputBalance("");
    } catch (error) {
      console.error("Error updating balance:", error);
      Alert.alert("Error", "Could not update balance");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Failed to load user data.
        </Text>
      </SafeAreaView>
    );
  }

  const renderBalanceItem = ({ item }: { item: [string, number] }) => {
    const [currency, balance] = item;
    return (
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.cell, { color: colors.text }]}>{currency}</Text>
        <Text style={[styles.cell, { color: colors.text }]}>{balance.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Text style={[styles.welcomeText, { color: colors.text }]}>
        Welcome! {user.firstName}
      </Text>

      <View style={[styles.table, { borderColor: colors.border }]}>
        <View style={[styles.row, styles.header, { backgroundColor: colors.tint }]}>
          <Text style={[styles.cell, { color: colors.background }]}>Currency</Text>
          <Text style={[styles.cell, { color: colors.background }]}>Balance</Text>
        </View>
        <FlatList
          data={Object.entries(user.balances).filter(([_, balance]) => balance > 0)}
          keyExtractor={([currency]) => currency}
          renderItem={renderBalanceItem}
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tint }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>Add Balance</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.modalContainerBackground,
                borderColor: colors.modalBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Balance</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter amount"
              placeholderTextColor={colors.placeholderText}
              keyboardType="numeric"
              value={inputBalance}
              onChangeText={(value) => setInputBalance(value)}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={handleAddBalance}
            >
              <Text style={[styles.addButtonText, { color: colors.background }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.cancelButton }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  errorText: {
    fontSize: wp("4%"),
    textAlign: "center",
    marginTop: hp("2%"),
  },
  table: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    marginBottom: hp("2%"),
    overflow: "hidden",
    width: "90%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    padding: hp("1%"),
  },
  row: {
    flexDirection: "row",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("2%"),
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: wp("4%"),
  },
  addButton: {
    paddingVertical: hp("1.8%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    marginTop: hp("2%"),
    width: "80%",
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: hp("1.5%"),
    padding: hp("1.5%"),
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: wp("4%"),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    padding: hp("3%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  input: {
    width: "100%",
    height: hp("6%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("2%"),
    marginBottom: hp("2%"),
  },
});
