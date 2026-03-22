import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import { useLocation, useNavigate } from 'react-router'
import { SettingsLayoutProps } from './types'
import { useTheme } from '@mui/material/styles'
import { useRoundLayoutMetrics } from '@renderer/hooks'

const clampPx = (min: number, pref: number, max: number) => Math.max(min, Math.min(pref, max))

export const SettingsLayout = ({
  children,
  title,
  showRestart,
  onRestart
}: SettingsLayoutProps) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const { viewport, isRoundDisplay, circularInset, safeDiameter } = useRoundLayoutMetrics()

  //const handleNavigate = () => navigate(-1)
  const handleNavigate = () => {
    const el = document.activeElement as HTMLElement | null
    if (el && el !== document.body) el.blur?.()
    requestAnimationFrame(() => navigate(-1))
  }

  const showBack = location.pathname !== '/settings'

  const px = useMemo(() => {
    const vw = viewport.w / 100
    const vh = viewport.h / 100

    const pl = isRoundDisplay ? circularInset : clampPx(12, 1.5 * vw, 28)
    const pr = isRoundDisplay ? circularInset : clampPx(12, 3.5 * vw, 28)
    const pt = isRoundDisplay ? circularInset : clampPx(8, 2.2 * vh, 18)
    const pb = isRoundDisplay ? circularInset : clampPx(10, 2.2 * vh, 18)

    const headerH = clampPx(32, 5.5 * vh, 44)
    const slotLeftW = clampPx(36, 6 * vw, 56)
    const slotRightW = clampPx(36, 8 * vw, 100)
    const iconPx = clampPx(18, 3.2 * vh, 28)
    const titlePx = clampPx(16, 3.6 * vh, 34)
    const applyPx = clampPx(13, 1.8 * vh, 16)

    const contentMaxW = isRoundDisplay
      ? Math.min(Math.max(250, Math.round(safeDiameter * 0.84)), 372)
      : Number.POSITIVE_INFINITY

    return { pl, pr, pt, pb, headerH, slotLeftW, slotRightW, iconPx, titlePx, applyPx, contentMaxW }
  }, [viewport.h, viewport.w, isRoundDisplay, circularInset, safeDiameter])

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        pl: `${px.pl}px`,
        pr: `${px.pr}px`,
        pt: `${px.pt}px`,
        pb: `${px.pb}px`,
        gap: '0.75rem'
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `${px.slotLeftW}px 1fr ${px.slotRightW}px`,
          alignItems: 'center',
          height: `${px.headerH}px`,
          px: '0.5rem',
          boxSizing: 'border-box',
          flex: '0 0 auto'
        }}
      >
        <Box
          sx={{
            width: `${px.slotLeftW}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          {showBack ? (
            <IconButton
              onClick={handleNavigate}
              aria-label="Back"
              className="nav-focus-primary"
              disableRipple
              disableFocusRipple
              disableTouchRipple
              sx={{
                width: `${px.slotLeftW}px`,
                height: '100%',
                p: 0,
                m: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowBackIosOutlinedIcon sx={{ fontSize: `${px.iconPx}px` }} />
            </IconButton>
          ) : (
            <Box sx={{ width: `${px.slotLeftW}px`, height: '100%' }} />
          )}
        </Box>

        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              lineHeight: 1.05,
              fontSize: `${px.titlePx}px`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            width: `${px.slotRightW}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          {showRestart ? (
            <IconButton
              onClick={onRestart}
              aria-label="Apply"
              sx={{
                width: `${px.slotRightW}px`,
                height: '100%',
                p: 0,
                m: 0,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: `${px.applyPx}px`,
                  gap: '0.5rem'
                }}
              >
                <span>Apply</span>
                <RestartAltOutlinedIcon sx={{ fontSize: `${px.iconPx}px` }} />
              </Box>
            </IconButton>
          ) : (
            <Box sx={{ width: `${px.slotRightW}px`, height: '100%' }} />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarGutter: 'stable',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Stack
          spacing={isRoundDisplay ? 1 : 0}
          sx={{
            width: '100%',
            maxWidth: Number.isFinite(px.contentMaxW) ? `${px.contentMaxW}px` : '100%',
            minHeight: '100%',
            padding: 0
          }}
        >
          {children}
        </Stack>
      </Box>
    </Box>
  )
}
