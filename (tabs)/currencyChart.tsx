import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function CurrencyChart() {
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('PLN');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activePicker, setActivePicker] = useState<'from' | 'to'>('from');
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1W');
  const [rates, setRates] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [currencyPair, setCurrencyPair] = useState<string>('USD/PLN');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchAvailableCurrencies = async () => {
      try {
        const response = await fetch(
          'https://api.nbp.pl/api/exchangerates/tables/A/?format=json'
        );
        const data = await response.json();
        const currencies = data[0].rates.map((rate: any) => rate.code);
        setAvailableCurrencies(['PLN', ...currencies]);
      } catch (error) {
        console.error('Error fetching available currencies:', error);
      }
    };

    fetchAvailableCurrencies();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);

      const calculateDateRange = (range: '1W' | '1M' | '1Y') => {
        const today = new Date();
        const startDate = new Date();

        switch (range) {
          case '1W':
            startDate.setDate(today.getDate() - 7);
            break;
          case '1M':
            startDate.setMonth(today.getMonth() - 1);
            break;
          case '1Y':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }

        return { startDate, endDate: today };
      };

      const { startDate, endDate } = calculateDateRange(selectedRange);

      if (fromCurrency === toCurrency) {
        setRates({ labels: [], data: [] });
        setLoading(false);
        return;
      }

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const fromUrl = `https://api.nbp.pl/api/exchangerates/rates/A/${fromCurrency}/${formatDate(
        startDate
      )}/${formatDate(endDate)}/?format=json`;
      const toUrl = `https://api.nbp.pl/api/exchangerates/rates/A/${toCurrency}/${formatDate(
        startDate
      )}/${formatDate(endDate)}/?format=json`;

      let fromRates: any[] = [];
      let toRates: any[] = [];

      if (fromCurrency !== 'PLN') {
        const fromResponse = await fetch(fromUrl);
        const fromData = await fromResponse.json();
        fromRates = fromData.rates || [];
      }

      if (toCurrency !== 'PLN') {
        const toResponse = await fetch(toUrl);
        const toData = await toResponse.json();
        toRates = toData.rates || [];
      }

      const labels: string[] = [];
      const data: number[] = [];

      fromRates.forEach((rate: any, index: number) => {
        const date = new Date(rate.effectiveDate);

        if (selectedRange === '1W') {
          labels.push(
            `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString(
              'en-US',
              { weekday: 'short' }
            )}`
          );
        } else if (selectedRange === '1M') {
          labels.push(
            `${date.getDate().toString()} ${date.toLocaleDateString('en-US', {
              month: 'short',
            })}`
          );
        } else if (selectedRange === '1Y') {
          const month = date.toLocaleDateString('en-US', { month: 'short' });

          if (!labels.includes(month)) {
            labels.push(month);

            const monthlyRates = fromRates
              .filter(
                (r: any) =>
                  new Date(r.effectiveDate).getMonth() === date.getMonth()
              )
              .map((r: any) =>
                toCurrency === 'PLN'
                  ? r.mid
                  : r.mid / (toRates[index]?.mid || 1)
              );

            data.push(
              monthlyRates.reduce((a: number, b: number) => a + b, 0) /
              monthlyRates.length
            );
          }
        }

        const rateValue =
          toCurrency === 'PLN'
            ? rate.mid
            : rate.mid / (toRates[index]?.mid || 1);

        if (selectedRange !== '1Y') {
          data.push(rateValue);
        }
      });

      setRates({ labels, data });
      setCurrencyPair(`${fromCurrency}/${toCurrency}`);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeChart = () => {
    fetchRates();
  };

  const handleDataPointClick = (index: number) => {
    if (rates.data.length > index) {
      setSelectedPrice(rates.data[index]);
      setSelectedLabel(rates.labels[index]);
    }
  };

  const handleCurrencySelect = (currency: string) => {
    if (activePicker === 'from') {
      setFromCurrency(currency);
    } else {
      setToCurrency(currency);
    }
    setModalVisible(false);
  };

  const renderCurrencyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleCurrencySelect(item)}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar
  backgroundColor={colors.background}
  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
/>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{currencyPair}</Text>

        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: colors.text, backgroundColor: colors.background }]}
            onPress={() => {
              setActivePicker('from');
              setModalVisible(true);
            }}
          >
            <Text style={[styles.pickerButtonText, { color: colors.text }]}>{fromCurrency}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerButton, { borderColor: colors.text, backgroundColor: colors.background }]}
            onPress={() => {
              setActivePicker('to');
              setModalVisible(true);
            }}
          >
            <Text style={[styles.pickerButtonText, { color: colors.text }]}>{toCurrency}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rangeSelector}>
  {['1W', '1M', '1Y'].map((range) => (
    <TouchableOpacity
      key={range}
      style={[
        styles.rangeButton,
        {
          backgroundColor: selectedRange === range ? colors.tint : colors.background,
          borderColor: selectedRange === range ? colors.activeBorder : colors.inactiveBorder,
        },
      ]}
      onPress={() => setSelectedRange(range as '1W' | '1M' | '1Y')}
    >
      <Text
        style={[
          styles.rangeButtonText,
          { color: selectedRange === range ? colors.text : colors.inactiveRangeText },
        ]}
      >
        {range}
      </Text>
    </TouchableOpacity>
  ))}
</View>



        <TouchableOpacity
          style={[
            styles.chartButton,
            { borderColor: colors.text, backgroundColor: colors.background },
          ]}
          onPress={handleSeeChart}
        >
          <Text style={[styles.chartButtonText, { color: colors.text }]}>See Chart</Text>
        </TouchableOpacity>

        {selectedPrice !== null && (
          <Text style={[styles.priceLabel, { color: colors.text }]}>
            {`Price: ${selectedPrice.toFixed(2)} (${selectedLabel})`}
          </Text>
        )}

        <ScrollView horizontal>
          {rates.data.length > 0 && (
            <LineChart
            data={{
              labels: rates.labels,
              datasets: [
                {
                  data: rates.data,
                },
              ],
            }}
            width={Math.max(rates.labels.length * 50, Dimensions.get('window').width)}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 2,
              color: (opacity = 1) => (colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
              labelColor: (opacity = 1) => (colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colorScheme === 'dark' ? '#FFF' : '#000',
              },
              propsForBackgroundLines: {
                stroke: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            onDataPointClick={({ index }) => handleDataPointClick(index)}
          />
          
          )}
        </ScrollView>

        <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={[styles.modalOverlay, { backgroundColor: colors.modalBackground }]}>
    <View style={[styles.modalContainer, { backgroundColor: colors.modalContentBackground }]}>
      <FlatList
        data={availableCurrencies}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.modalItem, { backgroundColor: colors.modalContentBackground }]}
            onPress={() => handleCurrencySelect(item)}
          >
            <Text style={[styles.modalItemText, { color: colors.modalText }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </View>
</Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  rangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
    borderWidth: 1,
  },
  chartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: Dimensions.get('window').height * 0.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
