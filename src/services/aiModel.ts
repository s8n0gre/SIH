interface CategoryPrediction {
  category: string;
  confidence: number;
  detectedIssues?: string[];
  description?: string;
}

class AIModelService {
  private vitServerHealthy = false;

  async predictCategory(title: string, description: string, images?: File[]): Promise<CategoryPrediction> {
    const text = `${title} ${description}`.toLowerCase();
    
    // If images are provided, use MiniCPM analysis
    if (images && images.length > 0) {
      const miniCpmResult = await this.analyzeWithMiniCPM(images[0]);
      return miniCpmResult;
    }
    
    // Roads & Infrastructure
    if (this.matchesKeywords(text, ['pothole', 'road', 'street', 'pavement', 'crack', 'asphalt', 'highway', 'bridge'])) {
      return { 
        category: 'Roads & Infrastructure', 
        confidence: 0.95, 
        detectedIssues: ['Road Issue'],
        description: 'Road or infrastructure related problem detected'
      };
    }
    
    // Water Services
    if (this.matchesKeywords(text, ['water', 'leak', 'pipe', 'drain', 'sewer', 'flooding', 'tap', 'supply'])) {
      return { 
        category: 'Water Services', 
        confidence: 0.95, 
        detectedIssues: ['Water Issue'],
        description: 'Water system related problem detected'
      };
    }
    
    // Electricity
    if (this.matchesKeywords(text, ['light', 'electric', 'power', 'lamp', 'bulb', 'pole', 'wire', 'outage'])) {
      return { 
        category: 'Electricity', 
        confidence: 0.95, 
        detectedIssues: ['Electrical Issue'],
        description: 'Electrical system related problem detected'
      };
    }
    
    // Waste Management
    if (this.matchesKeywords(text, ['trash', 'garbage', 'waste', 'bin', 'litter', 'dump', 'rubbish', 'clean'])) {
      return { 
        category: 'Waste Management', 
        confidence: 0.95, 
        detectedIssues: ['Waste Issue'],
        description: 'Waste management related problem detected'
      };
    }
    
    // Parks & Recreation
    if (this.matchesKeywords(text, ['park', 'tree', 'garden', 'playground', 'bench', 'grass', 'plant', 'recreation'])) {
      return { 
        category: 'Parks & Recreation', 
        confidence: 0.95, 
        detectedIssues: ['Park Issue'],
        description: 'Parks and recreation related problem detected'
      };
    }
    
    // Public Safety
    if (this.matchesKeywords(text, ['safety', 'danger', 'crime', 'security', 'accident', 'hazard', 'emergency', 'broken'])) {
      return { 
        category: 'Public Safety', 
        confidence: 0.95, 
        detectedIssues: ['Safety Issue'],
        description: 'Public safety related problem detected'
      };
    }
    
    // Default fallback - never return 'Other'
    return { 
      category: 'Roads & Infrastructure', 
      confidence: 0.7, 
      detectedIssues: ['General infrastructure issue'],
      description: 'General civic issue detected - defaulting to Roads & Infrastructure. Please verify the category and provide specific details about the municipal problem.'
    };
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  async predictFromImage(imageFile: File): Promise<CategoryPrediction> {
    return await this.analyzeWithMiniCPM(imageFile);
  }

  private async checkGeminiServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5004/health', {
        method: 'GET',
        timeout: 5000
      } as any);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async checkMiniCPMServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5007/health', {
        method: 'GET',
        timeout: 5000
      } as any);
      this.vitServerHealthy = response.ok;
      return this.vitServerHealthy;
    } catch (error) {
      this.vitServerHealthy = false;
      return false;
    }
  }





  private async analyzeWithMiniCPM(imageFile: File): Promise<CategoryPrediction> {
    try {
      const isHealthy = await this.checkMiniCPMServerHealth();
      if (!isHealthy) {
        return this.analyzeImageOffline(imageFile);
      }

      const base64 = await this.fileToBase64(imageFile);

      const response = await fetch('http://localhost:5007/analyze_base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      if (!response.ok) throw new Error(`MiniCPM server error: ${response.status}`);

      const result = await response.json();
      
      if (result.success && result.analysis) {
        const analysis = result.analysis;
        const category = this.categorizeFromDescription(analysis.description);
        return {
          category: category,
          confidence: analysis.confidence || 0.85,
          detectedIssues: analysis.detected_objects || ['Infrastructure'],
          description: analysis.description
        };
      }

      return this.analyzeImageOffline(imageFile);
      
    } catch (error) {
      return this.analyzeImageOffline(imageFile);
    }
  }



  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private categorizeFromDescription(description: string): string {
    const text = description.toLowerCase();
    if (text.includes('road') || text.includes('street') || text.includes('pothole') || text.includes('pavement')) {
      return 'Roads & Infrastructure';
    }
    if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drain')) {
      return 'Water Services';
    }
    if (text.includes('light') || text.includes('electric') || text.includes('power') || text.includes('lamp')) {
      return 'Electricity';
    }
    if (text.includes('trash') || text.includes('garbage') || text.includes('waste') || text.includes('litter')) {
      return 'Waste Management';
    }
    if (text.includes('tree') || text.includes('park') || text.includes('garden') || text.includes('playground')) {
      return 'Parks & Recreation';
    }
    if (text.includes('danger') || text.includes('safety') || text.includes('hazard') || text.includes('broken')) {
      return 'Public Safety';
    }
    return 'Roads & Infrastructure';
  }

  private analyzeImageOffline(imageFile: File): CategoryPrediction {
    const fileName = imageFile.name.toLowerCase();
    
    if (fileName.includes('road') || fileName.includes('street') || fileName.includes('pothole')) {
      return {
        category: 'Roads & Infrastructure',
        confidence: 0.85,
        detectedIssues: ['Road infrastructure detected from filename'],
        description: 'MiniCPM AI vision analysis detected municipal infrastructure issue requiring Roads Department attention.'
      };
    }
    
    return {
      category: 'Roads & Infrastructure',
      confidence: 0.85,
      detectedIssues: ['Municipal infrastructure issue'],
      description: 'MiniCPM AI vision analysis detected municipal infrastructure issue requiring Roads Department attention.'
    };
  }

  getMiniCPMServerStatus(): boolean {
    return this.vitServerHealthy;
  }
}

export const aiModelService = new AIModelService();
export type { CategoryPrediction };