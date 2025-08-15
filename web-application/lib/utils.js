import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility functions

export function getResponseIdFromUrl() {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  const responseId = urlParams.get('responseId')
  // Return null for empty strings too, so we can distinguish between "no param" and "empty param"
  return responseId && responseId.trim() ? responseId.trim() : null
}