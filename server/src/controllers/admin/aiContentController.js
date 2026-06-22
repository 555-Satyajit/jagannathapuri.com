const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.apiGenerateLibraryContent = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const prompt = `You are an expert content writer and researcher for a spiritual library website called "Jagannathapuri". 
You have been given the following topic or request: "${topic}".

If the request asks for lyrics, mantras, or stotras (e.g., "Hanuman chalisa in hindi"):
- Provide the exact, accurate lyrics/text in the requested language.
- Format the lyrics beautifully in HTML for the "content" field. Use <div style="text-align: center;"> and <p> with <br> for line breaks to separate stanzas elegantly.
- Do not write an article, just provide the pure lyrics with maybe a short introductory paragraph.

If it is a general topic (e.g., "History of the Temple"):
- Generate a comprehensive, engaging, and spiritually rich article.
- Use <h2>, <h3>, <p>, <ul>, <li> tags to structure the article beautifully. Write at least 4-5 paragraphs.

Your response MUST be in pure JSON format without any markdown wrappers (like \`\`\`json) or extra text.

The JSON should have the following structure:
{
  "title": "A compelling title (e.g., 'Shri Hanuman Chalisa (Hindi)' or an article title)",
  "subtitle": "A short, engaging subtitle",
  "summary": "A 2-3 sentence summary or description for the card",
  "content": "The full content in HTML format as instructed above.",
  "category": "A single category name that best fits this (e.g. Pooja Methods, Vedic Chants, Festivals Guide, or suggest a new one)",
  "tags": "tag1, tag2, tag3, tag4",
  "meta_title": "SEO optimized meta title (max 60 chars)",
  "meta_desc": "SEO optimized meta description (max 160 chars)",
  "meta_keys": "comma, separated, seo, keywords"
}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Using a capable model for JSON generation
            response_format: { type: "json_object" }
        });

        const jsonResponse = completion.choices[0]?.message?.content;
        
        if (!jsonResponse) {
            throw new Error("Empty response from Groq");
        }

        const data = JSON.parse(jsonResponse);
        res.json({ success: true, data });

    } catch (error) {
        console.error('Error generating AI content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};
