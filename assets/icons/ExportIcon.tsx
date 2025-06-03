import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1684 6.74145L15.7546 6.74145C17.5067 6.74145 18.927 8.1618 18.927 9.91387L18.927 13.8794C18.927 15.6315 17.5067 17.0518 15.7546 17.0518L6.23736 17.0518C4.48528 17.0518 3.06494 15.6315 3.06494 13.8794L3.06494 9.91387C3.06494 8.16179 4.48528 6.74146 6.23736 6.74145L7.82356 6.74145" stroke="#1D1B20" stroke-width="2" stroke-linecap="round"/>
<path d="M13.3755 4.3621L11.557 2.5436C11.2473 2.23387 10.7451 2.23387 10.4354 2.5436L8.61687 4.3621" stroke="#1D1B20" stroke-width="2" stroke-linecap="round"/>
<path d="M10.9961 2.77585L10.9961 12.2931" stroke="#1D1B20" stroke-width="2" stroke-linecap="round"/>
</svg>

`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const ExportIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default ExportIcon; 
