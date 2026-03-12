import { inferCategoryFromText } from '../data/municipalityData';

interface CategoryPrediction {
  category: string;
  confidence: number;
  detectedIssues?: string[];
  description?: string;
}

class AIModelService {
  private vitServerHealthy = false;

  async predictCategory(title: string, description: string, images?: File[], onProgress?: (progress: number, statusText: string, partialText?: string) => void): Promise<CategoryPrediction> {
    if (images && images.length > 0) {
      return await this.analyzeWithMiniCPM(images[0], onProgress);
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

  async predictFromImage(imageFile: File, onProgress?: (progress: number, statusText: string, partialText?: string) => void): Promise<CategoryPrediction> {
    return await this.analyzeWithMiniCPM(imageFile, onProgress);
  }

  private async checkMiniCPMServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('/ai-vision/health', { method: 'GET' });
      this.vitServerHealthy = response.ok;
      return this.vitServerHealthy;
    } catch (error) {
      this.vitServerHealthy = false;
      return false;
    }
  }

  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 448;
          
          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                console.log(`[AI] Compressed: ${width}x${height}, ${(compressedFile.size / 1024).toFixed(1)} KB`);
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            }, 'image/jpeg', 0.7);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private async analyzeWithMiniCPM(imageFile: File, onProgress?: (progress: number, statusText: string, partialText?: string) => void): Promise<CategoryPrediction> {
    try {
      if (onProgress) onProgress(5, "Checking AI Server Health...");
      const isHealthy = await this.checkMiniCPMServerHealth();
      if (!isHealthy) {
        if (onProgress) onProgress(100, "Native server offline, using fallback");
        return this.analyzeImageOffline(imageFile);
      }

      console.log("[AI] Requesting analysis for:", imageFile.name);
      
      if (onProgress) onProgress(10, "Compressing image...");
      const compressedFile = await this.compressImage(imageFile);
      const fileSizeKB = (compressedFile.size / 1024).toFixed(1);
      console.log("[AI] Compressed size:", fileSizeKB, "KB");

      if (onProgress) onProgress(20, `Starting upload (${fileSizeKB} KB)...`);

      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/ai-vision/analyze');

        let uploadComplete = false;
        let processingStartTime = 0;
        let processingInterval: any = null;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            const loadedKB = (event.loaded / 1024).toFixed(1);
            const totalKB = (event.total / 1024).toFixed(1);
            
            console.log(`📤 Upload: ${loadedKB}KB / ${totalKB}KB (${percentComplete.toFixed(1)}%)`);
            
            const uiProgress = 20 + (percentComplete * 0.4);
            if (onProgress) {
              onProgress(
                uiProgress, 
                `Uploading: ${percentComplete.toFixed(0)}% (${loadedKB}KB / ${totalKB}KB)`
              );
            }
          }
        };

        xhr.upload.onload = () => {
          uploadComplete = true;
          processingStartTime = Date.now();
          console.log('✅ Upload complete, AI processing started...');
          
          if (onProgress) onProgress(60, "AI: Image encoding...");
          
          let stage = 0;
          const stages = [
            { progress: 65, text: "AI: Vision encoder..." },
            { progress: 70, text: "AI: LLM inference..." },
            { progress: 75, text: "AI: Generating tokens..." },
            { progress: 80, text: "AI: Analyzing..." },
            { progress: 85, text: "AI: Finalizing..." },
            { progress: 90, text: "AI: Preparing response..." }
          ];
          
          processingInterval = setInterval(() => {
            const elapsed = (Date.now() - processingStartTime) / 1000;
            if (stage < stages.length) {
              const currentStage = stages[stage];
              if (onProgress) {
                onProgress(currentStage.progress, `${currentStage.text} (${elapsed.toFixed(0)}s)`);
              }
              stage++;
            }
          }, 3000);
        };

        xhr.onload = () => {
          if (processingInterval) clearInterval(processingInterval);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            const elapsed = uploadComplete ? ((Date.now() - processingStartTime) / 1000).toFixed(1) : '0';
            console.log(`✅ Complete in ${elapsed}s`);
            
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Failed to parse AI response"));
            }
          } else {
            reject(new Error(`AI Error: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          if (processingInterval) clearInterval(processingInterval);
          reject(new Error("Network error"));
        };
        
        xhr.ontimeout = () => {
          if (processingInterval) clearInterval(processingInterval);
          reject(new Error("Timeout"));
        };
        
        xhr.timeout = 120000;
        
        const formData = new FormData();
        formData.append('image', compressedFile);
        xhr.send(formData);
      });

      if (onProgress) onProgress(100, "Analysis Complete!");

      if (result.success && result.analysis) {
        const analysis = result.analysis;
        return {
          category: analysis.category,
          confidence: analysis.confidence ?? 0.8,
          detectedIssues: analysis.detected_objects ?? ['Infrastructure'],
          description: analysis.description,
        };
      }

      return this.analyzeImageOffline(imageFile);

    } catch (error) {
      console.error("[AI] Error:", error);
      if (onProgress) onProgress(100, "Falling back to basic analysis");
      return this.analyzeImageOffline(imageFile);
    }
  }

  private analyzeImageOffline(imageFile: File): CategoryPrediction {
    const fileName = imageFile.name.toLowerCase();
    const category = inferCategoryFromText(fileName);
    return {
      category,
      confidence: 0.50,
      detectedIssues: [`Offline estimation`],
      description: `[OFFLINE MODE] AI server unavailable. Detected ${category} from filename.`,
    };
  }

  getMiniCPMServerStatus(): boolean {
    return this.vitServerHealthy;
  }
}

export const aiModelService = new AIModelService();
export type { CategoryPrediction };
