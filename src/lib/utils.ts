import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** public/ asset URL, honoring Vite `base` (e.g. deployed under /panel/). */
export function publicFileUrl(fileName: string) {
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith("/") ? base : `${base}/`
  return `${prefix}${encodeURIComponent(fileName)}`
}
