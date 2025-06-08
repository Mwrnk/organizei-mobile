import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.66634 16.6003L5.93631 15.5844L5.94565 15.5772C6.21041 15.3654 6.34401 15.2585 6.49307 15.1823C6.6268 15.114 6.7694 15.0643 6.9165 15.0341C7.08231 15 7.25503 15 7.60173 15H14.8359C15.7675 15 16.2338 15 16.59 14.8186C16.9036 14.6588 17.1587 14.4035 17.3185 14.0899C17.5 13.7338 17.5 13.268 17.5 12.3364V5.99747C17.5 5.06587 17.5 4.59938 17.3185 4.2432C17.1587 3.9296 16.9031 3.67482 16.5895 3.51503C16.233 3.33337 15.7669 3.33337 14.8335 3.33337H5.16683C4.23341 3.33337 3.76635 3.33337 3.40983 3.51503C3.09623 3.67482 2.84144 3.9296 2.68166 4.2432C2.5 4.59972 2.5 5.06678 2.5 6.0002V15.5594C2.5 16.4475 2.5 16.8914 2.68205 17.1195C2.84037 17.3178 3.08036 17.4332 3.33415 17.4329C3.62596 17.4326 3.97287 17.1551 4.66634 16.6003Z" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>


`;

// You might need to adjust props like width, height, and fill (color) based on your needs
const ChatIcon = (props: { color?: string, size?: number }) => (
  <SvgXml 
    xml={xml} 
    width={props.size || 24} 
    height={props.size || 24} 
    color={props.color || '#000'} 
  />
);

export default ChatIcon; 
