import { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import { app } from "../../server/_core/index.js";

// Wrap Express app with serverless-http for Netlify Functions
const handler: Handler = serverless(app);

export { handler };
