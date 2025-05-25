import Realm from 'realm';

// Schema para o objeto aninhado Pdf
export class Pdf extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Pdf',
    embedded: true, // Define como objeto aninhado (não tem sua própria tabela)
    properties: {
      url: 'string',
      filename: 'string',
      uploaded_at: 'date',
      size_kb: 'int?', // '?' indica que o campo é opcional (pode ser null)
    },
  };
}

// Schema para o objeto aninhado Comment
export class Comment extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Comment',
    embedded: true, // Define como objeto aninhado
    properties: {
      _id: 'string', // Mongoose ObjectId será armazenado como string no Realm
      userId: 'string', // Mongoose ObjectId será armazenado como string no Realm
      text: 'string',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

// Schema para o modelo List
export class List extends Realm.Object {
  static schema: Realm.ObjectSchema = {
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
      // Relacionamento inverso com Cards
      cards: { type: 'linkingObjects', objectType: 'Card', property: 'list' }
    },
  };
}

// Schema para o modelo Card
export class Card extends Realm.Object {
  static schema: Realm.ObjectSchema = {
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
      pdfs: { type: 'list', objectType: 'Pdf' },
      likes: { type: 'int', default: 0 },
      comments: { type: 'list', objectType: 'Comment' },
      downloads: { type: 'int', default: 0 },
      createdAt: 'date',
      updatedAt: 'date',
      content: { type: 'string', default: '' },
      isSynced: { type: 'bool', default: true },
      isDeleted: { type: 'bool', default: false },
    },
  };
}

// Schema para o modelo User
export class User extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id', // Define _id como chave primária
    properties: {
      _id: 'string', // Mongoose ObjectId será armazenado como string
      coduser: 'string',
      name: 'string',
      email: 'string',
      password: { type: 'string', optional: true }, // Senha geralmente não é armazenada localmente, ou opcional
      dateOfBirth: 'date',
      role: { type: 'string', default: 'user' },
      plan: 'string?', // Mongoose ObjectId opcional será string opcional no Realm
      orgPoints: { type: 'int', default: 0 },
      profileImage: 'string?', // String opcional
      loginAttempts: { type: 'int', default: 0 },
      lastLoginAttempt: 'date?', // Date opcional
      createdAt: 'date',
      updatedAt: 'date',
      // Relacionamento direto ou inverso com Cards (depende da sua necessidade de acesso)
      // Se precisar acessar todos os cards de um usuário frequentemente a partir do objeto User:
      cards: { type: 'list', objectType: 'Card' }, // Relacionamento um-para-muitos
      // Ou se preferir um relacionamento inverso:
      // cards: { type: 'linkingObjects', objectType: 'Card', property: 'user' },
    },
  };
}

// Array com todos os schemas que serão usados no Realm
export const realmSchemas = [User, List, Card, Comment, Pdf];