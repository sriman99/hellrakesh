import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface StudentQuota {
    practiceUsed: number
    practiceQuota: number
    remainingSessions: number
}

interface PracticeHeaderProps {
    templateCount: number
    studentQuota: StudentQuota | null
}

export default function PracticeHeader({ templateCount, studentQuota }: PracticeHeaderProps) {
    const router = useRouter()

    return (
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
                    <h1 className="text-3xl font-bold text-white">Start Interview</h1>
                    <p className="text-slate-400 mt-2">
                        Choose from {templateCount} available interview templates
                    </p>
                </div>

                {studentQuota && (
                    <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-emerald-500" />
                                    <span className="text-white font-medium">
                                        {studentQuota.remainingSessions} sessions left
                                    </span>
                                </div>
                                <div className="text-sm text-slate-400">
                                    {studentQuota.practiceUsed}/{studentQuota.practiceQuota} used
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}