import { MongoClient } from "mongodb"
import { hashPassword } from "../lib/auth"
import type { User } from "../lib/models/User"
import type { Template } from "../lib/models/Template"
import type { Interview } from "../lib/models/Interview"
import { generateUniqueInterviewLink } from "../lib/utils/generateLink"

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Connect to the database directly
    const client = new MongoClient("mongodb://localhost:27017") // Replace with your MongoDB URI if different
    await client.connect()
    const db = client.db("humaneqhr") // Replace with your database name

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("templates").deleteMany({})
    await db.collection("interviews").deleteMany({})

    console.log("Cleared existing data")

    // Create admin user
    const adminPassword = await hashPassword("admin123")
    const adminUser: Omit<User, "_id"> = {
      email: "admin@humaneqhr.com",
      password: adminPassword,
      role: "admin",
      name: "System Administrator",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const adminResult = await db.collection<User>("users").insertOne(adminUser)
    console.log("Created admin user:", adminResult.insertedId)

    // Create demo company users
    const companyPassword = await hashPassword("company123")

    const companies = [
      {
        email: "demo@techcorp.com",
        name: "John Smith",
        companyName: "TechCorp Solutions",
        interviewQuota: 200, // Increased from 50
        interviewsUsed: 12,
      },
      {
        email: "hr@innovatetech.com",
        name: "Sarah Johnson",
        companyName: "InnovateTech",
        interviewQuota: 150, // Increased from 25
        interviewsUsed: 8,
      },
      {
        email: "recruiter@startupxyz.com",
        name: "Mike Davis",
        companyName: "StartupXYZ",
        interviewQuota: 100, // Increased from 15
        interviewsUsed: 3,
      },
    ]

    const companyIds = []
    for (const company of companies) {
      const companyUser: Omit<User, "_id"> = {
        email: company.email,
        password: companyPassword,
        role: "company",
        name: company.name,
        companyName: company.companyName,
        interviewQuota: company.interviewQuota,
        interviewsUsed: company.interviewsUsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection<User>("users").insertOne(companyUser)
      companyIds.push(result.insertedId)
      console.log(`Created company user: ${company.companyName}`)
    }

    // Create demo templates
    const templates = [
      {
        companyId: companyIds[0],
        title: "Software Engineer Interview",
        description: "Technical interview for software engineering positions",
        questions: [
          {
            id: "1",
            type: "text",
            question: "Tell us about your experience with JavaScript and React.",
            timeLimit: 300,
            required: true,
          },
          {
            id: "2",
            type: "video",
            question: "Explain how you would approach debugging a complex issue in production.",
            timeLimit: 600,
            required: true,
          },
          {
            id: "3",
            type: "text",
            question: "Describe a challenging project you worked on and how you overcame obstacles.",
            timeLimit: 400,
            required: true,
          },
        ],
        estimatedDuration: 25,
      },
      {
        companyId: companyIds[1],
        title: "Product Manager Interview",
        description: "Interview template for product management roles",
        questions: [
          {
            id: "1",
            type: "video",
            question: "How do you prioritize features in a product roadmap?",
            timeLimit: 480,
            required: true,
          },
          {
            id: "2",
            type: "text",
            question: "Describe your experience with user research and data analysis.",
            timeLimit: 360,
            required: true,
          },
        ],
        estimatedDuration: 15,
      },
    ]

    const templateIds = []
    for (const template of templates) {
      const templateDoc: Omit<Template, "_id"> = {
        ...template,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection<Template>("templates").insertOne(templateDoc)
      templateIds.push(result.insertedId)
      console.log(`Created template: ${template.title}`)
    }

    // Create demo interviews
    const interviews = [
      {
        companyId: companyIds[0],
        templateId: templateIds[0],
        candidateName: "Alice Johnson",
        candidateEmail: "alice.johnson@email.com",
        status: "completed",
        score: 85,
        responses: [
          {
            questionId: "1",
            response: "I have 5 years of experience with JavaScript and 3 years with React...",
            duration: 280,
            timestamp: new Date(),
          },
        ],
      },
      {
        companyId: companyIds[0],
        templateId: templateIds[0],
        candidateName: "Bob Smith",
        candidateEmail: "bob.smith@email.com",
        status: "pending",
        responses: [],
      },
      {
        companyId: companyIds[1],
        templateId: templateIds[1],
        candidateName: "Carol Davis",
        candidateEmail: "carol.davis@email.com",
        status: "completed",
        score: 92,
        responses: [
          {
            questionId: "1",
            response: "I prioritize features based on user impact, business value, and technical feasibility...",
            duration: 450,
            timestamp: new Date(),
          },
        ],
      },
    ]

    for (const interview of interviews) {
      const interviewDoc: Omit<Interview, "_id"> = {
        ...interview,
        uniqueLink: generateUniqueInterviewLink(),
        ...(interview.status === "completed" && {
          startedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 82800000), // 23 hours ago
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection<Interview>("interviews").insertOne(interviewDoc)
      console.log(`Created interview for: ${interview.candidateName}`)
    }

    console.log("\n=== DEMO CREDENTIALS ===")
    console.log("Admin Login:")
    console.log("Email: admin@humaneqhr.com")
    console.log("Password: admin123")
    console.log("\nCompany Logins:")
    console.log("Email: demo@techcorp.com | Password: company123")
    console.log("Email: hr@innovatetech.com | Password: company123")
    console.log("Email: recruiter@startupxyz.com | Password: company123")
    console.log("========================\n")

    console.log("Database seeding completed successfully!")
    await client.close() // Close the database connection
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seedDatabase()
