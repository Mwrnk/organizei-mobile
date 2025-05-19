import Realm from 'realm';
// Importamos os schemas e modelos para usá-los na tipagem
import { realmSchemas, User, Card, Comment, Pdf } from './realmSchemas';

// Definimos o tipo da função de migração para melhor clareza e tipagem
type MigrationCallback = (oldRealm: Realm, newRealm: Realm) => void;

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

  // >>> NOVA MIGRAÇÃO: de schema version 1 para 2 (adicionando isDeleted) <<<
  if (oldRealm.schemaVersion < 2) {
    console.log('Migrando de schema version 1 para 2 (adicionando isDeleted)...');
    // Acessamos os objetos Card na nova versão (já terão o campo isDeleted)
    const newObjects = newRealm.objects<Card>('Card');
    // Como adicionamos isDeleted com default: false no schema,
    // o Realm já adicionou o campo com o valor padrão.
    // Se precisássemos definir o valor de forma diferente, faríamos aqui:
    // newObjects.forEach(card => {
    //   card.isDeleted = false; // Redundante se já há default, mas demonstra
    // });
    console.log('Migração de schema version 1 para 2 concluída.');
  }

  // Se você tiver futuras migrações (ex: da versão 2 para 3), adicione mais 'if' blocks:
  // if (oldRealm.schemaVersion < 3) {
  //   console.log('Migrando de schema version 2 para 3...');
  //   // Sua lógica de migração para a versão 3 aqui
  //   console.log('Migração de schema version 2 para 3 concluída.');
  // }

  console.log('Migração do Realm finalizada.');
};


// Configuração do Realm
const databaseOptions: Realm.Configuration = {
  path: 'organizeiMobile.realm', // Nome do arquivo do banco de dados local
  schema: realmSchemas, // Schemas que o Realm vai usar
  schemaVersion: 2, // Incrementamos a versão do schema para 2
  // Atribuímos a função de migração implementada acima
  onMigration: migrationFunction,
};

// Variável para armazenar a instância do Realm
let realmInstance: Realm | null = null;

// Função assíncrona para obter a instância do Realm
export async function getRealm(): Promise<Realm> {
  if (realmInstance && !realmInstance.isClosed) {
    console.log('Returning existing Realm instance.');
    return realmInstance; // Retorna a instância existente se já estiver aberta
  }

  try {
    console.log('Attempting to open Realm database...');
    // Abre o banco de dados com as opções configuradas
    // O Realm lidará com a migração automaticamente se o schemaVersion for maior que a armazenada no arquivo.
    realmInstance = await Realm.open(databaseOptions);
    console.log('Realm database opened successfully!');
    return realmInstance;
  } catch (error: any) { // Adicionado ': any' para acessar propriedades do erro
    console.error('----------------------------------------------------');
    console.error('Error opening Realm database:');
    console.error(`Error message: ${error.message}`);
    console.error(`Error name: ${error.name}`);
    if (error.code) { // Alguns erros do Realm podem ter um código
      console.error(`Error code: ${error.code}`);
    }
    console.error('----------------------------------------------------');

    // Re-lança o erro para ser tratado no local onde getRealm foi chamado
    throw error;
  }
}

// Função opcional para fechar a instância do Realm quando não for mais necessária
export function closeRealm(): void {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    console.log('Realm database closed');
    realmInstance = null;
  }
}