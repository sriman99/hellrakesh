require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkAgents() {
    let client;
    try {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("humaneq-hr");

        console.log("=== CHECKING TEMPLATE AGENTS ===\n");

        const templates = await db.collection("templates").find({}).toArray();

        templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.title}`);
            console.log(`   Agent ID: ${template.agentId || 'NOT SET'}`);
            console.log(`   Student Accessible: ${template.isActive && (template.isPublic || template.practiceAllowed) ? 'YES' : 'NO'}`);
            console.log('');
        });

        const templatesWithoutAgents = templates.filter(t => !t.agentId);
        console.log(`Templates missing agents: ${templatesWithoutAgents.length}/${templates.length}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) await client.close();
    }
}

checkAgents();