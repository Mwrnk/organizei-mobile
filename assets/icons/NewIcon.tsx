import React from 'react';
import { SvgXml } from 'react-native-svg';

const NewIcon = (props: { color?: string, size?: number }) => {
  const xml = `
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="20" height="20" rx="5" stroke="#F5F5F5" stroke-width="1.5"/>
<path d="M8 11H14" stroke="#F5F5F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11 7.99988L11 13.9999" stroke="#F5F5F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  `;

  return (
    <SvgXml 
      xml={xml} 
      width={props.size || 24} 
      height={props.size || 24}
    />
  );
};

export default NewIcon; 
