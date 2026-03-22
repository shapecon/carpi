import { renderHook } from '@testing-library/react'
import { useTabsConfig } from '../useTabsConfig'

let mockState = {
  isStreaming: false,
  isDongleConnected: false,
  cameraFound: true,
  mapsEnabled: false,
  telemetryEnabled: false
}

jest.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    palette: {
      text: { primary: '#fff', disabled: '#777' }
    }
  })
}))

jest.mock('@store/store', () => ({
  useStatusStore: (selector: (s: any) => unknown) =>
    selector({
      isStreaming: mockState.isStreaming,
      isDongleConnected: mockState.isDongleConnected,
      cameraFound: mockState.cameraFound
    }),
  useLiviStore: (selector: (s: any) => unknown) =>
    selector({
      settings: {
        mapsEnabled: mockState.mapsEnabled,
        telemetryEnabled: mockState.telemetryEnabled
      }
    })
}))

describe('useTabsConfig', () => {
  beforeEach(() => {
    mockState = {
      isStreaming: false,
      isDongleConnected: false,
      cameraFound: true,
      mapsEnabled: false,
      telemetryEnabled: false
    }
  })

  test('returns base tabs by default', () => {
    const { result } = renderHook(() => useTabsConfig(false))
    expect(result.current.map((t) => t.path)).toEqual(['/', '/media', '/settings'])
  })

  test('adds maps and telemetry tabs when enabled', () => {
    mockState.mapsEnabled = true
    mockState.telemetryEnabled = true
    const { result } = renderHook(() => useTabsConfig(false))
    expect(result.current.map((t) => t.path)).toEqual([
      '/',
      '/maps',
      '/media',
      '/telemetry',
      '/settings'
    ])
  })
})
