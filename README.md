# AI Prompt Story Generator

An AI-powered story generator that creates unique narratives based on user prompts and preferences using Google Gemini API.

## Features

- Generate unique stories based on user prompts
- Customize story elements based on different styles (e.g., fantasy, mystery, sci-fi, romance)
- Listen to story playback
- Save and share your stories

## Requirements
- Node.js (version 14 or higher)
- Google Cloud account with access to the Gemini API

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Akashdip-N/AI-Prompt-Story-Generator.git
   ```

2. Navigate to the project directory:
   ```bash
   cd AI-Prompt-Story-Generator
   ```

3. Setting up the environment variables:
    - Go into the `backend` directory:
      ```bash
      cd backend
      ```
   - Create a `.env` file in the `backend` folder directory.
   - For easier setup there is a sample `.env.example` file included in the project. Use the following command to copy it:
      ```bash
      cp .env.example .env
      ```
    - Replace the `GOOGLE_API_KEY` value in the `.env` file with your actual Google Gemini API key.

## Running the Application

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. Go inside the `frontend` directory and open the `index.html` file in your web browser:
   ```bash
   cd ../frontend
   open index.html
   ```

5. You can now interact with the AI Prompt Story Generator through the web interface.


## Contributing

If you want to contribute to this project, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.