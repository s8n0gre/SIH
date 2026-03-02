const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private isConnected = false;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.checkConnection();
    this.startConnectionMonitoring();
  }

  private async checkConnection() {
    // Skip health check to avoid localhost:3001/health calls
    this.isConnected = true;
  }

  private startConnectionMonitoring() {
    // Disable connection monitoring to prevent health check calls
    this.isConnected = true;
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

  getConnectionStatus() {
    return this.isConnected;
  }

  async login(email: string, password: string) {
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
  }

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async createReport(reportData: any) {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    
    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
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
      // Return demo data if backend is not available
      console.warn('Backend not available, using demo data:', error);
      return [
        {
          _id: 'community-1',
          title: 'Water Leakage on Station Road',
          description: 'Major water pipe burst causing flooding on the main road',
          category: 'Water Services',
          status: 'in_progress',
          location: { address: 'Station Road, Ranchi, Jharkhand' },
          votes: { upvotes: 23, downvotes: 1 },
          comments: [],
          reportedBy: { username: 'RanchiResident', reputation: { points: 150, level: 'Active' } },
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'community-2',
          title: 'Broken Traffic Signal',
          description: 'Traffic signal at busy intersection has been malfunctioning for 2 days',
          category: 'Public Safety',
          status: 'open',
          location: { address: 'Albert Ekka Chowk, Ranchi, Jharkhand' },
          votes: { upvotes: 18, downvotes: 0 },
          comments: [],
          reportedBy: { username: 'SafetyFirst', reputation: { points: 89, level: 'Contributor' } },
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: 'community-3',
          title: 'Park Maintenance Required',
          description: 'Playground equipment needs repair and grass cutting required',
          category: 'Parks & Recreation',
          status: 'resolved',
          location: { address: 'Oxygen Park, Ranchi, Jharkhand' },
          votes: { upvotes: 12, downvotes: 2 },
          comments: [],
          reportedBy: { username: 'ParkLover', reputation: { points: 67, level: 'Regular' } },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  }

  async getUserReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        // If unauthorized, return empty reports
        if (response.status === 401 || response.status === 403) {
          return { reports: [] };
        }
        throw new Error('Failed to fetch user reports');
      }
      return response.json();
    } catch (error) {
      // Return demo data if backend is not available
      console.warn('Backend not available, using demo data:', error);
      return {
        reports: [
          {
            _id: 'demo-1',
            title: 'Demo: Pothole on Main Street',
            description: 'Large pothole causing traffic issues near the intersection',
            category: 'Roads & Infrastructure',
            department: 'Roads Department',
            status: 'in_progress',
            priority: 'high',
            location: {
              address: 'Main Street, Ranchi, Jharkhand',
              coordinates: { latitude: 23.3441, longitude: 85.3096 }
            },
            votes: { upvotes: 15, downvotes: 2 },
            aiAnalysis: {
              detectedIssues: ['Road Damage', 'Traffic Hazard'],
              confidence: 0.92
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'demo-2',
            title: 'Demo: Street Light Not Working',
            description: 'Street light has been out for 3 days, making the area unsafe at night',
            category: 'Electricity',
            department: 'Electricity Department',
            status: 'open',
            priority: 'medium',
            location: {
              address: 'Park Street, Ranchi, Jharkhand',
              coordinates: { latitude: 23.3629, longitude: 85.3346 }
            },
            votes: { upvotes: 8, downvotes: 0 },
            aiAnalysis: {
              detectedIssues: ['Electrical Issue', 'Public Safety'],
              confidence: 0.87
            },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'demo-3',
            title: 'Demo: Garbage Not Collected',
            description: 'Garbage has been piling up for over a week in this area',
            category: 'Waste Management',
            department: 'Sanitation Department',
            status: 'resolved',
            priority: 'medium',
            location: {
              address: 'Circular Road, Ranchi, Jharkhand',
              coordinates: { latitude: 23.3441, longitude: 85.3096 }
            },
            votes: { upvotes: 12, downvotes: 1 },
            aiAnalysis: {
              detectedIssues: ['Waste Accumulation', 'Sanitation Issue'],
              confidence: 0.95
            },
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
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
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role, department })
    });
    
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
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
}

export const apiService = new ApiService();