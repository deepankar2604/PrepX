import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Clock, Target } from 'lucide-react';
import { apiService } from '../../services/api';

interface QuizSelectionProps {
  onStartQuiz: (category: string, difficulty: string) => void;
}

const QuizSelection: React.FC<QuizSelectionProps> = ({ onStartQuiz }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedCategory || !selectedDifficulty) return;
    
    setLoading(true);
    try {
      await onStartQuiz(selectedCategory, selectedDifficulty);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const difficulties = ['Easy', 'Medium', 'Hard'];

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

  const difficultyInfo = {
    'Easy': { color: 'bg-green-100 text-green-700 border-green-200', time: '10-15 mins', questions: '5-10' },
    'Medium': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', time: '15-20 mins', questions: '10-15' },
    'Hard': { color: 'bg-red-100 text-red-700 border-red-200', time: '20-30 mins', questions: '15-20' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Quiz</h1>
          <p className="text-gray-600 text-lg">Select a category and difficulty level to get started</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl">
          {/* Category Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Select Category</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedCategory === category
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{categoryIcons[category as keyof typeof categoryIcons] || '📖'}</div>
                    <div className="font-medium text-gray-900">{category}</div>
                  </div>
                </button>
              ))}
            </div>
            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No categories available yet.</p>
              </div>
            )}
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Select Difficulty</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((difficulty) => {
                const info = difficultyInfo[difficulty as keyof typeof difficultyInfo];
                return (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                      selectedDifficulty === difficulty
                        ? `${info.color} border-opacity-50 shadow-md transform scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg mb-2">{difficulty}</div>
                      <div className="text-sm opacity-80 space-y-1">
                        <div className="flex items-center justify-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{info.time}</span>
                        </div>
                        <div>{info.questions} questions</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiz Preview */}
          {selectedCategory && selectedDifficulty && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quiz Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Category: <strong>{selectedCategory}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Difficulty: <strong>{selectedDifficulty}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Time: <strong>{difficultyInfo[selectedDifficulty as keyof typeof difficultyInfo].time}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Start Quiz Button */}
          <div className="text-center">
            <button
              onClick={handleStartQuiz}
              disabled={!selectedCategory || !selectedDifficulty || loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 mx-auto"
            >
              <Play className="h-5 w-5" />
              <span>{loading ? 'Loading Questions...' : 'Start Quiz'}</span>
            </button>
            
            {(!selectedCategory || !selectedDifficulty) && (
              <p className="text-sm text-gray-500 mt-2">
                Please select both category and difficulty to start
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSelection;