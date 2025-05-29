import * as FileSystem from 'expo-file-system';

/**
 * Converte uma imagem local (URI) para base64
 * @param imageUri URI local da imagem
 * @returns String base64 no formato "data:image/jpeg;base64,..."
 */
export const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // Lê o arquivo da imagem como base64
    const base64String = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determina o tipo MIME da imagem baseado na extensão ou assume JPEG
    let mimeType = 'image/jpeg';
    const extension = imageUri.toLowerCase().split('.').pop();

    switch (extension) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/jpeg'; // Default para JPEG
    }

    // Retorna no formato data URL como a versão web
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error);
    throw new Error('Falha ao converter imagem para base64');
  }
};
