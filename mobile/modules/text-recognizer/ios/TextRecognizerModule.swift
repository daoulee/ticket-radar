import ExpoModulesCore
import Vision
import UIKit

// 판매글 캡처 이미지에서 글자를 읽는다(기기 안에서만 처리, 네트워크·저장 없음).
// Apple Vision VNRecognizeTextRequest 정확 모드, 한국어 우선 + 영어. 줄 단위로 위→아래 순서로 돌려준다.
public class TextRecognizerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TextRecognizer")

    AsyncFunction("recognizeAsync") { (uri: String, promise: Promise) in
      guard let url = URL(string: uri), let data = try? Data(contentsOf: url), let image = UIImage(data: data),
            let cgImage = image.cgImage else {
        promise.reject("ERR_IMAGE", "이미지를 읽지 못했습니다.")
        return
      }
      let request = VNRecognizeTextRequest { request, error in
        if let error = error {
          promise.reject("ERR_OCR", error.localizedDescription)
          return
        }
        let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
        // Vision 좌표는 아래가 0. 위에서 아래, 왼쪽에서 오른쪽 순서로 정렬한다.
        let sorted = observations.sorted { a, b in
          let dy = a.boundingBox.midY - b.boundingBox.midY
          if abs(dy) > 0.01 { return dy > 0 }
          return a.boundingBox.minX < b.boundingBox.minX
        }
        let lines: [[String: Any]] = sorted.compactMap { obs in
          guard let top = obs.topCandidates(1).first else { return nil }
          return ["text": top.string, "confidence": Double(top.confidence)]
        }
        promise.resolve(["lines": lines])
      }
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      request.recognitionLanguages = ["ko-KR", "en-US"]
      let orientation = CGImagePropertyOrientation(image.imageOrientation)
      let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try handler.perform([request])
        } catch {
          promise.reject("ERR_OCR", error.localizedDescription)
        }
      }
    }

    // 이 기기에서 한국어 인식을 지원하는지(iOS 16+). 화면에서 안내 문구에 쓴다.
    AsyncFunction("supportsKoreanAsync") { () -> Bool in
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      let languages = (try? request.supportedRecognitionLanguages()) ?? []
      return languages.contains("ko-KR")
    }
  }
}

extension CGImagePropertyOrientation {
  init(_ o: UIImage.Orientation) {
    switch o {
    case .up: self = .up
    case .upMirrored: self = .upMirrored
    case .down: self = .down
    case .downMirrored: self = .downMirrored
    case .left: self = .left
    case .leftMirrored: self = .leftMirrored
    case .right: self = .right
    case .rightMirrored: self = .rightMirrored
    @unknown default: self = .up
    }
  }
}
