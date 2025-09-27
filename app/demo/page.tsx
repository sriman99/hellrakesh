"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, ArrowLeft, Users, Building2, Shield, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<"admin" | "company" | "candidate" | "student">("company")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Platform Demo</h1>
          <p className="text-muted-foreground">Explore the Humaneq HR platform with interactive demos</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-2">
              <Button
                variant={activeDemo === "admin" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveDemo("admin")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
              <Button
                variant={activeDemo === "company" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveDemo("company")}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Company Portal
              </Button>
              <Button
                variant={activeDemo === "student" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveDemo("student")}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Student Portal
              </Button>
              <Button
                variant={activeDemo === "candidate" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveDemo("candidate")}
              >
                <Users className="w-4 h-4 mr-2" />
                Candidate Experience
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {activeDemo === "admin" && (
                        <>
                          <Shield className="w-5 h-5" /> Admin Dashboard
                        </>
                      )}
                      {activeDemo === "company" && (
                        <>
                          <Building2 className="w-5 h-5" /> Company Portal
                        </>
                      )}
                      {activeDemo === "student" && (
                        <>
                          <GraduationCap className="w-5 h-5" /> Student Portal
                        </>
                      )}
                      {activeDemo === "candidate" && (
                        <>
                          <Users className="w-5 h-5" /> Candidate Experience
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {activeDemo === "admin" && "Manage companies, monitor usage, and control platform settings"}
                      {activeDemo === "company" && "Create templates, generate interview links, and view results"}
                      {activeDemo === "student" && "Practice interview skills with AI-powered mock interviews and analytics"}
                      {activeDemo === "candidate" && "Experience the interview process from a candidate's perspective"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Interactive Demo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Demo video placeholder</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeDemo === "admin" && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Try the Admin Dashboard:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/admin/login">
                          <Button variant="outline" className="w-full bg-transparent">
                            View Dashboard
                          </Button>
                        </Link>
                        <Link href="/admin/signup">
                          <Button variant="secondary" className="w-full">
                            Create Admin Account
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeDemo === "company" && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Try the Company Portal:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/company/login">
                          <Button variant="outline" className="w-full bg-transparent">
                            View Dashboard
                          </Button>
                        </Link>
                        <Link href="/company/signup">
                          <Button variant="secondary" className="w-full">
                            Start Free Trial
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeDemo === "student" && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Try the Student Portal:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/student/login">
                          <Button variant="outline" className="w-full bg-transparent border-emerald-500/50 text-emerald-600 hover:text-emerald-500">
                            View Dashboard
                          </Button>
                        </Link>
                        <Link href="/student/signup">
                          <Button variant="secondary" className="w-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                            Create Student Account
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-4 p-3 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Demo credentials: john.doe@university.edu / student123
                        </p>
                      </div>
                    </div>
                  )}

                  {activeDemo === "candidate" && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Experience the Interview Flow:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/demo/interview">
                          <Button variant="outline" className="w-full bg-transparent">
                            Try Demo Interview
                          </Button>
                        </Link>
                        <Link href="/interview/demo-123">
                          <Button variant="secondary" className="w-full">
                            Sample Interview Link
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
