import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.9999 17.9999L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1B20" stroke-width="1.99999" stroke-linecap="round" stroke-linejoin="round"/>
</svg>


`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const CloseIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default CloseIcon; 
