import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: 'primary' | 'outline' | 'danger' | 'ghost'
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-accent',
  outline: 'bg-transparent border border-border',
  danger:  'bg-transparent border border-red/40',
  ghost:   'bg-transparent',
}

const textVariants = {
  primary: 'text-white font-bold',
  outline: 'text-text-primary font-semibold',
  danger:  'text-red font-semibold',
  ghost:   'text-text-secondary font-semibold',
}

const sizes = {
  sm: 'py-2 px-4 rounded-xl',
  md: 'py-4 px-6 rounded-2xl',
  lg: 'py-5 px-8 rounded-2xl',
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  size = 'md',
  disabled,
  className = '',
  ...props
}: ButtonProps & { className?: string }) {
  return (
    <TouchableOpacity
      className={`items-center justify-center ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50' : 'opacity-100'} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#9945FF'} />
      ) : (
        <Text className={`${textVariants[variant]} ${textSizes[size]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
