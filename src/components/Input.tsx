import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import React from 'react';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';

const Input = ({ placeholder, secureTextEntry, onChangeText, value, ...props }: TextInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        value={value}
        style={[styles.input, props.style]}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: '#1a1a1a1a',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    width: '100%',
    height: '100%',
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.secondary,
    textAlign: 'left',
  },
});
