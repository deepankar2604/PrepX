import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/Auth/LandingPage';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import QuizSelection from './components/Quiz/QuizSelection';
import QuizInterface from './components/Quiz/QuizInterface';
import QuizResults from './components/Quiz/QuizResults';
import ProgressView from './components/Progress/ProgressView';
import AdminPanel from './components/Admin/AdminPanel';
import { apiService } from './services/api';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [quizState, setQuizState] = useState<{
    category: string;
    difficulty: string;
    isActive: boolean;
    isCompleted: boolean;
    score?: number;
    totalQuestions?: number;
  }>({
    category: '',
    difficulty: '',
    isActive: false,
    isCompleted: false
  });

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const handleStartQuiz = async (category: string, difficulty: string) => {
    try {
      // Check if questions are available for this category/difficulty
      const questions = await apiService.getQuestionsByCategory(category, difficulty);
      if (questions.length === 0) {
        alert(`No questions available for ${category} - ${difficulty} level.`);
        return;
      }
      
      setQuizState({
        category,
        difficulty,
        isActive: true,
        isCompleted: false
      });
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert('Failed to load quiz questions. Please try again.');
    }
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: true,
      score,
      totalQuestions
    }));
  };

  const handleRetakeQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      isActive: true,
      isCompleted: false,
      score: undefined,
      totalQuestions: undefined
    }));
  };

  const handleBackToDashboard = () => {
    setQuizState({
      category: '',
      difficulty: '',
      isActive: false,
      isCompleted: false
    });
    setCurrentPage('dashboard');
  };

  const handleBackToQuizSelection = () => {
    setQuizState(prev => ({
      ...prev,
      isActive: false,
      isCompleted: false
    }));
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Reset quiz state when navigating away from quiz
    if (page !== 'quiz') {
      setQuizState({
        category: '',
        difficulty: '',
        isActive: false,
        isCompleted: false
      });
    }
  };

  // Quiz flow rendering
  if (currentPage === 'quiz') {
    if (quizState.isCompleted) {
      return (
        <>
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <QuizResults
            score={quizState.score!}
            totalQuestions={quizState.totalQuestions!}
            category={quizState.category}
            difficulty={quizState.difficulty}
            onRetakeQuiz={handleRetakeQuiz}
            onBackToDashboard={handleBackToDashboard}
          />
        </>
      );
    }

    if (quizState.isActive) {
      return (
        <>
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <QuizInterface
            category={quizState.category}
            difficulty={quizState.difficulty}
            onComplete={handleQuizComplete}
            onBack={handleBackToQuizSelection}
          />
        </>
      );
    }

    return (
      <>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <QuizSelection onStartQuiz={handleStartQuiz} />
      </>
    );
  }

  // Regular page rendering
  return (
    <>
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'progress' && <ProgressView />}
      {currentPage === 'admin' && <AdminPanel />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;