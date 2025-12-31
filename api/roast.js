export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not configured',
      roast: "The server isn't even configured properly. Fix your setup."
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a brutally honest reality-check generator. Generate short, harsh truth roasts (1-2 sentences max) that snap people out of procrastination. No jokes, no humor - just hard truths that sting. Be direct, aggressive, and motivational. Examples: "Every minute you waste here is a minute you\'ll never get back." "You\'re choosing temporary comfort over the person you want to become." "Your excuses are more creative than your effort."'
          },
          {
            role: 'user',
            content: 'Generate a new brutal reality check roast about procrastination. Make it sting.'
          }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const roast = data.choices[0]?.message?.content?.trim();

    if (!roast) {
      throw new Error('No roast generated');
    }

    return res.status(200).json({ roast });
  } catch (error) {
    console.error('Error generating roast:', error);
    
    // Fallback roasts if API fails
    const fallbackRoasts = [
      "The API failed, but you're still procrastinating. That's on you.",
      "Even the server is working harder than you right now.",
      "Connection error? More like connection to reality error."
    ];
    
    const randomFallback = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
    
    return res.status(200).json({ 
      roast: randomFallback,
      fallback: true 
    });
  }
}

