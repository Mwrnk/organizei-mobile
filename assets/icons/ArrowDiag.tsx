import React from 'react';
import { SvgXml } from 'react-native-svg';

const ArrowDiag = (props: { color?: string, size?: number }) => {
  const xml = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.1465 6.69653L16.8034 6.69653C17.3557 6.69653 17.8034 7.14425 17.8034 7.69653V12.3534M17.0963 7.40365L7.19678 17.3031" stroke="${props.color || '#000'}" stroke-width="1.5" stroke-linecap="round"/>
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

export default ArrowDiag; 
