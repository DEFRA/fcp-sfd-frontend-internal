/**
 * Publishes a CDP count metric
 *
 * @module metrics
 */

import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'

import { config } from '../config/index.js'
import { createLogger } from './logger.js'

/**
 * Publishes a CDP count metric
 *
 * Does nothing when metrics are disabled. Errors are logged rather than thrown.
 *
 * @param {string} metricName - The name of the metric
 * @param {number} [value] - The value to add, defaulting to 1
 *
 * @returns {Promise<void>}
 */
export const metricsCounter = async (metricName, value = 1) => {
  const isMetricsEnabled = config.get('server.isMetricsEnabled')

  if (!isMetricsEnabled) {
    return
  }

  try {
    const metricsLogger = createMetricsLogger()
    metricsLogger.putMetric(
      metricName,
      value,
      Unit.Count,
      StorageResolution.Standard
    )
    await metricsLogger.flush()
  } catch (error) {
    createLogger().error(error, error.message)
  }
}
