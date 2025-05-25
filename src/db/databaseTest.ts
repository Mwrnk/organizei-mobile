const {
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
} = require('./realmService');

const { closeRealm } = require('./realmDatabase');

async function testDatabase() {
  console.log('Iniciando testes do banco de dados local...\n');

  try {
    // 1. Teste de Usuário
    console.log('1. Testando operações de usuário...');
    const testUser = {
      _id: `test-user-${Date.now()}`,
      coduser: 'TEST001',
      name: 'Usuário Teste',
      email: 'teste@teste.com',
      dateOfBirth: new Date('1990-01-01'),
      role: 'user',
      plan: 'free',
      orgPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar usuário
    const createdUser = await saveOrUpdateCurrentUser(testUser);
    console.log('✅ Usuário criado:', createdUser._id);

    // Buscar usuário
    const foundUser = await getCurrentUser(createdUser._id);
    console.log('✅ Usuário encontrado:', foundUser._id);

    // Atualizar usuário
    const updatedUser = await updateUser(createdUser._id, { name: 'Usuário Teste Atualizado' });
    console.log('✅ Usuário atualizado:', updatedUser.name);

    // Listar todos os usuários
    const allUsers = await getAllUsers();
    console.log('✅ Total de usuários:', allUsers.length);

    // 2. Teste de Lista
    console.log('\n2. Testando operações de lista...');
    const testList = {
      _id: `test-list-${Date.now()}`,
      userId: createdUser._id,
      title: 'Lista Teste',
      description: 'Descrição da lista teste',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar lista
    const createdList = await createList(testList);
    console.log('✅ Lista criada:', createdList._id);

    // Buscar todas as listas
    const allLists = await getAllLists();
    console.log('✅ Total de listas:', allLists.length);

    // Atualizar lista
    const updatedList = await updateList(createdList._id, { title: 'Lista Teste Atualizada' });
    console.log('✅ Lista atualizada:', updatedList.title);

    // 3. Teste de Card
    console.log('\n3. Testando operações de card...');
    const testCard = {
      _id: `test-card-${Date.now()}`,
      listId: createdList._id,
      userId: createdUser._id,
      title: 'Card Teste',
      content: 'Conteúdo do card teste',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar card
    const createdCard = await createCard(testCard);
    console.log('✅ Card criado:', createdCard._id);

    // Buscar todos os cards
    const allCards = await getAllCards();
    console.log('✅ Total de cards:', allCards.length);

    // Buscar cards por lista
    const listCards = await getCardsByList(createdList._id);
    console.log('✅ Cards na lista:', listCards.length);

    // Atualizar card
    const updatedCard = await updateCard(createdCard._id, { title: 'Card Teste Atualizado' });
    console.log('✅ Card atualizado:', updatedCard.title);

    // 4. Teste de Deleção
    console.log('\n4. Testando operações de deleção...');

    // Deletar card
    await deleteCard(createdCard._id);
    console.log('✅ Card deletado');

    // Deletar lista
    await deleteList(createdList._id);
    console.log('✅ Lista deletada');

    // Deletar usuário
    await deleteUser(createdUser._id);
    console.log('✅ Usuário deletado');

    // Verificar deleção
    const remainingUsers = await getAllUsers();
    const remainingLists = await getAllLists();
    const remainingCards = await getAllCards();
    console.log('✅ Verificação final:');
    console.log('   - Usuários restantes:', remainingUsers.length);
    console.log('   - Listas restantes:', remainingLists.length);
    console.log('   - Cards restantes:', remainingCards.length);

    console.log('\n✅ Todos os testes do banco de dados foram concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await closeRealm();
  }
}

// Executar os testes
testDatabase(); 