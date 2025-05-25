const { getRealm } = require('./realmDatabase');
const { Card, List, User } = require('./realmSchemas');
const Realm = require('realm');

// Funções para Listas
async function createList(list: any) {
  const realm = await getRealm();
  return realm.write(() => {
    return realm.create('List', list);
  });
}

async function getAllLists() {
  const realm = await getRealm();
  return realm.objects('List');
}

async function updateList(id: string, updates: any) {
  const realm = await getRealm();
  return realm.write(() => {
    const list = realm.objectForPrimaryKey('List', id);
    if (list) {
      Object.assign(list, updates);
    }
    return list;
  });
}

async function deleteList(id: string) {
  const realm = await getRealm();
  return realm.write(() => {
    const list = realm.objectForPrimaryKey('List', id);
    if (list) {
      realm.delete(list);
    }
  });
}

// Funções para Cards
async function createCard(card: any) {
  const realm = await getRealm();
  return realm.write(() => {
    return realm.create('Card', card);
  });
}

async function getAllCards() {
  const realm = await getRealm();
  return realm.objects('Card');
}

async function updateCard(id: string, updates: any) {
  const realm = await getRealm();
  return realm.write(() => {
    const card = realm.objectForPrimaryKey('Card', id);
    if (card) {
      Object.assign(card, updates);
    }
    return card;
  });
}

async function deleteCard(id: string) {
  const realm = await getRealm();
  return realm.write(() => {
    const card = realm.objectForPrimaryKey('Card', id);
    if (card) {
      realm.delete(card);
    }
  });
}

// Funções para Usuário
async function saveOrUpdateCurrentUser(user: any) {
  const realm = await getRealm();
  return realm.write(() => {
    return realm.create('User', user, true);
  });
}

async function getCurrentUser(id: string) {
  const realm = await getRealm();
  return realm.objectForPrimaryKey('User', id);
}

async function getAllUsers() {
  const realm = await getRealm();
  return realm.objects('User');
}

async function updateUser(id: string, updates: any) {
  const realm = await getRealm();
  return realm.write(() => {
    const user = realm.objectForPrimaryKey('User', id);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  });
}

async function deleteUser(id: string) {
  const realm = await getRealm();
  return realm.write(() => {
    const user = realm.objectForPrimaryKey('User', id);
    if (user) {
      realm.delete(user);
    }
  });
}

// Função para obter cards por lista
async function getCardsByList(listId: string) {
  const realm = await getRealm();
  return realm.objects('Card').filtered('listId = $0', listId);
}

module.exports = {
  createList,
  getAllLists,
  updateList,
  deleteList,
  createCard,
  getAllCards,
  updateCard,
  deleteCard,
  saveOrUpdateCurrentUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getCardsByList,
};
