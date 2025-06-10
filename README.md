
# JOB analyser - a student fiend: AI-Powered Resume & Job Tools

JOB analyser is a Next.js application designed to assist users in optimizing their resumes, creating tailored demo resumes, and discovering job opportunities using the power of Artificial Intelligence. It leverages Genkit and Google AI (Gemini models) to provide insightful analysis and content generation.

## Core Features

1.  **Resume Analyzer**:
    *   Upload your resume (PDF) and paste a job description.
    *   Receive an AI-powered analysis including:
        *   **Match Score**: A percentage-based score indicating how well your resume aligns with the job description, along with a qualitative assessment (e.g., "Strong Match", "Moderate Match"). Displayed in a clear, three-column layout with suggestions and keyword analysis.
        *   **Improvement Suggestions**: Actionable, concise bullet points (typically 4-5) to enhance your resume for the specific role.
        *   **Keyword Analysis**: A breakdown of important keywords from the job description, keywords found in your resume, and crucial keywords missing from your resume.
    *   Organized in a step-by-step tabbed interface for a clear user experience.

2.  **AI-Powered Resume Modification**:
    *   After the initial analysis, users can opt to have the AI modify their resume based on the provided suggestions and the job description.
    *   The system generates a revised resume (plain text).
    *   A new analysis (match score, suggestions, keywords) is provided for the AI-modified resume.
    *   Users can download the modified resume as a `.txt` file.

3.  **Demo Resume Generator**:
    *   Input a job description.
    *   Select an experience level (Fresher, Intermediate, Senior).
    *   The AI generates a professional demo resume tailored to the job description and experience level.
    *   Users can copy the generated resume to their clipboard.

4.  **Find Job by Resume**:
    *   Upload your resume (PDF).
    *   The AI processes your resume and *simulates* a search for suitable job roles from top MNCs and product-based companies.
    *   Displays a list of AI-generated job opportunities, including:
        *   Company Name
        *   Job Title
        *   Brief Job Description
        *   Match Percentage with your resume
        *   Placeholder "Apply" link
    *   Option to "Modify resume based on this job," which pre-fills the AI-generated job description in the Resume Analyzer.

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **UI Library**: React
*   **Styling**: Tailwind CSS
*   **Component Library**: ShadCN UI
*   **AI Integration**: Genkit
*   **AI Model Provider**: Google AI (Gemini)
*   **Language**: TypeScript

## Getting Started

### Prerequisites

*   Node.js (version 18 or later recommended)
*   npm or yarn

### Local Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd job-analyser # Or your project's directory name
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**:
    *   You'll need a Google AI API key to use the AI features. Generate one from [Google AI Studio](https://aistudio.google.com/).
    *   Create a `.env` file in the root of your project by copying the `.env.example` file (if one exists) or creating a new one.
    *   Add your API key to the `.env` file:
        ```env
        GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
    *   **Important**: Do not commit your `.env` file with your actual API key to version control. Add `.env` to your `.gitignore` file.

4.  **Run the development server**:
    *   To run the Next.js app:
        ```bash
        npm run dev
        # or
        yarn dev
        ```
        This will typically start the app on `http://localhost:9002`.

    *   Genkit also has a development UI. To start it (in a separate terminal):
        ```bash
        npm run genkit:dev
        # or
        yarn genkit:dev
        ```
        This usually starts the Genkit developer UI on `http://localhost:4000`.

### Project Structure

*   `src/app/`: Contains the pages (e.g., `resume-analyzer/page.tsx`, `find-jobs/page.tsx`) and layouts for the Next.js application.
*   `src/components/`: Shared React components, including UI components from ShadCN (e.g., `resume-analyzer-form.tsx`).
*   `src/ai/`: Genkit related code.
    *   `src/ai/flows/`: Contains the Genkit AI flows (e.g., `analyze-resume-flow.ts`, `find-jobs-by-resume-flow.ts`).
    *   `src/ai/genkit.ts`: Genkit initialization and configuration.
*   `public/`: Static assets.

## Deployment to Vercel

When deploying this application to Vercel (or any other hosting provider), you need to ensure that the necessary environment variables for the AI functionalities are correctly configured.

The application uses the `googleAI()` plugin for Genkit, which requires a `GOOGLE_API_KEY`.

**To ensure your deployed application works correctly on Vercel:**

1.  Go to your Vercel project dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add a new environment variable:
    *   **Name**: `GOOGLE_API_KEY`
    *   **Value**: Your actual Google AI API key.
4.  Ensure the variable is available to all necessary environments (Production, Preview, Development).
5.  Redeploy your application.

Without the correct API key set in Vercel, Genkit will not be able to initialize the Google AI services, leading to errors when server components try to render pages that utilize AI flows (often manifesting as a generic server component render error).

## Author

This project was developed by **Prem Charan Gudipudi**.

*   **GitHub**: [premcharan99](https://github.com/premcharan99)

---

This README provides a solid overview for anyone interacting with the project.
