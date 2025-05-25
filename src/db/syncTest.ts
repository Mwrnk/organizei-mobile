const { getRealm, closeRealm } = require('./realmDatabase');
const { syncWithServer } = require('./syncService');

async function testSync() {
  console.log('Iniciando testes de sincronização...\n');

  try {
    // 1. Testando conexão com o banco local
    console.log('1. Testando conexão com o banco local...');
    const realm = await getRealm();
    console.log('✅ Conexão com o banco local estabelecida\n');

    // 2. Criando dados locais para sincronizar
    console.log('2. Criando dados locais para sincronizar...');
    
    // Criar um usuário
    realm.write(() => {
      const user = realm.create('User', {
        _id: 'test-user-' + Date.now(),
        coduser: 'TEST001',
        name: 'Usuário Teste',
        email: 'teste@teste.com',
        dateOfBirth: new Date(),
        role: 'user',
        orgPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false,
        loginAttempts: 0
      });
      console.log('✅ Usuário de teste criado:', user._id);

      // Criar uma lista
      const list = realm.create('List', {
        _id: 'test-list-' + Date.now(),
        userId: user._id,
        title: 'Lista de Teste',
        description: 'Lista criada para teste de sincronização',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false
      });
      console.log('✅ Lista de teste criada:', list._id);

      // Criar um card
      const card = realm.create('Card', {
        _id: 'test-card-' + Date.now(),
        listId: list._id,
        userId: user._id,
        title: 'Card de Teste',
        priority: 'Média',
        content: 'Conteúdo do card de teste',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false
      });
      console.log('✅ Card de teste criado:', card._id);
    });

    // 3. Testando sincronização
    console.log('\n3. Iniciando sincronização com o servidor...');
    await syncWithServer();
    console.log('✅ Sincronização concluída\n');

    // 4. Verificando dados após sincronização
    console.log('4. Verificando dados após sincronização...');
    
    const syncedUser = realm.objects('User').filtered('isSynced == true')[0];
    const syncedList = realm.objects('List').filtered('isSynced == true')[0];
    const syncedCard = realm.objects('Card').filtered('isSynced == true')[0];

    console.log(`✅ Usuário sincronizado: ${syncedUser ? 'Sim' : 'Não'}`);
    console.log(`✅ Lista sincronizada: ${syncedList ? 'Sim' : 'Não'}`);
    console.log(`✅ Card sincronizado: ${syncedCard ? 'Sim' : 'Não'}\n`);

    // 5. Limpando dados de teste
    console.log('5. Limpando dados de teste...');
    realm.write(() => {
      if (syncedCard) realm.delete(syncedCard);
      if (syncedList) realm.delete(syncedList);
      if (syncedUser) realm.delete(syncedUser);
    });
    console.log('✅ Dados de teste removidos\n');

    console.log('✅ Todos os testes de sincronização foram concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes de sincronização:', error);
  } finally {
    await closeRealm();
  }
}

// Executar o teste
testSync(); 