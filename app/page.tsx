"use client"

import { useEffect, useState } from "react"
import { Upload, Users, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface ContactSummary {
  total: number
  invited: number
  notInvited: number
  withIntimacy: number
  withGroup: number
}

export default function Home() {
  const [contactSummary, setContactSummary] = useState<ContactSummary | null>(null)

  useEffect(() => {
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem("contacts")
    if (storedContacts) {
      try {
        const contacts = JSON.parse(storedContacts)
        if (Array.isArray(contacts) && contacts.length > 0) {
          const summary: ContactSummary = {
            total: contacts.length,
            invited: contacts.filter((c) => c.invited === true).length,
            notInvited: contacts.filter((c) => c.invited !== true).length,
            withIntimacy: contacts.filter((c) => c.intimacy).length,
            withGroup: contacts.filter((c) => c.group).length,
          }
          setContactSummary(summary)
        }
      } catch (error) {
        console.error("Failed to parse contacts:", error)
      }
    }
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">결혼식 연락처 관리</CardTitle>
          <CardDescription>결혼식 초대를 위한 연락처를 관리하고 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {contactSummary ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">연락처 요약</h3>
                  <span className="text-sm text-gray-500">총 {contactSummary.total}개</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>초대 여부</span>
                      <span>
                        {contactSummary.invited}명 초대 / {contactSummary.notInvited}명 미초대
                      </span>
                    </div>
                    <Progress
                      value={(contactSummary.invited / contactSummary.total) * 100}
                      className="h-2 bg-gray-200"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>친밀도 입력</span>
                      <span>
                        {contactSummary.withIntimacy}명 (
                        {Math.round((contactSummary.withIntimacy / contactSummary.total) * 100)}%)
                      </span>
                    </div>
                    <Progress
                      value={(contactSummary.withIntimacy / contactSummary.total) * 100}
                      className="h-2 bg-gray-200"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>그룹 입력</span>
                      <span>
                        {contactSummary.withGroup}명 (
                        {Math.round((contactSummary.withGroup / contactSummary.total) * 100)}%)
                      </span>
                    </div>
                    <Progress
                      value={(contactSummary.withGroup / contactSummary.total) * 100}
                      className="h-2 bg-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button asChild className="bg-rose-500 hover:bg-rose-600 flex flex-col h-auto py-3">
                  <Link href="/upload">
                    <Upload className="h-5 w-5 mb-1" />
                    <span className="text-xs">새 업로드</span>
                  </Link>
                </Button>
                <Button asChild className="bg-rose-500 hover:bg-rose-600 flex flex-col h-auto py-3">
                  <Link href="/review">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs">연락처 검토</span>
                  </Link>
                </Button>
                <Button asChild className="bg-rose-500 hover:bg-rose-600 flex flex-col h-auto py-3">
                  <Link href="/results">
                    <Filter className="h-5 w-5 mb-1" />
                    <span className="text-xs">필터 및 내보내기</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Upload className="h-6 w-6 text-rose-500" />
              </div>
              <p className="mt-2 text-sm font-medium">연락처 파일 업로드</p>
              <p className="mt-1 text-xs text-gray-500">형식: name, phone, 친밀도(5/5), 그룹</p>
              <Button asChild className="mt-4 bg-rose-500 hover:bg-rose-600">
                <Link href="/upload">파일 업로드</Link>
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>파일을 업로드한 후 하단 메뉴를 통해 연락처 검토 및 필터링을 할 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
