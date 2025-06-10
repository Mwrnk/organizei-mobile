import Realm from 'realm';
import { v4 as uuidv4 } from 'uuid';
import QuizQuestion from '../models/QuizQuestion';

interface CreateQuestionData {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  category: string;
}

class QuizService {
  private realm: Realm;

  constructor(realm: Realm) {
    this.realm = realm;
  }

  async createQuestion(data: CreateQuestionData): Promise<QuizQuestion> {
    try {
      let question;
      await this.realm.write(() => {
        question = this.realm.create('QuizQuestion', {
          id: uuidv4(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      return question;
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      throw error;
    }
  }

  getQuestionsByCategory(categories: string[]): QuizQuestion[] {
    return this.realm
      .objects<QuizQuestion>('QuizQuestion')
      .filtered('category IN $0', categories)
      .sorted('createdAt', true)
      .toArray();
  }

  getRandomQuestions(categories: string[], count: number): QuizQuestion[] {
    const questions = this.getQuestionsByCategory(categories);
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      const question = this.realm.objectForPrimaryKey('QuizQuestion', id);
      if (question) {
        await this.realm.write(() => {
          this.realm.delete(question);
        });
      }
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      throw error;
    }
  }
}

export default QuizService; 