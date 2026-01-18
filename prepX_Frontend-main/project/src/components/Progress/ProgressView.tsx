import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Calendar, Target, BookOpen, BarChart3 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProgressView: React.FC = () => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0,
    streak: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    if (!user?.id) return;
    
    try {
      const progress = await apiService.getUserProgress(user.id);
      setProgressData(progress);
      calculateStats(progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (progress: any[]) => {
    if (progress.length === 0) return;

    const totalQuizzes = progress.length;
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const totalQuestions = progress.reduce((sum, p) => sum + p.totalQuestions, 0);
    const averageScore = Math.round((totalScore / totalQuestions) * 100);
    const bestScore = Math.max(...progress.map(p => Math.round((p.score / p.totalQuestions) * 100)));

    setStats({
      totalQuizzes,
      averageScore,
      bestScore,
      totalQuestions,
      streak: 0 // Would need to calculate based on consecutive days
    });
  };

  const getCategories = () => {
    const categories = ['All', ...new Set(progressData.map(p => p.category))];
    return categories;
  };

  const getFilteredData = () => {
    if (selectedCategory === 'All') return progressData;
    return progressData.filter(p => p.category === selectedCategory);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {progressData.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-12 border border-gray-200 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Quiz History Yet</h2>
            <p className="text-gray-600 mb-6">
              Start taking quizzes to see your progress and track your improvement over time.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
              Take Your First Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Questions Answered</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Filter by Category</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {getCategories().map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz History */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Quiz History {selectedCategory !== 'All' && `- ${selectedCategory}`}</span>
              </h2>
              
              <div className="space-y-4">
                {filteredData.map((quiz, index) => {
                  const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100);
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{quiz.category}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                            {percentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {quiz.score}/{quiz.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Score: {quiz.score} out of {quiz.totalQuestions}</span>
                        <span>{new Date(quiz.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 80 ? 'bg-green-500' : 
                            percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredData.length === 0 && selectedCategory !== 'All' && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No quizzes found for {selectedCategory} category.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressView;