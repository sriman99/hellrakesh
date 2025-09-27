"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowLeft,
    User,
    Settings,
    Bell,
    Shield,
    Upload,
    Save,
    Trash2,
    LogOut,
    Award,
    Calendar,
    MapPin,
    Phone,
    Mail,
    GraduationCap,
    Target,
    Linkedin
} from "lucide-react"

interface StudentProfile {
    id: string
    email: string
    firstName: string
    lastName: string
    university?: string
    major?: string
    graduationYear?: number
    targetRole?: string
    phoneNumber?: string
    linkedinProfile?: string
    resumeUrl?: string
    profilePicture?: string
    subscriptionTier: string
    subscriptionExpires?: string
    practiceQuota: number
    practiceUsed: number
    quotaResetDate: string
    preferences: {
        emailNotifications: boolean
        practiceReminders: boolean
        reminderFrequency: string
        preferredDifficulty: string
        focusAreas: string[]
        language: string
        timezone: string
    }
    accountStatus: string
    isEmailVerified: boolean
    createdAt: string
    lastLoginAt?: string
    loginCount: number
}

export default function StudentProfilePage() {
    const [student, setStudent] = useState<StudentProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "account">("profile")
    const [hasChanges, setHasChanges] = useState(false)
    const [formData, setFormData] = useState<Partial<StudentProfile>>({})
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/student/profile')
            if (response.ok) {
                const data = await response.json()
                setStudent(data.student)
                setFormData(data.student)
            } else if (response.status === 401) {
                router.push('/student/login')
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
    }

    const handlePreferenceChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                emailNotifications: false,
                practiceReminders: false,
                reminderFrequency: 'weekly',
                preferredDifficulty: 'beginner',
                focusAreas: [],
                language: 'en',
                timezone: 'UTC',
                ...prev.preferences,
                [field]: value
            }
        }))
        setHasChanges(true)
    }

    const saveProfile = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/student/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const data = await response.json()
                setStudent(data.student)
                setFormData(data.student)
                setHasChanges(false)
                alert('Profile updated successfully!')
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error saving profile:', error)
            alert('Network error. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const logout = async () => {
        if (confirm('Are you sure you want to log out?')) {
            // Clear auth cookie
            document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            router.push('/student/login')
        }
    }

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear()
        const years = []
        for (let year = currentYear; year <= currentYear + 10; year++) {
            years.push(year.toString())
        }
        return years
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white">Loading profile...</div>
            </div>
        )
    }

    if (!student) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/student/dashboard')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                            <p className="text-slate-400 mt-2">
                                Manage your account information and preferences
                            </p>
                        </div>

                        {hasChanges && (
                            <Button
                                onClick={saveProfile}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile Header Card */}
                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-slate-700">
                                    {student.profilePicture ? (
                                        <img src={student.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-emerald-400" />
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 border-slate-700"
                                >
                                    <Upload className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white">
                                    {student.firstName} {student.lastName}
                                </h2>
                                <p className="text-slate-400">{student.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                                        {student.subscriptionTier}
                                    </Badge>
                                    <span className="text-sm text-slate-400">
                                        Member since {new Date(student.createdAt).getFullYear()}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    {student.practiceUsed}/{student.practiceQuota}
                                </div>
                                <div className="text-sm text-slate-400">Sessions this month</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
                    {[
                        { id: "profile", label: "Profile", icon: User },
                        { id: "preferences", label: "Preferences", icon: Settings },
                        { id: "account", label: "Account", icon: Shield }
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "default" : "ghost"}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="flex-1"
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Personal Information</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Update your personal details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName || ''}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="bg-slate-800/50 border-slate-700/50 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName || ''}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="bg-slate-800/50 border-slate-700/50 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ''}
                                        disabled
                                        className="bg-slate-800/30 border-slate-700/50 text-slate-400"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Email cannot be changed. Contact support if needed.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="phoneNumber" className="text-slate-300 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className="bg-slate-800/50 border-slate-700/50 text-white"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="linkedinProfile" className="text-slate-300 flex items-center gap-2">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn Profile
                                    </Label>
                                    <Input
                                        id="linkedinProfile"
                                        value={formData.linkedinProfile || ''}
                                        onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="bg-slate-800/50 border-slate-700/50 text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Information */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Academic & Career</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Your educational background and career goals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="university" className="text-slate-300 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        University/College
                                    </Label>
                                    <Input
                                        id="university"
                                        value={formData.university || ''}
                                        onChange={(e) => handleInputChange('university', e.target.value)}
                                        className="bg-slate-800/50 border-slate-700/50 text-white"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="major" className="text-slate-300">Major/Field of Study</Label>
                                    <Input
                                        id="major"
                                        value={formData.major || ''}
                                        onChange={(e) => handleInputChange('major', e.target.value)}
                                        className="bg-slate-800/50 border-slate-700/50 text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Expected Graduation Year
                                    </Label>
                                    <Select
                                        value={formData.graduationYear?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('graduationYear', parseInt(value))}
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
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

                                <div>
                                    <Label htmlFor="targetRole" className="text-slate-300 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Target Job Role
                                    </Label>
                                    <Input
                                        id="targetRole"
                                        value={formData.targetRole || ''}
                                        onChange={(e) => handleInputChange('targetRole', e.target.value)}
                                        className="bg-slate-800/50 border-slate-700/50 text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "preferences" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Notification Preferences */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Choose what notifications you'd like to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="emailNotifications"
                                        checked={formData.preferences?.emailNotifications || false}
                                        onCheckedChange={(checked: boolean | "indeterminate") =>
                                            handlePreferenceChange('emailNotifications', checked === true)
                                        }
                                    />
                                    <Label htmlFor="emailNotifications" className="text-slate-300">
                                        Email notifications
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="practiceReminders"
                                        checked={formData.preferences?.practiceReminders || false}
                                        onCheckedChange={(checked: boolean | "indeterminate") =>
                                            handlePreferenceChange('practiceReminders', checked === true)
                                        }
                                    />
                                    <Label htmlFor="practiceReminders" className="text-slate-300">
                                        Practice session reminders
                                    </Label>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Reminder Frequency</Label>
                                    <Select
                                        value={formData.preferences?.reminderFrequency || 'weekly'}
                                        onValueChange={(value) => handlePreferenceChange('reminderFrequency', value)}
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Practice Preferences */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Practice Settings</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Customize your practice experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">Preferred Difficulty</Label>
                                    <Select
                                        value={formData.preferences?.preferredDifficulty || 'beginner'}
                                        onValueChange={(value) => handlePreferenceChange('preferredDifficulty', value)}
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Language</Label>
                                    <Select
                                        value={formData.preferences?.language || 'en'}
                                        onValueChange={(value) => handlePreferenceChange('language', value)}
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-slate-300">Timezone</Label>
                                    <Select
                                        value={formData.preferences?.timezone || 'UTC'}
                                        onValueChange={(value) => handlePreferenceChange('timezone', value)}
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "account" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Status */}
                        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Account Status</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Your account information and subscription details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Email Verified</span>
                                    <Badge variant={student.isEmailVerified ? "default" : "destructive"}>
                                        {student.isEmailVerified ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Account Status</span>
                                    <Badge variant="default">
                                        {student.accountStatus}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Subscription</span>
                                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                                        {student.subscriptionTier}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Login Count</span>
                                    <span className="text-white">{student.loginCount}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Last Login</span>
                                    <span className="text-white">
                                        {student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-red-500/50 bg-red-500/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-red-400">Danger Zone</CardTitle>
                                <CardDescription className="text-red-300/70">
                                    Irreversible and destructive actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-white font-medium">Log Out</h4>
                                    <p className="text-sm text-slate-400">
                                        Sign out from your account on this device.
                                    </p>
                                    <Button
                                        onClick={logout}
                                        variant="outline"
                                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log Out
                                    </Button>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-red-500/20">
                                    <h4 className="text-white font-medium">Delete Account</h4>
                                    <p className="text-sm text-slate-400">
                                        Permanently delete your account and all associated data.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                        onClick={() => alert('Account deletion is not yet implemented')}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}