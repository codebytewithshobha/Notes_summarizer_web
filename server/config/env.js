const validateEnvironment = () => {
  const required = ['MONGODB_URI'];
  const missing = required.filter((name) => !process.env[name]);

  if (!process.env.Groq_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
    missing.push('Groq_API_KEY');
  }

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    error.status = 500;
    throw error;
  }
};

module.exports = { validateEnvironment };
