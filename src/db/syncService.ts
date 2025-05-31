const { getRealm } = require('./realmDatabase');
const { Card, List, User } = require('./realmSchemas');
const Realm = require('realm');

// Configuração da API
const API_URL = 'http://localhost:3000';

// Interface para os dados que vêm do servidor
interface IServerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Interfaces para os objetos do Realm
interface IRealmList {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isSynced: boolean;
  isDeleted: boolean;
  cards: any[];
}

interface IRealmCard {
  _id: string;
  listId: string;
  userId: string;
  title: string;
  priority: string;
  is_published: boolean;
  image_url: string[];
  pdfs: any[];
  likes: number;
  comments: any[];
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  isSynced: boolean;
  isDeleted: boolean;
  list: any[];
}

interface IRealmUser {
  _id: string;
  coduser: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  role: string;
  plan?: string;
  orgPoints: number;
  profileImage?: string;
  loginAttempts: number;
  lastLoginAttempt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isSynced: boolean;
  cards: any[];
}

// Função para obter o token de autenticação
async function getAuthToken(): Promise<string | null> {
  try {
    const realm = await getRealm();
    // Primeiro, vamos verificar se existe algum usuário
    const users = realm.objects('User');
    if (users.length === 0) {
      return null;
    }

    // Se existir usuário, vamos usar o primeiro como autenticado
    const currentUser = users[0];
    return currentUser._id;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
}

// Função para fazer requisições autenticadas
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Função para sincronizar dados com o servidor
async function syncWithServer() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    // 1. Sincronizar Lists
    await syncLists();

    // 2. Sincronizar Cards
    await syncCards();

    // 3. Sincronizar Users
    await syncUsers();
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    throw error;
  }
}

// Função para sincronizar Lists
async function syncLists() {
  const realm = await getRealm();

  try {
    // Buscar todas as lists não sincronizadas
    const unsyncedLists = realm.objects('List').filtered('isSynced == false');

    for (const list of unsyncedLists) {
      try {
        // Se a list foi marcada como deletada, enviar para o servidor
        if (list.isDeleted) {
          await deleteListOnServer(list._id);
        } else {
          // Se é uma nova list ou foi atualizada
          await syncListWithServer(list);
        }

        // Marcar como sincronizada
        realm.write(() => {
          list.isSynced = true;
        });
      } catch (error) {
        console.error(`Erro ao sincronizar list ${list._id}:`, error);
        // Não marcar como sincronizada em caso de erro
      }
    }

    // Buscar lists do servidor que não existem localmente
    await fetchNewListsFromServer();
  } catch (error) {
    console.error('Erro ao sincronizar lists:', error);
    throw error;
  }
}

// Função para sincronizar Cards
async function syncCards() {
  const realm = await getRealm();

  try {
    // Buscar todos os cards não sincronizados
    const unsyncedCards = realm.objects('Card').filtered('isSynced == false');

    for (const card of unsyncedCards) {
      try {
        // Se o card foi marcado como deletado, enviar para o servidor
        if (card.isDeleted) {
          await deleteCardOnServer(card._id);
        } else {
          // Se é um novo card ou foi atualizado
          await syncCardWithServer(card);
        }

        // Marcar como sincronizado
        realm.write(() => {
          card.isSynced = true;
        });
      } catch (error) {
        console.error(`Erro ao sincronizar card ${card._id}:`, error);
        // Não marcar como sincronizado em caso de erro
      }
    }

    // Buscar cards do servidor que não existem localmente
    await fetchNewCardsFromServer();
  } catch (error) {
    console.error('Erro ao sincronizar cards:', error);
    throw error;
  }
}

// Função para sincronizar Users
async function syncUsers() {
  const realm = await getRealm();

  try {
    // Buscar todos os users não sincronizados
    const unsyncedUsers = realm.objects('User').filtered('isSynced == false');

    for (const user of unsyncedUsers) {
      try {
        await syncUserWithServer(user);

        // Marcar como sincronizado
        realm.write(() => {
          user.isSynced = true;
        });
      } catch (error) {
        console.error(`Erro ao sincronizar user ${user._id}:`, error);
        // Não marcar como sincronizado em caso de erro
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar users:', error);
    throw error;
  }
}

// Funções auxiliares para comunicação com o servidor

async function syncListWithServer(list: IRealmList): Promise<IServerResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/lists`, {
      method: list._id ? 'PUT' : 'POST',
      body: JSON.stringify({
        _id: list._id,
        userId: list.userId,
        title: list.title,
        description: list.description,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao sincronizar list com servidor:', error);
    throw error;
  }
}

async function syncCardWithServer(card: IRealmCard): Promise<IServerResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/cards`, {
      method: card._id ? 'PUT' : 'POST',
      body: JSON.stringify({
        _id: card._id,
        listId: card.listId,
        userId: card.userId,
        title: card.title,
        priority: card.priority,
        is_published: card.is_published,
        image_url: card.image_url,
        pdfs: card.pdfs,
        likes: card.likes,
        comments: card.comments,
        downloads: card.downloads,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        content: card.content,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao sincronizar card com servidor:', error);
    throw error;
  }
}

async function syncUserWithServer(user: IRealmUser): Promise<IServerResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/users`, {
      method: 'PUT',
      body: JSON.stringify({
        _id: user._id,
        coduser: user.coduser,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        plan: user.plan,
        orgPoints: user.orgPoints,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao sincronizar user com servidor:', error);
    throw error;
  }
}

async function deleteListOnServer(listId: string): Promise<IServerResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/lists/${listId}`, {
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao deletar list no servidor:', error);
    throw error;
  }
}

async function deleteCardOnServer(cardId: string): Promise<IServerResponse> {
  try {
    const response = await fetchWithAuth(`${API_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao deletar card no servidor:', error);
    throw error;
  }
}

async function fetchNewListsFromServer() {
  try {
    const response = await fetchWithAuth(`${API_URL}/lists`);
    const data = await response.json();

    if (data.success && data.data) {
      const realm = await getRealm();
      realm.write(() => {
        data.data.forEach((listData: any) => {
          realm.create(
            'List',
            {
              ...listData,
              isSynced: true,
              isDeleted: false,
            },
            Realm.UpdateMode.Modified
          );
        });
      });
    }
  } catch (error) {
    console.error('Erro ao buscar novas lists do servidor:', error);
    throw error;
  }
}

async function fetchNewCardsFromServer() {
  try {
    const response = await fetchWithAuth(`${API_URL}/cards`);
    const data = await response.json();

    if (data.success && data.data) {
      const realm = await getRealm();
      realm.write(() => {
        data.data.forEach((cardData: any) => {
          realm.create(
            'Card',
            {
              ...cardData,
              isSynced: true,
              isDeleted: false,
            },
            Realm.UpdateMode.Modified
          );
        });
      });
    }
  } catch (error) {
    console.error('Erro ao buscar novos cards do servidor:', error);
    throw error;
  }
}

module.exports = {
  syncWithServer,
  syncLists,
  syncCards,
  syncUsers,
  syncListWithServer,
  syncCardWithServer,
  syncUserWithServer,
  deleteListOnServer,
  deleteCardOnServer,
  fetchNewListsFromServer,
  fetchNewCardsFromServer,
};
