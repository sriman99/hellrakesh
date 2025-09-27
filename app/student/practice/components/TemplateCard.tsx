import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Play, Star, BookOpen, Target } from "lucide-react"

interface Template {
    _id: string
    title: string
    description: string
    estimatedDuration: number
    difficulty: "beginner" | "intermediate" | "advanced"
    category: string
    questionCount: number
}

interface TemplateCardProps {
    template: Template
    onStartInterview: (templateId: string) => void
    disabled: boolean
}

export default function TemplateCard({ template, onStartInterview, disabled }: TemplateCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            case "intermediate":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            case "advanced":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case "technical":
                return <Target className="w-4 h-4" />
            case "behavioral":
                return <Users className="w-4 h-4" />
            case "case study":
                return <BookOpen className="w-4 h-4" />
            default:
                return <Star className="w-4 h-4" />
        }
    }

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <Badge variant="outline" className="border-slate-600">
                            {template.category}
                        </Badge>
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                    </Badge>
                </div>
                <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
                    {template.title}
                </CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2">
                    {template.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{template.estimatedDuration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{template.questionCount} questions</span>
                    </div>
                </div>

                <Button
                    onClick={() => onStartInterview(template._id)}
                    disabled={disabled}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Start Interview
                </Button>
            </CardContent>
        </Card>
    )
}