import React from 'react'
import { Modal as RNModal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'

interface ModalProps {
  visible: boolean
  title?: string
  onClose?: () => void
  children: React.ReactNode
}

export function Modal({ visible, title, onClose, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="bg-card border-t border-border rounded-t-3xl p-6">
          {(title || onClose) && (
            <View className="flex-row items-center justify-between mb-4">
              {title && (
                <Text className="text-text-primary text-lg font-bold">{title}</Text>
              )}
              {onClose && (
                <TouchableOpacity onPress={onClose}>
                  <Text className="text-text-secondary text-2xl leading-6">×</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {children}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}
