import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useStatusStore } from '../../store/store'
import { useTabsConfig } from './useTabsConfig'
import { ROUTES, UI } from '../../constants'
import { useRoundLayoutMetrics } from '@renderer/hooks'

interface RoundNavProps {
  receivingVideo: boolean
}

type PolarPoint = {
  x: number
  y: number
}

function polarToCartesian(angleDeg: number, radius: number, center = 50): PolarPoint {
  const rad = ((angleDeg - 90) * Math.PI) / 180

  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad)
  }
}

function buildDonutSegmentPath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number
) {
  const outerStart = polarToCartesian(startAngle, outerRadius)
  const outerEnd = polarToCartesian(endAngle, outerRadius)
  const innerEnd = polarToCartesian(endAngle, innerRadius)
  const innerStart = polarToCartesian(startAngle, innerRadius)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ')
}

function getCenterAngles(count: number) {
  switch (count) {
    case 3:
      return [86, 180, 274]
    case 4:
      return [74, 136, 224, 286]
    case 5:
      return [68, 122, 180, 238, 292]
    case 6:
      return [60, 104, 148, 212, 256, 300]
    default: {
      const arcStart = 56
      const arcEnd = 304
      const span = arcEnd - arcStart
      const step = count > 1 ? span / (count - 1) : 0

      return Array.from({ length: count }, (_, i) => arcStart + step * i)
    }
  }
}

