// src/styles/global.js
import { StyleSheet } from 'react-native';
import colors from './colors';
import { fontNames } from './fonts';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  title2: {
    fontSize: 32,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  text: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },
  textSmall: {
    fontSize: 12,
    fontFamily: fontNames.semibold,
    color: colors.primary,
  },
  textLink: {
    fontSize: 12,
    fontFamily: fontNames.semibold,
    color: colors.textLink,
  },
});
