# No Excuses - Reality Check

A brutally honest web app that delivers AI-generated harsh truth roasts to snap you out of procrastination.

## Features

- **AI-Generated Roasts** - Dynamic, personalized reality checks powered by OpenAI
- **Visit Counter** - Tracks how many times you've visited (localStorage)
- **Time Tracker** - Shows how long you've been wasting time on the page
- **Minimal Design** - Black background, bold white text, no fluff
- **Smooth Animations** - Fade transitions between roasts

## Setup & Deployment

### Prerequisites

- Node.js (for local development)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Vercel account ([sign up free](https://vercel.com))

### Local Development

1. Clone the repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel dev` to start local development server
4. Add your OpenAI API key when prompted, or set it in Vercel dashboard

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/no-excuses.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the project

3. **Add Environment Variable**
   - In Vercel dashboard, go to **Settings → Environment Variables**
   - Add: `OPENAI_API_KEY` = `your-api-key-here`
   - Make sure it's added to **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)

**Important:** Never commit your API key to git. It's stored securely in Vercel's environment variables.

## How It Works

1. User visits the site
2. Frontend calls `/api/roast` endpoint
3. Vercel serverless function calls OpenAI API
4. AI generates a brutal reality check roast
5. Roast is displayed with smooth fade animation

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Backend:** Vercel Serverless Functions
- **AI:** OpenAI GPT-3.5-turbo
- **Hosting:** Vercel

## License

MIT

