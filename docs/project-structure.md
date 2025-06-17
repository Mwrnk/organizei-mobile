# Estrutura do Projeto Organizei Mobile

## 📁 Visão Geral da Estrutura

O Organizei Mobile é um aplicativo React Native desenvolvido com Expo que segue uma arquitetura modular e bem organizada. Este documento explica a estrutura de pastas e a responsabilidade de cada componente.

## 🏗️ Estrutura de Diretórios

```
organizei-mobile/
├── app/                    # Pasta principal do Expo
│   └── App.tsx            # Componente raiz do aplicativo
├── assets/                 # Recursos estáticos
│   ├── fonts/             # Fontes customizadas (Kodchasan)
│   ├── icons/             # Ícones SVG customizados
│   ├── imgs/              # Imagens do aplicativo
│   └── banners/           # Banners e imagens promocionais
├── src/                    # Código fonte principal
│   ├── components/         # Componentes reutilizáveis
│   ├── config/            # Configurações do app
│   ├── constants/         # Constantes e enums
│   ├── contexts/          # Contextos do React
│   ├── controllers/       # Controladores de lógica
│   ├── db/               # Configuração do banco Realm
│   ├── models/           # Modelos de dados
│   ├── navigation/       # Configuração de navegação
│   ├── screens/          # Telas do aplicativo (organizadas)
│   ├── services/         # Serviços e APIs
│   ├── styles/           # Estilos globais
│   ├── types/            # Definições TypeScript
│   └── utils/            # Funções utilitárias
├── docs/                  # Documentação do projeto
├── .expo/                 # Cache do Expo
├── node_modules/          # Dependências do npm
└── Arquivos de Configuração
```

## 📱 Organização das Telas (src/screens/)

As telas estão organizadas em subpastas por funcionalidade:

### 🔐 **auth/** - Autenticação
- `LoginScreen.tsx` - Tela de login com suporte a biometria
- `RegisterScreen.tsx` - Tela de registro de usuário

### 👤 **profile/** - Perfil do Usuário
- `ProfileScreen.tsx` - Tela principal do perfil
- `EditProfileScreen.tsx` - Edição de dados do perfil
- `UserProfileScreen.tsx` - Visualização de perfil de outros usuários

### 📋 **cards/** - Gerenciamento de Cards
- `AllCardsScreen.tsx` - Listagem de todos os cards
- `CardDetailScreen.tsx` - Detalhes de um card específico
- `CreateCardScreen.tsx` - Criação de novos cards
- `FlashCardsScreen.tsx` - Funcionalidade de flashcards

### 🎮 **games/** - Jogos Educacionais
- `GamesScreen.tsx` - Tela principal dos jogos
- `JogoDoMilhaoScreen.tsx` - Jogo do Milhão
- `BoardScreen.tsx` - Quadro de jogos

### 🏆 **points/** - Sistema de Pontos
- `PointsScreen.tsx` - Visualização de pontos
- `PlanScreen.tsx` - Gerenciamento de planos

### 👥 **community/** - Comunidade
- `CommunityScreen.tsx` - Tela principal da comunidade

### 📚 **escolar/** - Módulo Escolar
- `EscolarScreen.tsx` - Módulo principal escolar

### 🤖 **ai/** - Integração com IA
- `AIScreen.tsx` - Interface com ORGAN.IA

### ℹ️ **info/** - Informações
- `AboutScreen.tsx` - Sobre o aplicativo

## 🔧 Arquivos de Configuração

### **package.json**
- Define dependências do projeto
- Scripts de desenvolvimento e teste
- Configurações do projeto

### **tsconfig.json**
- Configuração do TypeScript
- Aliases de importação (@components, @styles, etc.)
- Configurações de compilação

### **babel.config.js**
- Configuração do Babel (transpilador)
- Plugin de resolução de módulos
- Aliases para importações

### **metro.config.js**
- Configuração do Metro bundler
- Resolução de assets e módulos
- Aliases para o bundler

### **app.json**
- Configuração do Expo
- Informações do aplicativo
- Permissões e configurações nativas

## 🎨 Sistema de Estilos

### **src/styles/colors.tsx**
- Paleta de cores do aplicativo
- Cores organizadas por categoria
- Sistema de prioridades (alta, média, baixa)

### **src/styles/fonts.tsx**
- Configuração das fontes Kodchasan
- Aliases para facilitar uso
- Carregamento de fontes customizadas

### **src/styles/global.tsx**
- Estilos globais do aplicativo
- Componentes base reutilizáveis

## 🔐 Sistema de Autenticação

### **src/contexts/AuthContext.tsx**
- Gerenciamento de estado de autenticação
- Funções de login/logout
- Atualização de dados do usuário

### **src/services/auth.ts**
- Integração com API de autenticação
- Armazenamento seguro de tokens
- Mapeamento de dados da API

## 🗄️ Banco de Dados

### **src/db/**
- Configuração do Realm Database
- Modelos de dados locais
- Serviços de sincronização

## 🧭 Sistema de Navegação

### **src/navigation/Routes.tsx**
- Roteamento principal baseado em autenticação
- Decisão entre rotas autenticadas e não autenticadas

### **src/navigation/AppRoutes.tsx**
- Rotas do aplicativo principal (usuário logado)
- Navegação por abas
- Stacks de navegação

### **src/navigation/AuthRoutes.tsx**
- Rotas de autenticação (login/registro)
- Stack de navegação para autenticação

## 🔧 Serviços e APIs

### **src/services/api.ts**
- Configuração do cliente HTTP (Axios)
- Interceptors para autenticação
- Configurações de base URL

### **src/services/**
- Serviços específicos por funcionalidade
- Integração com APIs externas
- Lógica de negócio

## 🎯 Componentes

### **src/components/**
- Componentes reutilizáveis
- Organizados por funcionalidade
- Componentes específicos da comunidade

## 📝 Tipos TypeScript

### **src/types/**
- Definições de interfaces
- Tipos para navegação
- Tipos para dados da API

## 🛠️ Utilitários

### **src/utils/**
- Funções utilitárias
- Helpers para formatação
- Utilitários de rede

## 🔄 Fluxo de Dados

1. **Inicialização**: App.tsx carrega fontes e configura providers
2. **Autenticação**: Routes.tsx decide qual conjunto de rotas exibir
3. **Navegação**: Usuário navega entre telas organizadas por funcionalidade
4. **Dados**: Serviços fazem requisições para APIs e gerenciam estado local
5. **Persistência**: Realm Database armazena dados localmente

## 🎨 Design System

- **Cores**: Sistema consistente de cores com prioridades
- **Fontes**: Kodchasan como fonte principal
- **Componentes**: Biblioteca de componentes reutilizáveis
- **Ícones**: Sistema de ícones SVG customizados

## 🔐 Segurança

- **Biometria**: Suporte a Touch ID, Face ID e impressão digital
- **Tokens**: Armazenamento seguro de JWT
- **Validação**: Validação de dados em múltiplas camadas

Esta estrutura garante organização, manutenibilidade e escalabilidade do projeto. 