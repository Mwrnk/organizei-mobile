import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 9L12.7809 14.3306C12.3316 14.7158 11.6684 14.7158 11.2191 14.3306L5 9" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const ArrowDownIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default ArrowDownIcon; 
