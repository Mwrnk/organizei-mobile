const Realm = require('realm');

/**
 * Schema para o modelo List
 * @property {string} _id - Identificador único da lista
 * @property {string} userId - ID do usuário dono da lista
 * @property {string} title - Título da lista
 * @property {string} [description] - Descrição opcional da lista
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {boolean} isSynced - Indica se a lista está sincronizada com o servidor
 * @property {boolean} isDeleted - Indica se a lista foi deletada (soft delete)
 * @property {Card[]} cards - Lista de cards associados
 */
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

/**
 * Schema para o modelo Card
 * @property {string} _id - Identificador único do card
 * @property {string} listId - ID da lista que contém o card
 * @property {List} list - Referência à lista que contém o card
 * @property {string} userId - ID do usuário dono do card
 * @property {string} title - Título do card
 * @property {string} priority - Prioridade do card (Baixa, Média, Alta)
 * @property {boolean} is_published - Indica se o card está publicado
 * @property {string[]} image_url - URLs das imagens do card
 * @property {number} likes - Número de curtidas
 * @property {string[]} likedBy - IDs dos usuários que curtiram
 * @property {number} downloads - Número de downloads
 * @property {string[]} pdfs - Lista de PDFs associados ao card
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {string} content - Conteúdo do card
 * @property {boolean} isSynced - Indica se o card está sincronizado com o servidor
 * @property {boolean} isDeleted - Indica se o card foi deletado (soft delete)
 */
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
    pdfs: {
      type: 'list',
      objectType: 'Pdf',
      default: []
    },
    createdAt: 'date',
    updatedAt: 'date',
    content: { type: 'string', default: '' },
    isSynced: { type: 'bool', default: true },
    isDeleted: { type: 'bool', default: false }
  }
};

/**
 * Schema para o modelo User
 * @property {string} _id - Identificador único do usuário
 * @property {string} coduser - Código do usuário
 * @property {string} name - Nome do usuário
 * @property {string} email - Email do usuário
 * @property {string} [password] - Senha do usuário (opcional)
 * @property {Date} dateOfBirth - Data de nascimento
 * @property {string} role - Papel do usuário (user, admin)
 * @property {string} [plan] - Plano do usuário
 * @property {number} orgPoints - Pontos de organização
 * @property {string} [profileImage] - URL da imagem de perfil
 * @property {number} loginAttempts - Número de tentativas de login
 * @property {Date} [lastLoginAttempt] - Data da última tentativa de login
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {boolean} isSynced - Indica se o usuário está sincronizado com o servidor
 * @property {boolean} isDeleted - Indica se o usuário foi deletado (soft delete)
 * @property {Card[]} cards - Lista de cards do usuário
 */
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
    isSynced: { type: 'bool', default: true },
    isDeleted: { type: 'bool', default: false },
    cards: { type: 'list', objectType: 'Card' }
  }
};

/**
 * Schema para o modelo Pdf (usado em Card)
 * @property {string} url - URL do PDF
 * @property {string} filename - Nome do arquivo
 * @property {date} uploaded_at - Data de upload
 * @property {number} [size_kb] - Tamanho em KB (opcional)
 */
const Pdf = {
  name: 'Pdf',
  properties: {
    url: 'string',
    filename: 'string',
    uploaded_at: 'date',
    size_kb: { type: 'int', optional: true },
  }
};

// Array com todos os schemas que serão usados no Realm
const realmSchemas = [User, List, Card, Pdf];

module.exports = {
  Card,
  List,
  User,
  Pdf,
  realmSchemas
};