export const RoundNav: React.FC<RoundNavProps> = ({ receivingVideo }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const theme = useTheme()
  const isStreaming = useStatusStore((s) => s.isStreaming)
  const tabs = useTabsConfig(receivingVideo)
  const { circleSize } = useRoundLayoutMetrics()

  const [hidden, setHidden] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setHidden(true)
      hideTimerRef.current = null
    }, UI.INACTIVITY_HIDE_DELAY_MS)
  }, [clearHideTimer])

  const showAndArm = useCallback(() => {
    setHidden(false)
    scheduleHide()
  }, [scheduleHide])

  useEffect(() => {
    scheduleHide()
    return () => clearHideTimer()
  }, [scheduleHide, clearHideTimer])

  useEffect(() => {
    const wake = () => showAndArm()
    window.addEventListener('keydown', wake, { passive: true })
    document.addEventListener('mousemove', wake, { passive: true })
    document.addEventListener('pointerdown', wake, { passive: true })
    document.addEventListener('wheel', wake, { passive: true })

    return () => {
      window.removeEventListener('keydown', wake)
      document.removeEventListener('mousemove', wake)
      document.removeEventListener('pointerdown', wake)
      document.removeEventListener('wheel', wake)
    }
  }, [showAndArm])

  if (isStreaming && pathname === ROUTES.HOME) return null

  const activeIndex = tabs.findIndex((t) => {
    if (t.path === ROUTES.HOME) return pathname === ROUTES.HOME
    return pathname.startsWith(t.path)
  })

  const activeLabel = activeIndex >= 0 ? tabs[activeIndex]?.label : ''
  const count = tabs.length
  const centerAngles = getCenterAngles(count)
  const segmentGap = count <= 4 ? 5.5 : 4.2
  const ringStart =
    count > 1
      ? centerAngles[0]! - (centerAngles[1]! - centerAngles[0]!) / 2
      : (centerAngles[0] ?? 180) - 18
  const ringEnd =
    count > 1
      ? centerAngles[count - 1]! + (centerAngles[count - 1]! - centerAngles[count - 2]!) / 2
      : (centerAngles[0] ?? 180) + 18
  const navSize = Math.min(Math.max(Math.round(circleSize * 1.02), 388), 488)
  const outerRadius = 49.7
  const innerRadius = 42.4
  const iconRadius = 45.9
  const buttonSize = Math.max(42, Math.min(Math.round(circleSize * 0.095), 50))
  const iconSize = Math.max(20, Math.min(Math.round(buttonSize * 0.44), 25))
  const activeFill = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.96)' : '#ffffff'
  const inactiveFill =
    theme.palette.mode === 'dark' ? 'rgba(19,22,27,0.92)' : 'rgba(240,242,245,0.9)'
  const ringStroke = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  const activateTab = (path: string) => {
    if (path === ROUTES.QUIT) {
      window.projection.quit().catch(console.error)
      return
    }
    if (path === ROUTES.SETTINGS && pathname.startsWith(ROUTES.SETTINGS)) {
      navigate(ROUTES.SETTINGS, { replace: true })
      return
    }
    navigate(path)
  }

  return (
    <Box
      id="round-nav"
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1100,
        opacity: hidden ? 0 : 1,
        transition: 'opacity 220ms ease'
      }}
    >
      {!!activeLabel && (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 'clamp(10px, 3.6svh, 22px)',
            transform: 'translateX(-50%)',
            px: 1.8,
            py: 0.7,
            borderRadius: 999,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(7,10,12,0.74)' : 'rgba(255,255,255,0.86)',
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 6px 18px rgba(0,0,0,0.22)'
                : '0 6px 18px rgba(15,23,42,0.12)'
          }}
        >
          <Typography
            sx={{
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: theme.palette.text.primary,
              whiteSpace: 'nowrap'
            }}
          >
            {activeLabel}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${navSize}px`,
          height: `${navSize}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="roundNavShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="2.4"
                floodColor={theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.14)'}
              />
            </filter>
          </defs>

          <path
            d={buildDonutSegmentPath(ringStart, ringEnd, innerRadius, outerRadius)}
            fill={theme.palette.mode === 'dark' ? 'rgba(8,10,12,0.44)' : 'rgba(255,255,255,0.3)'}
            filter="url(#roundNavShadow)"
          />

          {tabs.map((tab, i) => {
            const center = centerAngles[i] ?? 180
            const prevCenter = centerAngles[i - 1]
            const nextCenter = centerAngles[i + 1]
            const rawStart =
              prevCenter == null
                ? center - ((nextCenter ?? center) - center) / 2
                : (prevCenter + center) / 2
            const rawEnd =
              nextCenter == null
                ? center + (center - (prevCenter ?? center)) / 2
                : (center + nextCenter) / 2
            const start = rawStart + segmentGap / 2
            const end = rawEnd - segmentGap / 2
            const isActive = i === activeIndex
            const path = buildDonutSegmentPath(start, end, innerRadius, outerRadius)

            return (
              <g key={`${tab.path}-segment`}>
                <path
                  d={path}
                  fill={isActive ? activeFill : inactiveFill}
                  stroke={isActive ? alpha(theme.palette.primary.main, 0.65) : ringStroke}
                  strokeWidth={isActive ? 0.72 : 0.45}
                />
                <path
                  d={path}
                  role="button"
                  tabIndex={tab.disabled ? -1 : 0}
                  aria-label={tab.label}
                  onClick={() => {
                    if (tab.disabled) return
                    activateTab(tab.path)
                  }}
                  onKeyDown={(e) => {
                    if (tab.disabled) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      activateTab(tab.path)
                    }
                  }}
                  style={{
                    pointerEvents: hidden || tab.disabled ? 'none' : 'auto',
                    cursor: tab.disabled ? 'default' : 'pointer',
                    fill: 'transparent'
                  }}
                >
                  <title>{tab.label}</title>
                </path>
              </g>
            )
          })}
        </svg>

        {tabs.map((tab, i) => {
          const angle = centerAngles[i] ?? 180
          const pos = polarToCartesian(angle, iconRadius)
          const isActive = i === activeIndex

          return (
            <Box
              key={tab.path}
              sx={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
                color: tab.disabled
                  ? theme.palette.text.disabled
                  : isActive
                    ? '#111111'
                    : theme.palette.text.primary,
                transition: 'color 140ms ease',
                '& .MuiSvgIcon-root': {
                  fontSize: `${iconSize}px`
                }
              }}
            >
              {tab.icon}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
