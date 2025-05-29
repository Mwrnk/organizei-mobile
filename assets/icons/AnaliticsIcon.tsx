import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="2" y="2" width="20" height="20" rx="5" stroke="#1D1B20" stroke-width="1.5"/>
<path d="M8 17L8 14" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 17L12 7" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 17L16 10" stroke="#1D1B20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const AnaliticsIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default AnaliticsIcon; 
