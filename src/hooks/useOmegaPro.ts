import { useEffect, useState } from "react"

const KEY = "omega_pro_unlimited_summaries"

export function useOmegaPro() {
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsPro(localStorage.getItem(KEY) === "true")
  }, [])

  return isPro
}
