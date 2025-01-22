import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExchangeRate {
  currency: string;
  code: string;
  mid: number;
}

export default function CurrencyRateScreen() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://currencyexchange-ll7e.onrender.com/api/v1/currencies');
        const data: ExchangeRate[] = await response.json();
        setExchangeRates(data || []);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  const handleSeeCharts = () => {
    router.push('/(tabs)/currencyChart');
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar
  backgroundColor={colors.background}
  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
/>
      {/* Tytuł */}
      <Text style={[styles.title, { color: colors.text }]}>All Available Currencies</Text>

      {/* Tabela */}
      <FlatList
  data={exchangeRates}
  keyExtractor={(item) => item.code}
  renderItem={({ item, index }) => (
    <View
      style={[
        styles.row,
        {
          borderBottomWidth: index === exchangeRates.length - 1 ? 0 : 1,
          borderBottomColor: colors.text,
          minHeight: 40,
          justifyContent: 'center',
        },
      ]}
    >
      <Text style={[styles.cell, { color: colors.text }]}>{item.currency}</Text>
      <Text style={[styles.cell, { color: colors.text }]}>{item.code}</Text>
      <Text style={[styles.cell, { color: colors.text }]}>{item.mid.toFixed(2)}</Text>
    </View>
  )}
  style={[styles.table, { borderColor: colors.text }]}
  contentContainerStyle={{ paddingBottom: hp('0%') }}
/>


      <View
        style={[
          styles.footer,
          {
            marginBottom: insets.bottom + hp('3%'),
            marginTop: hp('3%'),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.seeChartsButton, { backgroundColor: colors.tint }]}
          onPress={handleSeeCharts}
        >
          <Text style={[styles.seeChartsButtonText, { color: colors.background }]}>
            See Charts
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderRadius: wp('2%'),
    overflow: 'hidden',
    marginHorizontal: wp('4%'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
  },
  cell: {
    flex: 1,
    fontSize: wp('3.5%'),
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  seeChartsButton: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignSelf: 'center',
  },
  seeChartsButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
