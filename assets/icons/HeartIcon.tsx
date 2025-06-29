import React from 'react';
import { SvgXml } from 'react-native-svg';

const HeartIcon = (props: { color?: string, size?: number }) => {
  const xml = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="icon=curtida">
  <path id="Vector" d="M12 7.69431C10 2.99988 3 3.49988 3 9.49991C3 15.4999 12 20.5001 12 20.5001C12 20.5001 21 15.4999 21 9.49991C21 3.49988 14 2.99988 12 7.69431Z" stroke="${props.color || '#000'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  </svg>


  `;

  return (
    <SvgXml 
      xml={xml} 
      width={props.size || 24} 
      height={props.size || 24}
      color={props.color || '#000'} 
    />
  );
};

export default HeartIcon; 
