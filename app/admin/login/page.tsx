"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "admin",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-950"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-all duration-300 hover:translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-slate-400 text-base mt-3">
              Access the administrative dashboard to manage companies and monitor platform usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@humaneqhr.com"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-300 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In to Admin Panel"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Need an admin account?{" "}
                <Link
                  href="/admin/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
          <p className="text-xs text-slate-400 text-center">
            This is a secure admin area. All login attempts are monitored and logged.
          </p>
          <p className="text-sm text-blue-400 text-center mt-3 font-medium bg-slate-800/50 py-2 px-4 rounded-lg">
            Demo: admin@humaneqhr.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
