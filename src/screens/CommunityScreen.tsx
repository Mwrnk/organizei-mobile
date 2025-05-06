import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Input from '@components/Input';
import { GlobalStyles } from '@styles/global';
const CommunityScreen = () => {
  return (
    <View style={GlobalStyles.container}>
      <View>
        <Text style={GlobalStyles.title2}>O que está procurando hoje?</Text>
        <Input
          placeholder="Pesquise por tópicos ou pessoas"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => {}}
        />
      </View>
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
