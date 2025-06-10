import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Interface / Exit">
<path id="Vector" d="M12 15L15 12M15 12L12 9M15 12H4M4 7.24802V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2839 4.21799 18.9076C4 18.4798 4 17.9201 4 16.8V16.75" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>

`;

const LogOutIcon = (props: { color?: string, size?: number }) => {
  // For SVGs with stroke, we need to pass the color to the stroke prop
  // We will modify the XML string to replace the stroke color if a color prop is provided.
  // Note: This is a basic replacement and might need to be more robust for complex SVGs.
  let finalXml = xml;
  if (props.color) {
    finalXml = xml.replace(/stroke="#[0-9a-fA-F]+"/g, `stroke="${props.color}"`);
  }

  return (
    <SvgXml 
      xml={finalXml} 
      width={props.size || 24} 
      height={props.size || 24} 
      {...props} // Pass other props like style
    />
  );
};

export default LogOutIcon; 