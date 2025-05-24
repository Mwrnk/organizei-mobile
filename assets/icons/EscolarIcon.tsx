import React from 'react';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9Z" fill="currentColor"/>
<path d="M17 16L12 13.5L7 16V13.5L12 11L17 13.5V16Z" fill="currentColor"/>
<path d="M7 18.5V16L12 18.5L17 16V18.5L12 21L7 18.5Z" fill="currentColor"/>
</svg>
`;

// Ícone representando educação/escola (chapéu de formatura e livros)
const EscolarIcon = (props: { color?: string; size?: number }) => (
  <SvgXml
    xml={xml}
    width={props.size || 24}
    height={props.size || 24}
    fill={props.color || '#000'}
    {...props}
  />
);

export default EscolarIcon;
