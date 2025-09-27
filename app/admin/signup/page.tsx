"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/admin/dashboard")
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-950"></div>
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-all duration-300 hover:translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4 rounded-2xl border border-slate-700/50">
              <Shield className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Create Admin Account
          </h1>
          <p className="text-slate-400 mt-3 text-base">Set up your administrator account</p>
        </div>

        <Card className="shadow-2xl shadow-black/50 border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-white">Admin Registration</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your details to create an admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-slate-300 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="adminCode" className="text-slate-300 font-medium">
                  Admin Access Code
                </Label>
                <Input
                  id="adminCode"
                  name="adminCode"
                  type="text"
                  placeholder="Enter admin access code"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-slate-400">Contact your system administrator for the access code</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-300 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02] mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/admin/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
