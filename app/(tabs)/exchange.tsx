import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface Currency {
  code: string;
  mid: number;
  currency: string;
}

interface User {
  balances: { [currency: string]: number };
}

export default function Exchange() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>("PLN");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [amount, setAmount] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<string>("0.00");
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activePicker, setActivePicker] = useState<"from" | "to">("from");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const modalBackground = useThemeColor({}, "modalBackground");
  const buttonBackground = useThemeColor({}, "buttonBackground");
  const buttonText = useThemeColor({}, "buttonText");
  const borderColor = useThemeColor({}, "border");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("http://192.168.1.18:8080/api/v1/currencies");
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status}`);
        }
        const data: Currency[] = await response.json();
        const plnCurrency: Currency = { code: "PLN", mid: 1.0, currency: "Polish Zloty" };
        setCurrencies([plnCurrency, ...data]);
      } catch (error) {
        console.error("Error fetching currencies:", error);
        Alert.alert("Error", "Failed to load currency data");
      }
    };

    fetchCurrencies();
    fetchUserBalances();
  }, []);

  const fetchUserBalances = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await fetch(`http://192.168.1.18:8080/api/v1/students/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);

      const data: User = await response.json();
      setUser(data);

      const initialBalance = data.balances["PLN"] || 0;
      setBalance(initialBalance);
    } catch (error) {
      console.error("Error fetching user balances:", error);
      Alert.alert("Error", "Could not load user balances");
    }
  };

  const updateConversion = () => {
    const fromRate = currencies.find((c) => c.code === fromCurrency)?.mid || 1;
    const toRate = currencies.find((c) => c.code === toCurrency)?.mid || 1;

    const inputAmount = parseFloat(amount);
    if (!isNaN(inputAmount) && inputAmount > 0) {
      const result = (inputAmount * fromRate) / toRate;
      setConvertedAmount(result.toFixed(2));
    } else {
      setConvertedAmount("0.00");
    }
  };

  useEffect(() => {
    updateConversion();
  }, [amount, fromCurrency, toCurrency]);

  const handleCurrencySelect = (currency: string) => {
    if (activePicker === "from") {
      setFromCurrency(currency);
      setBalance(user?.balances[currency] || 0);
    } else {
      setToCurrency(currency);
    }
    setModalVisible(false);
  };

  const finalizeExchange = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const fromAmountValue = parseFloat(amount);
      const toAmountValue = parseFloat(convertedAmount);

      if (isNaN(fromAmountValue) || isNaN(toAmountValue)) {
        Alert.alert("Error", "Invalid exchange amounts");
        return;
      }

      const response = await fetch(
        `http://192.168.1.18:8080/api/v1/students/${userId}/exchange?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${fromAmountValue}&toAmount=${toAmountValue}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to finalize exchange: ${response.status}, ${errorText}`);
      }

      Alert.alert("Success", "Exchange finalized successfully!");
      fetchUserBalances();
      setAmount("");
    } catch (error) {
      console.error("Error finalizing exchange:", error);
      Alert.alert("Error", "Could not finalize exchange");
    }
  };

  const renderCurrencyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.modalItem, { backgroundColor: modalBackground, borderColor }]}
      onPress={() => handleCurrencySelect(item)}
    >
      <Text style={[styles.modalItemText, { color: textColor }]}>{item}</Text>
    </TouchableOpacity>
  );

  if (currencies.length === 0 || !user) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
        <View style={styles.loader}>
          <Text style={[styles.loaderText, { color: textColor }]}>
            Loading currencies...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText, { color: textColor }]}>
            Available Balance: {balance.toFixed(2)} {fromCurrency}
          </Text>
        </View>

        <Text style={[styles.title, { color: textColor }]}>Currency Exchange</Text>

        <Text style={[styles.label, { color: textColor }]}>From:</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            { backgroundColor: buttonBackground, borderColor },
          ]}
          onPress={() => {
            setActivePicker("from");
            setModalVisible(true);
          }}
        >
          <Text style={[styles.pickerButtonText, { color: buttonText }]}>{fromCurrency}</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          placeholder="Enter amount"
          placeholderTextColor={textColor}
          keyboardType="numeric"
          value={amount}
          onChangeText={(value) => setAmount(value)}
        />

        <Text style={[styles.label, { color: textColor }]}>To:</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            { backgroundColor: buttonBackground, borderColor },
          ]}
          onPress={() => {
            setActivePicker("to");
            setModalVisible(true);
          }}
        >
          <Text style={[styles.pickerButtonText, { color: buttonText }]}>{toCurrency}</Text>
        </TouchableOpacity>

        <Text style={[styles.resultLabel, { color: textColor }]}>
          Converted Amount:
        </Text>
        <Text style={[styles.result, { color: textColor }]}>
          {convertedAmount} {toCurrency}
        </Text>

        <TouchableOpacity
          style={[
            styles.exchangeButton,
            { backgroundColor: buttonBackground, borderColor },
          ]}
          onPress={finalizeExchange}
        >
          <Text style={[styles.exchangeButtonText, { color: buttonText }]}>Finalize Exchange</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: modalBackground }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, { backgroundColor }]}>
                <FlatList
                  data={currencies.map((c) => c.code)}
                  keyExtractor={(item) => item}
                  renderItem={renderCurrencyItem}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: wp("4%"),
  },
  balanceContainer: {
    marginBottom: hp("2%"),
  },
  balanceText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  label: {
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
  },
  pickerButton: {
    borderWidth: 1,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("2%"),
    marginBottom: hp("2%"),
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: wp("4%"),
  },
  input: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: hp("1%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  resultLabel: {
    fontSize: wp("5%"),
    marginTop: hp("2%"),
    fontWeight: "bold",
  },
  result: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: Dimensions.get("window").height * 0.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: wp("4%"),
    textAlign: "center",
  },
  exchangeButton: {
    borderWidth: 1,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: wp("2%"),
    alignSelf: "center",
    marginTop: hp("2%"),
  },
  exchangeButtonText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    textAlign: "center",
  },
});
