# AthletePeak

AthletePeak is an application designed to help athletes optimize their recovery through personalized plans and AI-powered recommendations.

## Features

- Personalized recovery plans based on athlete data
- AI-powered recommendations for optimal recovery
- Exercise database with targeted recovery activities
- Feedback analysis for continuous improvement

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see below)
4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```
cp .env.example .env
```

### OpenAI API Key

This application uses OpenAI's API for generating personalized recovery recommendations. You'll need to obtain an API key from OpenAI to use these features.

#### How to Create an OpenAI API Key

1. **Create an OpenAI Account**
   - Go to [OpenAI's website](https://openai.com/)
   - Click on "Sign Up" to create a new account or "Log In" if you already have one

2. **Navigate to API Section**
   - Once logged in, go to the [API section](https://platform.openai.com/)
   - Click on your profile icon in the top-right corner
   - Select "View API Keys" from the dropdown menu

3. **Create a New API Key**
   - Click on the "Create new secret key" button
   - Optionally, provide a name for your key to identify its purpose
   - Click "Create secret key"
   - **Important**: Copy your API key immediately and store it securely. You won't be able to view it again after closing the dialog.

4. **Add to Environment Variables**
   - Open your `.env` file
   - Add your API key to the `OPENAI_API_KEY` variable:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

5. **Usage Limits and Billing**
   - Be aware that OpenAI API usage is billed based on the number of tokens processed
   - Set up billing information in your OpenAI account
   - Consider implementing rate limiting in your application (already included in this codebase)
   - Monitor your usage in the OpenAI dashboard

## Development

### Project Structure

- `/client` - Frontend application
- `/server` - Backend API and services
- `/shared` - Shared types and utilities

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

[MIT](LICENSE)