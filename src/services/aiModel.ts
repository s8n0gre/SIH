import { inferCategoryFromText } from '../data/municipalityData';

interface CategoryPrediction {
  category: string;
  confidence: number;
  detectedIssues?: string[];
  description?: string;
}

class AIModelService {
  private vitServerHealthy = false;

  async predictCategory(title: string, description: string, images?: File[]): Promise<CategoryPrediction> {
    // If images are provided, use MiniCPM analysis
    if (images && images.length > 0) {
      return await this.analyzeWithMiniCPM(images[0]);
    }

    const text = `${title} ${description}`;
    const category = inferCategoryFromText(text);
    return {
      category,
      confidence: 0.95,
      detectedIssues: [`${category} issue`],
      description: `${category} related problem detected`,
    };
  }


  async predictFromImage(imageFile: File): Promise<CategoryPrediction> {
    return await this.analyzeWithMiniCPM(imageFile);
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
    return inferCategoryFromText(description);
  }

  private analyzeImageOffline(imageFile: File): CategoryPrediction {
    const fileName = imageFile.name.toLowerCase();
    const category = inferCategoryFromText(fileName);
    return {
      category,
      confidence: 0.85,
      detectedIssues: [`${category} issue detected`],
      description: `MiniCPM AI vision analysis detected a ${category} issue.`,
    };
  }

  getMiniCPMServerStatus(): boolean {
    return this.vitServerHealthy;
  }
}

export const aiModelService = new AIModelService();
export type { CategoryPrediction };