# Organizei Mobile

Aplicativo móvel desenvolvido com React Native e Expo para auxiliar estudantes na organização e otimização dos estudos, oferecendo uma plataforma completa de gerenciamento de tarefas e recursos educacionais.

## 🚀 Tecnologias

- React Native 0.79.2
- Expo SDK 53
- TypeScript
- Realm Database
- React Navigation 7
- Expo Router
- Async Storage
- Axios
- React Native Reanimated
- React Native Gesture Handler
- Expo Image Picker
- React Native Markdown Display
- React Native SVG

## 📱 Funcionalidades

- Sistema de autenticação completo (login/registro)
- Gerenciamento de perfil de usuário
- Criação e gerenciamento de cards de estudo
- Sistema de quadros e listas
- Jogos educacionais (Jogo do Milhão)
- Flash Cards
- Sistema de pontos e recompensas
- Comunidade de usuários
- Integração com IA
- Suporte a documentos e imagens
- Modo offline com sincronização
- Interface moderna e responsiva
- Sistema de planos (gratuito/premium)

## 🛠️ Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn
- Expo CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas em macOS)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Mwrnk/organizei-mobile.git
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o projeto:
```bash
npm start
# ou
yarn start
```

## 📦 Scripts Disponíveis

- `npm start` ou `yarn start`: Inicia o servidor de desenvolvimento
- `npm run android` ou `yarn android`: Executa o app no Android
- `npm run ios` ou `yarn ios`: Executa o app no iOS
- `npm run web` ou `yarn web`: Executa o app na versão web
- `npm run test:db` ou `yarn test:db`: Executa testes do banco de dados
- `npm run test:sync` ou `yarn test:sync`: Executa testes de sincronização

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── config/        # Configurações do app
├── constants/     # Constantes e enums
├── contexts/      # Contextos do React
├── controllers/   # Controladores de lógica
├── db/           # Configuração e modelos do banco de dados
├── models/       # Modelos de dados
├── navigation/   # Configuração de navegação
├── screens/      # Telas do aplicativo
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── BoardScreen.tsx
│   ├── CreateCardScreen.tsx
│   ├── GamesScreen.tsx
│   ├── CommunityScreen.tsx
│   └── ...
├── services/     # Serviços e APIs
├── styles/       # Estilos globais
├── types/        # Definições de tipos TypeScript
└── utils/        # Funções utilitárias
```

## 🔐 Permissões

O aplicativo requer as seguintes permissões:

- Câmera: Para tirar fotos de perfil
- Galeria: Para selecionar imagens
- Armazenamento: Para salvar documentos e imagens
- Internet: Para sincronização e recursos online

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 📞 Suporte

Para suporte, envie um email para carlosbrenops01@gmail.com ou abra uma issue no repositório.
