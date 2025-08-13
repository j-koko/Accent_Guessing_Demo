import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility functions

export function getResponseIdFromUrl() {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('responseId')
}