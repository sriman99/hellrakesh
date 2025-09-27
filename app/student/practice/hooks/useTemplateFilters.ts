import { useState, useEffect } from "react"

interface Template {
    _id: string
    title: string
    description: string
    estimatedDuration: number
    difficulty: "beginner" | "intermediate" | "advanced"
    category: string
    questionCount: number
}

export function useTemplateFilters(templates: Template[]) {
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedDifficulty, setSelectedDifficulty] = useState("all")
    const [selectedDuration, setSelectedDuration] = useState("all")

    useEffect(() => {
        filterTemplates()
    }, [templates, searchTerm, selectedCategory, selectedDifficulty, selectedDuration])

    const filterTemplates = () => {
        let filtered = templates

        if (searchTerm) {
            filtered = filtered.filter(template =>
                template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(template => template.category === selectedCategory)
        }

        if (selectedDifficulty !== "all") {
            filtered = filtered.filter(template => template.difficulty === selectedDifficulty)
        }

        if (selectedDuration !== "all") {
            const maxDuration = parseInt(selectedDuration)
            filtered = filtered.filter(template => template.estimatedDuration <= maxDuration)
        }

        setFilteredTemplates(filtered)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setSelectedCategory("all")
        setSelectedDifficulty("all")
        setSelectedDuration("all")
    }

    const categories = [...new Set(templates.map(t => t.category))]

    return {
        filteredTemplates,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        selectedDifficulty,
        setSelectedDifficulty,
        selectedDuration,
        setSelectedDuration,
        clearFilters,
        categories
    }
}