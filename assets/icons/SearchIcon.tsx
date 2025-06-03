import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="11" cy="11" r="8" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 16.958L21.5 21.958" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const SearchIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default SearchIcon; 
