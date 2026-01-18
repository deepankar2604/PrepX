import React, { useState, useEffect } from 'react';
import { Upload, Plus, BookOpen, FileText, Download, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Question } from '../../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'add' | 'view'>('upload');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newQuestions, setNewQuestions] = useState<Question[]>([{
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    category: '',
    difficulty: 'Easy'
  }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // For delete functionality
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  const loadQuestions = async () => {
    try {
      const questionData = await apiService.getAllQuestions();
      setQuestions(questionData);
      setSelectedQuestionIds([]); // Clear selection after reload
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !adminPassword) {
      setMessage({ type: 'error', text: 'Please select a CSV file and enter the admin password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await apiService.uploadCSV(selectedFile, adminPassword);
      setMessage({ type: 'success', text: 'CSV file uploaded successfully!' });
      setSelectedFile(null);
      setAdminPassword('');
      await loadQuestions();
      await loadCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload CSV file. Please check the format and password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestions = async () => {
    const validQuestions = newQuestions.filter(q => 
      q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && q.category
    );

    if (validQuestions.length === 0 || !adminPassword) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and enter the admin password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiService.addQuestions(validQuestions, adminPassword);
      setMessage({ type: 'success', text: `${validQuestions.length} question(s) added successfully!` });
      setNewQuestions([{
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        category: '',
        difficulty: 'Easy'
      }]);
      setAdminPassword('');
      await loadQuestions();
      await loadCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add questions. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addNewQuestionForm = () => {
    setNewQuestions([...newQuestions, {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: '',
      difficulty: 'Easy'
    }]);
  };

  const removeQuestionForm = (index: number) => {
    if (newQuestions.length > 1) {
      const updated = newQuestions.filter((_, i) => i !== index);
      setNewQuestions(updated);
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...newQuestions];
    (updated[index] as any)[field] = value;
    setNewQuestions(updated);
  };

  const downloadSampleCSV = () => {
    const sampleData = `questionText,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty
"What is Java?","A fruit","A programming language","A movie","A car","B","Java","Easy"
"What is Spring Boot?","A boot brand","A Java Framework","A season","An IDE","B","Java","Medium"`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-questions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    questions.forEach(q => {
      stats[q.category] = (stats[q.category] || 0) + 1;
    });
    return stats;
  };

  // Delete selected questions
  const handleDeleteQuestions = async () => {
    if (selectedQuestionIds.length === 0 || !deletePassword) {
      setMessage({ type: 'error', text: 'Please select at least one question and enter the admin password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiService.deleteQuestions(selectedQuestionIds, deletePassword);
      setMessage({ type: 'success', text: 'Questions deleted successfully!' });
      setSelectedQuestionIds([]);
      setDeletePassword('');
      await loadQuestions();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete questions.' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (id: number) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(qid => qid !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage quiz questions and categories</p>
        </div>

        {message && (
          <div className={`flex items-center space-x-2 p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span>Add Questions</span>
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'view'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>View Questions</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 border border-gray-200">
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Questions via CSV</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Choose CSV file
                        </label>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Password *
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter admin password..."
                    />
                  </div>

                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || !adminPassword || loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Uploading...' : 'Upload Questions'}
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Your CSV file should have these columns:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>questionText</strong> - The question text</li>
                      <li>• <strong>optionA</strong> - First option</li>
                      <li>• <strong>optionB</strong> - Second option</li>
                      <li>• <strong>optionC</strong> - Third option</li>
                      <li>• <strong>optionD</strong> - Fourth option</li>
                      <li>• <strong>correctAnswer</strong> - A, B, C, or D</li>
                      <li>• <strong>category</strong> - Question category</li>
                      <li>• <strong>difficulty</strong> - Easy, Medium, or Hard</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={downloadSampleCSV}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Sample CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add Questions Manually</h2>
                <button
                  onClick={addNewQuestionForm}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Question</span>
                </button>
              </div>

              <div className="space-y-8">
                {newQuestions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                      {newQuestions.length > 1 && (
                        <button
                          onClick={() => removeQuestionForm(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your question here..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Option A *
                        </label>
                        <input
                          type="text"
                          value={question.optionA}
                          onChange={(e) => updateQuestion(index, 'optionA', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="First option"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Option B *
                        </label>
                        <input
                          type="text"
                          value={question.optionB}
                          onChange={(e) => updateQuestion(index, 'optionB', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Second option"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Option C *
                        </label>
                        <input
                          type="text"
                          value={question.optionC}
                          onChange={(e) => updateQuestion(index, 'optionC', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Third option"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Option D *
                        </label>
                        <input
                          type="text"
                          value={question.optionD}
                          onChange={(e) => updateQuestion(index, 'optionD', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Fourth option"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={question.category}
                          onChange={(e) => updateQuestion(index, 'category', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Java, Science, Geography"
                          list={`categories-${index}`}
                        />
                        <datalist id={`categories-${index}`}>
                          {categories.map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={question.difficulty}
                          onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password *
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password..."
                />
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleAddQuestions}
                  disabled={loading || !adminPassword}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Adding Questions...' : `Add ${newQuestions.length} Question(s)`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'view' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Questions</h2>
                <div className="text-sm text-gray-600">
                  Total: {questions.length} questions
                </div>
              </div>

              {/* Category Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(getCategoryStats()).map(([category, count]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600">{category}</div>
                  </div>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="mr-2"
                        />
                        <h3 className="font-medium text-gray-900 flex-1">
                          {question.questionText}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {question.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className={question.correctAnswer === 'A' ? 'text-green-600 font-medium' : ''}>
                        A) {question.optionA}
                      </div>
                      <div className={question.correctAnswer === 'B' ? 'text-green-600 font-medium' : ''}>
                        B) {question.optionB}
                      </div>
                      <div className={question.correctAnswer === 'C' ? 'text-green-600 font-medium' : ''}>
                        C) {question.optionC}
                      </div>
                      <div className={question.correctAnswer === 'D' ? 'text-green-600 font-medium' : ''}>
                        D) {question.optionD}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete Selected Questions */}
              {selectedQuestionIds.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Password *
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter admin password..."
                    />
                  </div>
                  <button
                    onClick={handleDeleteQuestions}
                    disabled={!deletePassword || loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected Questions ({selectedQuestionIds.length})</span>
                  </button>
                </div>
              )}

              {questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No questions available</p>
                  <p>Upload a CSV file or add questions manually to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
