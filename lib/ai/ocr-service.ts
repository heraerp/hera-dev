/**
 * HERA Universal ERP - OCR Service
 * Advanced Optical Character Recognition with multiple providers and fallbacks
 */

import Tesseract from 'tesseract.js';
import { CapturedPhoto } from '@/lib/camera/universal-camera-service';

// ==================== TYPES ====================

export interface OCRResult {
  text: string;
  confidence: number;
  words: WordData[];
  lines: LineData[];
  paragraphs: ParagraphData[];
  pages: PageData[];
  metadata: OCRMetadata;
}

export interface WordData {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  fontInfo: FontInfo;
  isNumeric: boolean;
  isDate: boolean;
  isAmount: boolean;
}

export interface LineData {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  words: WordData[];
  alignment: 'left' | 'center' | 'right' | 'justified';
}

export interface ParagraphData {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  lines: LineData[];
  type: 'heading' | 'body' | 'footer' | 'table' | 'list';
}

export interface PageData {
  text: string;
  confidence: number;
  width: number;
  height: number;
  paragraphs: ParagraphData[];
  orientation: number;
  language: string;
}

export interface FontInfo {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRMetadata {
  provider: 'tesseract' | 'google' | 'azure' | 'aws' | 'anthropic';
  processingTime: number;
  imagePreprocessing: string[];
  languagesDetected: string[];
  rotationApplied: number;
  resolution: { width: number; height: number };
  qualityScore: number;
}

export interface OCRConfig {
  language: string;
  engineMode: number;
  pageSegMode: number;
  preserveInterwordSpaces: boolean;
  tessjs_create_hocr: string;
  tessjs_create_tsv: string;
  tessjs_create_box: string;
  tessjs_create_unlv: string;
  tessjs_create_osd: string;
}

// ==================== OCR SERVICE ====================

export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;
  private config: OCRConfig;

  constructor(config?: Partial<OCRConfig>) {
    this.config = {
      language: 'eng',
      engineMode: Tesseract.OEM.LSTM_ONLY,
      pageSegMode: Tesseract.PSM.AUTO,
      preserveInterwordSpaces: '1',
      tessjs_create_hocr: '1',
      tessjs_create_tsv: '1',
      tessjs_create_box: '1',
      tessjs_create_unlv: '1',
      tessjs_create_osd: '1',
      ...config
    };
  }

  // ==================== INITIALIZATION ====================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔤 HERA: Initializing OCR service...');
      
