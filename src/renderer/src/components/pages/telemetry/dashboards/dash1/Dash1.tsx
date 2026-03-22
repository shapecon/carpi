import { DashShell } from '../../components/DashShell'
import { useVehicleTelemetry } from '../../hooks/useVehicleTelemetry'
import { useBlinkingTime } from '@renderer/hooks'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

export function Dash1() {
  const theme = useTheme()
  const { telemetry } = useVehicleTelemetry()
  const time = useBlinkingTime()

  const speedKph = typeof telemetry?.speedKph === 'number' ? Math.round(telemetry.speedKph) : 0

  return (
    <DashShell>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        {/* Time */}
        <Box
          sx={{
            fontSize: 'clamp(1.4rem, 6vw, 2.4rem)',
            fontWeight: 300,
            letterSpacing: '0.12em',
            color: theme.palette.text.secondary,
            lineHeight: 1
          }}
        >
          {time}
        </Box>

        {/* Speed */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1
          }}
        >
          <Box
            sx={{
              fontSize: 'clamp(4rem, 18vw, 8rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: theme.palette.text.primary,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {speedKph}
          </Box>
          <Box
            sx={{
              fontSize: 'clamp(0.65rem, 2.2vw, 1rem)',
              fontWeight: 400,
              letterSpacing: '0.25em',
              color: theme.palette.text.disabled,
              mt: 0.5
            }}
          >
            KM/H
          </Box>
        </Box>
      </Box>
    </DashShell>
  )
}
