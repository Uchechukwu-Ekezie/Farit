const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Redirect jose to its browser build — the default Node.js build imports
// native crypto which doesn't exist in React Native.
const joseNodeDist = path.join(__dirname, 'node_modules/jose/dist/node')
const joseBrowserIndex = path.join(__dirname, 'node_modules/jose/dist/browser/index.js')

const originalResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Top-level 'jose' import → use browser build
  if (moduleName === 'jose') {
    return { filePath: joseBrowserIndex, type: 'sourceFile' }
  }

  // Any jose sub-import that resolved into the node dist → rewrite to browser dist
  if (context.originModulePath && context.originModulePath.startsWith(joseNodeDist)) {
    const rel = path.relative(joseNodeDist, context.originModulePath)
    const browserEquivalent = path.join(
      __dirname,
      'node_modules/jose/dist/browser',
      moduleName
    )
    try {
      require.resolve(browserEquivalent)
      return { filePath: require.resolve(browserEquivalent), type: 'sourceFile' }
    } catch { /* fall through */ }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
