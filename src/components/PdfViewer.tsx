import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../services/auth';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';

interface PdfViewerProps {
  source: {
    uri: string;
    headers?: { [key: string]: string };
  };
  style?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ source, style, onLoad, onError }) => {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);

  const downloadPdf = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter token de autenticação
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Criar nome único para o arquivo
      const fileName = `pdf_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Headers para autenticação
      const headers = {
        Authorization: `Bearer ${token}`,
        ...source.headers,
      };

      // Download do arquivo
      const downloadResult = await FileSystem.downloadAsync(source.uri, fileUri, {
        headers,
      });

      if (downloadResult.status === 200) {
        // Verificar se o arquivo foi baixado corretamente
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          // Converter para base64 para usar no WebView
          const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const dataUri = `data:application/pdf;base64,${base64}`;
          setPdfUri(dataUri);

          // Limpar arquivo temporário
          await FileSystem.deleteAsync(fileUri, { idempotent: true });

          onLoad?.();
        } else {
          throw new Error('Arquivo PDF baixado está vazio ou corrompido');
        }
      } else {
        throw new Error(`Falha no download: Status ${downloadResult.status}`);
      }
    } catch (err: any) {
      console.error('📄 Erro no download do PDF:', err);
      setError(err.message || 'Erro ao carregar PDF');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [source.uri, source.headers, onLoad, onError]);

  useEffect(() => {
    if (source.uri) {
      downloadPdf();
    }
  }, [source.uri]);

  const createPdfHtml = (pdfDataUri: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
          <title>PDF Viewer</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f5f5f5;
              height: 100vh;
              overflow: hidden;
            }
            
            .container {
              width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            
            .pdf-container {
              flex: 1;
              width: 100%;
              height: 100%;
              background: white;
              position: relative;
            }
            
            .pdf-object {
              width: 100%;
              height: 100%;
              border: none;
            }
            
            .loading {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: rgba(255, 255, 255, 0.9);
              color: #666;
              z-index: 10;
            }
            
            .error {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: white;
              color: #e74c3c;
              text-align: center;
              padding: 20px;
              z-index: 10;
            }
            
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007AFF;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .retry-btn {
              background: #007AFF;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 16px;
            }
            
            .hidden {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="pdf-container">
              <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Carregando PDF...</p>
              </div>
              
              <div id="error" class="error hidden">
                <p>Erro ao carregar o PDF</p>
                <button class="retry-btn" onclick="retryLoad()">Tentar novamente</button>
              </div>
              
              <object 
                id="pdf-object" 
                class="pdf-object" 
                data="${pdfDataUri}" 
                type="application/pdf"
                style="display: none;"
              >
                <p>Seu navegador não suporta visualização de PDF.</p>
              </object>
            </div>
          </div>
          
          <script>
            let loadTimeout;
            let hasLoaded = false;
            
            function showLoading() {
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('error').classList.add('hidden');
              document.getElementById('pdf-object').style.display = 'none';
            }
            
            function showError() {
              document.getElementById('loading').classList.add('hidden');
              document.getElementById('error').classList.remove('hidden');
              document.getElementById('pdf-object').style.display = 'none';
              window.ReactNativeWebView?.postMessage('pdf_error');
            }
            
            function showPdf() {
              document.getElementById('loading').classList.add('hidden');
              document.getElementById('error').classList.add('hidden');
              document.getElementById('pdf-object').style.display = 'block';
              hasLoaded = true;
              window.ReactNativeWebView?.postMessage('pdf_loaded');
            }
            
            function retryLoad() {
              showLoading();
              loadPdf();
            }
            
            setTimeout(() => {
              if (!hasLoaded) {
                setError('Tempo limite para carregar PDF excedido');
                setLoading(false);
              }
            }, 30000);

            // Mostrar PDF após um pequeno delay para garantir que está carregado
            setTimeout(() => {
              setWebViewLoading(false);
            }, 2000);

            // Aguardar o DOM carregar
            window.addEventListener('DOMContentLoaded', function() {
              loadPdf();
            });

            function loadPdf() {
              if (typeof pdfjsLib !== 'undefined') {
                // PDF.js carregado
              } else {
                // Erro ao carregar PDF.js
              }
            }
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={styles.loadingText}>Baixando PDF...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar PDF</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.retryText} onPress={downloadPdf}>
            Toque para tentar novamente
          </Text>
        </View>
      </View>
    );
  }

  if (!pdfUri) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>PDF não disponível</Text>
          <Text style={styles.errorMessage}>Não foi possível carregar o arquivo PDF</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: createPdfHtml(pdfUri) }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        scalesPageToFit={true}
        startInLoadingState={false}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          try {
            const data = JSON.parse(message);
            if (data.type === 'pdfLoaded') {
              // PDF carregado com sucesso
              setError(null);
            } else if (data.type === 'pdfError') {
              setError('Erro ao carregar PDF no WebView');
            }
          } catch (e) {
            // Mensagem não é JSON válido, ignorar
          }
        }}
        onLoadStart={() => {
          // WebView começou a carregar
        }}
        onLoadEnd={() => {
          // WebView terminou de carregar
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('📄 WebView error:', nativeEvent);
          setError('Erro na visualização do PDF');
          setWebViewLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('📄 WebView HTTP error:', nativeEvent);
          setError('Erro de rede ao carregar PDF');
          setWebViewLoading(false);
        }}
      />

      {webViewLoading && (
        <View style={styles.webviewLoading}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={styles.loadingText}>Renderizando PDF...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryText: {
    fontSize: 16,
    color: colors.button,
    fontFamily: fontNames.semibold,
    textDecorationLine: 'underline',
  },
});

export default PdfViewer;
