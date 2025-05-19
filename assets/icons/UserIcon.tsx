import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 21C19 17.134 15.866 14 12 14C8.13401 14 5 17.134 5 21M12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7C16 9.20914 14.2091 11 12 11Z" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const UserIcon = (props: { color?: string, size?: number }) => {
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

export default UserIcon; 