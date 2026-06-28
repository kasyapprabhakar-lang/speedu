import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTrackingId(): string {
  const prefix = 'SPD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function calculateShippingPrice(
  weightKg: number,
  distanceKm: number
): number {
  const basePrice = 50
  const perKgRate = 20
  const perKmRate = 0.5
  return Math.round(basePrice + weightKg * perKgRate + distanceKm * perKmRate)
}
