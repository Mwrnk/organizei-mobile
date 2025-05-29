import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles } from '@styles/global';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';
import CustomButton from '@components/CustomButton';
import api from '../services/api';

interface RouteParams {
  listId: string;
  listName: string;
}

interface Tag {
  _id: string;
  name: string;
}

const CreateCardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listId, listName } = route.params as RouteParams;
  const { user } = useAuth();

  // Estados existentes - simplificados para 1 arquivo de cada tipo
  const [cardTitle, setCardTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Novos estados baseados no backend
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Baixa');
  const [isPublished, setIsPublished] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

  // Carregar tags disponíveis
  useEffect(() => {
    loadAvailableTags();
  }, []);

  const loadAvailableTags = async () => {
    try {
      const response = await api.get('/tags');
      setAvailableTags(response.data.tags || []);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  };

  // Criar nova tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await api.post('/tags', { name: newTagName.trim() });
      const newTag = response.data.data;

      setAvailableTags([...availableTags, newTag]);
      setSelectedTags([...selectedTags, newTag._id]);
      setNewTagName('');

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      Alert.alert('Erro', 'Não foi possível criar a tag');
    }
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Função para selecionar uma imagem
  const handleSelectImage = useCallback(async () => {
    try {
      // Solicitar permissão primeiro
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: false, // Garantir apenas 1 imagem
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  }, []);

  // Função para selecionar um PDF
  const handleSelectPdf = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false, // Garantir apenas 1 PDF
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPdf(result.assets[0]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Erro ao selecionar PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  }, []);

  // Função para criar card (atualizada)
  const handleCreateCard = async () => {
    if (!cardTitle.trim()) {
      Alert.alert('Erro', 'Preencha o nome do card.');
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    setUploadingFiles(true);
    try {
      console.log('🚀 Iniciando criação do card...');
      console.log('📍 PASSO 1: Preparando dados básicos do card');

      // Passo 1: Criar o card básico (apenas com campos aceitos pelo backend)
      const createPayload = {
        title: cardTitle.trim(),
        listId: listId,
        content: content.trim(),
      };

      console.log('📦 Payload de criação:', createPayload);
      console.log('📍 PASSO 1: Enviando requisição POST /cards');

      const createRes = await api.post(`/cards`, createPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📍 PASSO 1: ✅ Card criado com sucesso');

      const newCard = {
        id: createRes.data.data.id,
        title: createRes.data.data.title,
        userId: createRes.data.data.userId,
        createdAt: createRes.data.data.createdAt,
        content: createRes.data.data.content,
        listId: createRes.data.data.listId,
      };

      console.log('✅ Card criado com sucesso:', newCard);

      // Passo 2: Atualizar o card com priority e is_published (se diferentes dos padrões)
      if (priority !== 'Baixa' || isPublished !== false) {
        console.log('📍 PASSO 2: Atualizando prioridade e configurações');

        const updatePayload = {
          title: cardTitle.trim(),
          content: content.trim(),
          priority: priority,
          is_published: isPublished,
        };

        console.log('📝 Payload de atualização:', updatePayload);
        console.log('📍 PASSO 2: Enviando requisição PATCH /cards/:id');

        await api.patch(`/cards/${newCard.id}`, updatePayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📍 PASSO 2: ✅ Card atualizado com prioridade e configurações');
      } else {
        console.log('📍 PASSO 2: ⏭️ Pulando atualização (valores padrão)');
      }

      // Passo 3: Upload de arquivos se houver (rota separada)
      if (selectedImage || selectedPdf) {
        console.log('📍 PASSO 3: Iniciando upload de arquivos');
        console.log(
          `📊 Arquivos selecionados: ${selectedImage ? '1 imagem' : 'nenhuma imagem'} ${
            selectedPdf ? '1 PDF' : 'nenhum PDF'
          }`
        );

        // Upload da imagem primeiro (se houver)
        if (selectedImage) {
          console.log('📍 PASSO 3A: Fazendo upload da imagem');
          const imageFormData = new FormData();

          console.log(`🖼️ Adicionando imagem:`, {
            uri: selectedImage.uri,
            type: selectedImage.mimeType || 'image/jpeg',
            name: selectedImage.fileName || 'image.jpg',
            size: selectedImage.fileSize || 'desconhecido',
          });

          imageFormData.append('files', {
            uri: selectedImage.uri,
            type: selectedImage.mimeType || 'image/jpeg',
            name: selectedImage.fileName || 'image.jpg',
          } as any);

          console.log('📤 Enviando imagem para:', `/cards/${newCard.id}/files`);

          try {
            await api.post(`/cards/${newCard.id}/files`, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log('📍 PASSO 3A: ✅ Upload da imagem concluído');
          } catch (imageError) {
            console.error('📍 PASSO 3A: ❌ Erro no upload da imagem:', imageError);
            throw imageError;
          }
        }

        // Upload do PDF depois (se houver)
        if (selectedPdf) {
          console.log('📍 PASSO 3B: Fazendo upload do PDF');
          const pdfFormData = new FormData();

          console.log(`📄 Adicionando PDF:`, {
            uri: selectedPdf.uri,
            type: selectedPdf.mimeType || 'application/pdf',
            name: selectedPdf.name || 'document.pdf',
            size: selectedPdf.size || 'desconhecido',
          });

          pdfFormData.append('files', {
            uri: selectedPdf.uri,
            type: selectedPdf.mimeType || 'application/pdf',
            name: selectedPdf.name || 'document.pdf',
          } as any);

          console.log('📤 Enviando PDF para:', `/cards/${newCard.id}/files`);

          try {
            await api.post(`/cards/${newCard.id}/files`, pdfFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log('📍 PASSO 3B: ✅ Upload do PDF concluído');
          } catch (pdfError) {
            console.error('📍 PASSO 3B: ❌ Erro no upload do PDF:', pdfError);
            throw pdfError;
          }
        }

        console.log('📍 PASSO 3: ✅ Upload de todos os arquivos concluído');
      } else {
        console.log('📍 PASSO 3: ⏭️ Pulando upload (nenhum arquivo selecionado)');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const successMessage = `Card "${cardTitle.trim()}" criado com sucesso!${
        selectedImage || selectedPdf
          ? `\n\nArquivos anexados:\n${selectedImage ? '• 1 imagem' : ''}${
              selectedPdf ? '\n• 1 PDF' : ''
            }`
          : ''
      }`;

      Alert.alert('Sucesso! 🎉', successMessage, [
        {
          text: 'Criar Outro',
          onPress: () => {
            clearForm();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
          style: 'default',
        },
        {
          text: 'Voltar',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]);
    } catch (err: any) {
      console.error('💥 Erro ao criar card:', err);

      // Log detalhado do erro
      if (err.response) {
        console.error('📋 Status do erro:', err.response.status);
        console.error('📋 Dados do erro:', err.response.data);
        console.error('📋 Headers da resposta:', err.response.headers);
        console.error('📋 URL da requisição:', err.config?.url);
        console.error('📋 Método da requisição:', err.config?.method);
        console.error('📋 Headers da requisição:', err.config?.headers);

        // Verificar se é um MulterError
        if (
          err.response.data?.message?.includes('MulterError') ||
          err.response.data?.message?.includes('Unexpected field')
        ) {
          console.error('🚨 MULTER ERROR DETECTADO!');
          console.error('🔍 Detalhes específicos do MulterError:', {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers,
            data: err.config?.data,
          });
        }
      } else if (err.request) {
        console.error('📡 Erro de rede - sem resposta:', err.request);
      } else {
        console.error('⚙️ Erro de configuração:', err.message);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = 'Não foi possível criar o card';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage =
          'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Você não tem permissão para criar cards nesta lista.';
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Função para limpar o formulário
  const clearForm = () => {
    setCardTitle('');
    setContent('');
    setPriority('Baixa');
    setIsPublished(false);
    setSelectedTags([]);
    setNewTagName('');
    setSelectedImage(null);
    setSelectedPdf(null);
  };

  // Função para salvar como rascunho
  const handleSaveAsDraft = () => {
    setIsPublished(false);
    handleCreateCard();
  };

  // Função para verificar se o formulário tem dados
  const hasFormData = () => {
    return (
      cardTitle.trim() ||
      content.trim() ||
      priority !== 'Baixa' ||
      selectedTags.length > 0 ||
      selectedImage ||
      selectedPdf
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Novo Card</Text>
          <Text style={styles.headerSubtitle}>Lista: {listName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Seção do título */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nome do Card</Text>
            <View style={styles.titleInputWrapper}>
              <Ionicons name="create-outline" size={20} color="#666" style={styles.titleIcon} />
              <TextInput
                placeholder="Digite o nome do seu card..."
                value={cardTitle}
                onChangeText={(text) => {
                  if (text.length <= 50) {
                    setCardTitle(text);
                  }
                }}
                style={styles.titleInput}
                maxLength={50}
                multiline={false}
                returnKeyType="done"
              />
            </View>
            <Text style={styles.characterCount}>{cardTitle.length}/50 caracteres</Text>
          </View>

          {/* Seção de conteúdo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conteúdo do Card</Text>
            <Text style={styles.sectionDescription}>Adicione o conteúdo principal do seu card</Text>
            <View style={styles.contentInputWrapper}>
              <TextInput
                placeholder="Digite o conteúdo do card..."
                value={content}
                onChangeText={setContent}
                style={styles.contentInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.characterCount}>{content.length} caracteres</Text>
          </View>

          {/* Seção de prioridade - Seletor interativo com ícones e feedback visual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioridade</Text>
            <Text style={styles.sectionDescription}>
              Selecione o nível de prioridade do seu card
            </Text>
            <View style={styles.priorityContainer}>
              {[
                { key: 'Baixa', icon: 'chevron-down', color: '#4CAF50', bgColor: '#E8F5E8' },
                { key: 'Média', icon: 'remove', color: '#FF9800', bgColor: '#FFF3E0' },
                { key: 'Alta', icon: 'chevron-up', color: '#F44336', bgColor: '#FFEBEE' },
              ].map((priorityOption) => (
                <TouchableOpacity
                  key={priorityOption.key}
                  style={[
                    styles.priorityCard,
                    priority === priorityOption.key && [
                      styles.priorityCardSelected,
                      { backgroundColor: priorityOption.color },
                    ],
                    !priority ||
                      (priority !== priorityOption.key && {
                        backgroundColor: priorityOption.bgColor,
                        borderColor: priorityOption.color,
                      }),
                  ]}
                  onPress={() => {
                    setPriority(priorityOption.key as 'Baixa' | 'Média' | 'Alta');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.priorityIconContainer,
                      priority === priorityOption.key && {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={priorityOption.icon as any}
                      size={24}
                      color={priority === priorityOption.key ? '#fff' : priorityOption.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.priorityCardText,
                      priority === priorityOption.key
                        ? styles.priorityCardTextSelected
                        : { color: priorityOption.color },
                    ]}
                  >
                    {priorityOption.key}
                  </Text>
                  {priority === priorityOption.key && (
                    <View style={styles.priorityCheckmark}>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Indicador visual da prioridade selecionada */}
            <View style={styles.priorityIndicatorContainer}>
              <Text style={styles.priorityIndicatorLabel}>Prioridade selecionada:</Text>
              <View
                style={[
                  styles.prioritySelectedIndicator,
                  priority === 'Baixa' && { backgroundColor: '#4CAF50' },
                  priority === 'Média' && { backgroundColor: '#FF9800' },
                  priority === 'Alta' && { backgroundColor: '#F44336' },
                ]}
              >
                <Ionicons
                  name={
                    priority === 'Baixa'
                      ? 'chevron-down'
                      : priority === 'Média'
                      ? 'remove'
                      : 'chevron-up'
                  }
                  size={16}
                  color="#fff"
                />
                <Text style={styles.prioritySelectedText}>{priority}</Text>
              </View>
            </View>
          </View>

          {/* Seção de tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.sectionDescription}>
              Adicione tags para organizar e facilitar a busca do seu card
            </Text>

            {/* Input para nova tag */}
            <View style={styles.newTagContainer}>
              <TextInput
                placeholder="Nome da nova tag..."
                value={newTagName}
                onChangeText={setNewTagName}
                style={styles.newTagInput}
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Tags disponíveis */}
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag._id}
                  style={[styles.tagItem, selectedTags.includes(tag._id) && styles.tagItemSelected]}
                  onPress={() => toggleTag(tag._id)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag._id) && styles.tagTextSelected,
                    ]}
                  >
                    {tag.name}
                  </Text>
                  {selectedTags.includes(tag._id) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Seção de imagem */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagem do Card</Text>
            <Text style={styles.sectionDescription}>
              Adicione uma imagem para ilustrar seu card (máximo: 1 imagem)
            </Text>
            <TouchableOpacity
              style={[styles.imageUploadButton, selectedImage && styles.uploadButtonDisabled]}
              onPress={handleSelectImage}
              disabled={!!selectedImage}
            >
              <Ionicons name="images" size={24} color={selectedImage ? '#999' : colors.button} />
              <Text style={[styles.imageUploadText, selectedImage && styles.uploadTextDisabled]}>
                {selectedImage ? 'Imagem selecionada' : 'Selecionar Imagem'}
              </Text>
              {!selectedImage && <Ionicons name="chevron-forward" size={20} color="#999" />}
              {selectedImage && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
            </TouchableOpacity>

            {/* Preview da imagem */}
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setSelectedImage(null);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
                <View style={styles.imageInfoOverlay}>
                  <Text style={styles.imageInfoText}>
                    {selectedImage.fileName || 'Imagem selecionada'}
                  </Text>
                  {selectedImage.fileSize && (
                    <Text style={styles.imageInfoSize}>
                      {Math.round(selectedImage.fileSize / 1024)}KB
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Seção de PDF */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documento PDF</Text>
            <Text style={styles.sectionDescription}>
              Adicione um documento PDF relacionado ao card (máximo: 1 PDF)
            </Text>
            <TouchableOpacity
              style={[styles.pdfUploadButton, selectedPdf && styles.uploadButtonDisabled]}
              onPress={handleSelectPdf}
              disabled={!!selectedPdf}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color={selectedPdf ? '#999' : colors.button}
              />
              <Text style={[styles.pdfUploadText, selectedPdf && styles.uploadTextDisabled]}>
                {selectedPdf ? 'PDF selecionado' : 'Selecionar PDF'}
              </Text>
              {!selectedPdf && <Ionicons name="chevron-forward" size={20} color="#999" />}
              {selectedPdf && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
            </TouchableOpacity>

            {/* Informações do PDF selecionado */}
            {selectedPdf && (
              <View style={styles.selectedFileInfo}>
                <View style={styles.fileInfo}>
                  <View style={styles.pdfIconContainer}>
                    <Ionicons name="document-text" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedPdf.name}
                    </Text>
                    <Text style={styles.fileSize}>
                      {selectedPdf.size
                        ? `${Math.round(selectedPdf.size / 1024)}KB`
                        : 'Tamanho desconhecido'}
                    </Text>
                    <Text style={styles.fileType}>Documento PDF</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => {
                    setSelectedPdf(null);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  <Text style={styles.removeFileText}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Seção de configurações de publicação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            <View style={styles.publishContainer}>
              <View style={styles.publishInfo}>
                <Text style={styles.publishTitle}>Publicar na Comunidade</Text>
                <Text style={styles.publishDescription}>
                  Quando ativado, seu card ficará visível para outros usuários
                </Text>
              </View>
              <Switch
                value={isPublished}
                onValueChange={(value) => {
                  setIsPublished(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: '#767577', true: colors.button }}
                thumbColor={isPublished ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Preview do card atualizado */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.cardPreview}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  {cardTitle || 'Nome do card aparecerá aqui'}
                </Text>
                <View
                  style={[
                    styles.prioritySelectedIndicator,
                    priority === 'Baixa' && { backgroundColor: '#4CAF50' },
                    priority === 'Média' && { backgroundColor: '#FF9800' },
                    priority === 'Alta' && { backgroundColor: '#F44336' },
                  ]}
                >
                  <Ionicons
                    name={
                      priority === 'Baixa'
                        ? 'chevron-down'
                        : priority === 'Média'
                        ? 'remove'
                        : 'chevron-up'
                    }
                    size={14}
                    color="#fff"
                  />
                  <Text style={[styles.prioritySelectedText, { fontSize: 12 }]}>{priority}</Text>
                </View>
              </View>
              {content && (
                <Text style={styles.previewContent} numberOfLines={3}>
                  {content}
                </Text>
              )}
              {selectedImage && (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImageMain} />
              )}
              <View style={styles.previewFooter}>
                <Text style={styles.previewDate}>{new Date().toLocaleDateString('pt-BR')}</Text>
                <View style={styles.previewIndicators}>
                  {selectedImage && (
                    <View style={styles.previewIndicator}>
                      <Ionicons name="images-outline" size={14} color="#666" />
                      <Text style={styles.previewIndicatorText}>1 imagem</Text>
                    </View>
                  )}
                  {selectedPdf && (
                    <View style={styles.previewIndicator}>
                      <Ionicons name="document-text-outline" size={14} color="#666" />
                      <Text style={styles.previewIndicatorText}>1 PDF</Text>
                    </View>
                  )}
                  {selectedTags.length > 0 && (
                    <View style={styles.previewIndicator}>
                      <Ionicons name="pricetags-outline" size={14} color="#666" />
                      <Text style={styles.previewIndicatorText}>
                        {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                  {isPublished && (
                    <View style={styles.previewIndicator}>
                      <Ionicons name="globe-outline" size={14} color="#4CAF50" />
                      <Text style={[styles.previewIndicatorText, { color: '#4CAF50' }]}>
                        Público
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Botões de ação atualizados */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.clearButton,
                !hasFormData() && styles.buttonDisabled,
              ]}
              onPress={() => {
                if (hasFormData()) {
                  Alert.alert(
                    'Limpar Formulário',
                    'Tem certeza que deseja limpar todos os dados do formulário?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Limpar',
                        style: 'destructive',
                        onPress: () => {
                          clearForm();
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert('Info', 'O formulário já está vazio.');
                }
              }}
              disabled={!hasFormData()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={!hasFormData() ? '#999' : '#FF6B6B'}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: !hasFormData() ? '#999' : '#FF6B6B' },
                  !hasFormData() && styles.buttonTextDisabled,
                ]}
              >
                Limpar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.draftButton,
                (!cardTitle.trim() || uploadingFiles) && styles.buttonDisabled,
              ]}
              onPress={handleSaveAsDraft}
              disabled={!cardTitle.trim() || uploadingFiles}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-outline"
                size={18}
                color={!cardTitle.trim() || uploadingFiles ? '#999' : colors.button}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.button },
                  (!cardTitle.trim() || uploadingFiles) && styles.buttonTextDisabled,
                ]}
              >
                Rascunho
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.createButton, styles.primaryButton]}
            onPress={handleCreateCard}
            disabled={!cardTitle.trim() || uploadingFiles}
            activeOpacity={0.8}
          >
            <Ionicons
              name={uploadingFiles ? 'reload-outline' : 'add-circle-outline'}
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {uploadingFiles ? 'Criando...' : 'Criar Card'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    marginBottom: 16,
    lineHeight: 20,
  },
  imageUploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  imageUploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageUploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    marginTop: 12,
  },
  removeFileText: {
    marginLeft: 4,
    color: '#ff4444',
    fontFamily: fontNames.regular,
    fontSize: 14,
  },
  titleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleIcon: {
    marginRight: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
    marginTop: 8,
  },
  pdfUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pdfUploadText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  selectedFileInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  cardPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  previewIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  previewIndicatorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.button,
    backgroundColor: 'transparent',
  },
  clearButton: {
    flex: 1,
    marginRight: 6,
    minWidth: 100,
    borderColor: '#FF6B6B',
  },
  draftButton: {
    flex: 1,
    marginLeft: 6,
    minWidth: 100,
  },
  createButton: {
    width: '100%',
    maxWidth: 300,
    borderColor: colors.button,
  },
  contentInputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentInput: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: 90,
    justifyContent: 'center',
  },
  priorityIconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  priorityCardSelected: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  priorityCardText: {
    fontSize: 14,
    fontFamily: fontNames.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  priorityCardTextSelected: {
    fontWeight: '700',
    fontFamily: fontNames.bold,
    color: '#fff',
  },
  priorityCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  priorityIndicatorLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    marginRight: 8,
  },
  prioritySelectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  prioritySelectedText: {
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: '#fff',
    marginLeft: 8,
  },
  newTagContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  newTagInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  tagItemSelected: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
  tagText: {
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: colors.primary,
    marginRight: 4,
  },
  tagTextSelected: {
    color: '#fff',
    fontFamily: fontNames.semibold,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageUploadText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
  },
  imagePreviewItem: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  previewContent: {
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewImageMain: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  publishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  publishInfo: {
    flex: 1,
    marginRight: 16,
  },
  publishTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 4,
  },
  publishDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    lineHeight: 18,
  },
  priorityLow: {
    borderColor: '#4CAF50',
  },
  priorityMedium: {
    borderColor: '#FF9800',
  },
  priorityHigh: {
    borderColor: '#f44336',
  },
  priorityLowIndicator: {
    backgroundColor: '#4CAF50',
  },
  priorityMediumIndicator: {
    backgroundColor: '#FF9800',
  },
  priorityHighIndicator: {
    backgroundColor: '#f44336',
  },
  priorityIndicatorText: {
    fontSize: 10,
    fontFamily: fontNames.semibold,
    color: '#fff',
    textTransform: 'uppercase',
  },
  uploadButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  uploadTextDisabled: {
    color: '#999',
  },
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  imageInfoText: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: '#fff',
  },
  imageInfoSize: {
    fontSize: 10,
    fontFamily: fontNames.regular,
    color: '#fff',
  },
  pdfIconContainer: {
    marginRight: 12,
  },
  fileType: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.7,
    borderColor: '#e0e0e0',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.button,
  },
  buttonTextDisabled: {
    color: '#999',
  },
  primaryButton: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
});

export default CreateCardScreen;
