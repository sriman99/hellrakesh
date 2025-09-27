"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowLeft, Brain, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export default function CompanyLoginPage() {
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
          role: "company",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/company/dashboard")
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
    <div className="min-h-screen bg-background cursor-reactive-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl hero-float" />
      <div
        className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl hero-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          <Card className="glass-enterprise border-enterprise shadow-2xl animate-fade-in">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-enterprise-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-enterprise-gradient rounded-lg flex items-center justify-center mr-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text-enterprise">HumaneQ HR</span>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2">Company Portal</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Access your enterprise AI recruitment dashboard to manage interviews and analyze candidate performance.
              </CardDescription>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Enterprise
                </Badge>
                <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium text-foreground">
                    Company Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@yourcompany.com"
                    className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="bg-input/50 border-enterprise hover:border-primary/50 focus:border-primary transition-all duration-300 h-12 text-base"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg btn-enterprise shadow-xl" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Access Dashboard"}
                </Button>
              </form>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/company/forgot-password"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/company/signup"
                  className="text-primary hover:text-primary/80 transition-colors font-semibold"
                >
                  Create account
                </Link>
              </div>

              <Separator className="bg-border/50" />

              <div className="text-center space-y-4">
                <p className="text-base text-muted-foreground">New to HumaneQ HR?</p>
                <Link href="/company/signup">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-enterprise hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 bg-transparent"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-4">
                <div className="glass-enterprise rounded-xl p-4 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Demo Credentials</p>
                  <p className="text-sm font-mono text-primary">demo@techcorp.com / company123</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-muted-foreground mb-4">Trusted by 2,500+ companies worldwide</p>
            <div className="flex justify-center space-x-6 opacity-60">
              <div className="text-xs font-semibold text-foreground">Google</div>
              <div className="text-xs font-semibold text-foreground">Microsoft</div>
              <div className="text-xs font-semibold text-foreground">Amazon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
