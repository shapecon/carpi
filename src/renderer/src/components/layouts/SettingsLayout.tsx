import { useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import { useLocation, useNavigate } from 'react-router'
import { SettingsLayoutProps } from './types'
import { alpha, useTheme } from '@mui/material/styles'
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
  const { viewport, isRoundDisplay, circularInset, safeDiameter, topInset, contentBottomInset } =
    useRoundLayoutMetrics()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const touchGestureRef = useRef({
    active: false,
    moved: false,
    x: 0,
    y: 0,
    suppressClicksUntil: 0
  })
  const [fadeState, setFadeState] = useState({ top: false, bottom: false })

  //const handleNavigate = () => navigate(-1)
  const handleNavigate = () => {
    const el = document.activeElement as HTMLElement | null
    if (el && el !== document.body) el.blur?.()
    requestAnimationFrame(() => navigate(-1))
  }

  const showBack = location.pathname !== '/settings'
  const showHeader = !(isRoundDisplay && location.pathname === '/settings')

  const suppressTouchClicks = (durationMs = 380) => {
    touchGestureRef.current.suppressClicksUntil = Math.max(
      touchGestureRef.current.suppressClicksUntil,
      window.performance.now() + durationMs
    )
  }

  const handleScrollPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return
    touchGestureRef.current = {
      active: true,
      moved: false,
      x: e.clientX,
      y: e.clientY,
      suppressClicksUntil: touchGestureRef.current.suppressClicksUntil
    }
  }

  const handleScrollPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchGestureRef.current.active) return

    const dx = Math.abs(e.clientX - touchGestureRef.current.x)
    const dy = Math.abs(e.clientY - touchGestureRef.current.y)

    if (dx > 8 || dy > 8) {
      touchGestureRef.current.moved = true
      suppressTouchClicks()
    }
  }

  const finishScrollGesture = () => {
    if (!touchGestureRef.current.active) return

    if (touchGestureRef.current.moved) {
      suppressTouchClicks(420)
    }

    touchGestureRef.current.active = false
    touchGestureRef.current.moved = false
  }

  const handleScrollClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.performance.now() > touchGestureRef.current.suppressClicksUntil) return
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const updateFades = () => {
      const next = {
        top: el.scrollTop > 2,
        bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2
      }

      setFadeState((prev) => (prev.top === next.top && prev.bottom === next.bottom ? prev : next))
    }

    const blockClicksDuringScroll = () => {
      if (touchGestureRef.current.active || touchGestureRef.current.moved) {
        suppressTouchClicks()
      }
    }

    updateFades()

    el.addEventListener('scroll', updateFades, { passive: true })
    el.addEventListener('scroll', blockClicksDuringScroll, { passive: true })
    window.addEventListener('resize', updateFades)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateFades) : null
    ro?.observe(el)
    if (el.firstElementChild instanceof HTMLElement) {
      ro?.observe(el.firstElementChild)
    }

    return () => {
      el.removeEventListener('scroll', updateFades)
      el.removeEventListener('scroll', blockClicksDuringScroll)
      window.removeEventListener('resize', updateFades)
      ro?.disconnect()
    }
  }, [children, location.pathname, isRoundDisplay])

  const px = useMemo(() => {
    const vw = viewport.w / 100
    const vh = viewport.h / 100

    const pl = isRoundDisplay ? circularInset : clampPx(12, 1.5 * vw, 28)
    const pr = isRoundDisplay ? circularInset : clampPx(12, 3.5 * vw, 28)
    const pt = isRoundDisplay ? topInset : clampPx(8, 2.2 * vh, 18)
    const pb = isRoundDisplay ? contentBottomInset : clampPx(10, 2.2 * vh, 18)

    const headerH = clampPx(40, 5.5 * vh, 52)
    const slotLeftW = isRoundDisplay ? clampPx(52, 8 * vw, 72) : clampPx(36, 6 * vw, 56)
    const slotRightW = clampPx(36, 8 * vw, 100)
    const iconPx = isRoundDisplay ? clampPx(28, 4 * vh, 38) : clampPx(18, 3.2 * vh, 28)
    const backButtonSize = isRoundDisplay ? clampPx(40, 6.2 * vh, 50) : slotLeftW
    const titlePx = clampPx(16, 3.6 * vh, 34)
    const applyPx = clampPx(13, 1.8 * vh, 16)
    const shellW = isRoundDisplay
      ? Math.min(Math.max(288, Math.round(safeDiameter * 0.9)), 372)
      : Number.POSITIVE_INFINITY
    const shellH = isRoundDisplay ? Math.max(0, viewport.h - pt - pb) : Number.POSITIVE_INFINITY

    const contentMaxW = isRoundDisplay ? shellW : Number.POSITIVE_INFINITY

    return {
      pl,
      pr,
      pt,
      pb,
      headerH,
      slotLeftW,
      slotRightW,
      iconPx,
      backButtonSize,
      titlePx,
      applyPx,
      shellW,
      shellH,
      contentMaxW
    }
  }, [
    viewport.h,
    viewport.w,
    isRoundDisplay,
    circularInset,
    safeDiameter,
    topInset,
    contentBottomInset
  ])

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          position: isRoundDisplay ? 'absolute' : 'relative',
          left: isRoundDisplay ? '50%' : undefined,
          top: isRoundDisplay ? '50%' : undefined,
          transform: isRoundDisplay ? 'translate(-50%, -50%)' : undefined,
          width: isRoundDisplay ? `${px.shellW}px` : '100%',
          maxWidth: Number.isFinite(px.shellW) ? `${px.shellW}px` : '100%',
          height: isRoundDisplay ? `${px.shellH}px` : '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxSizing: 'border-box',
          pl: isRoundDisplay ? 0 : `${px.pl}px`,
          pr: isRoundDisplay ? 0 : `${px.pr}px`,
          pt: isRoundDisplay ? 0 : `${px.pt}px`,
          pb: isRoundDisplay ? 0 : `${px.pb}px`,
          gap: showHeader ? '0.75rem' : '0.3rem'
        }}
      >
        {showHeader && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isRoundDisplay
                ? `${px.backButtonSize}px 1fr ${px.backButtonSize}px`
                : `${px.slotLeftW}px 1fr ${px.slotRightW}px`,
              alignItems: 'center',
              height: `${px.headerH}px`,
              width: '100%',
              maxWidth: Number.isFinite(px.contentMaxW) ? `${px.contentMaxW}px` : '100%',
              alignSelf: 'center',
              boxSizing: 'border-box',
              flex: '0 0 auto',
              position: 'relative',
              zIndex: isRoundDisplay ? 1201 : 'auto'
            }}
          >
            <Box
              sx={{
                width: isRoundDisplay ? `${px.backButtonSize}px` : `${px.slotLeftW}px`,
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
                    position: 'relative',
                    zIndex: isRoundDisplay ? 1202 : 'auto',
                    width: isRoundDisplay ? `${px.backButtonSize}px` : `${px.slotLeftW}px`,
                    height: isRoundDisplay ? `${px.backButtonSize}px` : '100%',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    color: theme.palette.text.primary,
                    border: `1px solid ${alpha(theme.palette.text.primary, isRoundDisplay ? 0.2 : 0)}`,
                    backgroundColor: isRoundDisplay
                      ? alpha(theme.palette.background.paper, 0.88)
                      : 'transparent',
                    boxShadow: isRoundDisplay
                      ? `0 4px 12px ${alpha('#000000', 0.1)}, inset 0 1px 0 ${alpha('#ffffff', 0.16)}`
                      : 'none',
                    backdropFilter: isRoundDisplay ? 'blur(8px)' : 'none',
                    '&:active': isRoundDisplay
                      ? {
                          backgroundColor: alpha(theme.palette.background.paper, 0.94)
                        }
                      : undefined
                  }}
                >
                  <ArrowBackIosOutlinedIcon
                    sx={{
                      fontSize: `${px.iconPx}px`,
                      transform: isRoundDisplay ? 'translateX(1px)' : 'none'
                    }}
                  />
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
                width: isRoundDisplay ? `${px.backButtonSize}px` : `${px.slotRightW}px`,
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
        )}

        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box
            ref={scrollRef}
            onPointerDown={handleScrollPointerDown}
            onPointerMove={handleScrollPointerMove}
            onPointerUp={finishScrollGesture}
            onPointerCancel={finishScrollGesture}
            onClickCapture={handleScrollClickCapture}
            sx={{
              width: '100%',
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

          <Box
            aria-hidden="true"
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              top: isRoundDisplay ? '-4px' : 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: Number.isFinite(px.contentMaxW) ? `${px.contentMaxW}px` : '100%',
              height: isRoundDisplay ? '18px' : '14px',
              opacity: fadeState.top ? 1 : 0,
              transition: 'opacity 160ms ease',
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0.82)} 0%, ${alpha(theme.palette.background.default, 0.38)} 48%, ${alpha(theme.palette.background.default, 0)} 100%)`
            }}
          />

          <Box
            aria-hidden="true"
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: Number.isFinite(px.contentMaxW) ? `${px.contentMaxW}px` : '100%',
              bottom: isRoundDisplay ? '-6px' : 0,
              height: isRoundDisplay ? '22px' : '16px',
              opacity: fadeState.bottom ? 1 : 0,
              transition: 'opacity 160ms ease',
              background: `linear-gradient(to top, ${alpha(theme.palette.background.default, 0.84)} 0%, ${alpha(theme.palette.background.default, 0.42)} 48%, ${alpha(theme.palette.background.default, 0)} 100%)`
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
