import { nunjucksEnvironment } from '../../src/plugins/template-renderer/vision.js'

const defaultTestContext = {
  getAssetPath: (input) => input
}

export const renderTemplate = (template, context = {}) => {
  const mergedContext = {
    ...defaultTestContext,
    ...context
  }

  return nunjucksEnvironment.render(template, mergedContext)
}