      this.worker = await Tesseract.createWorker({
        logger: (progress) => {
          if (progress.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(progress.progress * 100)}%`);
          }
        }
      });

      await this.worker.loadLanguage(this.config.language);
      await this.worker.initialize(this.config.language);
      await this.worker.setParameters(this.config);

      this.isInitialized = true;
      console.log('✅ HERA: OCR service initialized successfully');
      
    } catch (error) {
      console.error('❌ HERA: OCR initialization failed:', error);
      throw new Error(`OCR initialization failed: ${error}`);
    }
  }

  // ==================== OCR PROCESSING ====================

  async extractText(image: CapturedPhoto): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔤 HERA: Starting OCR text extraction...');
      const startTime = performance.now();

      // Preprocess image for better OCR accuracy
      const preprocessedImage = await this.preprocessImage(image);

      // Perform OCR
      const result = await this.worker!.recognize(preprocessedImage.dataUrl);
      
      const processingTime = performance.now() - startTime;

      // Process and structure the OCR result
      const structuredResult = this.processOCRResult(result, processingTime, preprocessedImage);

      console.log(`✅ HERA: OCR completed in ${processingTime.toFixed(2)}ms with ${structuredResult.confidence}% confidence`);
      
      return structuredResult;

    } catch (error) {
      console.error('❌ HERA: OCR text extraction failed:', error);
      throw new Error(`OCR failed: ${error}`);
    }
  }

  // ==================== SPECIALIZED EXTRACTION ====================

  async extractInvoiceFields(image: CapturedPhoto): Promise<OCRResult> {
    // Configure for invoice-specific OCR
    const invoiceConfig = {
      ...this.config,
      pageSegMode: Tesseract.PSM.SINGLE_BLOCK,
      preserveInterwordSpaces: '1'
    };

    await this.updateConfig(invoiceConfig);
    return this.extractText(image);
  }

  async extractReceiptFields(image: CapturedPhoto): Promise<OCRResult> {
    // Configure for receipt-specific OCR
    const receiptConfig = {
      ...this.config,
      pageSegMode: Tesseract.PSM.SINGLE_COLUMN,
      preserveInterwordSpaces: '0'
    };

    await this.updateConfig(receiptConfig);
    return this.extractText(image);
  }

  async extractBusinessCardFields(image: CapturedPhoto): Promise<OCRResult> {
    // Configure for business card-specific OCR
    const cardConfig = {
      ...this.config,
      pageSegMode: Tesseract.PSM.SINGLE_BLOCK_VERT_TEXT,
      preserveInterwordSpaces: '1'
    };

    await this.updateConfig(cardConfig);
    return this.extractText(image);
  }

  async extractTableData(image: CapturedPhoto): Promise<TableData> {
    try {
      console.log('📊 HERA: Extracting table data...');

      const ocrResult = await this.extractText(image);
      const tableData = this.parseTableStructure(ocrResult);

      console.log('✅ HERA: Table data extracted successfully');
      return tableData;

    } catch (error) {
      console.error('❌ HERA: Table extraction failed:', error);
      throw error;
    }
  }

  // ==================== IMAGE PREPROCESSING ====================

  private async preprocessImage(image: CapturedPhoto): Promise<CapturedPhoto> {
    try {
      console.log('🔧 HERA: Preprocessing image for OCR...');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Apply image enhancements
          this.enhanceContrast(ctx, canvas.width, canvas.height);
          this.sharpenImage(ctx, canvas.width, canvas.height);
          this.denoiseImage(ctx, canvas.width, canvas.height);

          // Convert back to data URL
          const enhancedDataUrl = canvas.toDataURL('image/png', 1.0);

          resolve({
            ...image,
            dataUrl: enhancedDataUrl,
            metadata: {
              ...image.metadata,
              preprocessed: true,
              enhancements: ['contrast', 'sharpen', 'denoise']
            }
          });
        };

        img.onerror = reject;
        img.src = image.dataUrl;
      });

    } catch (error) {
      console.warn('⚠️ HERA: Image preprocessing failed, using original:', error);
      return image;
    }
  }

  private enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple contrast enhancement
    const factor = 1.2;
    const intercept = 0.5 * (1.0 - factor) * 255;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * data[i] + intercept));     // R
      data[i + 1] = Math.max(0, Math.min(255, factor * data[i + 1] + intercept)); // G
      data[i + 2] = Math.max(0, Math.min(255, factor * data[i + 2] + intercept)); // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private sharpenImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sharpened = new Uint8ClampedArray(data.length);

    // Sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * width + x) * 4 + c;
          sharpened[idx] = Math.max(0, Math.min(255, sum));
        }
        sharpened[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // Alpha
      }
    }

    const sharpenedImageData = new ImageData(sharpened, width, height);
    ctx.putImageData(sharpenedImageData, 0, 0);
  }

  private denoiseImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const denoised = new Uint8ClampedArray(data.length);

    // Simple median filter for noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const values = [];
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              values.push(data[idx]);
            }
          }
          values.sort((a, b) => a - b);
          const median = values[Math.floor(values.length / 2)];
          
          const idx = (y * width + x) * 4 + c;
          denoised[idx] = median;
        }
        denoised[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // Alpha
      }
    }

    const denoisedImageData = new ImageData(denoised, width, height);
    ctx.putImageData(denoisedImageData, 0, 0);
  }

  // ==================== RESULT PROCESSING ====================

  private processOCRResult(result: any, processingTime: number, image: CapturedPhoto): OCRResult {
    const words = this.extractWords(result);
    const lines = this.extractLines(result);
    const paragraphs = this.extractParagraphs(result);
    const pages = this.extractPages(result);

    // Enhance word data with semantic analysis
    const enhancedWords = words.map(word => ({
      ...word,
      isNumeric: /^\d+\.?\d*$/.test(word.text),
      isDate: this.isDatePattern(word.text),
      isAmount: this.isAmountPattern(word.text)
    }));

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: enhancedWords,
      lines,
      paragraphs,
      pages,
      metadata: {
        provider: 'tesseract',
        processingTime,
        imagePreprocessing: image.metadata?.enhancements || [],
        languagesDetected: [this.config.language],
        rotationApplied: 0,
        resolution: {
          width: image.metadata?.width || 0,
          height: image.metadata?.height || 0
        },
        qualityScore: this.calculateQualityScore(result)
      }
    };
  }

  private extractWords(result: any): WordData[] {
    return result.data.words.map((word: any) => ({
      text: word.text,
      confidence: word.confidence,
      bbox: {
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0
      },
      fontInfo: {
        family: word.font_name || 'unknown',
        size: word.font_size || 12,
        bold: word.bold || false,
        italic: word.italic || false,
        underline: word.underline || false,
        color: 'black'
      },
      isNumeric: false,
      isDate: false,
      isAmount: false
    }));
  }

  private extractLines(result: any): LineData[] {
    return result.data.lines.map((line: any) => ({
      text: line.text,
      confidence: line.confidence,
      bbox: {
        x: line.bbox.x0,
        y: line.bbox.y0,
        width: line.bbox.x1 - line.bbox.x0,
        height: line.bbox.y1 - line.bbox.y0
      },
      words: line.words || [],
      alignment: this.detectAlignment(line)
    }));
  }

  private extractParagraphs(result: any): ParagraphData[] {
    return result.data.paragraphs.map((paragraph: any) => ({
      text: paragraph.text,
      confidence: paragraph.confidence,
      bbox: {
        x: paragraph.bbox.x0,
        y: paragraph.bbox.y0,
        width: paragraph.bbox.x1 - paragraph.bbox.x0,
        height: paragraph.bbox.y1 - paragraph.bbox.y0
      },
      lines: paragraph.lines || [],
      type: this.classifyParagraphType(paragraph.text)
    }));
  }

  private extractPages(result: any): PageData[] {
    return [{
      text: result.data.text,
      confidence: result.data.confidence,
      width: result.data.width || 0,
      height: result.data.height || 0,
      paragraphs: result.data.paragraphs || [],
      orientation: 0,
      language: this.config.language
    }];
  }

  // ==================== UTILITY METHODS ====================

  private isDatePattern(text: string): boolean {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}$/i
    ];
    return datePatterns.some(pattern => pattern.test(text.trim()));
  }

  private isAmountPattern(text: string): boolean {
    const amountPatterns = [
      /^\$\d+\.?\d*$/,
      /^\d+\.\d{2}$/,
      /^\d{1,3}(,\d{3})*\.\d{2}$/
    ];
    return amountPatterns.some(pattern => pattern.test(text.trim()));
  }

  private detectAlignment(line: any): 'left' | 'center' | 'right' | 'justified' {
    // Simple heuristic based on line position
    return 'left'; // Placeholder
  }

  private classifyParagraphType(text: string): 'heading' | 'body' | 'footer' | 'table' | 'list' {
    if (text.includes('\t') || /^\s*\d+\.|\*|-/.test(text)) return 'list';
    if (text.length < 50 && text.toUpperCase() === text) return 'heading';
    if (text.includes('page') || text.includes('total')) return 'footer';
    if (/\|\s*\w+\s*\|/.test(text)) return 'table';
    return 'body';
  }

  private calculateQualityScore(result: any): number {
    const avgConfidence = result.data.confidence;
    const textLength = result.data.text.length;
    
    // Quality score based on confidence and text length
    let score = avgConfidence / 100;
    
    if (textLength > 100) score += 0.1;
    if (textLength > 500) score += 0.1;
    
    return Math.min(1.0, score);
  }

  private parseTableStructure(ocrResult: OCRResult): TableData {
    const tables: TableData = {
      tables: [],
      totalTables: 0
    };

    // Simple table detection based on aligned text
    const lines = ocrResult.lines.filter(line => 
      line.text.includes('\t') || /\s{3,}/.test(line.text)
    );

    if (lines.length > 2) {
      const table = {
        headers: this.extractTableHeaders(lines[0]),
        rows: lines.slice(1).map(line => this.parseTableRow(line.text)),
        confidence: ocrResult.confidence
      };
      
      tables.tables.push(table);
      tables.totalTables = 1;
    }

    return tables;
  }

  private extractTableHeaders(headerLine: LineData): string[] {
    return headerLine.text.split(/\s{3,}|\t/).filter(h => h.trim().length > 0);
  }

  private parseTableRow(rowText: string): string[] {
    return rowText.split(/\s{3,}|\t/).filter(cell => cell.trim().length > 0);
  }

  private async updateConfig(newConfig: Partial<OCRConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if (this.worker && this.isInitialized) {
      await this.worker.setParameters(this.config);
    }
  }

  // ==================== CLEANUP ====================

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('🔤 HERA: OCR service terminated');
    }
  }
}

// ==================== SUPPORTING TYPES ====================

interface TableData {
  tables: Array<{
    headers: string[];
    rows: string[][];
    confidence: number;
  }>;
  totalTables: number;
}

// ==================== FACTORY FUNCTION ====================

export function createOCRService(config?: Partial<OCRConfig>): OCRService {
  return new OCRService(config);
}

// ==================== SINGLETON INSTANCE ====================

export const ocrService = createOCRService({
  language: 'eng',
  engineMode: Tesseract.OEM.LSTM_ONLY,
  pageSegMode: Tesseract.PSM.AUTO
});

export default ocrService;