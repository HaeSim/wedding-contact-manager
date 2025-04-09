"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { parseCSV } from "@/lib/csv-parser"
import { toast } from "@/hooks/use-toast"

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const text = await file.text()
      const contacts = parseCSV(text)

      // Store contacts in localStorage
      localStorage.setItem("contacts", JSON.stringify(contacts))

      // Show success toast
      toast({
        title: "연락처 업로드 성공",
        description: `${contacts.length}개의 연락처가 업로드되었습니다.`,
      })

      // Navigate to review page
      router.push("/review")
    } catch (err) {
      setError("Failed to parse CSV file. Please check the format.")
      console.error(err)

      toast({
        title: "연락처 업로드 실패",
        description: "파일 형식을 확인해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">연락처 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Upload className="h-6 w-6 text-rose-500" />
              </div>
              <p className="mt-2 text-sm font-medium">파일을 선택하려면 클릭하세요</p>
              <p className="mt-1 text-xs text-gray-500">형식: name, phone, 친밀도(5/5), 그룹</p>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

          <div className="text-center text-sm text-gray-500">
            <p>파일에 다음 열이 포함되어 있는지 확인하세요:</p>
            <ul className="mt-2 list-inside list-disc text-left">
              <li>Name (이름)</li>
              <li>Phone number (전화번호)</li>
              <li>Intimacy level (친밀도)</li>
              <li>Group (그룹)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
