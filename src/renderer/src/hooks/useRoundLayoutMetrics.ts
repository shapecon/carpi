import { useLayoutEffect, useMemo, useState } from 'react'
import { useLiviStore } from '@store/store'

type ViewportSize = {
  w: number
  h: number
}

function readViewport(): ViewportSize {
  const vv = window.visualViewport

  return {
    w: Math.round(vv?.width ?? window.innerWidth),
    h: Math.round(vv?.height ?? window.innerHeight)
  }
}

export function useRoundLayoutMetrics() {
  const isRoundDisplay = useLiviStore((s) => s.settings?.displayMode === 'round')
  const [viewport, setViewport] = useState<ViewportSize>(() => readViewport())

  useLayoutEffect(() => {
    const vv = window.visualViewport

    const update = () => {
      setViewport(readViewport())
    }

    update()
    window.addEventListener('resize', update)
    vv?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      vv?.removeEventListener('resize', update)
    }
  }, [])

  return useMemo(() => {
    const circleSize = Math.min(viewport.w, viewport.h)
    const circularInset = isRoundDisplay ? Math.round(circleSize * 0.15) : 0
    const sideInset = circularInset
    const topInset = isRoundDisplay ? Math.max(28, Math.round(circleSize * 0.1)) : 0
    const bottomInset = isRoundDisplay ? Math.max(44, Math.round(circleSize * 0.115)) : 0
    const navDockHeight = isRoundDisplay ? bottomInset : 0
    const contentBottomInset = isRoundDisplay ? bottomInset : 0
    const safeDiameter = Math.max(0, circleSize - circularInset * 2)

    return {
      viewport,
      circleSize,
      safeDiameter,
      isRoundDisplay,
      circularInset,
      sideInset,
      topInset,
      bottomInset,
      navDockHeight,
      contentBottomInset
    }
  }, [viewport, isRoundDisplay])
}
