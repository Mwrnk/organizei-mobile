// src/styles/global.js
import { StyleSheet } from 'react-native';
import colors from './colors';
import { fontNames } from './fonts';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  frame: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
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
