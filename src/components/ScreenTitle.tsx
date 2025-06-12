import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ScreenTitleProps {
  title: string;
  style?: any;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({ title, style }) => {
  return <Text style={[styles.title, style]}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
}); 