import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import { StackItemProps } from '../../type'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Item = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'itemvariant'
})<{ itemvariant: 'default' | 'category' }>(({ theme, itemvariant }) => {
  const activeColor = theme.palette.primary.main
  const isCategory = itemvariant === 'category'

  const rowPadY = isCategory ? 'clamp(15px, 2.3svh, 19px)' : 'clamp(13px, 2.1svh, 18px)'
  const rowPadX = isCategory ? 'clamp(16px, 2.6svh, 22px)' : 'clamp(14px, 2.3svh, 20px)'
  const rowFont = isCategory ? 'clamp(1rem, 2.4svh, 1.08rem)' : 'clamp(0.95rem, 2.25svh, 1.02rem)'
  const rowGap = 'clamp(0.75rem, 2.3svh, 2rem)'

  const activeRowStyles = {
    borderColor: `${activeColor}55`,
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(24,24,24,0.98), rgba(18,18,18,0.98))'
        : 'linear-gradient(180deg, rgba(250,250,250,0.98), rgba(239,239,239,0.98))',
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 1px ${activeColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`
        : `0 0 0 1px ${activeColor}28, inset 0 1px 0 rgba(255,255,255,0.85)`,
    a: { color: theme.palette.text.primary },
    '& .stack-item-label': { color: theme.palette.text.primary },
    '& .stack-item-forward': {
      color: theme.palette.text.primary,
      transform: 'translateX(2px)'
    }
  } as const

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: rowGap,
    minHeight: isCategory ? 'clamp(60px, 9.2svh, 72px)' : 'clamp(56px, 8.6svh, 66px)',
    padding: `${rowPadY} ${rowPadX}`,
    borderRadius: isCategory ? 12 : 10,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
    fontSize: rowFont,
    background:
      theme.palette.mode === 'dark'
        ? isCategory
          ? 'linear-gradient(180deg, rgba(16,16,16,0.99), rgba(11,11,11,0.99))'
          : 'linear-gradient(180deg, rgba(17,17,17,0.98), rgba(14,14,14,0.98))'
        : isCategory
          ? 'linear-gradient(180deg, rgba(246,246,246,0.99), rgba(235,235,235,0.99))'
          : 'linear-gradient(180deg, rgba(248,248,248,0.98), rgba(239,239,239,0.98))',
    boxShadow:
      theme.palette.mode === 'dark'
        ? isCategory
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.22)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.02)'
        : 'inset 0 1px 0 rgba(255,255,255,0.82)',
    cursor: 'default',
    transition: 'background 140ms ease, border-color 140ms ease, box-shadow 140ms ease',

    '& svg': {
      transition: 'transform 140ms ease, color 140ms ease'
    },

    // Hover ONLY for real mouse (prevents sticky hover after touch)
    'html[data-input="mouse"] &': {
      '&:hover': activeRowStyles,
      '&:active': activeRowStyles
    },

    // Keyboard/D-pad highlight
    '&:focus-visible': {
      outline: 'none',
      ...activeRowStyles
    },

    // IMPORTANT: do not use :focus styling (can stick on touch/click)
    '&:focus': { outline: 'none' },

    '& .stack-item-label': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      textDecoration: 'none',
      fontSize: rowFont,
      outline: 'none',
      color: theme.palette.text.secondary,
      margin: 0,
      fontWeight: isCategory ? 600 : 500,
      letterSpacing: '0.01em'
    },

    '& .stack-item-label > *': {
      margin: 0,
      fontSize: 'inherit',
      fontWeight: 'inherit',
      color: 'inherit'
    },

    '& > a, & .stack-item-link': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      textDecoration: 'none',
      fontSize: rowFont,
      outline: 'none',
      color: theme.palette.text.secondary,

      // Hover ONLY for real mouse
      'html[data-input="mouse"] &': {
        '&:hover': {
          color: activeColor,
          '+ .stack-item-forward': { color: activeColor, transform: 'translateX(2px)' }
        },
        '&:active': {
          color: activeColor,
          '+ .stack-item-forward': { color: activeColor, transform: 'translateX(2px)' }
        }
      },

      // Keyboard highlight
      '&:focus-visible': {
        color: activeColor,
        '+ .stack-item-forward': { color: activeColor, transform: 'translateX(2px)' }
      },

      '&:focus': { outline: 'none' }
    },

    '& .stack-item-right': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'clamp(0.65rem, 1.8svh, 1rem)',
      flexShrink: 0
    },

    '& .stack-item-forward': {
      color: theme.palette.text.primary,
      fontSize: isCategory ? 'clamp(19px, 3.2svh, 25px)' : 'clamp(18px, 3.1svh, 24px)',
      opacity: 0.95
    },

    '& .stack-item-forward-shell': {
      width: isCategory ? 'clamp(32px, 5.2svh, 38px)' : 'auto',
      height: isCategory ? 'clamp(32px, 5.2svh, 38px)' : 'auto',
      borderRadius: isCategory ? 999 : 0,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: isCategory
        ? theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.04)'
        : 'transparent'
    }
  }
})

export const StackItem = ({
  children,
  value,
  node,
  showValue,
  withForwardIcon,
  variant = 'default',
  onClick
}: StackItemProps) => {
  const { t } = useTranslation()

  const viewValue = node?.valueTransform?.toView ? node?.valueTransform.toView(value) : value

  let displayValue = node?.valueTransform?.format
    ? node.valueTransform.format(viewValue)
    : `${viewValue}${node?.displayValueUnit ?? ''}`

  if (node?.type === 'select') {
    const option = node?.options.find((o) => o.value === value)
    displayValue = option ? (option.labelKey ? t(option.labelKey, option.label) : option.label) : ''
  }

  if (displayValue === 'null' || displayValue === 'undefined') {
    displayValue = '---'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <Item
      itemvariant={variant}
      elevation={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
    >
      <div className="stack-item-label" style={{ minWidth: 0 }}>
        {children}
      </div>

      <div className="stack-item-right">
        {showValue && value != null && (
          <div
            style={{
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.82rem, 1.95svh, 0.92rem)',
              color: 'inherit',
              opacity: 0.82
            }}
          >
            {displayValue}
          </div>
        )}
        {withForwardIcon && (
          <div className="stack-item-forward-shell">
            <ArrowForwardIosOutlinedIcon className="stack-item-forward" />
          </div>
        )}
      </div>
    </Item>
  )
}
