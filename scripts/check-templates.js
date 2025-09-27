require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkTemplates() {
  let client;
  try {
    console.log("Connecting to database...");

    // Connect to the database
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("humaneq-hr");

    // Get all templates
    const templates = await db.collection("templates").find({}).toArray();

    console.log(`\n=== TEMPLATES IN DATABASE ===`);
    console.log(`Total templates found: ${templates.length}\n`);

    // Check student accessibility
    const studentAccessibleTemplates = templates.filter(t =>
      t.isActive && (t.isPublic === true || t.practiceAllowed === true)
    );

    console.log(`Templates accessible to students: ${studentAccessibleTemplates.length}\n`);

    templates.forEach((template, index) => {
      const accessible = template.isActive && (template.isPublic === true || template.practiceAllowed === true);
      console.log(`${index + 1}. Template ID: ${template._id}`);
      console.log(`   Title: ${template.title}`);
      console.log(`   Description: ${template.description}`);
      console.log(`   Questions: ${template.questions?.length || 0}`);
      console.log(`   Company ID: ${template.companyId}`);
      console.log(`   Agent ID: ${template.agentId || 'NOT SET'}`);
      console.log(`   Is Active: ${template.isActive ?? 'undefined'}`);
      console.log(`   Is Public: ${template.isPublic ?? 'undefined'}`);
      console.log(`   Practice Allowed: ${template.practiceAllowed ?? 'undefined'}`);
      console.log(`   Student Accessible: ${accessible ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${template.createdAt}`);
      console.log(`   ---`);
    });

    // Also check which company owns which templates
    const users = await db.collection("users").find({ role: "company" }).toArray();
    console.log(`\n=== COMPANY USERS ===`);
    users.forEach((user, index) => {
      const userTemplates = templates.filter(t => t.companyId.toString() === user._id.toString());
      console.log(`${index + 1}. Company: ${user.companyName} (${user.email})`);
      console.log(`   Templates: ${userTemplates.map(t => t.title).join(', ') || 'None'}`);
      console.log(`   ---`);
    });

    // Recommendations
    console.log(`\n=== RECOMMENDATIONS FOR STUDENT PRACTICE ===`);
    if (templates.length === 0) {
      console.log('❌ No templates exist. Need to create templates first.');
    } else if (studentAccessibleTemplates.length === 0) {
      console.log('❌ Templates exist but none are accessible to students.');
      console.log('💡 Solution: Set isPublic=true OR practiceAllowed=true on existing templates.');
      console.log('💡 Or create new templates specifically for student practice.');
    } else {
      console.log('✅ Templates are available for students.');
      console.log('🔍 If students still see "no templates", check:');
      console.log('  - API response in browser dev tools');
      console.log('  - Student authentication (JWT token)');
      console.log('  - Frontend template fetching logic');
    }

  } catch (error) {
    console.error("Error checking templates:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the check
checkTemplates();
