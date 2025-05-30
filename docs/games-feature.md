# Documentação da Feature de Jogos

## Visão Geral
Esta documentação detalha a implementação da feature de jogos no aplicativo Organizei Mobile, que inclui uma tela principal de jogos e duas modalidades: Flash Cards e Jogo do Milhão.

## Estrutura de Arquivos

```
src/
├── screens/
│   ├── HomeScreen.tsx       # Tela principal de jogos
│   ├── FlashCardsScreen.tsx # Tela do jogo Flash Cards
│   └── JogoDoMilhaoScreen.tsx # Tela do Jogo do Milhão
└── navigation/
    ├── types.ts            # Tipos das rotas
    └── AppRoutes.tsx       # Configuração das rotas
```

## Navegação

### Tipos de Rotas
```typescript
// navigation/types.ts
export type RootTabParamList = {
  // ... outras rotas ...
  FlashCards: undefined;
  JogoDoMilhao: undefined;
};
```

### Stack Navigator de Jogos
```typescript
// navigation/AppRoutes.tsx
const GameStack = createStackNavigator();

function GameStackScreen() {
  return (
    <GameStack.Navigator screenOptions={{ headerShown: false }}>
      <GameStack.Screen name="GameHome" component={HomeScreen} />
      <GameStack.Screen name="FlashCards" component={FlashCardsScreen} />
      <GameStack.Screen name="JogoDoMilhao" component={JogoDoMilhaoScreen} />
    </GameStack.Navigator>
  );
}
```

## Componentes

### Tela Principal (HomeScreen)
- Card principal azul mostrando pontuação
- Cards clicáveis para cada jogo
- Barra de navegação inferior
- Navegação tipada usando `StackNavigationProp`

### Flash Cards
- Tela básica com título e descrição
- Preparada para implementação futura do jogo
- Integração com IA para geração de perguntas

### Jogo do Milhão
- Tela básica com título e descrição
- Preparada para implementação futura do jogo
- Sistema de perguntas e respostas com pontuação

## Estilização

### Cores Principais
- Azul principal: `#007AFF`
- Fundo dos cards: `#fff`
- Texto secundário: `#666`
- Fundo da navegação: `#F2F2F7`

### Componentes de UI
- Cards com sombras e bordas arredondadas
- Ícones da biblioteca Ionicons
- Layout responsivo com SafeAreaView

## Próximos Passos

1. Implementar a lógica do jogo Flash Cards
   - Integração com IA para geração de perguntas
   - Sistema de pontuação
   - Animações de cards

2. Implementar a lógica do Jogo do Milhão
   - Banco de perguntas
   - Sistema de pontuação
   - Níveis de dificuldade

3. Melhorias Gerais
   - Persistência de pontuação
   - Sistema de conquistas
   - Ranking de jogadores

## Como Usar

1. Navegação para os Jogos:
   ```typescript
   navigation.navigate('FlashCards'); // Para Flash Cards
   navigation.navigate('JogoDoMilhao'); // Para Jogo do Milhão
   ```

2. Tipagem da Navegação:
   ```typescript
   type GameStackNavigationProp = StackNavigationProp<RootTabParamList>;
   const navigation = useNavigation<GameStackNavigationProp>();
   ```

## Observações Importantes

- A navegação está configurada usando Stack Navigator para permitir animações de transição entre telas
- O design segue o padrão do aplicativo com cards e elementos visuais consistentes
- A estrutura está preparada para expansão futura com novos jogos
- Todas as telas são responsivas e utilizam SafeAreaView para compatibilidade com diferentes dispositivos 