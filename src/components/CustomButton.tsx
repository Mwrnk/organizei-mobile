import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  View 
} from 'react-native';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  loading = false, 
  variant = 'primary',
  buttonStyle, 
  textStyle,
  disabled,
  icon,
  iconPosition = 'left',
  ...rest 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.buttonText;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={variant === 'outline' ? colors.button : '#FFFFFF'} />;
    }

    const textComponent = <Text style={[getTextStyle(), textStyle]}>{title}</Text>;

    if (!icon) {
      return textComponent;
    }

    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && <View style={styles.iconContainer}>{icon}</View>}
        {textComponent}
        {iconPosition === 'right' && <View style={styles.iconContainer}>{icon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        getButtonStyle(), 
        disabled && styles.disabledButton,
        buttonStyle
      ]} 
      disabled={disabled || loading}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
});

export default CustomButton;
    