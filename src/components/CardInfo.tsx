import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../services/cardService';

interface CardInfoProps {
  card: Card;
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Baixa':
      return '#e8f5e9';
    case 'Média':
      return '#fff3e0';
    case 'Alta':
      return '#ffebee';
    default:
      return '#e0e0e0';
  }
};

export const CardInfo: React.FC<CardInfoProps> = ({ card }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações do Card:</Text>
      <View style={styles.content}>
        <Text style={styles.label}>Título:</Text>
        <Text style={styles.value}>{card.title}</Text>
        
        <Text style={styles.label}>Prioridade:</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(card.priority) }]}>
          <Text style={styles.priorityText}>{card.priority}</Text>
        </View>

        {card.content && (
          <>
            <Text style={styles.label}>Conteúdo:</Text>
            <Text style={styles.value}>{card.content}</Text>
          </>
        )}

        {card.pdfs && card.pdfs.length > 0 ? (
          <>
            <Text style={styles.label}>PDF:</Text>
            <Text style={styles.value}>{card.pdfs[0].filename || 'arquivo.pdf'}</Text>
          </>
        ) : (
          <Text style={[styles.label, styles.error]}>Este card não possui PDF.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  content: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  error: {
    color: '#ff4444',
  },
}); 