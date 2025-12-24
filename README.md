# agents101-Production

# Prototype to Production: Advanced AI Apps


## Setup Instructions

This repo requires **Node.js version 20+** or **bun v1.0.20**.

The `main` branch contains the final application. To code along with the workshop, checkout the `step/1` branch. You will also need an [API Key from OpenAI](https://platform.openai.com/settings/organization/api-keys).

```bash
git clone https://github.com/Hendrixer/agents-production.git
cd agents-production
git checkout step/1
npm install # or bun install
```

To run the project:

```bash
npm start
# or
bun run index.ts
```

## OpenAI API Key

Create an [API Key from OpenAI](https://platform.openai.com/settings/organization/api-keys) and save it in a `.env` file:

```
OPENAI_API_KEY='YOUR_API_KEY'
```

![image](https://github.com/user-attachments/assets/64e720ca-e460-4722-b84c-b76968dfcfe9)

OpenAI requires you to add a minimum of $5 USD credit to your account. Go to the [billing page](https://platform.openai.com/settings/organization/billing/overview) and add credits.

![image](https://github.com/user-attachments/assets/6de27e21-8345-48a7-adf9-5dfee3e8e1c9)

> [!NOTE]  
> It can take up to 20 minutes for the credits to be available via the API. So if you get an `insufficient_quota` error, try again in a few minutes.

## Upstash Account
A free [Upstash account](https://upstash.com/) is required for hosting a serverless vector database. The setup is demonstrated in the course. You can find the details [in the course notes](https://clumsy-humor-894.notion.site/3-RAG-13754fed51a38061adbdd038a1224749)

## Windows Environments
The dynamic imports may be incompatible depending on the windows environment, so you may need to run the evals directly. Add the environment import to the top of each eval:

```
import 'dotenv/config'
```

Then run the eval with the full path to the file. For example:

```
npx tsx evals/experiments/reddit.eval.ts
```