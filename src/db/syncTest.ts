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
    
    let testUser: any = null;
    let testList: any = null;
    let testCard: any = null;
    
    // Criar um usuário
    realm.write(() => {
      testUser = realm.create('User', {
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
      console.log('✅ Usuário de teste criado:', testUser._id);

      // Criar uma lista
      testList = realm.create('List', {
        _id: 'test-list-' + Date.now(),
        userId: testUser._id,
        title: 'Lista de Teste',
        description: 'Lista criada para teste de sincronização',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false
      });
      console.log('✅ Lista de teste criada:', testList._id);

      // Criar um card
      testCard = realm.create('Card', {
        _id: 'test-card-' + Date.now(),
        listId: testList._id,
        userId: testUser._id,
        title: 'Card de Teste',
        priority: 'Média',
        content: 'Conteúdo do card de teste',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false
      });
      console.log('✅ Card de teste criado:', testCard._id);
    });

    if (!testUser || !testList || !testCard) {
      throw new Error('Falha ao criar dados de teste');
    }

    // 3. Testando sincronização
    console.log('\n3. Iniciando sincronização com o servidor...');
    await syncWithServer();
    console.log('✅ Sincronização concluída\n');

    // 4. Verificando dados após sincronização
    console.log('4. Verificando dados após sincronização...');
    
    // Verificar usuário
    const syncedUser = realm.objects('User').filtered('_id == $0', testUser._id)[0];
    console.log('✅ Usuário sincronizado:', syncedUser ? 'Sim' : 'Não');
    if (syncedUser) {
      console.log('   - ID:', syncedUser._id);
      console.log('   - Nome:', syncedUser.name);
      console.log('   - isSynced:', syncedUser.isSynced);
    }

    // Verificar lista
    const syncedList = realm.objects('List').filtered('_id == $0', testList._id)[0];
    console.log('✅ Lista sincronizada:', syncedList ? 'Sim' : 'Não');
    if (syncedList) {
      console.log('   - ID:', syncedList._id);
      console.log('   - Título:', syncedList.title);
      console.log('   - isSynced:', syncedList.isSynced);
    }

    // Verificar card
    const syncedCard = realm.objects('Card').filtered('_id == $0', testCard._id)[0];
    console.log('✅ Card sincronizado:', syncedCard ? 'Sim' : 'Não');
    if (syncedCard) {
      console.log('   - ID:', syncedCard._id);
      console.log('   - Título:', syncedCard.title);
      console.log('   - isSynced:', syncedCard.isSynced);
    }

    // Verificar relacionamentos
    if (syncedUser && syncedList && syncedCard) {
      console.log('\nVerificando relacionamentos:');
      console.log('✅ Lista pertence ao usuário:', syncedList.userId === syncedUser._id);
      console.log('✅ Card pertence à lista:', syncedCard.listId === syncedList._id);
      console.log('✅ Card pertence ao usuário:', syncedCard.userId === syncedUser._id);
    }

    // Armazenar IDs antes da deleção
    const userId = testUser._id;
    const listId = testList._id;
    const cardId = testCard._id;

    // Verificação final antes da deleção
    const remainingUsers = realm.objects('User').filtered('_id == $0', userId).length;
    const remainingLists = realm.objects('List').filtered('_id == $0', listId).length;
    const remainingCards = realm.objects('Card').filtered('_id == $0', cardId).length;

    console.log('\nVerificação final:');
    console.log('✅ Usuário existe:', remainingUsers > 0);
    console.log('✅ Lista existe:', remainingLists > 0);
    console.log('✅ Card existe:', remainingCards > 0);

    // 5. Limpando dados de teste
    console.log('\n5. Limpando dados de teste...');
    realm.write(() => {
      // Deletar na ordem correta (primeiro card, depois lista, por fim usuário)
      if (syncedCard) {
        realm.delete(syncedCard);
        console.log('✅ Card de teste removido');
      }
      if (syncedList) {
        realm.delete(syncedList);
        console.log('✅ Lista de teste removida');
      }
      if (syncedUser) {
        realm.delete(syncedUser);
        console.log('✅ Usuário de teste removido');
      }
    });

    // Verificação após deleção
    const finalUsers = realm.objects('User').filtered('_id == $0', userId).length;
    const finalLists = realm.objects('List').filtered('_id == $0', listId).length;
    const finalCards = realm.objects('Card').filtered('_id == $0', cardId).length;

    console.log('\nVerificação após deleção:');
    console.log('✅ Usuário removido:', finalUsers === 0);
    console.log('✅ Lista removida:', finalLists === 0);
    console.log('✅ Card removido:', finalCards === 0);

    console.log('\n✅ Todos os testes de sincronização foram concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes de sincronização:', error);
  } finally {
    await closeRealm();
  }
}

// Executar o teste
testSync(); 