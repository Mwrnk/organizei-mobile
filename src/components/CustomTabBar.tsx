import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { Home, Globe, Bot, User } from 'lucide-react-native'; // Remove Lucide imports

import HomeIcon from 'assets/icons/HomeIcon';
import GameIcon from 'assets/icons/GamesIcon';
import EscolarIcon from 'assets/icons/EscolarIcon';
import NetworkIcon from 'assets/icons/NetworkIcon'; // Assuming NetworkIcon for Globe/Comunidade
import BotIcon from 'assets/icons/BotIcon';
import UserIcon from 'assets/icons/UserIcon';

const icons: Record<string, React.ElementType> = {
  Game: GameIcon,
  Escolar: EscolarIcon,
  Comunidade: NetworkIcon,
  IA: BotIcon,
  Eu: UserIcon,
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={{
      position: 'absolute',
      alignItems: 'center',
      width: '100%',
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: 10,
      paddingBottom: 24,
      backgroundColor: 'transparent',
    }}>
      <View
        style={{
          flexDirection: 'row',
          width: '93%',
          backgroundColor: '#f5f5f5',
          height: 80,
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          borderRadius: 999,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const IconComponent = icons[route.name] || UserIcon;
          const iconColor = isFocused ? '#000' : '#444';
          const labelTextColor = isFocused ? '#000' : '#444';
          const labelText = route.name;

          const label =
            typeof options.tabBarLabel === 'function'
              ? options.tabBarLabel({
                  focused: isFocused,
                  color: labelTextColor,
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
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 50,
              }}
            >
              <View
                style={{
                  backgroundColor: isFocused ? '#18171A' : 'transparent',
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
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
                    fontSize: 12,
                    fontWeight: isFocused ? '600' : '400',
                    marginTop: 2,
                  }}
                  numberOfLines={1}
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
    </View>
  );
};

export default CustomTabBar;
