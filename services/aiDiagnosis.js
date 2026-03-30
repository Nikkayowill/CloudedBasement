'use strict';

// services/aiDiagnosis.js
// Calls Claude Haiku to analyze a failed deployment log and writes a plain-English
// diagnosis back to deployments.ai_diagnosis.
//
// Fire-and-forget — never throws, never blocks the deployment response.
// Requires: ANTHROPIC_API_KEY env var. Silently skips if not set.

const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db');

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_LOG_LINES = 150;   // keep token cost low
const MAX_TOKENS = 350;

const SYSTEM_PROMPT = `You are a deployment error analyst for a managed cloud hosting platform.
Users deploy Node.js, Python, Go, Rust, and static apps via Git onto Ubuntu VPS servers.
Analyze the deployment log and explain the failure in plain English.
Be specific about the root cause and give one concrete fix the user can act on immediately.
Never repeat secrets, tokens, or passwords from the log.
Keep your response to 2–4 sentences maximum.`;

/**
 * Analyze a failed deployment log with Claude Haiku and persist the diagnosis.
 * Called fire-and-forget — errors are logged but never propagated.
 *
 * @param {number} deploymentId
 * @param {string} output — raw deployment log (will be trimmed)
 */
async function analyzeDeploymentFailure(deploymentId, output) {
  if (!process.env.ANTHROPIC_API_KEY) return;

  try {
    const client = new Anthropic();

    // Look up deployment_type from DB (may be null if failure was before type detection)
    const depRow = await pool.query(
      'SELECT deployment_type FROM deployments WHERE id = $1',
      [deploymentId]
    );
    const deploymentType = depRow.rows[0]?.deployment_type || null;

    // Trim to last N lines to keep token cost predictable
    const logSnippet = output
      .split('\n')
      .slice(-MAX_LOG_LINES)
      .join('\n');

    const userMessage = `Stack type: ${deploymentType || 'unknown'}

Deployment log (last ${MAX_LOG_LINES} lines):
${logSnippet}

What caused this failure and how should the user fix it?`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const diagnosis = response.content[0]?.text?.trim();
    if (!diagnosis) return;

    await pool.query(
      'UPDATE deployments SET ai_diagnosis = $1 WHERE id = $2',
      [diagnosis, deploymentId]
    );

    console.log(`[AI] Diagnosis written for deployment #${deploymentId}`);
  } catch (err) {
    // Never crash the caller — diagnosis is best-effort
    console.error(`[AI] Failed to analyze deployment #${deploymentId}:`, err.message);
  }
}

module.exports = { analyzeDeploymentFailure };
