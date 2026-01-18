import React from 'react';
import { Trophy, Target, Clock, RotateCcw, Home, Share2, Star } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  category,
  difficulty,
  onRetakeQuiz,
  onBackToDashboard
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Excellent! Outstanding performance!", color: "text-green-600", icon: "🏆" };
    if (percentage >= 80) return { message: "Great job! Well done!", color: "text-blue-600", icon: "⭐" };
    if (percentage >= 70) return { message: "Good work! Keep it up!", color: "text-yellow-600", icon: "👍" };
    if (percentage >= 60) return { message: "Not bad! Room for improvement.", color: "text-orange-600", icon: "📚" };
    return { message: "Keep practicing! You'll get better!", color: "text-red-600", icon: "💪" };
  };

  const performance = getPerformanceMessage();

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{performance.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">Here are your results</p>
        </div>

        {/* Main Results Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-xl mb-6">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                  className="text-blue-600 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor()}`}>{percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${performance.color}`}>
              {performance.message}
            </h2>
            <p className="text-gray-600">
              You scored {score} out of {totalQuestions} questions correctly
            </p>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Category</div>
              <div className="text-blue-600">{category}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Difficulty</div>
              <div className="text-purple-600">{difficulty}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Accuracy</div>
              <div className="text-green-600">{percentage}%</div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-700">Correct Answers</span>
                <span className="font-semibold text-green-700">{score}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-700">Incorrect Answers</span>
                <span className="font-semibold text-red-700">{totalQuestions - score}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-700">Total Questions</span>
                <span className="font-semibold text-blue-700">{totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRetakeQuiz}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Retake Quiz</span>
            </button>
            
            <button
              onClick={onBackToDashboard}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Share Results */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Achievement</h3>
          <p className="text-gray-600 mb-4">
            Scored {percentage}% in {category} ({difficulty}) quiz!
          </p>
          <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto">
            <Share2 className="h-4 w-4" />
            <span>Share Results</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;