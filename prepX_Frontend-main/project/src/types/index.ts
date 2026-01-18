export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface Question {
  id?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  category: string;
  difficulty?: string;
}

export interface Progress {
  id?: number;
  username: string;
  score: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  date: string;
}

export interface AuthResponse {
  jwt: string;
  message: string;
  userId: number;
  fullName: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestion: number;
  userAnswers: string[];
  score: number;
  timeRemaining: number;
  isCompleted: boolean;
}