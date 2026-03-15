import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import IconButton from '@mui/material/IconButton'
import { useStatusStore } from '../../store/store'
import { useTabsConfig } from './useTabsConfig'
import { ROUTES, UI } from '../../constants'
import { useTheme } from '@mui/material/styles'

interface RoundNavProps {
  receivingVideo: boolean
}

export const RoundNav: React.FC<RoundNavProps> = ({ receivingVideo }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const theme = useTheme()
  const isStreaming = useStatusStore((s) => s.isStreaming)
  const tabs = useTabsConfig(receivingVideo)

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

  // Start auto-hide on mount
  useEffect(() => {
    scheduleHide()
    return () => clearHideTimer()
  }, [scheduleHide, clearHideTimer])

  // Wake on user activity
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

  // Hide when streaming on home
  if (isStreaming && pathname === ROUTES.HOME) return null

  const activeIndex = tabs.findIndex((t) => {
    if (t.path === ROUTES.HOME) return pathname === ROUTES.HOME
    return pathname.startsWith(t.path)
  })

  // Position icons in an arc at the bottom of the circle
  // Arc from 210° to 330° (bottom arc), center at 270°
  const count = tabs.length
  const arcStart = 210
  const arcEnd = 330
  const arcStep = count > 1 ? (arcEnd - arcStart) / (count - 1) : 0
  const radius = 46 // % from center

  return (
    <div
      id="round-nav"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1100,
        opacity: hidden ? 0 : 1,
        transition: 'opacity 220ms ease'
      }}
    >
      {tabs.map((tab, i) => {
        const angleDeg = count > 1 ? arcStart + i * arcStep : 270
        const angleRad = (angleDeg * Math.PI) / 180
        const x = 50 + radius * Math.cos(angleRad)
        const y = 50 + radius * Math.sin(angleRad)
        const isActive = i === activeIndex

        return (
          <IconButton
            key={tab.path}
            aria-label={tab.label}
            disabled={tab.disabled}
            onClick={() => {
              if (tab.path === ROUTES.QUIT) {
                window.carplay.quit().catch(console.error)
                return
              }
              if (tab.path === ROUTES.SETTINGS && pathname.startsWith(ROUTES.SETTINGS)) {
                navigate(ROUTES.SETTINGS, { replace: true })
                return
              }
              navigate(tab.path)
            }}
            sx={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: hidden ? 'none' : 'auto',
              width: 48,
              height: 48,
              backgroundColor: isActive
                ? `${theme.palette.primary.main}33`
                : `${theme.palette.background.paper}AA`,
              backdropFilter: 'blur(8px)',
              border: isActive
                ? `2px solid ${theme.palette.primary.main}`
                : '1px solid rgba(255,255,255,0.15)',
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}44`
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.4rem'
              }
            }}
          >
            {tab.icon}
          </IconButton>
        )
      })}
    </div>
  )
}
