# Simply

Simply is an open-source browser extension and web platform that turns YouTube(as of now) into an interactive learning experience. It's tiring to switch tabs, give the LLM's context and then get the answer for your long educational video and this exact issue is solved by Simply. It acts as an AI teaching assistant that reads video captions in real time, summarizes content and answers your questions directly within your browser.

## How It Works

The architecture is split into three main parts: the browser extension, the backend API and the web frontend.

1. **Browser Extension:** Built with Manifest V3. When you open a YouTube video, the content scripts extract the raw caption data directly from the page. You can open the extension popup to ask a question or request a summary.
2. **Backend API:** A fast Python backend built with FastAPI. It receives the captions, chunks them up and generates vector embeddings using the Hugging Face Inference API (specifically the `BAAI/bge-small-en-v1.5` model). These embeddings are injected into a PostgreSQL database powered by Supabase and `pgvector`.
3. **RAG Pipeline:** When you ask a question, the backend embeds your query, runs a similarity search against the video chunks in the database and sends the most relevant context to the Groq API. Groq then streams back a lightning-fast response based strictly on the video content.
4. **Web Frontend:** A sleek React web app built with Vite that handles user authentication, account management and settings.

## Tech Stack

- **Frontend:** React, Vite and CSS
- **Extension:** JavaScript and Manifest V3
- **Backend:** Python, FastAPI and Uvicorn
- **Database:** Supabase (PostgreSQL with `pgvector`)
- **AI Models:** Groq API (LLM generation) and Hugging Face (Embeddings)

## Contributing

Simply is open source and we welcome contributions from anyone! Whether you want to fix a bug, improve the AI pipeline or design a better UI, your help is appreciated.

Here are the steps to get the project running locally so you can start contributing:

### 1. Clone the Repo

First fork the repository to your own GitHub account and clone it to your local machine:

```bash
git clone https://github.com/Shreyasnalle/SIMPLY.git
cd SIMPLY
```

### 2. Set up the Backend

The backend requires Python 3. Navigate to the backend directory, install the dependencies and run the server.

```bash
cd backend
pip install -r requirements.txt
```

You will need to create a `supabase_key.env` file in the backend directory with your API keys:
- `HUGGING_FACE` for the embedding model
- `GROQ_API_KEY` for the LLM
- `SUPABASE_URL` and `SUPABASE_KEY` for your database
- `SUPABASE_DB_URL` for direct postgres connections

Run the backend locally:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Set up the Frontend

The web app is built with React and Vite. Navigate to the frontend code directory, install the packages and run the development server.

```bash
cd ../frontend/frontend_code
npm install
npm run dev
```

### 4. Load the Extension

To test changes to the browser extension:
1. Open your browser and go to `chrome://extensions/` or `edge://extensions/`
2. Turn on "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` folder in this repository

### 5. Make a Pull Request

Create a new branch for your feature, commit your code and push it to your fork. Then open a pull request on the main repository at [https://github.com/Shreyasnalle/SIMPLY](https://github.com/Shreyasnalle/SIMPLY). We will review it as soon as possible.

## License

This project is open source. Check the LICENSE file for more information.
