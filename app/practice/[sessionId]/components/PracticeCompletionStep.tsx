import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, GraduationCap, Trophy, Target } from "lucide-react"

interface PracticeCompletionStepProps {
    templateTitle: string
    questionsCount: number
    totalDuration: number
    onBackToDashboard: () => void
}

export default function PracticeCompletionStep({
    templateTitle,
    questionsCount,
    totalDuration,
    onBackToDashboard
}: PracticeCompletionStepProps) {
    return (
        <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="w-12 h-12 text-blue-500 mr-3" />
                    <span className="text-blue-500 text-lg font-semibold">Practice Complete!</span>
                </div>
                <div className="text-green-400 text-8xl mb-6 animate-bounce">
                    <Trophy className="w-24 h-24 mx-auto" />
                </div>
                <h1 className="text-5xl font-bold gradient-text text-balance mb-4">
                    Great Job!
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                    You've successfully completed the practice session for "{templateTitle}".
                    Every practice session helps you improve!
                </p>
            </div>

            <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-t-lg">
                    <CardTitle className="text-2xl text-foreground flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 mr-3 text-green-500" />
                        Practice Session Summary
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Here's what you accomplished in this practice session
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Target className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{questionsCount}</p>
                                <p className="text-sm text-muted-foreground">Questions practiced</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <CheckCircle className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">100%</p>
                                <p className="text-sm text-muted-foreground">Session completed</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Trophy className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">Practice</p>
                                <p className="text-sm text-muted-foreground">Experience gained</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 rounded-xl p-6 border border-blue-500/20">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            What's next?
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                Practice more templates to improve your skills
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                Try the same template again with different approaches
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                Review your performance and identify areas for improvement
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                When ready, apply for real interviews with confidence!
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-500/90 hover:to-purple-500/90"
                            onClick={onBackToDashboard}
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}