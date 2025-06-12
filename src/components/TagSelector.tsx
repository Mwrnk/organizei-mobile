import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tag {
  _id: string;
  name: string;
}

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  error?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagToggle,
  error,
}) => {
  return (
    <View>
      {availableTags.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma tag disponível</Text>
      ) : (
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag._id}
              style={[
                styles.tagButton,
                selectedTags.includes(tag._id) && styles.selectedTag,
              ]}
              onPress={() => onTagToggle(tag._id)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag._id) && styles.selectedTagText,
                ]}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#2196f3',
  },
  tagText: {
    color: '#333',
    fontSize: 13,
  },
  selectedTagText: {
    color: '#fff',
  },
  emptyText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
}); 