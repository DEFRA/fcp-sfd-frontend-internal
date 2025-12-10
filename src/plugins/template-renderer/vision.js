import { fileURLToPath } from 'node:url'
import path from 'path'
import nunjucks from 'nunjucks'
import hapiVision from '@hapi/vision'

import { config } from '../../config/index.js'
import { context } from './context.js'
import * as filters from './filters/filters.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const nunjucksEnvironment = nunjucks.configure(
  [
    'node_modules/govuk-frontend/dist/',
    path.resolve(dirname, '../../views')
  ],
  {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: true,
    lstripBlocks: true,
    watch: config.get('nunjucks.watch'),
    noCache: config.get('nunjucks.noCache')
  }
)

nunjucksEnvironment.addGlobal('govukRebrand', true)

Object.entries(filters).forEach(([name, filter]) => {
  nunjucksEnvironment.addFilter(name, filter)
})

export const vision = {
  plugin: hapiVision,
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)
          return (ctx) => template.render(ctx)
        }
      }
    },
    compileOptions: {
      environment: nunjucksEnvironment
    },
    relativeTo: path.resolve(dirname, '../..'),
    path: 'views',
    isCached: config.get('server.isProduction'),
    context
  }
}
