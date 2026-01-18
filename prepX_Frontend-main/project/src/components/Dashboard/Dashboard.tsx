import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, TrendingUp, Play, Users, Clock, Award } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [recentProgress, setRecentProgress] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestCategory: '',
    totalQuestions: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load categories
      const cats = await apiService.getCategories();
      setCategories(cats);

      // Load user progress if available
      if (user?.id) {
        const progress = await apiService.getUserProgress(user.id);
        setRecentProgress(progress.slice(0, 5)); // Show last 5 attempts
        
        // Calculate stats
        if (progress.length > 0) {
          const totalScore = progress.reduce((sum: number, p: any) => sum + p.score, 0);
          const totalQuestions = progress.reduce((sum: number, p: any) => sum + p.totalQuestions, 0);
          const averageScore = Math.round((totalScore / totalQuestions) * 100);
          
          // Find best category
          const categoryScores: { [key: string]: { total: number; count: number } } = {};
          progress.forEach((p: any) => {
            const percentage = (p.score / p.totalQuestions) * 100;
            if (!categoryScores[p.category]) {
              categoryScores[p.category] = { total: 0, count: 0 };
            }
            categoryScores[p.category].total += percentage;
            categoryScores[p.category].count += 1;
          });
          
          let bestCategory = '';
          let bestAverage = 0;
          Object.entries(categoryScores).forEach(([category, data]) => {
            const average = data.total / data.count;
            if (average > bestAverage) {
              bestAverage = average;
              bestCategory = category;
            }
          });

          setStats({
            totalQuizzes: progress.length,
            averageScore: averageScore,
            bestCategory: bestCategory,
            totalQuestions: totalQuestions
          });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Hard': 'bg-red-100 text-red-700'
  };

  const categoryIcons = {
    'Java': '☕',
    'JavaScript': '🟨',
    'Python': '🐍',
    'Science': '🔬',
    'Geography': '🌍',
    'Technology': '💻',
    'Mathematics': '📊',
    'History': '📚'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600">Ready to challenge yourself with some quizzes today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Best Category</p>
                <p className="text-lg font-bold text-gray-900">{stats.bestCategory || 'None yet'}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Questions Answered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Available Quiz Categories</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                    onClick={() => onNavigate('quiz')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons] || '📖'}</span>
                        <h3 className="font-semibold text-gray-900">{category}</h3>
                      </div>
                      <Play className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Test your knowledge in {category.toLowerCase()} with our curated questions
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Multiple difficulties</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>15-30 mins</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No quiz categories available yet.</p>
                  <p className="text-sm">Contact your admin to add some questions!</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Play className="h-5 w-5" />
                  <span>Start a Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Recent Activity</span>
            </h2>

            <div className="space-y-4">
              {recentProgress.map((progress, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{progress.category}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      difficultyColors[progress.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {progress.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{progress.score}/{progress.totalQuestions} correct</span>
                    <span className="font-medium text-blue-600">
                      {Math.round((progress.score / progress.totalQuestions) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.score / progress.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {recentProgress.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No quiz attempts yet.</p>
                  <p className="text-sm">Start your first quiz to see your progress here!</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => onNavigate('progress')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                View All Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;