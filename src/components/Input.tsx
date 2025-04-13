import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import React from 'react'
import { fontNames } from '@styles/fonts'
import colors from '@styles/colors'

const Input = ({ placeholder, secureTextEntry, onChangeText }: TextInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput 
        placeholder={placeholder} 
        secureTextEntry={secureTextEntry} 
        onChangeText={onChangeText} 
        style={styles.input} 
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        height: 70,
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
        fontSize: 16,
        fontFamily: fontNames.regular,
        color: colors.secondary,
    }
})
