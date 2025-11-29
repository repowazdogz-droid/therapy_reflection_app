import { useEffect, useState } from "react"

export default function SuccessPage() {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const key = "omega_pro_unlimited_summaries"
    localStorage.setItem(key, "true")
    setVerified(true)
  }, [])

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Thank you for your purchase! 🎉</h1>
      {verified && (
        <>
          <p className="mb-4">Your PDF is ready to download:</p>
          <a
            href="/products/TheAdvancedReflectiveWorkbook.pdf"
            download
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Download PDF
          </a>
          <p className="mt-6 text-sm text-gray-600">
            Unlimited summaries are unlocked on this device.
          </p>
        </>
      )}
    </div>
  )
}

