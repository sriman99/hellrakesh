/**
 * Complete verification script for all fixes
 * Tests authentication, logout, interview creation, and fetching
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Complete Authentication and Interview Fixes\n')

// Check all authentication endpoints exist and are properly configured
const authEndpoints = [
    'app/api/interviews/route.ts',
    'app/api/interviews/[id]/route.ts',
    'app/api/student/profile/route.ts',
    'app/api/auth/logout/route.ts',
    'app/api/student/auth/logout/route.ts'
]

console.log('📂 Checking authentication endpoints:')
authEndpoints.forEach(endpoint => {
    const fullPath = path.join(process.cwd(), endpoint)
    const exists = fs.existsSync(fullPath)
    console.log(`${exists ? '✅' : '❌'} ${endpoint}`)

    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8')

        // Check for proper authentication usage
        if (endpoint.includes('interviews/route.ts')) {
            const hasAuthFunction = content.includes('authenticateAndDetectRole')
            const hasRoleDetection = content.includes('role:')
            const hasQuotaCheck = content.includes('quotaUsed')
            console.log(`   🔐 Auth function: ${hasAuthFunction ? '✅' : '❌'}`)
            console.log(`   👤 Role detection: ${hasRoleDetection ? '✅' : '❌'}`)
            console.log(`   📊 Quota checking: ${hasQuotaCheck ? '✅' : '❌'}`)
        }

        if (endpoint.includes('logout')) {
            const clearsCompanyToken = content.includes('removeAuthCookie')
            const clearsStudentToken = content.includes('removeStudentAuthCookie')
            console.log(`   🍪 Clears company token: ${clearsCompanyToken ? '✅' : '❌'}`)
            console.log(`   🍪 Clears student token: ${clearsStudentToken ? '✅' : '❌'}`)
        }

        if (endpoint.includes('student/profile')) {
            const usesStudentAuth = content.includes('getCurrentStudent')
            console.log(`   👩‍🎓 Uses student auth: ${usesStudentAuth ? '✅' : '❌'}`)
        }
    }
    console.log()
})

// Check frontend hooks are updated
console.log('🎨 Checking frontend hooks:')
const frontendFiles = [
    'app/interview/[id]/hooks/useInterviewData.ts',
    'app/company/dashboard/page.tsx'
]

frontendFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file)
    const exists = fs.existsSync(fullPath)
    console.log(`${exists ? '✅' : '❌'} ${file}`)

    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8')

        if (file.includes('useInterviewData')) {
            const usesUnifiedEndpoint = content.includes('/api/interviews/')
            console.log(`   🔗 Uses unified endpoint: ${usesUnifiedEndpoint ? '✅' : '❌'}`)
        }

        if (file.includes('company/dashboard')) {
            const fetchesInterviews = content.includes('/api/interviews')
            console.log(`   📊 Fetches interviews: ${fetchesInterviews ? '✅' : '❌'}`)
        }
    }
    console.log()
})

// Check authentication utilities
console.log('🛠️ Checking authentication utilities:')
const authUtils = [
    'lib/auth.ts',
    'lib/utils/studentAuth.ts'
]

authUtils.forEach(util => {
    const fullPath = path.join(process.cwd(), util)
    const exists = fs.existsSync(fullPath)
    console.log(`${exists ? '✅' : '❌'} ${util}`)

    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8')

        if (util.includes('lib/auth.ts')) {
            const hasGetCurrentUser = content.includes('getCurrentUser')
            const hasRemoveCompanyToken = content.includes('removeAuthCookie')

            console.log(`   👤 getCurrentUser: ${hasGetCurrentUser ? '✅' : '❌'}`)
            console.log(`   � removeAuthCookie: ${hasRemoveCompanyToken ? '✅' : '❌'}`)
        }

        if (util.includes('studentAuth.ts')) {
            const hasGetCurrentStudent = content.includes('getCurrentStudent')
            const hasRemoveStudentToken = content.includes('removeStudentAuthCookie')

            console.log(`   👩‍� getCurrentStudent: ${hasGetCurrentStudent ? '✅' : '❌'}`)
            console.log(`   🍪 removeStudentAuthCookie: ${hasRemoveStudentToken ? '✅' : '❌'}`)
        }
    }
    console.log()
})

// Check environment configuration
console.log('⚙️ Checking environment configuration:')
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const hasMongoUri = envContent.includes('MONGODB_URI')
    const hasJwtSecret = envContent.includes('JWT_SECRET')
    const hasElevenLabsKey = envContent.includes('ELEVENLABS_API_KEY')

    console.log(`✅ .env file exists`)
    console.log(`   🗄️ MongoDB URI: ${hasMongoUri ? '✅' : '❌'}`)
    console.log(`   🔐 JWT Secret: ${hasJwtSecret ? '✅' : '❌'}`)
    console.log(`   🎤 ElevenLabs API Key: ${hasElevenLabsKey ? '✅' : '❌'}`)
} else {
    console.log(`❌ .env file missing`)
}
console.log()

console.log('🏁 Verification Summary:')
console.log('• All authentication endpoints should exist and have proper auth checks')
console.log('• Logout endpoints should clear both company and student tokens')
console.log('• Frontend hooks should use unified interview endpoints')
console.log('• Authentication utilities should support both user types')
console.log('• Environment should have all required configuration')
console.log()
console.log('🧪 Next Steps for Testing:')
console.log('1. Test student login and interview creation')
console.log('2. Test company login and interview creation')
console.log('3. Test that company dashboard only shows company interviews')
console.log('4. Test logout clears tokens properly')
console.log('5. Verify MongoDB connection works')