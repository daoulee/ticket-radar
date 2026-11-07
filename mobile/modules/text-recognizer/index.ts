import { requireOptionalNativeModule } from 'expo';

// 기기 안 OCR(Apple Vision). 네이티브 모듈이 없는 환경(Jest·Expo Go·Android 미구현)에서는 null.
export interface RecognizedLine {
  text: string;
  confidence: number;
}

interface TextRecognizerNative {
  recognizeAsync(uri: string): Promise<{ lines: RecognizedLine[] }>;
  supportsKoreanAsync(): Promise<boolean>;
}

export const TextRecognizer = requireOptionalNativeModule<TextRecognizerNative>('TextRecognizer');
