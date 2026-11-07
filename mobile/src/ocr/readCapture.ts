import * as ImagePicker from 'expo-image-picker';
import { TextRecognizer } from '../../modules/text-recognizer';

// 판매글 캡처 이미지 → 글자(기기 안 OCR). 목업 ①: PNG/JPG, 5MB 이하. 이미지는 서버로 보내거나 앱에 저장하지 않는다.
// 읽은 글은 판매글 입력칸에 채워지고, 사용자가 확인·수정한 뒤 기존 추출/직접 입력 흐름을 탄다(AI 추출 아님).
export const MAX_CAPTURE_BYTES = 5 * 1024 * 1024;

export interface Capture {
  uri: string;
  name: string;
  bytes: number | null;
  mime: string | null;
}

export type CaptureError = 'TOO_LARGE_OR_TYPE' | 'OCR_UNAVAILABLE' | 'OCR_FAILED' | 'NO_TEXT';

export async function pickCapture(): Promise<Capture | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets?.length) return null;
  const a = result.assets[0];
  return { uri: a.uri, name: a.fileName ?? 'capture.png', bytes: a.fileSize ?? null, mime: a.mimeType ?? null };
}

export function validateCapture(c: Capture): CaptureError | null {
  const okType = !c.mime || /^image\/(png|jpe?g)$/i.test(c.mime) || /\.(png|jpe?g)$/i.test(c.name);
  if (!okType || (c.bytes !== null && c.bytes > MAX_CAPTURE_BYTES)) return 'TOO_LARGE_OR_TYPE';
  return null;
}

export async function readCaptureText(c: Capture): Promise<{ text: string } | { error: CaptureError }> {
  if (!TextRecognizer) return { error: 'OCR_UNAVAILABLE' };
  try {
    const { lines } = await TextRecognizer.recognizeAsync(c.uri);
    const text = lines.map((l) => l.text.trim()).filter(Boolean).join('\n');
    return text ? { text } : { error: 'NO_TEXT' };
  } catch {
    return { error: 'OCR_FAILED' };
  }
}

export const CAPTURE_ERROR_TEXT: Record<CaptureError, string> = {
  TOO_LARGE_OR_TYPE: '5MB를 넘거나 PNG/JPG가 아닌 이미지예요.',
  OCR_UNAVAILABLE: '이 기기에서는 이미지 글자 읽기를 쓸 수 없어요. 판매글을 붙여넣어 주세요.',
  OCR_FAILED: '이미지에서 글자를 읽지 못했어요. 다른 이미지를 올리거나 붙여넣어 주세요.',
  NO_TEXT: '이미지에서 글자를 찾지 못했어요. 판매글이 잘 보이는 캡처를 올려 주세요.',
};

export function formatBytes(bytes: number | null) {
  if (bytes === null) return '크기 확인 불가';
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
