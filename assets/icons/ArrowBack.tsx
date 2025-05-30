import React from 'react';
import { SvgXml } from 'react-native-svg';

const ArrowBack = (props: { color?: string, size?: number }) => {
  const xml = `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.00003 14L2.70714 10.7071C2.31661 10.3166 2.31661 9.68342 2.70714 9.29289L6.00003 6M3.00003 10L17 10" stroke="${props.color || '#000'}" stroke-width="1.5" stroke-linecap="round"/>
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

export default ArrowBack; 
