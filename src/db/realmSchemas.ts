const Realm = require('realm');

// Schema para o modelo List
const List = {
  name: 'List',
  primaryKey: '_id',
  properties: {
    _id: 'string',
    userId: 'string',
    title: 'string',
    description: { type: 'string', optional: true },
    createdAt: 'date',
    updatedAt: 'date',
    isSynced: { type: 'bool', default: true },
    isDeleted: { type: 'bool', default: false },
    cards: { type: 'list', objectType: 'Card' }
  }
};

// Schema para o modelo Card
const Card = {
  name: 'Card',
  primaryKey: '_id',
  properties: {
    _id: 'string',
    listId: 'string',
    list: { type: 'linkingObjects', objectType: 'List', property: 'cards' },
    userId: 'string',
    title: 'string',
    priority: { type: 'string', default: 'Baixa' },
    is_published: { type: 'bool', default: false },
    image_url: { type: 'list', objectType: 'string' },
    likes: { type: 'int', default: 0 },
    likedBy: { type: 'list', objectType: 'string' },
    downloads: { type: 'int', default: 0 },
    createdAt: 'date',
    updatedAt: 'date',
    content: { type: 'string', default: '' },
    isSynced: { type: 'bool', default: true },
    isDeleted: { type: 'bool', default: false }
  }
};

// Schema para o modelo User
const User = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'string',
    coduser: 'string',
    name: 'string',
    email: 'string',
    password: { type: 'string', optional: true },
    dateOfBirth: 'date',
    role: { type: 'string', default: 'user' },
    plan: 'string?',
    orgPoints: { type: 'int', default: 0 },
    profileImage: 'string?',
    loginAttempts: { type: 'int', default: 0 },
    lastLoginAttempt: 'date?',
    createdAt: 'date',
    updatedAt: 'date',
    isSynced: { type: 'bool', default: false },
    isDeleted: { type: 'bool', default: false },
    cards: { type: 'list', objectType: 'Card' }
  }
};

// Array com todos os schemas que serão usados no Realm
const realmSchemas = [User, List, Card];

module.exports = {
  Card,
  List,
  User,
  realmSchemas
};