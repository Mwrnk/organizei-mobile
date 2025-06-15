import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import colors from '@styles/colors';
import { fontNames } from '../styles/fonts';
import ArrowBack from 'assets/icons/ArrowBack';
import MemberCard from '@components/MemberCard';



type AboutScreenNavigationProp = StackNavigationProp<RootTabParamList>;

const AboutScreen = () => {
  const navigation = useNavigation<AboutScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowBack color={colors.primary} size={16} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sobre Nós</Text>
                <View style={{ width: 24 }} /> {/* Espaçador para centralizar título */}
            </View>
            
            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.h1}>Conheça quem{'\n'}está por trás{'\n'} disso tudo!</Text>
                <View style={styles.historyContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.sectionTitle}>#história</Text>
                        <View style={styles.sectionLine} />
                    </View>

                    <View style={styles.contentDescription}>

                        <Text style={styles.historyDescription}>
                        Este app surgiu como um projeto de faculdade para enfrentar um desafio comum: a desorganização nos estudos e o difícil acesso a conteúdos.
                        </Text>

                        <Text style={styles.historyDescription}>
                        Este app surgiu como um projeto de faculdade para enfrentar um desafio comum: a desorganização nos estudos e o difícil acesso a conteúdos.
                        </Text>

                    </View>

                </View>

                {/* Members */}
                <View style={styles.membersContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.sectionTitle}>#membros</Text>
                        <View style={styles.sectionLine} />
                    </View>

                    <View style={styles.contentMembers}>
                        <View style={styles.membersGrid}>
                            <MemberCard
                                name="Gabriel Cunha"
                                image={require('assets/imgs/gc.png')}
                                description="UX/UI / Front-End Mobile"
                                style="first"
                            />
                            <MemberCard
                                name="Mateus Werneck"
                                image={require('assets/imgs/werneck.jpeg')}
                                description="Front-End Mobile"
                                style="second"
                            />
                            <MemberCard
                                name="Matheus Ribas"
                                image={require('assets/imgs/Matheus Ribas.jpg')}
                                description="Front-End Web"
                                style="first"
                            />
                            <MemberCard
                                name="Micael Ferrari"
                                image={require('assets/imgs/Micael.png')}
                                description="Back-End Dev"
                                style="second"
                            />

                            <MemberCard
                                name="Thiago Malaquias"
                                image={require('assets/imgs/Tiago.png')}
                                description="Back-End Dev"
                                style="first"
                            />
                            
                            <MemberCard
                                name="Pedro Marazo"
                                image={require('assets/imgs/Marazo.png')}
                                description="Back-End Dev"
                                style="second"
                            />

                            <MemberCard
                                name="Carlos Breno"
                                image={require('assets/imgs/brenin.jpeg')}
                                description="Back-End Dev"
                                style="first"
                            />

                            <MemberCard
                                name="Mateus Silva"
                                image={require('assets/imgs/Mateus Silva.png')}
                                description="Front-End Mobile"
                                style="second"
                            />
                        </View>
                    </View>

                    
                </View>
                
                

            </View>

            

        
            <View style={styles.content}>
                <Text style={styles.version}>Versão 1.0.0</Text>
                <Text style={styles.description}>
                Organizei é um aplicativo desenvolvido para ajudar estudantes a organizarem seus estudos de forma eficiente.
                </Text>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
    marginTop: 20,
  },

  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    padding: 8,
  },

  contentContainer: {
    padding: 16,
    marginTop: 20,
  },

  h1: {
    fontSize: 40,
    fontFamily: fontNames.bold,
    color: colors.primary,
    lineHeight: 48,
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  historyContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 40,
  },

  membersContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 32,
  },

  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.lightGray,
    borderRadius: 1,
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },

  contentDescription: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 16,
  },

  historyDescription: {
    fontSize: 16,
    fontFamily: fontNames.regular,

  },

  content: {
    padding: 16,
  },

  contentMembers: {
    width: '100%',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  
  memberItemImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberItemName: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },

  memberItemDescription: {
    fontSize: 10,
    fontFamily: fontNames.regular,
    color: colors.gray,
  },

  version: {
    fontSize: 16,
    fontFamily: fontNames.semibold,
    color: colors.gray,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: colors.gray,
    lineHeight: 20,
  },
});

export default AboutScreen; 