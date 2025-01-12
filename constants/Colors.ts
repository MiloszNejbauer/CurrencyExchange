/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    modalBackground: 'rgba(255, 255, 255, 0)',
    border: "#222",
    buttonBackground: tintColorLight, // Dodane
    buttonText: "#fff",
    rangeButtonText: "#222",
    activeRangeButtonText: "#222",
    activeRangeButton: "f2f2f2",
    inactiveRangeText: '#555',
    modalContentBackground: '#fff',
    modalText: '#FFF',
    borderColor: '#222',
    activeBorder: '#222',
    inactiveBorder: '#222',
    inputBackground: '#fff',
    placeholderText: '#222',
    cancelButton: 'rgba(255, 0, 0, 0.25)',
    modalOverlay: 'rgba(0, 0, 0, 0.1)',
    modalContainer: '#fff',
    modalBorder: '#222',
    modalContainerBackground: '#fff',
    tileBackground: tintColorLight,
    tileText: '#fff',
    tileBorder: '#222'
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#555',
    icon: '#9BA1A6',
    tabIconDefault: '#fff',
    tabIconSelected: tintColorDark,
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    border: "#f2f2f2",
    buttonBackground: "#222", // Dodane
    buttonText: "#f2f2f2",
    rangeButtonText: "#f2f2f2",
    activeRangeButtonText: "#222",
    activeRangeButton: "#222",
    inactiveRangeText: '#fff',
    inactiveRangeBorder: '#fff',
    modalContentBackground: '#333', // Tło zawartości modala w ciemnym trybie
    modalText: '#FFF', // Tekst modala w ciemnym trybie
    borderColor: '#fff',
    activeBorder: '#222',
    inactiveBorder: '#888',
    inputBackground: 'rgba(0, 0, 0, 0.5)',
    placeholderText: 'rgba(0, 0, 0, 0.5)',
    cancelButton: 'rgba(0, 0, 0, 0.5)',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalContainer: '#fff',
    modalBorder: '#222',
    modalContainerBackground: '#222',
    tileBackground: '#222',
    tileText: '#fff',
    tileBorder: '#fff'
  },
};
