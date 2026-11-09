// lib/default-works-n8n.ts
//
// The 50 n8n AI automations from github.com/itz-kirankumar/workflows, each its
// own work entry. Grounding rule for every entry: the workflow's own JSON -
// its About sticky note (description, trigger, setup), its node names and the
// If node's business rule. No invented usage, clients or metrics. State is
// honest everywhere: imported into a self-hosted n8n, inactive, not
// configured, never executed. Screenshots are genuine canvas captures.
//
// Timestamps are stamped by lib/default-works.ts when it merges these into
// DEFAULT_WORKS.

export type N8nWorkSeed = {
  slug: string
  title: string
  tagline: string
  summary: string
  body: string
  coverUrl: string
  sourceUrl: string
  tags: string[]
  highlights: string[]
  order: number
}

export const N8N_WORKS: N8nWorkSeed[] = [
  {
    "slug": "n8n-01-lead-qualification",
    "title": "AI Lead Qualification System",
    "tagline": "Scores inbound leads 0-100 with AI, alerts sales on hot leads and logs every lead to Google Sheets.",
    "summary": "Scores inbound leads 0-100 with AI, alerts sales on hot leads and logs every lead to Google Sheets. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Scores inbound leads 0-100 with AI, alerts sales on hot leads and logs every lead to Google Sheets.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"score >= 70\". When it holds, the workflow runs \"Slack #sales\" and \"Flatten Row (Leads)\". When it does not, it runs \"Flatten Row (Leads) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/01.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/01-lead-qualification.json",
    "tags": [
      "Sales",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Scores inbound leads 0-100 with AI, alerts sales on hot leads and logs every lead to Google Sheets.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: score >= 70",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 201
  },
  {
    "slug": "n8n-02-appointment-scheduler",
    "title": "AI Appointment Scheduler",
    "tagline": "Reads free-text booking requests, extracts date/time with AI, creates a Google Calendar event and emails a confirmation (or asks for missing details).",
    "summary": "Reads free-text booking requests, extracts date/time with AI, creates a Google Calendar event and emails a confirmation (or asks for missing details). One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Reads free-text booking requests, extracts date/time with AI, creates a Google Calendar event and emails a confirmation (or asks for missing details).\n\nThis workflow runs on a schedule. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_complete is true\". When it holds, the workflow runs \"Create Calendar Event\" and \"Send Email\". When it does not, it runs \"Send Email 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Calendar and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/02.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/02-appointment-scheduler.json",
    "tags": [
      "Sales",
      "Gmail",
      "Google Calendar",
      "OpenAI"
    ],
    "highlights": [
      "Reads free-text booking requests, extracts date/time with AI, creates a Google Calendar event and emails a confirmation (or asks for missing details).",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_complete is true",
      "Connects: Gmail, Google Calendar, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 202
  },
  {
    "slug": "n8n-03-email-responder",
    "title": "AI Email Responder",
    "tagline": "Watches the inbox, classifies each unread email, auto-replies to routine ones and escalates sensitive ones to Slack.",
    "summary": "Watches the inbox, classifies each unread email, auto-replies to routine ones and escalates sensitive ones to Slack. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Watches the inbox, classifies each unread email, auto-replies to routine ones and escalates sensitive ones to Slack.\n\nThis workflow fires when a new unread email lands in Gmail; the message itself is the input. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"needs_human is true\". When it holds, the workflow runs \"Slack #inbox-escalations\". When it does not, it runs \"Reply to Email\" instead.\n\nIt connects to Gmail, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/03.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/03-email-responder.json",
    "tags": [
      "Communication",
      "Gmail",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Watches the inbox, classifies each unread email, auto-replies to routine ones and escalates sensitive ones to Slack.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: needs_human is true",
      "Connects: Gmail, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 203
  },
  {
    "slug": "n8n-04-follow-up",
    "title": "AI Follow-Up Automation",
    "tagline": "Every morning reviews leads in Google Sheets and sends personalised follow-up emails to contacts that went quiet.",
    "summary": "Every morning reviews leads in Google Sheets and sends personalised follow-up emails to contacts that went quiet. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Every morning reviews leads in Google Sheets and sends personalised follow-up emails to contacts that went quiet.\n\nThis workflow runs on a schedule (cron expression 0 9 * * 1-5), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"needs_follow_up is true\". When it holds, the workflow runs \"Send Email\" and \"Flatten Row (Follow-Up Log)\". Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/04.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/04-follow-up.json",
    "tags": [
      "Sales",
      "Gmail",
      "Google Sheets",
      "OpenAI"
    ],
    "highlights": [
      "Every morning reviews leads in Google Sheets and sends personalised follow-up emails to contacts that went quiet.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: needs_follow_up is true",
      "Connects: Gmail, Google Sheets, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 204
  },
  {
    "slug": "n8n-05-proposal-generator",
    "title": "AI Proposal Generator",
    "tagline": "Turns discovery-call notes into a structured sales proposal, emails the draft to the account owner and logs it.",
    "summary": "Turns discovery-call notes into a structured sales proposal, emails the draft to the account owner and logs it. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Turns discovery-call notes into a structured sales proposal, emails the draft to the account owner and logs it.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"estimated_value >= 10000\". When it holds, the workflow runs \"Slack #deals\", \"Send Email\" and \"Flatten Row (Proposals)\". When it does not, it runs \"Send Email 2\" and \"Flatten Row (Proposals) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/05.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/05-proposal-generator.json",
    "tags": [
      "Sales",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Turns discovery-call notes into a structured sales proposal, emails the draft to the account owner and logs it.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: estimated_value >= 10000",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 205
  },
  {
    "slug": "n8n-06-invoice-automation",
    "title": "AI Invoice Automation",
    "tagline": "Extracts line items, totals and due dates from invoice text/OCR, validates the maths and books valid invoices to Sheets.",
    "summary": "Extracts line items, totals and due dates from invoice text/OCR, validates the maths and books valid invoices to Sheets. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Extracts line items, totals and due dates from invoice text/OCR, validates the maths and books valid invoices to Sheets.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_valid is true\". When it holds, the workflow runs \"Flatten Row (Invoices)\". When it does not, it runs \"Slack #finance\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/06.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/06-invoice-automation.json",
    "tags": [
      "Finance",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Extracts line items, totals and due dates from invoice text/OCR, validates the maths and books valid invoices to Sheets.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_valid is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 206
  },
  {
    "slug": "n8n-07-payment-reminders",
    "title": "AI Payment Reminder System",
    "tagline": "Daily scan of unpaid invoices; AI writes reminders with tone matched to how overdue they are and escalates 30+ days.",
    "summary": "Daily scan of unpaid invoices; AI writes reminders with tone matched to how overdue they are and escalates 30+ days. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily scan of unpaid invoices; AI writes reminders with tone matched to how overdue they are and escalates 30+ days.\n\nThis workflow runs on a schedule (cron expression 0 10 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"days_overdue >= 30\". When it holds, the workflow runs \"Slack #finance\" and \"Send Email\". When it does not, it runs \"Only if send\" instead.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/07.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/07-payment-reminders.json",
    "tags": [
      "Finance",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily scan of unpaid invoices; AI writes reminders with tone matched to how overdue they are and escalates 30+ days.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: days_overdue >= 30",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 207
  },
  {
    "slug": "n8n-08-customer-onboarding",
    "title": "AI Customer Onboarding",
    "tagline": "When a new customer signs up, AI builds a personalised onboarding plan and welcome email; enterprise accounts get a CSM alert.",
    "summary": "When a new customer signs up, AI builds a personalised onboarding plan and welcome email; enterprise accounts get a CSM alert. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "When a new customer signs up, AI builds a personalised onboarding plan and welcome email; enterprise accounts get a CSM alert.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"segment = enterprise\". When it holds, the workflow runs \"Slack #customer-success\", \"Send Email\" and \"Flatten Row (Onboarding)\". When it does not, it runs \"Send Email 2\" and \"Flatten Row (Onboarding) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/08.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/08-customer-onboarding.json",
    "tags": [
      "Customer Success",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "When a new customer signs up, AI builds a personalised onboarding plan and welcome email; enterprise accounts get a CSM alert.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: segment = enterprise",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 208
  },
  {
    "slug": "n8n-09-ticket-triage",
    "title": "AI Support Ticket Triage",
    "tagline": "Classifies incoming tickets by category, priority and sentiment, routes urgent ones to on-call and posts a suggested first reply.",
    "summary": "Classifies incoming tickets by category, priority and sentiment, routes urgent ones to on-call and posts a suggested first reply. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Classifies incoming tickets by category, priority and sentiment, routes urgent ones to on-call and posts a suggested first reply.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"priority_score <= 2\". When it holds, the workflow runs \"Slack #support-urgent\" and \"Flatten Row (Tickets)\". When it does not, it runs \"Flatten Row (Tickets) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/09.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/09-ticket-triage.json",
    "tags": [
      "Support",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Classifies incoming tickets by category, priority and sentiment, routes urgent ones to on-call and posts a suggested first reply.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: priority_score <= 2",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 209
  },
  {
    "slug": "n8n-10-knowledge-base",
    "title": "AI Knowledge Base Assistant",
    "tagline": "Answers questions from your knowledge-base content (fetched from a URL) and flags gaps when the KB has no answer.",
    "summary": "Answers questions from your knowledge-base content (fetched from a URL) and flags gaps when the KB has no answer. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Answers questions from your knowledge-base content (fetched from a URL) and flags gaps when the KB has no answer.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Knowledge Base\" node pulls the working data before the AI step.\n\nThe decision point is \"answered is true\". When it does not, it runs \"Slack #kb-gaps\" and \"Flatten Row (KB Gaps)\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/10.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/10-knowledge-base.json",
    "tags": [
      "Support",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Answers questions from your knowledge-base content (fetched from a URL) and flags gaps when the KB has no answer.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: answered is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 210
  },
  {
    "slug": "n8n-11-social-scheduler",
    "title": "AI Social Media Scheduler",
    "tagline": "Daily picks the next topic from a content calendar sheet, writes platform-specific posts and queues them via your scheduling API (e.g. Buffer).",
    "summary": "Daily picks the next topic from a content calendar sheet, writes platform-specific posts and queues them via your scheduling API (e.g. Buffer). One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily picks the next topic from a content calendar sheet, writes platform-specific posts and queues them via your scheduling API (e.g. Buffer).\n\nThis workflow runs on a schedule (cron expression 0 8 * * 1-5), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"is_today is true\". When it holds, the workflow runs \"POST to scheduler Api API\" and \"Slack #marketing\".\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/11.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/11-social-scheduler.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily picks the next topic from a content calendar sheet, writes platform-specific posts and queues them via your scheduling API (e.g. Buffer).",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_today is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 211
  },
  {
    "slug": "n8n-12-content-repurposer",
    "title": "AI Content Repurposer",
    "tagline": "Takes a blog post or transcript and repurposes it into a newsletter, LinkedIn post, X thread, short-video script and quote cards.",
    "summary": "Takes a blog post or transcript and repurposes it into a newsletter, LinkedIn post, X thread, short-video script and quote cards. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Takes a blog post or transcript and repurposes it into a newsletter, LinkedIn post, X thread, short-video script and quote cards.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"word_count >= 300\". When it holds, the workflow runs \"Flatten Row (Repurposed Content)\" and \"Slack #content\". When it does not, it runs \"Slack #content 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/12.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/12-content-repurposer.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Takes a blog post or transcript and repurposes it into a newsletter, LinkedIn post, X thread, short-video script and quote cards.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: word_count >= 300",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 212
  },
  {
    "slug": "n8n-13-review-manager",
    "title": "AI Review Manager",
    "tagline": "Analyses new customer reviews, drafts on-brand responses and escalates negative reviews to the team.",
    "summary": "Analyses new customer reviews, drafts on-brand responses and escalates negative reviews to the team. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Analyses new customer reviews, drafts on-brand responses and escalates negative reviews to the team.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"rating <= 2\". When it holds, the workflow runs \"Slack #reviews\" and \"Flatten Row (Reviews)\". When it does not, it runs \"Flatten Row (Reviews) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/13.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/13-review-manager.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Analyses new customer reviews, drafts on-brand responses and escalates negative reviews to the team.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: rating <= 2",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 213
  },
  {
    "slug": "n8n-14-data-entry",
    "title": "AI Data Entry Automation",
    "tagline": "Converts unstructured text (emails, forms, notes) into clean structured records and appends them to Google Sheets.",
    "summary": "Converts unstructured text (emails, forms, notes) into clean structured records and appends them to Google Sheets. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Converts unstructured text (emails, forms, notes) into clean structured records and appends them to Google Sheets.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"confidence >= 0.8\". When it holds, the workflow runs \"Flatten Row (Records)\". When it does not, it runs \"Flatten Row (Needs Review)\" and \"Slack #ops\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/14.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/14-data-entry.json",
    "tags": [
      "Operations",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Converts unstructured text (emails, forms, notes) into clean structured records and appends them to Google Sheets.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: confidence >= 0.8",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 214
  },
  {
    "slug": "n8n-15-document-classifier",
    "title": "AI Document Classifier",
    "tagline": "Classifies documents (invoice, contract, resume, receipt...) from their text, extracts key metadata and routes them.",
    "summary": "Classifies documents (invoice, contract, resume, receipt...) from their text, extracts key metadata and routes them. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Classifies documents (invoice, contract, resume, receipt...) from their text, extracts key metadata and routes them.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"confidence >= 0.75\". When it holds, the workflow runs \"Flatten Row (Document Index)\". When it does not, it runs \"Slack #ops\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/15.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/15-document-classifier.json",
    "tags": [
      "Operations",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Classifies documents (invoice, contract, resume, receipt...) from their text, extracts key metadata and routes them.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: confidence >= 0.75",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 215
  },
  {
    "slug": "n8n-16-meeting-notes",
    "title": "AI Meeting Notes Assistant",
    "tagline": "Turns a meeting transcript into a summary, decisions and owner-assigned action items, then shares them on Slack and email.",
    "summary": "Turns a meeting transcript into a summary, decisions and owner-assigned action items, then shares them on Slack and email. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Turns a meeting transcript into a summary, decisions and owner-assigned action items, then shares them on Slack and email.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"action_count >= 1\". When it holds, the workflow runs \"Slack #meetings\" and \"Send Email\". When it does not, it runs \"Slack #meetings 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/16.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/16-meeting-notes.json",
    "tags": [
      "Productivity",
      "Gmail",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Turns a meeting transcript into a summary, decisions and owner-assigned action items, then shares them on Slack and email.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: action_count >= 1",
      "Connects: Gmail, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 216
  },
  {
    "slug": "n8n-17-crm-updater",
    "title": "AI CRM Updater",
    "tagline": "Reads call notes or email threads and pushes structured updates (stage, next step, deal value) to your CRM API.",
    "summary": "Reads call notes or email threads and pushes structured updates (stage, next step, deal value) to your CRM API. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Reads call notes or email threads and pushes structured updates (stage, next step, deal value) to your CRM API.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"has_updates is true\". When it holds, the workflow runs \"POST to crm Api API\" and \"Flatten Row (CRM Updates Log)\". Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/17.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/17-crm-updater.json",
    "tags": [
      "Sales",
      "Google Sheets",
      "OpenAI"
    ],
    "highlights": [
      "Reads call notes or email threads and pushes structured updates (stage, next step, deal value) to your CRM API.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: has_updates is true",
      "Connects: Google Sheets, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 217
  },
  {
    "slug": "n8n-18-pipeline-management",
    "title": "AI Pipeline Management",
    "tagline": "Weekly review of every open deal: AI flags stalled or at-risk deals and recommends next actions to the sales channel.",
    "summary": "Weekly review of every open deal: AI flags stalled or at-risk deals and recommends next actions to the sales channel. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Weekly review of every open deal: AI flags stalled or at-risk deals and recommends next actions to the sales channel.\n\nThis workflow runs on a schedule (cron expression 0 8 * * 1), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"risk_score >= 60\". When it holds, the workflow runs \"Slack #sales\".\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/18.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/18-pipeline-management.json",
    "tags": [
      "Sales",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Weekly review of every open deal: AI flags stalled or at-risk deals and recommends next actions to the sales channel.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: risk_score >= 60",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 218
  },
  {
    "slug": "n8n-19-inventory-monitor",
    "title": "AI Inventory Monitor",
    "tagline": "Checks stock levels every 6 hours, predicts stock-out dates from sales velocity and recommends reorder quantities.",
    "summary": "Checks stock levels every 6 hours, predicts stock-out dates from sales velocity and recommends reorder quantities. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Checks stock levels every 6 hours, predicts stock-out dates from sales velocity and recommends reorder quantities.\n\nThis workflow runs on a schedule (cron expression 0 */6 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"reorder is true\". When it holds, the workflow runs \"Slack #inventory\" and \"Flatten Row (Reorder Requests)\". Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/19.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/19-inventory-monitor.json",
    "tags": [
      "Operations",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Checks stock levels every 6 hours, predicts stock-out dates from sales velocity and recommends reorder quantities.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: reorder is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 219
  },
  {
    "slug": "n8n-20-order-processing",
    "title": "AI Order Processing",
    "tagline": "Validates incoming orders, scores fraud risk, confirms good orders to the customer and holds risky ones for review.",
    "summary": "Validates incoming orders, scores fraud risk, confirms good orders to the customer and holds risky ones for review. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Validates incoming orders, scores fraud risk, confirms good orders to the customer and holds risky ones for review.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"fraud_score <= 40\". When it holds, the workflow runs \"Send Email\" and \"Flatten Row (Orders)\". When it does not, it runs \"Slack #orders\" and \"Flatten Row (Orders On Hold)\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/20.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/20-order-processing.json",
    "tags": [
      "E-commerce",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Validates incoming orders, scores fraud risk, confirms good orders to the customer and holds risky ones for review.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: fraud_score <= 40",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 220
  },
  {
    "slug": "n8n-21-shipping-automation",
    "title": "AI Shipping Automation",
    "tagline": "Interprets carrier tracking events, writes customer-friendly status updates and flags delays or exceptions.",
    "summary": "Interprets carrier tracking events, writes customer-friendly status updates and flags delays or exceptions. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Interprets carrier tracking events, writes customer-friendly status updates and flags delays or exceptions.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_exception is true\". When it holds, the workflow runs \"Slack #shipping\" and \"Send Email\". When it does not, it runs \"Send Email 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/21.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/21-shipping-automation.json",
    "tags": [
      "E-commerce",
      "Gmail",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Interprets carrier tracking events, writes customer-friendly status updates and flags delays or exceptions.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_exception is true",
      "Connects: Gmail, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 221
  },
  {
    "slug": "n8n-22-expense-categorizer",
    "title": "AI Expense Categorizer",
    "tagline": "Categorises expenses/receipts against your chart of accounts, flags policy violations and logs to the expense sheet.",
    "summary": "Categorises expenses/receipts against your chart of accounts, flags policy violations and logs to the expense sheet. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Categorises expenses/receipts against your chart of accounts, flags policy violations and logs to the expense sheet.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"policy_violation is true\". When it holds, the workflow runs \"Slack #finance\" and \"Flatten Row (Expenses)\". When it does not, it runs \"Flatten Row (Expenses) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/22.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/22-expense-categorizer.json",
    "tags": [
      "Finance",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Categorises expenses/receipts against your chart of accounts, flags policy violations and logs to the expense sheet.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: policy_violation is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 222
  },
  {
    "slug": "n8n-23-report-generator",
    "title": "AI Report Generator",
    "tagline": "Every Monday pulls metrics from your data endpoint and writes an executive weekly report with highlights and risks.",
    "summary": "Every Monday pulls metrics from your data endpoint and writes an executive weekly report with highlights and risks. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Every Monday pulls metrics from your data endpoint and writes an executive weekly report with highlights and risks.\n\nThis workflow runs on a schedule (cron expression 0 7 * * 1), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"kpi_health = bad\". When it holds, the workflow runs \"Slack #leadership\" and \"Send Email\". When it does not, it runs \"Send Email 2\" instead.\n\nIt connects to Gmail, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/23.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/23-report-generator.json",
    "tags": [
      "Analytics",
      "Gmail",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Every Monday pulls metrics from your data endpoint and writes an executive weekly report with highlights and risks.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: kpi_health = bad",
      "Connects: Gmail, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 223
  },
  {
    "slug": "n8n-24-sales-assistant",
    "title": "AI Sales Assistant",
    "tagline": "Chat-style webhook that answers prospect questions about your product, captures buying signals and hands off hot prospects.",
    "summary": "Chat-style webhook that answers prospect questions about your product, captures buying signals and hands off hot prospects. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Chat-style webhook that answers prospect questions about your product, captures buying signals and hands off hot prospects.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"handoff is true\". When it holds, the workflow runs \"Slack #sales\". Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/24.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/24-sales-assistant.json",
    "tags": [
      "Sales",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Chat-style webhook that answers prospect questions about your product, captures buying signals and hands off hot prospects.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: handoff is true",
      "Connects: OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 224
  },
  {
    "slug": "n8n-25-upsell-recommender",
    "title": "AI Upsell Recommender",
    "tagline": "Analyses a customer usage/purchase profile and recommends the best upsell or cross-sell with a tailored pitch.",
    "summary": "Analyses a customer usage/purchase profile and recommends the best upsell or cross-sell with a tailored pitch. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Analyses a customer usage/purchase profile and recommends the best upsell or cross-sell with a tailored pitch.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"likelihood >= 60\". When it holds, the workflow runs \"Send Email\" and \"Flatten Row (Upsell Opportunities)\". When it does not, it runs \"Flatten Row (Upsell Opportunities) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/25.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/25-upsell-recommender.json",
    "tags": [
      "Sales",
      "Gmail",
      "Google Sheets",
      "OpenAI"
    ],
    "highlights": [
      "Analyses a customer usage/purchase profile and recommends the best upsell or cross-sell with a tailored pitch.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: likelihood >= 60",
      "Connects: Gmail, Google Sheets, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 225
  },
  {
    "slug": "n8n-26-churn-prediction",
    "title": "AI Churn Prediction",
    "tagline": "Daily scores every account for churn risk from usage and support signals and alerts CS on high-risk accounts.",
    "summary": "Daily scores every account for churn risk from usage and support signals and alerts CS on high-risk accounts. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily scores every account for churn risk from usage and support signals and alerts CS on high-risk accounts.\n\nThis workflow runs on a schedule (cron expression 0 6 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"churn_risk >= 70\". When it holds, the workflow runs \"Slack #customer-success\" and \"Flatten Row (Churn Risk)\". When it does not, it runs \"Flatten Row (Churn Risk) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/26.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/26-churn-prediction.json",
    "tags": [
      "Customer Success",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily scores every account for churn risk from usage and support signals and alerts CS on high-risk accounts.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: churn_risk >= 70",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 226
  },
  {
    "slug": "n8n-27-feedback-analyzer",
    "title": "AI Feedback Analyzer",
    "tagline": "Analyses product feedback for sentiment, themes and feature requests and routes critical bugs to the product team.",
    "summary": "Analyses product feedback for sentiment, themes and feature requests and routes critical bugs to the product team. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Analyses product feedback for sentiment, themes and feature requests and routes critical bugs to the product team.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_critical is true\". When it holds, the workflow runs \"Slack #product\" and \"Flatten Row (Feedback)\". When it does not, it runs \"Flatten Row (Feedback) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/27.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/27-feedback-analyzer.json",
    "tags": [
      "Product",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Analyses product feedback for sentiment, themes and feature requests and routes critical bugs to the product team.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_critical is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 227
  },
  {
    "slug": "n8n-28-survey-automation",
    "title": "AI Survey Automation",
    "tagline": "Hosts a survey form, analyses each response with AI (NPS, sentiment, themes) and follows up with detractors.",
    "summary": "Hosts a survey form, analyses each response with AI (NPS, sentiment, themes) and follows up with detractors. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Hosts a survey form, analyses each response with AI (NPS, sentiment, themes) and follows up with detractors.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"nps <= 6\". When it holds, the workflow runs \"Send Email\", \"Slack #customer-success\" and \"Flatten Row (Survey Responses)\". When it does not, it runs \"Flatten Row (Survey Responses) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/28.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/28-survey-automation.json",
    "tags": [
      "Product",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Hosts a survey form, analyses each response with AI (NPS, sentiment, themes) and follows up with detractors.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: nps <= 6",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 228
  },
  {
    "slug": "n8n-29-webinar-automation",
    "title": "AI Webinar Automation",
    "tagline": "Handles webinar registrations: personalised confirmation, lead scoring from registration answers and sales alerts.",
    "summary": "Handles webinar registrations: personalised confirmation, lead scoring from registration answers and sales alerts. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Handles webinar registrations: personalised confirmation, lead scoring from registration answers and sales alerts.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"lead_score >= 70\". When it holds, the workflow runs \"Send Email\", \"Slack #sales\" and \"Flatten Row (Webinar Registrants)\". When it does not, it runs \"Send Email 2\" and \"Flatten Row (Webinar Registrants) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/29.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/29-webinar-automation.json",
    "tags": [
      "Marketing",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Handles webinar registrations: personalised confirmation, lead scoring from registration answers and sales alerts.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: lead_score >= 70",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 229
  },
  {
    "slug": "n8n-30-job-screener",
    "title": "AI Job Application Screener",
    "tagline": "Scores CVs against the job description, summarises strengths/gaps and fast-tracks strong candidates.",
    "summary": "Scores CVs against the job description, summarises strengths/gaps and fast-tracks strong candidates. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Scores CVs against the job description, summarises strengths/gaps and fast-tracks strong candidates.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"fit_score >= 75\". When it holds, the workflow runs \"Slack #hiring\" and \"Flatten Row (Candidates)\". When it does not, it runs \"Flatten Row (Candidates) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/30.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/30-job-screener.json",
    "tags": [
      "HR",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Scores CVs against the job description, summarises strengths/gaps and fast-tracks strong candidates.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: fit_score >= 75",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 230
  },
  {
    "slug": "n8n-31-interview-scheduler",
    "title": "AI Interview Scheduler",
    "tagline": "Proposes interview slots from interviewer availability, books the calendar event and emails the candidate.",
    "summary": "Proposes interview slots from interviewer availability, books the calendar event and emails the candidate. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Proposes interview slots from interviewer availability, books the calendar event and emails the candidate.\n\nThis workflow runs on a schedule. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_complete is true\". When it holds, the workflow runs \"Create Calendar Event\" and \"Send Email\". When it does not, it runs \"Send Email 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Calendar and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/31.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/31-interview-scheduler.json",
    "tags": [
      "HR",
      "Gmail",
      "Google Calendar",
      "OpenAI"
    ],
    "highlights": [
      "Proposes interview slots from interviewer availability, books the calendar event and emails the candidate.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_complete is true",
      "Connects: Gmail, Google Calendar, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 231
  },
  {
    "slug": "n8n-32-employee-onboarding",
    "title": "AI Employee Onboarding",
    "tagline": "Creates a role-specific onboarding plan and welcome email for new hires and notifies IT/manager of setup tasks.",
    "summary": "Creates a role-specific onboarding plan and welcome email for new hires and notifies IT/manager of setup tasks. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Creates a role-specific onboarding plan and welcome email for new hires and notifies IT/manager of setup tasks.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"it_requests has items\". When it holds, the workflow runs \"Slack #it-requests\", \"Send Email\" and \"Flatten Row (New Hires)\". When it does not, it runs \"Send Email 2\" and \"Flatten Row (New Hires) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Gmail, Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/32.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/32-employee-onboarding.json",
    "tags": [
      "HR",
      "Gmail",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Creates a role-specific onboarding plan and welcome email for new hires and notifies IT/manager of setup tasks.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: it_requests has items",
      "Connects: Gmail, Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 232
  },
  {
    "slug": "n8n-33-timesheet-collector",
    "title": "AI Timesheet Collector",
    "tagline": "Every Friday reviews timesheets, chases missing entries with friendly reminders and flags overtime anomalies.",
    "summary": "Every Friday reviews timesheets, chases missing entries with friendly reminders and flags overtime anomalies. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Every Friday reviews timesheets, chases missing entries with friendly reminders and flags overtime anomalies.\n\nThis workflow runs on a schedule (cron expression 0 16 * * 5), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"is_incomplete is true\". When it holds, the workflow runs \"Send Email\".\n\nIt connects to Gmail, Google Sheets and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/33.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/33-timesheet-collector.json",
    "tags": [
      "HR",
      "Gmail",
      "Google Sheets",
      "OpenAI"
    ],
    "highlights": [
      "Every Friday reviews timesheets, chases missing entries with friendly reminders and flags overtime anomalies.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_incomplete is true",
      "Connects: Gmail, Google Sheets, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 233
  },
  {
    "slug": "n8n-34-compliance-checker",
    "title": "AI Compliance Checker",
    "tagline": "Checks policies, marketing copy or contracts against GDPR/brand/regulatory rules and reports violations with fixes.",
    "summary": "Checks policies, marketing copy or contracts against GDPR/brand/regulatory rules and reports violations with fixes. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Checks policies, marketing copy or contracts against GDPR/brand/regulatory rules and reports violations with fixes.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"high_severity_count >= 1\". When it holds, the workflow runs \"Slack #compliance\" and \"Flatten Row (Compliance Log)\". When it does not, it runs \"Flatten Row (Compliance Log) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/34.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/34-compliance-checker.json",
    "tags": [
      "Legal",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Checks policies, marketing copy or contracts against GDPR/brand/regulatory rules and reports violations with fixes.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: high_severity_count >= 1",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 234
  },
  {
    "slug": "n8n-35-contract-analyzer",
    "title": "AI Contract Analyzer",
    "tagline": "Extracts parties, dates, value and key clauses from contracts and highlights risky terms for legal review.",
    "summary": "Extracts parties, dates, value and key clauses from contracts and highlights risky terms for legal review. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Extracts parties, dates, value and key clauses from contracts and highlights risky terms for legal review.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"risk_score >= 60\". When it holds, the workflow runs \"Slack #legal\" and \"Flatten Row (Contracts)\". When it does not, it runs \"Flatten Row (Contracts) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/35.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/35-contract-analyzer.json",
    "tags": [
      "Legal",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Extracts parties, dates, value and key clauses from contracts and highlights risky terms for legal review.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: risk_score >= 60",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 235
  },
  {
    "slug": "n8n-36-project-status",
    "title": "AI Project Status Reporter",
    "tagline": "Every Friday pulls tasks from your PM tool API and writes a RAG-status project report for stakeholders.",
    "summary": "Every Friday pulls tasks from your PM tool API and writes a RAG-status project report for stakeholders. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Every Friday pulls tasks from your PM tool API and writes a RAG-status project report for stakeholders.\n\nThis workflow runs on a schedule (cron expression 0 15 * * 5), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"rag = red\". When it holds, the workflow runs \"Slack #projects\" and \"Send Email\". When it does not, it runs \"Send Email 2\" instead.\n\nIt connects to Gmail, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/36.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/36-project-status.json",
    "tags": [
      "Productivity",
      "Gmail",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Every Friday pulls tasks from your PM tool API and writes a RAG-status project report for stakeholders.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: rag = red",
      "Connects: Gmail, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 236
  },
  {
    "slug": "n8n-37-task-automation",
    "title": "AI Task Automation",
    "tagline": "Turns free-text requests (\"remind Priya to send the deck by Thursday\") into structured, prioritised tasks in your task tool.",
    "summary": "Turns free-text requests (\"remind Priya to send the deck by Thursday\") into structured, prioritised tasks in your task tool. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Turns free-text requests (\"remind Priya to send the deck by Thursday\") into structured, prioritised tasks in your task tool.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"priority <= 1\". When it holds, the workflow runs \"POST to task Api API\" and \"Slack #tasks\". When it does not, it runs \"POST to task Api API 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/37.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/37-task-automation.json",
    "tags": [
      "Productivity",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Turns free-text requests (\"remind Priya to send the deck by Thursday\") into structured, prioritised tasks in your task tool.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: priority <= 1",
      "Connects: OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 237
  },
  {
    "slug": "n8n-38-file-organizer",
    "title": "AI File Organizer",
    "tagline": "Suggests a clean file name, folder path and tags for every uploaded file based on its name and content preview.",
    "summary": "Suggests a clean file name, folder path and tags for every uploaded file based on its name and content preview. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Suggests a clean file name, folder path and tags for every uploaded file based on its name and content preview.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"contains_sensitive is true\". When it holds, the workflow runs \"Slack #ops\" and \"Flatten Row (File Index)\". When it does not, it runs \"Flatten Row (File Index) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/38.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/38-file-organizer.json",
    "tags": [
      "Operations",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Suggests a clean file name, folder path and tags for every uploaded file based on its name and content preview.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: contains_sensitive is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 238
  },
  {
    "slug": "n8n-39-transcription",
    "title": "AI Transcription Automation",
    "tagline": "Transcribes audio from a URL with OpenAI Whisper, then summarises it and extracts action items.",
    "summary": "Transcribes audio from a URL with OpenAI Whisper, then summarises it and extracts action items. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Transcribes audio from a URL with OpenAI Whisper, then summarises it and extracts action items.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"action_items has items\". When it holds, the workflow runs \"Slack #transcripts\" and \"Flatten Row (Transcripts)\". When it does not, it runs \"Flatten Row (Transcripts) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/39.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/39-transcription.json",
    "tags": [
      "Productivity",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Transcribes audio from a URL with OpenAI Whisper, then summarises it and extracts action items.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: action_items has items",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 239
  },
  {
    "slug": "n8n-40-translator",
    "title": "AI Language Translator",
    "tagline": "Translates text into one or more target languages preserving tone and formatting, with a quality self-check.",
    "summary": "Translates text into one or more target languages preserving tone and formatting, with a quality self-check. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Translates text into one or more target languages preserving tone and formatting, with a quality self-check.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"confidence >= 0.85\". When it does not, it runs \"Slack #localization\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/40.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/40-translator.json",
    "tags": [
      "Communication",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Translates text into one or more target languages preserving tone and formatting, with a quality self-check.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: confidence >= 0.85",
      "Connects: OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 240
  },
  {
    "slug": "n8n-41-voice-assistant",
    "title": "AI Voice Assistant",
    "tagline": "Accepts a voice note URL, transcribes it with Whisper, answers/acts on the request and returns a spoken MP3 reply via OpenAI TTS.",
    "summary": "Accepts a voice note URL, transcribes it with Whisper, answers/acts on the request and returns a spoken MP3 reply via OpenAI TTS. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Accepts a voice note URL, transcribes it with Whisper, answers/acts on the request and returns a spoken MP3 reply via OpenAI TTS.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"is_task is true\". When it holds, the workflow runs \"Flatten Row (Voice Tasks)\". Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets and OpenAI. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/41.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/41-voice-assistant.json",
    "tags": [
      "Communication",
      "Google Sheets",
      "OpenAI"
    ],
    "highlights": [
      "Accepts a voice note URL, transcribes it with Whisper, answers/acts on the request and returns a spoken MP3 reply via OpenAI TTS.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: is_task is true",
      "Connects: Google Sheets, OpenAI",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 241
  },
  {
    "slug": "n8n-42-competitor-monitor",
    "title": "AI Competitor Monitor",
    "tagline": "Daily fetches competitor pages, has AI compare against the last snapshot and reports meaningful changes.",
    "summary": "Daily fetches competitor pages, has AI compare against the last snapshot and reports meaningful changes. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily fetches competitor pages, has AI compare against the last snapshot and reports meaningful changes.\n\nThis workflow runs on a schedule (cron expression 0 7 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Page\" node pulls the working data before the AI step.\n\nThe decision point is \"significance >= 5\". When it holds, the workflow runs \"Slack #competitive-intel\" and \"Flatten Row (Competitor Snapshots)\". When it does not, it runs \"Flatten Row (Competitor Snapshots) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/42.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/42-competitor-monitor.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily fetches competitor pages, has AI compare against the last snapshot and reports meaningful changes.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: significance >= 5",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 242
  },
  {
    "slug": "n8n-43-price-monitoring",
    "title": "AI Price Monitoring",
    "tagline": "Every 4 hours checks product pages for prices, compares with your price and recommends adjustments.",
    "summary": "Every 4 hours checks product pages for prices, compares with your price and recommends adjustments. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Every 4 hours checks product pages for prices, compares with your price and recommends adjustments.\n\nThis workflow runs on a schedule (cron expression 0 */4 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Page\" node pulls the working data before the AI step.\n\nThe decision point is \"price_gap_pct >= 5\". When it holds, the workflow runs \"Slack #pricing\" and \"Flatten Row (Price History)\". When it does not, it runs \"Flatten Row (Price History) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/43.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/43-price-monitoring.json",
    "tags": [
      "E-commerce",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Every 4 hours checks product pages for prices, compares with your price and recommends adjustments.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: price_gap_pct >= 5",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 243
  },
  {
    "slug": "n8n-44-local-seo",
    "title": "AI Local SEO Monitor",
    "tagline": "Weekly audits your local business listing / landing page for NAP consistency, keywords and review signals, with fixes.",
    "summary": "Weekly audits your local business listing / landing page for NAP consistency, keywords and review signals, with fixes. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Weekly audits your local business listing / landing page for NAP consistency, keywords and review signals, with fixes.\n\nThis workflow runs on a schedule (cron expression 0 9 * * 1), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Page\" node pulls the working data before the AI step.\n\nThe decision point is \"score <= 70\". When it holds, the workflow runs \"Slack #seo\" and \"Flatten Row (Local SEO)\". When it does not, it runs \"Flatten Row (Local SEO) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/44.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/44-local-seo.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Weekly audits your local business listing / landing page for NAP consistency, keywords and review signals, with fixes.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: score <= 70",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 244
  },
  {
    "slug": "n8n-45-ad-performance",
    "title": "AI Ad Performance Monitor",
    "tagline": "Daily pulls ad campaign metrics, detects wasted spend and anomalies and recommends budget shifts.",
    "summary": "Daily pulls ad campaign metrics, detects wasted spend and anomalies and recommends budget shifts. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily pulls ad campaign metrics, detects wasted spend and anomalies and recommends budget shifts.\n\nThis workflow runs on a schedule (cron expression 0 8 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"needs_attention is true\". When it holds, the workflow runs \"Slack #paid-media\" and \"Flatten Row (Ad Performance)\". When it does not, it runs \"Flatten Row (Ad Performance) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/45.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/45-ad-performance.json",
    "tags": [
      "Marketing",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily pulls ad campaign metrics, detects wasted spend and anomalies and recommends budget shifts.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: needs_attention is true",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 245
  },
  {
    "slug": "n8n-46-client-comms-hub",
    "title": "AI Client Communication Hub",
    "tagline": "One inbox webhook for every client channel (email, WhatsApp, chat, forms): AI classifies, drafts replies and routes to the right owner.",
    "summary": "One inbox webhook for every client channel (email, WhatsApp, chat, forms): AI classifies, drafts replies and routes to the right owner. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "One inbox webhook for every client channel (email, WhatsApp, chat, forms): AI classifies, drafts replies and routes to the right owner.\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"priority = high\". When it holds, the workflow runs \"Slack #client-comms\" and \"Flatten Row (Client Messages)\". When it does not, it runs \"Flatten Row (Client Messages) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/46.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/46-client-comms-hub.json",
    "tags": [
      "Communication",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "One inbox webhook for every client channel (email, WhatsApp, chat, forms): AI classifies, drafts replies and routes to the right owner.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: priority = high",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 246
  },
  {
    "slug": "n8n-47-backup-automation",
    "title": "AI Backup Automation",
    "tagline": "Nightly exports every n8n workflow via the n8n API to a GitHub repo and has AI summarise what changed.",
    "summary": "Nightly exports every n8n workflow via the n8n API to a GitHub repo and has AI summarise what changed. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Nightly exports every n8n workflow via the n8n API to a GitHub repo and has AI summarise what changed.\n\nThis workflow runs on a schedule (cron expression 0 2 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"issues_found is true\". When it holds, the workflow runs \"Slack #devops\" and \"Get Existing Backup\". When it does not, it runs \"Get Existing Backup 2\" instead.\n\nIt connects to GitHub, Header Auth (X-N8N-API-KEY), OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/47.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/47-backup-automation.json",
    "tags": [
      "IT",
      "GitHub",
      "Header Auth (X-N8N-API-KEY)",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Nightly exports every n8n workflow via the n8n API to a GitHub repo and has AI summarise what changed.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: issues_found is true",
      "Connects: GitHub, Header Auth (X-N8N-API-KEY), OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 247
  },
  {
    "slug": "n8n-48-system-health",
    "title": "AI System Health Monitor",
    "tagline": "Pings your endpoints every 5 minutes; AI diagnoses failures/slow responses and alerts with likely causes.",
    "summary": "Pings your endpoints every 5 minutes; AI diagnoses failures/slow responses and alerts with likely causes. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Pings your endpoints every 5 minutes; AI diagnoses failures/slow responses and alerts with likely causes.\n\nThis workflow runs on a schedule (cron expression */5 * * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"healthy is false\". When it holds, the workflow runs \"Slack #alerts\".\n\nIt connects to OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/48.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/48-system-health.json",
    "tags": [
      "IT",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Pings your endpoints every 5 minutes; AI diagnoses failures/slow responses and alerts with likely causes.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: healthy is false",
      "Connects: OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 248
  },
  {
    "slug": "n8n-49-workflow-orchestrator",
    "title": "AI Workflow Orchestrator",
    "tagline": "A single smart entry point: AI reads any incoming request and routes it to the right automation webhook (lead, ticket, invoice, meeting notes...).",
    "summary": "A single smart entry point: AI reads any incoming request and routes it to the right automation webhook (lead, ticket, invoice, meeting notes...). One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "A single smart entry point: AI reads any incoming request and routes it to the right automation webhook (lead, ticket, invoice, meeting notes...).\n\nThis workflow listens on a webhook for a JSON POST - the request body is the raw input. A Respond to Webhook node answers the caller with the AI result as JSON. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result.\n\nThe decision point is \"confidence >= 0.7\". When it holds, the workflow runs \"Forward to Target Workflow\". When it does not, it runs \"Slack #automation\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/49.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/49-workflow-orchestrator.json",
    "tags": [
      "IT",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "A single smart entry point: AI reads any incoming request and routes it to the right automation webhook (lead, ticket, invoice, meeting notes...).",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: confidence >= 0.7",
      "Connects: OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 249
  },
  {
    "slug": "n8n-50-business-insights",
    "title": "AI Business Insights Dashboard",
    "tagline": "Daily combines sales, marketing, support and finance metrics into an AI-written insights digest and logs KPIs for a dashboard.",
    "summary": "Daily combines sales, marketing, support and finance metrics into an AI-written insights digest and logs KPIs for a dashboard. One of 50 ready-to-import n8n automations built on a single pattern: trigger, config, an AI step with a strict JSON schema, one business rule, then the actions.",
    "body": "Daily combines sales, marketing, support and finance metrics into an AI-written insights digest and logs KPIs for a dashboard.\n\nThis workflow runs on a schedule (cron expression 0 7 * * *), so it works through the source data on its own without anyone kicking it off. Behind the trigger it follows the same spine as the rest of the set: a Config node holds the model choice, sheet URLs and endpoints, a Prepare AI Input node shapes the prompt, an AI Analyze node calls OpenAI in JSON mode with a task-specific system prompt, and a Parse AI Output node validates the structured result. A \"Fetch Data\" node pulls the working data before the AI step.\n\nThe decision point is \"health_score <= 60\". When it holds, the workflow runs \"Slack #leadership\" and \"Flatten Row (Daily Insights)\". When it does not, it runs \"Slack #leadership 2\" and \"Flatten Row (Daily Insights) 2\" instead. Every run ends in a log entry or a webhook response, so nothing finishes silently.\n\nIt connects to Google Sheets, OpenAI and Slack. The workflow file is one import: drop the JSON into any n8n instance, edit the Config node, attach the credentials, pick the target channels or sheets, and activate. The canvas carries an About sticky note with setup steps and a fictional sample payload.\n\nState: imported into my self-hosted n8n and viewable on the canvas (screenshot above); it is inactive and not configured - no credentials are attached and it has never been executed. The source JSON is public in the workflows repository linked below.",
    "coverUrl": "/works/n8n/50.png",
    "sourceUrl": "https://github.com/itz-kirankumar/workflows/blob/main/workflows/50-business-insights.json",
    "tags": [
      "Analytics",
      "Google Sheets",
      "OpenAI",
      "Slack"
    ],
    "highlights": [
      "Daily combines sales, marketing, support and finance metrics into an AI-written insights digest and logs KPIs for a dashboard.",
      "AI step uses a strict JSON output schema, validated before any action runs",
      "Business rule: health_score <= 60",
      "Connects: Google Sheets, OpenAI, Slack",
      "One-file import into any n8n instance; About sticky note on the canvas"
    ],
    "order": 250
  }
]
