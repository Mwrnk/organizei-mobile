import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';

interface MemberCardProps {
  name: string;
  image: ImageSourcePropType;
  description: string;
  style?: 'first' | 'second';
}

const MemberCard = ({ name, image, description, style = 'first' }: MemberCardProps) => {
  return (
    <View style={[styles.container, style === 'first' ? styles.first : styles.second]}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 6,
  },
  first: {
    paddingTop: 16,
  },
  second: {
    paddingBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  description: {
    fontSize: 10,
    fontFamily: fontNames.regular,
    color: colors.gray,
  },
});

export default MemberCard; 