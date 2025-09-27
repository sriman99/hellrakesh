import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, UserCheck, Camera, GraduationCap } from "lucide-react"

interface PracticeWelcomeStepProps {
    candidateName: string
    templateTitle: string
    templateDescription: string
    questionsCount: number
    totalDuration: number
    onStartPractice: () => void
}

export default function PracticeWelcomeStep({
    candidateName,
    templateTitle,
    templateDescription,
    questionsCount,
    totalDuration,
    onStartPractice
}: PracticeWelcomeStepProps) {
    return (
        <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="w-12 h-12 text-blue-500 mr-3" />
                    <span className="text-blue-500 text-lg font-semibold">Practice Mode</span>
                </div>
                <h1 className="text-5xl font-bold gradient-text text-balance mb-4">
                    Welcome to Your Practice Session, {candidateName}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                    Practice makes perfect! Get ready to practice with the {templateTitle} template.
                </p>
            </div>

            <Card className="border-border/50 max-w-2xl mx-auto shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
                    <CardTitle className="text-2xl text-foreground">{templateTitle}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        {templateDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{totalDuration} min</p>
                                <p className="text-sm text-muted-foreground">Practice duration</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <UserCheck className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{questionsCount}</p>
                                <p className="text-sm text-muted-foreground">Questions to practice</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                <Camera className="w-8 h-8 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">Video</p>
                                <p className="text-sm text-muted-foreground">Practice responses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 rounded-xl p-6 border border-blue-500/20">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            What to expect in practice mode:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                You'll be asked to enable your camera and microphone
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                Practice questions will be presented one at a time
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                Each question has a time limit for your response
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                This is practice mode - no pressure, just learn!
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                You can retry this practice session anytime
                            </li>
                        </ul>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-500/90 hover:to-purple-500/90 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        onClick={onStartPractice}
                    >
                        Start Practice Session
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}