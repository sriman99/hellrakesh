import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function hashPassword(password) {
  // Use bcrypt to hash the password
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function generateUniqueInterviewLink() {
  // Generate a simple unique identifier for the interview link
  return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
}

async function seedDatabase() {
  let client; // Declare client variable here
  try {
    console.log("Starting database seeding...");

    // Connect to the database directly
    client = new MongoClient("mongodb+srv://vemunoorinaveen:xNtdAGnnloPmZijS@cluster0.sov7vd7.mongodb.net/");
    await client.connect();
    const db = client.db("humaneq-hr"); // Define db here

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("templates").deleteMany({});
    await db.collection("interviews").deleteMany({});
    await db.collection("students").deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const adminUser = {
      email: "admin@humaneqhr.com",
      password: adminPassword,
      role: "admin",
      name: "System Administrator",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const adminResult = await db.collection("users").insertOne(adminUser);
    console.log("Created admin user:", adminResult.insertedId);

    // Create demo company users
    const companyPassword = await hashPassword("company123");

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
    ];

    const companyIds = [];
    for (const company of companies) {
      const companyUser = {
        email: company.email,
        password: companyPassword,
        role: "company",
        name: company.name,
        companyName: company.companyName,
        interviewQuota: company.interviewQuota,
        interviewsUsed: company.interviewsUsed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("users").insertOne(companyUser);
      companyIds.push(result.insertedId);
      console.log(`Created company user: ${company.companyName}`);
    }

    // Create demo student users
    const studentPassword = await hashPassword("Student123!");

    const students = [
      {
        email: "john.doe@university.edu",
        firstName: "John",
        lastName: "Doe",
        university: "Stanford University",
        major: "Computer Science",
        graduationYear: 2026,
        targetRole: "Software Engineer",
        phoneNumber: "+1-555-0123",
        linkedinProfile: "https://linkedin.com/in/johndoe",
        subscriptionTier: "free",
        practiceQuota: 10,
        practiceUsed: 3,
        quotaResetDate: new Date(2025, 9, 1), // October 1, 2025
        preferences: {
          emailNotifications: true,
          practiceReminders: true,
          reminderFrequency: "weekly",
          preferredDifficulty: "intermediate",
          focusAreas: ["technical-interviews", "behavioral-questions"],
          language: "en",
          timezone: "America/Los_Angeles"
        },
        accountStatus: "active",
        isEmailVerified: true,
        loginCount: 15,
        lastLoginAt: new Date()
      },
      {
        email: "sarah.chen@mit.edu",
        firstName: "Sarah",
        lastName: "Chen",
        university: "MIT",
        major: "Data Science",
        graduationYear: 2025,
        targetRole: "Data Scientist",
        phoneNumber: "+1-555-0456",
        linkedinProfile: "https://linkedin.com/in/sarahchen",
        subscriptionTier: "premium",
        practiceQuota: 50,
        practiceUsed: 12,
        quotaResetDate: new Date(2025, 9, 1),
        subscriptionExpires: new Date(2026, 2, 15), // March 15, 2026
        preferences: {
          emailNotifications: true,
          practiceReminders: true,
          reminderFrequency: "daily",
          preferredDifficulty: "advanced",
          focusAreas: ["case-studies", "technical-interviews", "presentation-skills"],
          language: "en",
          timezone: "America/New_York"
        },
        accountStatus: "active",
        isEmailVerified: true,
        loginCount: 42,
        lastLoginAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        email: "alex.rodriguez@berkeley.edu",
        firstName: "Alex",
        lastName: "Rodriguez",
        university: "UC Berkeley",
        major: "Business Administration",
        graduationYear: 2025,
        targetRole: "Product Manager",
        phoneNumber: "+1-555-0789",
        subscriptionTier: "free",
        practiceQuota: 10,
        practiceUsed: 1,
        quotaResetDate: new Date(2025, 9, 1),
        preferences: {
          emailNotifications: false,
          practiceReminders: true,
          reminderFrequency: "weekly",
          preferredDifficulty: "beginner",
          focusAreas: ["behavioral-questions", "case-studies"],
          language: "en",
          timezone: "America/Los_Angeles"
        },
        accountStatus: "active",
        isEmailVerified: false,
        loginCount: 5,
        lastLoginAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    const studentIds = [];
    for (const student of students) {
      const studentDoc = {
        ...student,
        password: studentPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("students").insertOne(studentDoc);
      studentIds.push(result.insertedId);
      console.log(`Created student user: ${student.firstName} ${student.lastName} (${student.email})`);
    }

    // Create some practice sessions for students
    const practiceSessions = [
      {
        studentId: studentIds[0],
        templateTitle: "Software Engineer Mock Interview",
        sessionType: "technical-interview",
        difficulty: "intermediate",
        duration: 1800, // 30 minutes
        score: 78,
        feedback: "Good technical knowledge, work on communication clarity",
        completedAt: new Date(Date.now() - 86400000),
        responses: [
          {
            question: "Explain the difference between let, const, and var in JavaScript",
            answer: "let and const are block-scoped while var is function-scoped...",
            score: 85
          }
        ]
      },
      {
        studentId: studentIds[1],
        templateTitle: "Data Science Case Study",
        sessionType: "case-study",
        difficulty: "advanced",
        duration: 2700, // 45 minutes
        score: 92,
        feedback: "Excellent analytical thinking and presentation skills",
        completedAt: new Date(Date.now() - 172800000), // 2 days ago
        responses: [
          {
            question: "How would you approach analyzing customer churn for a SaaS company?",
            answer: "I would start by defining churn metrics, then analyze cohort data...",
            score: 94
          }
        ]
      }
    ];

    for (const session of practiceSessions) {
      const sessionDoc = {
        ...session,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("practice_sessions").insertOne(sessionDoc);
      console.log(`Created practice session for student: ${session.templateTitle}`);
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
            timeLimit: 120,
            required: true,
          },
          {
            id: "2",
            type: "video",
            question: "Explain how you would approach debugging a complex issue in production.",
            timeLimit: 120,
            required: true,
          },
          {
            id: "3",
            type: "text",
            question: "Describe a challenging project you worked on and how you overcame obstacles.",
            timeLimit: 120,
            required: true,
          },
        ],
        estimatedDuration: 6, // 3 questions × 2 minutes each
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
            timeLimit: 120,
            required: true,
          },
          {
            id: "2",
            type: "text",
            question: "Describe your experience with user research and data analysis.",
            timeLimit: 120,
            required: true,
          },
        ],
        estimatedDuration: 4, // 2 questions × 2 minutes each
      },
      {
        companyId: companyIds[1],
        title: "Python Developer Interview",
        description: "Technical interview for Python development positions",
        questions: [
          {
            id: "1",
            type: "video",
            question: "Explain the difference between Python lists and tuples. When would you use each one?",
            timeLimit: 120,
            required: true,
          },
          {
            id: "2",
            type: "text",
            question: "Describe your experience with Python frameworks like Django, Flask, or FastAPI.",
            timeLimit: 120,
            required: true,
          },
          {
            id: "3",
            type: "video",
            question: "How would you optimize a slow Python script? Walk us through your debugging process.",
            timeLimit: 120,
            required: true,
          },
          {
            id: "4",
            type: "text",
            question: "Explain Python's GIL (Global Interpreter Lock) and how it affects multithreading.",
            timeLimit: 120,
            required: true,
          },
        ],
        estimatedDuration: 8, // 4 questions × 2 minutes each
      },
    ];

    // Note: Templates with agents should be created via API calls after seeding
    // For now, we'll create basic templates without agents for demo purposes
    // After seeding, create templates through the web interface to get ElevenLabs agents

    const templateIds = [];
    for (const template of templates) {
      const templateDoc = {
        ...template,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // agentId will be added when templates are created through the API
      };

      const result = await db.collection("templates").insertOne(templateDoc);
      templateIds.push(result.insertedId);
      console.log(`Created template: ${template.title} (Note: Create via web interface to add ElevenLabs agent)`);
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
        companyId: companyIds[0],
        templateId: templateIds[0],
        candidateName: "David Wilson",
        candidateEmail: "david.wilson@email.com",
        status: "in-progress",
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
      {
        companyId: companyIds[1],
        templateId: templateIds[2],
        candidateName: "Emma Thompson",
        candidateEmail: "emma.thompson@email.com",
        status: "pending",
        responses: [],
      },
      {
        companyId: companyIds[2],
        templateId: templateIds[0],
        candidateName: "Frank Miller",
        candidateEmail: "frank.miller@email.com",
        status: "in-progress",
        responses: [],
      },
    ];

    for (const interview of interviews) {
      const interviewDoc = {
        ...interview,
        uniqueLink: generateUniqueInterviewLink(),
        ...(interview.status === "completed" && {
          startedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 82800000), // 23 hours ago
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("interviews").insertOne(interviewDoc);
      console.log(`Created interview for: ${interview.candidateName}`);
    }

    console.log("\n=== DEMO CREDENTIALS ===");
    console.log("Admin Login:");
    console.log("Email: admin@humaneqhr.com");
    console.log("Password: admin123");
    console.log("\nCompany Logins:");
    console.log("Email: demo@techcorp.com | Password: company123");
    console.log("Email: hr@innovatetech.com | Password: company123");
    console.log("Email: recruiter@startupxyz.com | Password: company123");
    console.log("\nStudent Logins:");
    console.log("Email: john.doe@university.edu | Password: Student123!");
    console.log("Email: sarah.chen@mit.edu | Password: Student123!");
    console.log("Email: alex.rodriguez@berkeley.edu | Password: Student123!");
    console.log("========================\n");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    if (client) {
      await client.close(); // Ensure the database connection is closed
    }
  }
}

// Run the seed function
seedDatabase();
