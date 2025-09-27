import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, BookOpen } from "lucide-react"

interface StudentData {
    id: string
    email: string
    firstName: string
    lastName: string
    major: string
    university: string
    graduationYear: number
}

interface DashboardHeaderProps {
    student: StudentData
}

export function DashboardHeader({ student }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {student.firstName}!
                </h1>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {student.major}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 hover:bg-blue-900/70">
                        <Target className="w-4 h-4 mr-1" />
                        {student.university}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900/70">
                        <Trophy className="w-4 h-4 mr-1" />
                        Class of {student.graduationYear}
                    </Badge>
                </div>
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={() => window.location.href = '/student/practice'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    Start Practice
                </Button>
                <Button
                    onClick={() => window.location.href = '/student/profile'}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                    View Profile
                </Button>
            </div>
        </div>
    )
}