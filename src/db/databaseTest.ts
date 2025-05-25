const { getRealm } = require('./realmDatabase');
const { createList, getAllLists, updateList, deleteList } = require('./realmService');
const { createCard, getAllCards, updateCard, deleteCard } = require('./realmService');
const { saveOrUpdateCurrentUser, getCurrentUser } = require('./realmService');
const { Card, List, User } = require('./realmSchemas');
const Realm = require('realm');

// Interfaces para as atualizações
interface ListUpdate {
  title?: string;
  description?: string;
}

interface CardUpdate {
  title?: string;
  priority?: string;
  content?: string;
  is_published?: boolean;
}

// Tipos para os objetos do Realm
type RealmList = typeof List & { _id: string; userId: string; title: string; description: string };
type RealmCard = typeof Card & { _id: string; listId: string; userId: string; title: string };

async function testDatabase() {
  console.log('Iniciando testes do banco de dados local...');
  
  try {
    // 1. Teste de Conexão
    console.log('\n1. Testando conexão com o banco...');
    const realm = await getRealm();
    console.log('✅ Conexão com o banco estabelecida com sucesso');

    // 2. Teste de Usuário
    console.log('\n2. Testando operações de usuário...');
    const testUser = {
      _id: 'test-user-' + Date.now(),
      coduser: 'TEST001',
      name: 'Usuário Teste',
      email: 'teste@teste.com',
      dateOfBirth: new Date(),
      role: 'user',
      plan: 'free',
      orgPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar usuário
    await saveOrUpdateCurrentUser(testUser);
    console.log('✅ Usuário criado com sucesso');

    // Buscar usuário
    const createdUser = await getCurrentUser(testUser._id);
    console.log('✅ Usuário encontrado:', createdUser ? 'Sim' : 'Não');

    // 3. Teste de Lista
    console.log('\n3. Testando operações de lista...');
    const testList = {
      _id: 'test-list-' + Date.now(),
      userId: testUser._id,
      title: 'Lista Teste',
      description: 'Descrição da lista teste',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar lista
    await createList(testList);
    console.log('✅ Lista criada com sucesso');

    // Buscar lista
    const lists = await getAllLists();
    const createdList = lists?.find((l: RealmList) => l._id === testList._id);
    console.log('✅ Lista encontrada:', createdList ? 'Sim' : 'Não');

    // 4. Teste de Card
    console.log('\n4. Testando operações de card...');
    const testCard = {
      _id: 'test-card-' + Date.now(),
      listId: testList._id,
      userId: testUser._id,
      title: 'Card Teste',
      priority: 'medium',
      is_published: false,
      image_url: [],
      pdfs: [],
      likes: 0,
      comments: [],
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: 'Conteúdo do card teste',
    };

    // Criar card
    await createCard(testCard);
    console.log('✅ Card criado com sucesso');

    // Buscar card
    const cards = await getAllCards();
    const createdCard = cards?.find((c: RealmCard) => c._id === testCard._id);
    console.log('✅ Card encontrado:', createdCard ? 'Sim' : 'Não');

    // 5. Teste de Atualização
    console.log('\n5. Testando operações de atualização...');
    
    // Atualizar lista
    const listUpdate: ListUpdate = { title: 'Lista Teste Atualizada' };
    await updateList(testList._id, listUpdate as any);
    console.log('✅ Lista atualizada com sucesso');

    // Atualizar card
    const cardUpdate: CardUpdate = { title: 'Card Teste Atualizado' };
    await updateCard(testCard._id, cardUpdate as any);
    console.log('✅ Card atualizado com sucesso');

    // 6. Teste de Deleção
    console.log('\n6. Testando operações de deleção...');
    
    // Deletar card
    await deleteCard(testCard._id);
    console.log('✅ Card deletado com sucesso');

    // Deletar lista
    await deleteList(testList._id);
    console.log('✅ Lista deletada com sucesso');

    // 7. Verificação Final
    console.log('\n7. Verificação final do banco...');
    const finalLists = await getAllLists();
    const finalCards = await getAllCards();
    console.log('Listas restantes:', finalLists?.length || 0);
    console.log('Cards restantes:', finalCards?.length || 0);

    console.log('\n✅ Todos os testes foram concluídos com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  } finally {
    // Fechar conexão com o banco
    const realm = await getRealm();
    realm.close();
  }
}

// Executar os testes
testDatabase().catch(console.error);

module.exports = { testDatabase }; 