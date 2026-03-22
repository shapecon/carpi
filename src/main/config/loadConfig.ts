import { existsSync, readFileSync, writeFileSync } from 'fs'
import { CONFIG_PATH } from './paths'
import type { ExtraConfig } from '@shared/types'
import { DEFAULT_EXTRA_CONFIG } from '@shared/types'
import { validate } from './validateConfig'

export function loadConfig(): ExtraConfig {
  let fileConfig: Partial<ExtraConfig> = {}

  if (existsSync(CONFIG_PATH)) {
    try {
      fileConfig = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    } catch (e) {
      console.warn('[config] Failed to parse config.json, using defaults:', e)
    }
  }

  const merged = validate(fileConfig, DEFAULT_EXTRA_CONFIG)

  // Round display mode forces square resolution
  if (merged.displayMode === 'round' && merged.width !== merged.height) {
    const size = Math.max(merged.width, merged.height)
    merged.width = size
    merged.height = size
  }

  const needWrite =
    !existsSync(CONFIG_PATH) || JSON.stringify(fileConfig) !== JSON.stringify(merged)

  if (needWrite) {
    writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2))
    console.log('[config] Written corrected config.json')
  }

  return merged
}
