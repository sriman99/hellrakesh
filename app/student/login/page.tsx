"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface PasswordRequirement {
    text: string
    met: boolean
}

export default function StudentLoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    })
    const [error, setError] = useState("")
    const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([])
    const router = useRouter()

    const checkPasswordRequirements = (password: string): PasswordRequirement[] => {
        return [
            { text: "At least 8 characters long", met: password.length >= 8 },
            { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
            { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
            { text: "Contains a number", met: /\d/.test(password) },
            { text: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
        ]
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch("/api/student/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: formData.rememberMe,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                router.push("/student/dashboard")
            } else {
                setError(data.error || "Login failed")
                if (data.resetTime) {
                    setError(`${data.error} Try again after ${new Date(data.resetTime).toLocaleTimeString()}`)
                }
            }
        } catch (error) {
            setError("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target

        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }))

        if (id === "password") {
            setPasswordRequirements(checkPasswordRequirements(value))
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900/50 to-slate-950"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

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
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
                            <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            Student Login
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base mt-3">
                            Welcome back! Continue your interview practice journey.
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
                                    placeholder="student@university.edu"
                                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-slate-300 font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12 pr-12"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {formData.password && passwordRequirements.length > 0 && (
                                    <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                                        <p className="text-xs text-slate-400 mb-2">Password requirements:</p>
                                        <div className="space-y-1">
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    {req.met ? (
                                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-slate-500" />
                                                    )}
                                                    <span className={`text-xs ${req.met ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                        {req.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked: boolean | "indeterminate") =>
                                        setFormData(prev => ({ ...prev, rememberMe: checked === true }))
                                    }
                                    className="border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <Label
                                    htmlFor="rememberMe"
                                    className="text-sm text-slate-300 cursor-pointer"
                                >
                                    Keep me signed in for 30 days
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing In..." : "Sign In to Practice"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Link
                                href="/student/forgot-password"
                                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-slate-400">
                                New to HumaneQ HR?{" "}
                                <Link
                                    href="/student/signup"
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                    <div className="text-center space-y-3">
                        <p className="text-xs text-slate-400">
                            Practice unlimited mock interviews and track your progress.
                        </p>
                        <div className="flex justify-center space-x-4 text-xs text-slate-500">
                            <span>✓ AI-Powered Interviews</span>
                            <span>✓ Progress Analytics</span>
                            <span>✓ Skill Assessment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}