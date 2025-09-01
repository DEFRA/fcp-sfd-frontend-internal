import convict from 'convict'
import { serverConfig } from './server.js'
import { nunjucksConfig } from './nunjucks.js'
import { redisConfig } from './redis.js'
import { entraConfig } from './entra.js'
import { dalConfig } from './dal.js'
import { featureToggleConfig } from './feature-toggle.js'

const config = convict({
  ...serverConfig,
  ...nunjucksConfig,
  ...redisConfig,
  ...entraConfig,
  ...dalConfig,
  ...featureToggleConfig
})

config.validate({ allowed: 'strict' })

export { config }
