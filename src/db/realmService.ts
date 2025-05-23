import Realm from 'realm';
import { getRealm } from './realmDatabase'; // Importa a função para obter a instância do Realm
// Importa os schemas e modelos tipados diretamente como classes
import { Card, User, Comment, Pdf } from './realmSchemas';

// Definir tipos para os dados de entrada de objetos aninhados,
// pois a entrada pode não ser diretamente instâncias do Realm.Object
interface IPdfData {
    url: string;
    filename: string;
    uploaded_at: Date;
    size_kb?: number;
}

interface ICommentData {
    _id: string; // Manter como string para compatibilidade com backend ObjectId
    userId: string; // Manter como string para compatibilidade com backend ObjectId
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

// --- Funções relacionadas a Cards ---

// Cria um novo Card no Realm
export async function createCard(cardData: {
  _id: string; // Deve vir do backend ou ser gerado se for uma criação offline inicial
  listId: string; // Manter como string para compatibilidade com backend ObjectId
  userId: string; // O ID do usuário a quem o card pertence (string para compatibilidade com backend ObjectId)
  title: string;
  priority?: string;
  is_published?: boolean;
  image_url?: string[];
  pdfs?: IPdfData[]; // Usar um tipo para os dados de entrada dos PDFs
  likes?: number;
  comments?: ICommentData[]; // Usar um tipo para os dados de entrada dos Comentários
  downloads?: number;
  createdAt: Date;
  updatedAt: Date;
  content?: string;
  isSynced?: boolean; // Campo para controle de sincronização
}): Promise<Card | null> {
  // Tipagem explícita para a variável realm
  let realm: Realm | null = null; // Inicializa como null e tipa explicitamente
  try {
    realm = await getRealm();
    let createdCard: Card | null = null;

    realm.write(() => {
      // Antes de criar o card, verifique se o usuário existe no Realm
      // >>> CORREÇÃO para objectForPrimaryKey: Cast do primaryKey para 'any' <<<
      const user = realm!.objectForPrimaryKey<User>('User', cardData.userId as any);

      if (!user) {
         console.error(`User with ID ${cardData.userId} not found in Realm. Cannot create card.`);
         return; // Sai do bloco write
      }

      // Cria os objetos aninhados Pdf a partir dos dados de entrada
      const realmPdfs = cardData.pdfs ? cardData.pdfs.map(pdfData => {
           // Garantir que criamos instâncias Realm.Object aninhadas
           return realm!.create<Pdf>('Pdf', pdfData);
      }) : [];
      // Cria os objetos aninhados Comment a partir dos dados de entrada
      const realmComments = cardData.comments ? cardData.comments.map(commentData => {
          // Garantir que criamos instâncias Realm.Object aninhadas
          return realm!.create<Comment>('Comment', {
              ...commentData,
              // No schema, _id e userId são strings. Se o backend envia ObjectId, já devem vir como string.
              _id: commentData._id,
              userId: commentData.userId
          });
      }) : [];


      createdCard = realm!.create<Card>('Card', {
        _id: cardData._id,
        listId: cardData.listId,
        userId: cardData.userId,
        title: cardData.title,
        priority: cardData.priority || 'Baixa',
        is_published: cardData.is_published || false,
        image_url: cardData.image_url || [],
        pdfs: realmPdfs, // Atribui os objetos Realm aninhados criados
        likes: cardData.likes || 0,
        comments: realmComments, // Atribui os objetos Realm aninhados criados
        downloads: cardData.downloads || 0,
        createdAt: cardData.createdAt,
        updatedAt: cardData.updatedAt,
        content: cardData.content || '',
        isSynced: cardData.isSynced !== undefined ? cardData.isSynced : true,
        // isDeleted: false, // Já tem default no schema
        // Se o relacionamento for lista no User:
        // user.cards.push(createdCard!); // Adiciona o card ao usuário
      });

      // >>> ACESSO ao _id de createdCard (usando cast para any para resolver erro de tipagem) <<<
      if (createdCard) { 
          console.log(`Card criado no Realm com ID: ${(createdCard as any)._id}`); // Cast para any aqui
      } else {
          console.warn('Card não foi criado no Realm.');
      }
    });

    return createdCard; // createdCard pode ser null se o usuário não for encontrado
  } catch (error) {
    console.error('Erro ao criar card no Realm:', error);
    throw error;
  }
}


// Busca todos os Cards não deletados no Realm
// O tipo de retorno é Realm.Results<Card & Realm.Object> para maior compatibilidade com a API do Realm
export async function getAllCards(): Promise<Realm.Results<Card & Realm.Object> | null> {
  let realm: Realm | null = null;
  try {
    realm = await getRealm();
    // Busca todos os objetos do tipo 'Card' que NÃO ESTÃO marcados como deletados
    const cards = realm!.objects<Card>('Card').filtered('isDeleted == false');
    console.log(`Buscados ${cards.length} cards não deletados do Realm.`);
  
    return cards as unknown as Realm.Results<Card & Realm.Object>;
  } catch (error) {
    console.error('Erro ao buscar todos os cards do Realm:', error);
    throw error;
  }
}

// Busca Cards não deletados por ID de usuário
export async function getCardsByUserId(userId: string): Promise<Realm.Results<Card & Realm.Object> | null> {
    let realm: Realm | null = null;
    try {
        realm = await getRealm();
        // Busca cards onde o campo userId seja igual ao userId passado E que NÃO ESTÃO marcados como deletados
        const cards = realm!.objects<Card>('Card').filtered('userId == $0 AND isDeleted == false', userId);
         console.log(`Buscados ${cards.length} cards não deletados para o usuário ${userId}.`);
    
        return cards as unknown as Realm.Results<Card & Realm.Object>;
    } catch (error) {
        console.error(`Erro ao buscar cards para o usuário ${userId} do Realm:`, error);
        throw error;
    }
}

// Busca Cards não deletados por tema ou título
export async function searchCardsByTerm(term: string): Promise<Realm.Results<Card & Realm.Object> | null> {
    let realm: Realm | null = null;
    try {
        realm = await getRealm();
        // Busca cards onde o título OU o conteúdo contenham o termo (case-insensitive) E que NÃO ESTÃO marcados como deletados
        const cards = realm!.objects<Card>('Card').filtered('(title CONTAINS[c] $0 OR content CONTAINS[c] $0) AND isDeleted == false', term);
        console.log(`Buscados ${cards.length} cards não deletados para o termo "${term}".`);
        
        return cards as unknown as Realm.Results<Card & Realm.Object>;
    } catch (error) {
        console.error(`Erro ao buscar cards para o termo "${term}" do Realm:`, error);
        throw error;
    }
}


// Atualiza um Card existente no Realm
export async function updateCard(cardId: string, updates: Partial<Card>, markAsUnsynced: boolean = false): Promise<Card | null> {
  let realm: Realm | null = null;
  try {
    realm = await getRealm();
    let updatedCard: Card | null = null;

    realm!.write(() => {
      // Busca o card pela chave primária
      
      const cardToUpdate = realm!.objectForPrimaryKey<Card>('Card', cardId as any);
      if (!cardToUpdate) {
        console.warn(`Card with ID ${cardId} not found for update.`);
        return;
      }

      // Aplica as atualizações parciais de forma mais segura
      Object.keys(updates).forEach(key => {
           const value = (updates as any)[key];
           if (value !== undefined && (cardToUpdate as any)[key] !== undefined) {
              (cardToUpdate as any)[key] = value;
           } else if (value !== undefined) {
              console.warn(`Attempted to update non-existent property '${key}' on Card`);
           }
      });

      // >>> MARCA COMO NÃO SINCRONIZADO se markAsUnsynced for true (Mantido) <<<
      if (markAsUnsynced) {
          (cardToUpdate as any).isSynced = false; // Usar any para garantir atribuição
      }

      updatedCard = cardToUpdate;
      console.log(`Card com ID ${cardId} atualizado no Realm.`);
    });

    return updatedCard;
  } catch (error) {
    console.error(`Erro ao atualizar card com ID ${cardId} no Realm:`, error);
    throw error;
  }
}

// Marca um Card como deletado no Realm (Exclusão suave)
export async function deleteCard(cardId: string): Promise<void> {
  let realm: Realm | null = null;
  try {
    realm = await getRealm();

    realm!.write(() => {
       // Busca o card pela chave primária
    
      const cardToDelete = realm!.objectForPrimaryKey<Card>('Card', cardId as any);
      if (!cardToDelete) {
        console.warn(`Card with ID ${cardId} not found for deletion.`);
        return;
      }
      // >>> MODIFICADO: Marcar como deletado em vez de deletar do Realm <<<
      (cardToDelete as any).isDeleted = true; // Usar any para garantir atribuição
      (cardToDelete as any).isSynced = false; // Marcar como não sincronizado para enviar ao backend
      console.log(`Card com ID ${cardId} marcado como deletado no Realm.`);
    });
  } catch (error) {
    console.error(`Erro ao marcar card com ID ${cardId} como deletado no Realm:`, error);
    throw error;
  }
}

// --- Funções relacionadas a Usuários ---

// Salva ou atualiza o usuário logado no Realm
export async function saveOrUpdateCurrentUser(userData: {
    _id: string;
    coduser: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    role?: string;
    plan?: string; // ID do plano
    orgPoints?: number;
    profileImage?: string | null;
    createdAt: Date;
    updatedAt: Date;
}): Promise<User | null> {
    let realm: Realm | null = null;
    try {
      realm = await getRealm();
      let currentUser: User | null = null;

      realm!.write(() => {
        // Tenta encontrar o usuário pelo ID (string)
      
        let existingUser = realm!.objectForPrimaryKey<User>('User', userData._id as any);

        if (existingUser) {
          // Se o usuário existe, atualiza seus dados
          console.log(`Atualizando dados do usuário ${userData._id} no Realm.`);
          // Aplica as atualizações de forma mais segura
           Object.keys(userData).forEach(key => {
               const value = (userData as any)[key]; // Usar 'any' ou unknown para acessar propriedade dinâmica
               // Adicionar uma checagem se a propriedade key existe no existingUser antes de atribuir
               if (value !== undefined && (existingUser as any)[key] !== undefined) {
                   (existingUser as any)[key] = value;
               } else if (value !== undefined) {
                   console.warn(`Attempted to update non-existent property '${key}' on User`);
               }
            });
          currentUser = existingUser;
        } else {
          // Se o usuário não existe, cria um novo
          console.log(`Criando novo usuário ${userData._id} no Realm.`);
           currentUser = realm!.create<User>('User', {
             _id: userData._id,
             coduser: userData.coduser,
             name: userData.name,
             email: userData.email,
             dateOfBirth: userData.dateOfBirth,
             role: userData.role || 'user',
             plan: userData.plan || null,
             orgPoints: userData.orgPoints || 0,
             profileImage: userData.profileImage || null,
             createdAt: userData.createdAt,
             updatedAt: userData.updatedAt,
             
           });
        }
      });
      return currentUser;
    } catch (error) {
      console.error(`Erro ao salvar/atualizar usuário ${userData._id} no Realm:`, error);
      throw error;
    }
}

// Busca o usuário logado pelo ID
export async function getCurrentUser(userId: string): Promise<User & Realm.Object | null> {
    let realm: Realm | null = null;
    try {
      realm = await getRealm();
      // Busca o usuário pela chave primária (string)
       
      const user = realm!.objectForPrimaryKey<User>('User', userId as any);
      console.log(`Buscado usuário ${userId} do Realm.`);
      
      return user as unknown as (User & Realm.Object) | null;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${userId} do Realm:`, error);
      throw error;
    }
}
