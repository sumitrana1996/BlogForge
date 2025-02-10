const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const openai = require('openai');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Check if the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error(
    'OPENAI_API_KEY is not set. Please set it in your environment variables.'
  );
  process.exit(1);
}

// Create OpenAI client
const openaiAPI = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});

app.post('/generate-blog', async (req, res) => {
  const { brief } = req.body;

  if (!brief) {
    return res.status(400).json({ error: 'Brief is required' });
  }

  try {
    const prompt = `Generate a blog title, slug, description and content based on the following brief:\n\nBrief: ${brief}\n\nThe blog content should be informative, engaging, and relevant to the given topic and should be briefly explained with examples. The title should capture attention while being concise and SEO-friendly. The slug should be a short, URL-friendly version of the title. At last only return the JSON object`;

    const response = await openaiAPI.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo', // You can also use 'gpt-4' if you have access to it
      temperature: 0.7, // Adjust the creativity of the response
      max_tokens: 500, // Adjust the length of the content
    });

    const generatedText = JSON.parse(response.choices[0].message.content);

    res.json(generatedText);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Error generating content' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
