const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 
const fs = require('fs');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const input = require('input'); // npm i input
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const sessionString = process.env.TELEGRAM_SESSION ? process.env.TELEGRAM_SESSION.trim() : '';
const stringSession = new StringSession(sessionString); 
const targetGroup = process.env.TELEGRAM_GROUP;

if (!apiId || !apiHash) {
    console.error("Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in your .env file.");
    process.exit(1);
}

async function extractRitualFromMessage(messageText, timestampSeconds) {
    if (!messageText) return null;
    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY is not set in .env!");
        return null;
    }

    // Convert Telegram timestamp (seconds) to formatted time string (e.g., "06:30 PM")
    const date = new Date(timestampSeconds * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const messageTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    try {
        const systemPrompt = `
You are an AI assistant that extracts daily temple rituals from text messages.
The messages will be written in the Odia language.
Extract ANY and ALL temple activities, duties, or 'Niti' (e.g. Alata Lagi, Mailam, Bhitar Shodha, Puja, Dhupa). These are ALL valid rituals!

Translation Rules:
1. DO NOT translate cultural ritual names into literal English (e.g. do NOT use "Incense Worship" or "Sun Worship").
2. Instead, TRANSLITERATE the Odia ritual name into English characters (e.g., "Sakala Dhupa", "Mangala Alati", "Surya Puja", "Tera Padila").
3. ALWAYS include the status if mentioned in the message (e.g., "Sakala Dhupa (Started)", "Sakala Dhupa (Tera Padila)", "Sakala Dhupa (Completed)").
4. STRICT ACCURACY: Do NOT guess or hallucinate ritual names based on matching keywords! If the message says "Bhitara Katha Darshan Banda", translate it as "Bhitara Katha Darshan (Closed)" or "Besha (Completed)", NOT "Bhitar Shodha". Read the actual action happening.

For the 'time', if a time is mentioned in the text, use that. Otherwise, use this exact timestamp: "${messageTime}".

ONLY return null if the message is PURELY a greeting (e.g., "Jai Jagannath") or PURELY a date header with no activity mentioned.
If it mentions ANY temple activity starting or completing, it is a valid ritual!

IMPORTANT: Your response MUST be valid JSON and ONLY JSON. No conversational text.
Format: { "name": "Ritual Name in English", "time": "Time string" }
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Message:\n"${messageText}"` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("❌ Groq API Error:", data.error.message || data.error);
            return null;
        }

        const resultText = data.choices?.[0]?.message?.content;
        if (!resultText) return null;
        
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("❌ Failed to parse JSON from Groq:", resultText);
            return null;
        }

        if (result && result.name && result.name !== "null" && result.name !== null) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("❌ Error communicating with Groq API:", error.message);
        return null;
    }
}

async function saveRitualToDb(ritual) {
    try {
        const newRitual = await prisma.dailyRitual.create({
            data: {
                name: ritual.name,
                time: ritual.time,
                icon: "fas fa-sun",
                status: "Active"
            }
        });
        console.log("✅ Successfully saved to database:", newRitual);
    } catch (error) {
        console.error("❌ Database error:", error);
    }
}

(async () => {
    console.log("Starting Telegram Agent...");
    
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text('Please enter your number (e.g., +1234567890): '),
        password: async () => await input.password('Please enter your password (if 2FA enabled): '),
        phoneCode: async () => await input.text('Please enter the code you received: '),
        onError: (err) => console.log(err),
    });

    console.log("You are now connected to Telegram!");

    // Save session string so user doesn't have to log in again
    const sessionStr = client.session.save();
    if (!process.env.TELEGRAM_SESSION) {
        console.log('\n\n======================================================');
        console.log('IMPORTANT: Copy the string below and paste it into your .env file as TELEGRAM_SESSION=');
        console.log(sessionStr);
        console.log('======================================================\n\n');
    }

    // --- Fetch today's historical messages ---
    if (targetGroup) {
        console.log(`Looking for group '${targetGroup}' to fetch today's messages...`);
        const dialogs = await client.getDialogs();
        const chat = dialogs.find(d => 
            (d.title && d.title.toLowerCase().includes(targetGroup.toLowerCase())) || 
            (d.entity && d.entity.username && d.entity.username.toLowerCase() === targetGroup.toLowerCase())
        );

        if (chat) {
            console.log(`✅ Found group: ${chat.title}. Fetching missed messages...`);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            
            // Determine the timestamp to start from
            const timestampFile = path.join(__dirname, '../../.telegram_last_timestamp');
            let lastTimestamp = Math.floor(today.getTime() / 1000);
            
            if (fs.existsSync(timestampFile)) {
                const savedTimestamp = parseInt(fs.readFileSync(timestampFile, 'utf8'));
                if (!isNaN(savedTimestamp)) {
                    // Start from the later of (start of today) OR (last saved timestamp)
                    lastTimestamp = Math.max(lastTimestamp, savedTimestamp);
                }
            }

            // Get last 50 messages to catch up
            const messages = await client.getMessages(chat.entity, { limit: 50 });
            // Reverse so we process oldest messages first
            for (const msg of messages.reverse()) { 
                if (!msg.message || msg.date <= lastTimestamp) continue;
                
                console.log(`\n📥 Historical message from today: ${msg.message.substring(0, 50)}...`);
                console.log("🤖 Processing message with Groq AI...");
                const ritual = await extractRitualFromMessage(msg.message, msg.date);

                if (ritual) {
                    console.log("✨ Ritual found:", ritual);
                    await saveRitualToDb(ritual);
                } else {
                    console.log("❌ No ritual detected in this message.");
                }
                
                // Update timestamp after processing
                fs.writeFileSync(timestampFile, msg.date.toString());
            }
        } else {
            console.log(`❌ Could not find group '${targetGroup}' in your chat list. Check the name in .env`);
        }
    }

    console.log(`\n▶️ Listening for NEW messages from: ${targetGroup || "ALL groups"}`);

    client.addEventHandler(async (event) => {
        const message = event.message;
        
        // Let's get the chat name to filter
        const chat = await message.getChat();
        const chatName = chat.title || chat.username || "";

        // If a target group is set, ignore messages from other groups
        if (targetGroup) {
            const matchesGroup = chatName.toLowerCase().includes(targetGroup.toLowerCase()) || 
                                 (chat.username && chat.username.toLowerCase() === targetGroup.toLowerCase());
            
            if (!matchesGroup) return;
        }

        console.log(`\n📥 Received message in [${chatName}]:`);
        console.log(`Text: ${message.message?.substring(0, 50)}...`);

        if (!message.message) return; // Skip non-text messages (e.g. photos without captions)

        console.log("🤖 Processing message with Groq AI...");
        const ritual = await extractRitualFromMessage(message.message, message.date);

        if (ritual) {
            console.log("✨ Ritual found:", ritual);
            await saveRitualToDb(ritual);
        } else {
            console.log("❌ No ritual detected in this message.");
        }
        
        // Update the timestamp
        const timestampFile = path.join(__dirname, '../../.telegram_last_timestamp');
        fs.writeFileSync(timestampFile, message.date.toString());

    }, new NewMessage({}));
})();
