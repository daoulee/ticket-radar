Pod::Spec.new do |s|
  s.name           = 'TextRecognizer'
  s.version        = '1.0.0'
  s.summary        = 'On-device OCR (Apple Vision) for 티켓레이더 판매글 캡처'
  s.description    = 'Recognizes Korean/English text in a local image file using VNRecognizeTextRequest. No network.'
  s.author         = 'ticket-radar'
  s.homepage       = 'https://example.com/ticket-radar'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,swift}'
end
