import api from './api';

export interface QuizQuestion {
  question: string;
  options: string[];
}

export interface QuizStartResponse {
  sessionId: string;
  question: QuizQuestion;
  cardTitle: string;
}

export interface QuizAnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  pointsEarned: number;
  totalOrgPoints?: number;
}

export class QuizService {
  static async start(cardId: string, amount: number = 1): Promise<QuizStartResponse> {
    const response = await api.post(`/quiz/start/${cardId}`, { amount });
    return response.data?.data || response.data;
  }

  static async answer(
    sessionId: string,
    answer: number,
    timeSpent: number = 0
  ): Promise<QuizAnswerResponse> {
    const response = await api.post(`/quiz/answer/${sessionId}`, { answer, timeSpent });
    return response.data?.data || response.data;
  }
}
