import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { Home, Globe, Bot, User } from 'lucide-react-native'; // Remove Lucide imports

import HomeIcon from 'assets/icons/HomeIcon';
import EscolarIcon from 'assets/icons/EscolarIcon';
import NetworkIcon from 'assets/icons/NetworkIcon'; // Assuming NetworkIcon for Globe/Comunidade
import BotIcon from 'assets/icons/BotIcon';
import UserIcon from 'assets/icons/UserIcon';

const icons: Record<string, React.ElementType> = {
  Home: HomeIcon,
  Escolar: EscolarIcon,
  Comunidade: NetworkIcon, // Changed from Globe to NetworkIcon
  IA: BotIcon,
  Eu: UserIcon,
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        height: 60,
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;
        // Use UserIcon as a fallback if no specific icon is found for a route name
        const IconComponent = icons[route.name] || UserIcon;

        const iconColor = isFocused ? '#000' : '#444'; // Adjusted focused color for better visibility with default SVG black
        const labelTextColor = isFocused ? '#000' : '#444';
        const labelText = route.name;

        const label =
          typeof options.tabBarLabel === 'function'
            ? options.tabBarLabel({
                focused: isFocused,
                color: labelTextColor, // Use labelTextColor for the label
                position: 'below-icon',
                children: labelText,
              })
            : options.tabBarLabel ?? labelText;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 30,
              alignItems: 'center',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <View
              style={{
                backgroundColor: isFocused ? '#18171A' : 'transparent',
                borderRadius: 24,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconComponent color={isFocused ? '#fff' : '#888'} size={22} />
            </View>
            {typeof label === 'string' || typeof label === 'number' ? (
              <Text
                style={{
                  color: isFocused ? '#18171A' : '#888',
                  fontSize: 15,
                  fontWeight: isFocused ? '600' : '400',
                  marginTop: 2,
                }}
              >
                {label}
              </Text>
            ) : (
              label
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
