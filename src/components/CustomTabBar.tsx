import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Globe, Bot, User } from 'lucide-react-native';

const icons: Record<string, React.ElementType> = {
  Home: Home,
  Comunidade: Globe,
  IA: Bot,
  Eu: User,
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#f5f5f5',
      height: 60,
      justifyContent: 'space-around',
      alignItems: 'center'
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;
        const Icon = icons[route.name] || User;

        const color = isFocused ? '#fff' : '#444';
        const labelText = route.name;

        const label =
          typeof options.tabBarLabel === 'function'
            ? options.tabBarLabel({
                focused: isFocused,
                color,
                position: 'below-icon',
                children: labelText
              })
            : options.tabBarLabel ?? labelText;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
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
              backgroundColor: isFocused ? '#000' : 'transparent',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 30,
              alignItems: 'center',
              flexDirection: 'row',
              gap: 6
            }}
          >
            <Icon color={color} size={20} />
            {typeof label === 'string' || typeof label === 'number' ? (
              <Text style={{ color, fontSize: 12 }}>{label}</Text>
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
