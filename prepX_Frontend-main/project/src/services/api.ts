const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth endpoints
  async sendOtpForRegistration(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.text();
  }

  async verifyOtpForRegistration(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  }

  async registerUser(userData: { fullName: string; email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async sendOtpForLogin(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.text();
  }

  async verifyOtpForLogin(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  }

  // Question endpoints
  async getAllQuestions() {
    const response = await fetch(`${API_BASE_URL}/api/questions/all`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async getQuestionsByCategory(category: string, difficulty: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/questions?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`,
      { headers: this.getAuthHeaders() }
    );
    return response.json();
  }

  async getCategories() {
    const questions = await this.getAllQuestions();
    const categories = [...new Set(questions.map((q: any) => q.category))];
    return categories;
  }

  // Admin endpoints
  // Add these methods to your existing ApiService class
async addQuestions(questions: any[], password: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/add-questions?password=${encodeURIComponent(password)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questions)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  
  return response.text();
}

async uploadCSV(file: File, password: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  
  const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  
  return response.text();
}

  // Progress endpoints
  async saveProgress(progressData: {
    score: number;
    totalQuestions: number;
    category: string;
    difficulty: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    return response.text();
  }

  async getUserProgress(userId: number) {
    const response = await fetch(`${API_BASE_URL}/api/progress/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }


  async deleteQuestions(ids: number[], password: string) {
    const response = await fetch(
        `${API_BASE_URL}/api/admin/delete-questions?ids=${encodeURIComponent(ids.join(','))}&password=${encodeURIComponent(password)}`,
        {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        }
    );
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.text();
}

}





export const apiService = new ApiService();