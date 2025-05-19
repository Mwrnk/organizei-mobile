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

// Schema para o modelo Card
export class Card extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'Card',
    primaryKey: '_id', // Define _id como chave primária
    properties: {
      _id: 'string', // Mongoose ObjectId será armazenado como string
      listId: 'string', // Mongoose ObjectId será armazenado como string
      userId: 'string', // Mongoose ObjectId será armazenado como string
      title: 'string',
      priority: { type: 'string', default: 'Baixa' }, // Enum no backend, string com default no Realm
      is_published: { type: 'bool', default: false },
      image_url: { type: 'list', objectType: 'string' }, // Array de strings
      pdfs: { type: 'list', objectType: 'Pdf' }, // Array de objetos aninhados Pdf
      likes: { type: 'int', default: 0 },
      comments: { type: 'list', objectType: 'Comment' }, // Array de objetos aninhados Comment
      downloads: { type: 'int', default: 0 },
      createdAt: 'date',
      updatedAt: 'date',
      content: { type: 'string', default: '' },
      // Campo para controle de sincronização
      isSynced: { type: 'bool', default: true },
      // >>> NOVO CAMPO ADICIONADO: Marcação para exclusão suave <<<
      isDeleted: { type: 'bool', default: false },
      // Propriedade de relacionamento inverso (opcional, mas útil)
      // user: { type: 'linkingObjects', objectType: 'User', property: 'cards' },
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
export const realmSchemas = [User, Card, Comment, Pdf];