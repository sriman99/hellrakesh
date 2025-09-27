"use client"

import { useStudentTemplates } from "./hooks/useStudentTemplates"
import { useTemplateFilters } from "./hooks/useTemplateFilters"
import PracticeHeader from "./components/PracticeHeader"
import TemplateFilters from "./components/TemplateFilters"
import QuotaWarning from "./components/QuotaWarning"
import TemplateCard from "./components/TemplateCard"
import EmptyState from "./components/EmptyState"

export default function StudentPracticePage() {
    const { templates, studentQuota, isLoading, startInterview } = useStudentTemplates()
    const {
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
    } = useTemplateFilters(templates)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white">Loading templates...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <PracticeHeader templateCount={templates.length} studentQuota={studentQuota} />

                <TemplateFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                    selectedDuration={selectedDuration}
                    setSelectedDuration={setSelectedDuration}
                    categories={categories}
                />

                {studentQuota && <QuotaWarning studentQuota={studentQuota} />}

                {filteredTemplates.length === 0 ? (
                    <EmptyState onClearFilters={clearFilters} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template._id}
                                template={template}
                                onStartInterview={startInterview}
                                disabled={!studentQuota || studentQuota.remainingSessions <= 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}