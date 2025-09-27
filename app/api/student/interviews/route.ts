import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/utils/studentAuth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDatabase()

        // Find all interviews where this student is the candidate
        const interviews = await db.collection('interviews').find({
            candidateEmail: student.email
        }).toArray()

        return NextResponse.json({ interviews })
    } catch (error) {
        console.error('Error fetching student interviews:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}