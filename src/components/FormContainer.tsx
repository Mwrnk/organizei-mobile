import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormContainerProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  scrollEnabled?: boolean;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  scrollEnabled = true,
}) => {
  const insets = useSafeAreaInsets();

  const Container = scrollEnabled ? ScrollView : View;
  const containerProps = scrollEnabled
    ? {
        contentContainerStyle: [
          styles.scrollContent,
          { paddingBottom: 180 + insets.bottom },
          contentContainerStyle,
        ],
      }
    : {};

  return (
    <Container style={[styles.container, style]} {...containerProps}>
      <View style={styles.form}>{children}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  form: {
    padding: 16,
  },
}); 