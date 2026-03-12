const API_BASE_URL = '/api';
const MINICPM_SERVER = '/ai-vision';
const ASR_SERVER = '/speech';

class ApiService {
  private backendStatus: any = { status: 'offline', database: 'offline' };
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.checkConnection();
    this.startConnectionMonitoring();
  }

  private async checkConnection() {
    try {
      const response = await fetch(`/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      } as any);
      if (response.ok) {
        this.backendStatus = await response.json();
      } else {
        this.backendStatus = { status: 'offline', database: 'offline' };
      }
    } catch (error) {
      this.backendStatus = { status: 'offline', database: 'offline' };
      console.warn('Backend connection check failed:', error);
    }
  }

  private startConnectionMonitoring() {
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnection();
    }, 10000); // Check every 10 seconds
  }

  private async retryRequest(requestFn: () => Promise<Response>, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await requestFn();
        if (response.ok) return response;
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  getBackendStatus() {
    return this.backendStatus;
  }

  async login(email: string, password: string) {
    try {
      const response = await this.retryRequest(() =>
        fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
      );

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.warn('Backend authentication failed, enabling Demo Mode:', error);
      const demoToken = 'demo_mode_token_' + Date.now();
      localStorage.setItem('authToken', demoToken);

      const username = email ? email.split('@')[0] : 'DemoUser';
      return {
        token: demoToken,
        user: {
          id: 'demo_user_id',
          username: username,
          email: email,
          role: 'sys_admin'
        }
      };
    }
  }

  async register(userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Registration failed');
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.warn('Backend registration failed, enabling Demo Mode:', error);
      const demoToken = 'demo_mode_token_' + Date.now();
      localStorage.setItem('authToken', demoToken);

      return {
        token: demoToken,
        user: {
          id: 'demo_user_id',
          username: userData.username || 'DemoUser',
          email: userData.email,
          role: 'citizen',
          phoneNumber: userData.phoneNumber,
          address: userData.address
        }
      };
    }
  }

  async createReport(reportData: any, onProgress?: (sent: number, total: number) => void) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem('authToken');
      
      xhr.open('POST', `${API_BASE_URL}/reports`, true);
      // Let the browser set the boundary for multipart/form-data
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded, e.total);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Failed to create report: ${xhr.status} ${xhr.responseText}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));
      
      xhr.timeout = 180000; // Increased to 3 mins for large images
      
      const formData = new FormData();
      
      // Append all non-file fields
      Object.keys(reportData).forEach(key => {
        if (key === 'images') {
          // Handle images specially
          reportData.images.forEach((file: File | string) => {
            if (file instanceof File) {
              formData.append('images', file);
            } else if (typeof file === 'string' && file.startsWith('data:')) {
              // Fallback for base64 if needed (though we prefer Files)
              formData.append('images_base64', file);
            }
          });
        } else if (typeof reportData[key] === 'object' && reportData[key] !== null) {
          formData.append(key, JSON.stringify(reportData[key]));
        } else {
          formData.append(key, reportData[key]);
        }
      });

      console.log(`📤 Sending Multipart: ${[...formData.keys()].join(', ')}`);
      xhr.send(formData);
    });
  }

  async getReports(filters?: any) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    } catch (error) {
      console.warn('Backend not available, using demo data:', error);
      return [];
    }
  }

  async getUserReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { reports: [] };
        }
        throw new Error('Failed to fetch user reports');
      }
      return response.json();
    } catch (error) {
      console.warn('Backend not available, using demo data:', error);
      return { reports: [] };
    }
  }

  async updateReportStatus(reportId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });

    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }

  async voteOnReport(reportId: string, vote: 'up' | 'down') {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/vote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ vote })
    });

    if (!response.ok) throw new Error('Failed to vote');
    return response.json();
  }

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async approveUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to approve user');
    return response.json();
  }

  async updateUserRole(userId: string, role: string, department?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role, department })
      });

      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }

  async getReportHistory(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/history`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  }

  async assignReport(reportId: string, assignedTo: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assignedTo })
    });

    if (!response.ok) throw new Error('Failed to assign report');
    return response.json();
  }

  async getThreadMessages(reportId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/threads/${reportId}/messages`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch thread messages:', error);
      return [];
    }
  }

  async postThreadMessage(reportId: string, content: string, attachments?: any[], isAnonymous?: boolean) {
    try {
      const response = await fetch(`${API_BASE_URL}/threads/${reportId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ content, attachments, isAnonymous })
      });

      if (!response.ok) throw new Error('Failed to post message');
      return response.json();
    } catch (error) {
      console.error('Post message error:', error);
      throw error;
    }
  }

  async getSLA(reportId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/sla/${reportId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch SLA');
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch SLA:', error);
      return null;
    }
  }

  async deleteReport(reportId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Delete API error:', error);
      throw error;
    }
  }

  async analyzeImageWithAI(imageData: string) {
    try {
      const response = await fetch(`${MINICPM_SERVER}/analyze_base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) throw new Error(`MiniCPM analysis failed: ${response.status}`);
      return response.json();
    } catch (error) {
      console.warn('MiniCPM server not available:', error);
      return {
        success: true,
        analysis: {
          category: 'Roads & Infrastructure',
          department: 'Roads Department',
          priority: 'medium',
          confidence: 0.75,
          description: 'AI analysis temporarily unavailable. Manual categorization applied.',
          detected_objects: ['Municipal Infrastructure'],
          fallback: true
        }
      };
    }
  }

  async checkMiniCPMHealth() {
    try {
      const response = await fetch(`${MINICPM_SERVER}/health`, { timeout: 5000 } as any);
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkASRHealth() {
    try {
      const response = await fetch(`${ASR_SERVER}/health`, { timeout: 5000 } as any);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getGlobalStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/global`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch global stats');
      return response.json();
    } catch (error) {
      console.warn('Backend not available, using demo stats:', error);
      return {
        totalReports: 2847,
        reportsToday: 34,
        reportsThisWeek: 198,
        reportsThisMonth: 742,
        reportsLastMonth: 680,
        growthRate: 9.12,
        activeUsers: 15203,
        highPriorityCount: 312,
        mediumPriorityCount: 1540,
        lowPriorityCount: 995,
        overdueReports: 47,
        slaBreachedCount: 23,
        averageResponseTime: 4.5,
        averageResolutionTime: 38.2,
        medianResolutionTime: 26.0,
        topTrendingCategory: 'Roads & Infrastructure',
        totalComments: 8431,
        totalVotes: 21093,
        reportsByStatus: { open: 823, in_progress: 184, resolved: 1663, closed: 177 },
        reportsByPriority: { low: 995, medium: 1540, high: 262, urgent: 50 },
        reportsByDepartment: {
          'Roads & Infrastructure': 720,
          'Water Services': 540,
          'Electricity': 430,
          'Waste Management': 380,
          'Parks & Recreation': 290,
          'Public Safety': 487
        },
        reportsByCategory: {
          'Roads & Infrastructure': 720,
          'Water Services': 540,
          'Electricity': 430,
          'Waste Management': 380,
          'Parks & Recreation': 290,
          'Public Safety': 487
        },
        recentIssues: [
          { id: 1, title: 'Pothole on Main Street', department: 'Roads', status: 'in_progress', votes: 23 },
          { id: 2, title: 'Broken Streetlight', department: 'Electricity', status: 'open', votes: 15 },
          { id: 3, title: 'Garbage Collection Missed', department: 'Waste Management', status: 'resolved', votes: 8 },
          { id: 4, title: 'Water Leak at Park', department: 'Water Services', status: 'in_progress', votes: 31 }
        ]
      };
    }
  }
}

export const apiService = new ApiService();
export { MINICPM_SERVER };