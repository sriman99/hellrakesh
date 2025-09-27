"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, GraduationCap } from "lucide-react"
import Link from "next/link"

interface PasswordRequirement {
    text: string
    met: boolean
}

export default function StudentSignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        university: "",
        major: "",
        graduationYear: "",
        targetRole: "",
        phoneNumber: "",
        agreeToTerms: false,
        subscribeToNewsletter: false
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

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear()
        const years = []
        for (let year = currentYear; year <= currentYear + 10; year++) {
            years.push(year.toString())
        }
        return years
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        if (!formData.agreeToTerms) {
            setError("You must agree to the terms and conditions")
            setIsLoading(false)
            return
        }

        const allRequirementsMet = passwordRequirements.every(req => req.met)
        if (!allRequirementsMet) {
            setError("Please ensure all password requirements are met")
            setIsLoading(false)
            return
        }

        try {
            const signupData = {
                ...formData,
                graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
            }

            const response = await fetch("/api/student/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupData),
            })

            const data = await response.json()

            if (response.ok) {
                router.push("/student/dashboard")
            } else {
                setError(data.error || "Registration failed")
                if (data.details && Array.isArray(data.details)) {
                    setError(`${data.error}: ${data.details.join(", ")}`)
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

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const isFormValid = () => {
        return formData.email &&
            formData.password &&
            formData.firstName &&
            formData.lastName &&
            formData.agreeToTerms &&
            passwordRequirements.every(req => req.met)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900/50 to-slate-950"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="w-full max-w-2xl relative z-10">
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
                            <GraduationCap className="w-8 h-8 text-emerald-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            Create Student Account
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base mt-3">
                            Join thousands of students practicing for their dream interviews.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="firstName" className="text-slate-300 font-medium">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        placeholder="John"
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="lastName" className="text-slate-300 font-medium">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-slate-300 font-medium">
                                    Email Address *
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
                                <Label htmlFor="phoneNumber" className="text-slate-300 font-medium">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Academic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="university" className="text-slate-300 font-medium">
                                        University/College
                                    </Label>
                                    <Input
                                        id="university"
                                        type="text"
                                        placeholder="Stanford University"
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                        value={formData.university}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="major" className="text-slate-300 font-medium">
                                        Major/Field of Study
                                    </Label>
                                    <Input
                                        id="major"
                                        type="text"
                                        placeholder="Computer Science"
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                        value={formData.major}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-slate-300 font-medium">
                                        Expected Graduation Year
                                    </Label>
                                    <Select value={formData.graduationYear} onValueChange={(value) => handleSelectChange("graduationYear", value)}>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white h-12">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {generateYearOptions().map((year) => (
                                                <SelectItem key={year} value={year}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="targetRole" className="text-slate-300 font-medium">
                                        Target Job Role
                                    </Label>
                                    <Input
                                        id="targetRole"
                                        type="text"
                                        placeholder="Software Engineer"
                                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-12"
                                        value={formData.targetRole}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-slate-300 font-medium">
                                    Password *
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    {req.met ? (
                                                        <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-slate-500 flex-shrink-0" />
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

                            {/* Checkboxes */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onCheckedChange={(checked: boolean | "indeterminate") =>
                                            setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))
                                        }
                                        className="mt-1"
                                    />
                                    <Label
                                        htmlFor="agreeToTerms"
                                        className="text-sm text-slate-300 cursor-pointer leading-relaxed"
                                    >
                                        I agree to the{" "}
                                        <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="subscribeToNewsletter"
                                        checked={formData.subscribeToNewsletter}
                                        onCheckedChange={(checked: boolean | "indeterminate") =>
                                            setFormData(prev => ({ ...prev, subscribeToNewsletter: checked === true }))
                                        }
                                        className="mt-1"
                                    />
                                    <Label
                                        htmlFor="subscribeToNewsletter"
                                        className="text-sm text-slate-300 cursor-pointer leading-relaxed"
                                    >
                                        Send me interview tips, career advice, and platform updates
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                size="lg"
                                disabled={isLoading || !isFormValid()}
                            >
                                {isLoading ? "Creating Account..." : "Create Your Account"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-slate-400">
                                Already have an account?{" "}
                                <Link
                                    href="/student/login"
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                    <div className="text-center space-y-3">
                        <p className="text-xs text-slate-400">
                            Join the community of students landing their dream jobs.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-500">
                            <span>✓ Free Practice Sessions</span>
                            <span>✓ AI Feedback</span>
                            <span>✓ Progress Tracking</span>
                            <span>✓ Career Resources</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}