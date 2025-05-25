const Realm = require('realm');
// Importamos os schemas e modelos para usá-los na tipagem
const { Card, List, User } = require('./realmSchemas');

// Definimos o tipo da função de migração para melhor clareza e tipagem
type MigrationCallback = (oldRealm: typeof Realm, newRealm: typeof Realm) => void;

// Implementação da função de migração
const migrationFunction: MigrationCallback = (oldRealm, newRealm) => {
  console.log(`Iniciando migração do Realm da versão ${oldRealm.schemaVersion} para ${newRealm.schemaVersion}`);

  // Lógica de migração para cada versão
  // Migração de schema version 0 para 1 (adicionou isFavorite)
  if (oldRealm.schemaVersion < 1) {
    console.log('Migrando de schema version 0 para 1 (adicionando isFavorite)...');
    // O Realm adiciona campos com valor padrão automaticamente, não precisamos fazer nada aqui
    console.log('Migração de schema version 0 para 1 concluída.');
  }

  // Migração de schema version 1 para 2 (adicionando isDeleted)
  if (oldRealm.schemaVersion < 2) {
    console.log('Migrando de schema version 1 para 2 (adicionando isDeleted)...');
    // Acessamos os objetos Card na nova versão (já terão o campo isDeleted)
    const newObjects = newRealm.objects('Card');
    // Como adicionamos isDeleted com default: false no schema,
    // o Realm já adicionou o campo com o valor padrão.
    console.log('Migração de schema version 1 para 2 concluída.');
  }

  // Migração de schema version 2 para 3 (adicionando isSynced e isDeleted ao User)
  if (oldRealm.schemaVersion < 3) {
    console.log('Migrando de schema version 2 para 3 (adicionando isSynced e isDeleted ao User)...');
    // Acessamos os objetos User na nova versão (já terão os campos isSynced e isDeleted)
    const newUsers = newRealm.objects('User');
    // Como adicionamos isSynced e isDeleted com default: false no schema,
    // o Realm já adicionou os campos com os valores padrão.
    console.log('Migração de schema version 2 para 3 concluída.');
  }

  console.log('Migração do Realm finalizada.');
};


// Configuração do Realm
const databaseOptions = {
  path: 'organizeiMobile.realm', // Nome do arquivo do banco de dados local
  schema: [Card, List, User], // Schemas que o Realm vai usar
  schemaVersion: 3, // Incrementamos a versão do schema para 3
  // Atribuímos a função de migração implementada acima
  onMigration: migrationFunction,
};

// Variável para armazenar a instância do Realm
let realmInstance: typeof Realm | null = null;

// Função assíncrona para obter a instância do Realm
async function getRealm() {
  if (!realmInstance) {
    realmInstance = await Realm.open(databaseOptions);
  }
  return realmInstance;
}

// Função opcional para fechar a instância do Realm quando não for mais necessária
async function closeRealm() {
  if (realmInstance) {
    realmInstance.close();
    console.log('Realm database closed');
    realmInstance = null;
  }
}

module.exports = {
  getRealm,
  closeRealm,
  databaseOptions,
};