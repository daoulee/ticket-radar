// Sol 소유 공통 계약(../shared)을 앱 번들에 포함하기 위한 Metro 설정.
// shared/ 는 앱 폴더 밖에 있으므로 watchFolders 에 넣고, 패키지 이름을 소스 파일로 연결한다.
// shared 의 의존성(zod)은 shared/node_modules 에서 찾는다(앱에 zod 를 따로 설치하지 않음).
// shared/ 파일은 읽기만 하고 수정하지 않는다.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const sharedDir = path.resolve(__dirname, '../shared');

config.watchFolders = [...(config.watchFolders ?? []), sharedDir];

const upstreamResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@ticket-radar/shared') {
    return { type: 'sourceFile', filePath: path.join(sharedDir, 'index.ts') };
  }
  return (upstreamResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
