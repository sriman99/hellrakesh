import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface TemplateFiltersProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    selectedCategory: string
    setSelectedCategory: (value: string) => void
    selectedDifficulty: string
    setSelectedDifficulty: (value: string) => void
    selectedDuration: string
    setSelectedDuration: (value: string) => void
    categories: string[]
}

export default function TemplateFilters({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedDuration,
    setSelectedDuration,
    categories
}: TemplateFiltersProps) {
    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Templates
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                            <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Duration</SelectItem>
                            <SelectItem value="15">Under 15 min</SelectItem>
                            <SelectItem value="30">Under 30 min</SelectItem>
                            <SelectItem value="45">Under 45 min</SelectItem>
                            <SelectItem value="60">Under 1 hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}