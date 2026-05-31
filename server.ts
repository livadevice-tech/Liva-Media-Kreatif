import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiInstance;
}

// Safe error responder to prevent sensitive information leak in production environments
function getSafeErrorMessage(error: any): string {
  if (process.env.NODE_ENV !== "production") {
    return error?.message || "Unknown error";
  }
  return "Internal Server Error";
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Dynamic AI Assistant for Agency Performance
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, hosts, logs, alerts } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages body" });
    }

    const ai = getGeminiClient();

    // If API Key is missing, respond with a helpful local agent simulator
    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const lowerMsg = lastUserMsg.toLowerCase();
      let responseText = "";

      if (lowerMsg.includes("top-performing") || lowerMsg.includes("top performing") || lowerMsg.includes("best host") || lowerMsg.includes("highest revenue")) {
        responseText = "📊 **[Demo Mode - No API Key Set]**\nBased on your agency data, **Amanda Putri** is the top-performing host this week, generating **Rp 77.4M** with a **4.82% average conversion rate** and a flawless **97% consistency rating**. Amanda is exceptionally strong in beauty products handled via TikTok Live.";
      } else if (lowerMsg.includes("dedi") || lowerMsg.includes("anomaly") || lowerMsg.includes("attendance")) {
        responseText = "🔍 **[Demo Mode - No API Key Set]**\nMy analysis of **Dedi Kurniawan** shows a critical attendance warning:\n- **Incident Count**: 2 unexcused absences and 2 latenesses in the past week.\n- **Trend**: Repeated shifts missed highlight high friction on Shopee afternoon block. We recommend introducing mandatory morning check-ins or moving his schedule to a later time slot.";
      } else if (lowerMsg.includes("fraud") || lowerMsg.includes("budi")) {
        responseText = "⚠️ **[Demo Mode - No API Key Set]**\nFraud report for **Budi Wijaya**:\n- **Triggered**: Duplicate Log on May 21st, 2026.\n- **Detail**: Two records submitted with matching session metrics (Rp 16.5M revenue, 260 orders) for parallel slots on Tokopedia and TikTok Live. This indicates duplicate data entry or a deliberate double-submission attempt.";
      } else if (lowerMsg.includes("recommend") || lowerMsg.includes("pair") || lowerMsg.includes("somethinc") || lowerMsg.includes("wardah")) {
        responseText = "💡 **[Demo Mode - No API Key Set]**\nRecommended smart pairings:\n- **Amanda Putri** ➔ **Somethinc** on **TikTok Live (Evening)**: Amanda's high energy matches cosmetic triggers, achieving up to 5.6% conversion.\n- **Clara Angelica** ➔ **Eiger** on **Shopee Live (Afternoon)**: Clara delivers high transaction sizes for active fashion brands.";
      } else {
        responseText = `🤖 **[Demo Mode - AI Assistant]**\nI'm ready to help you coordinate Liva Media Kreatif streaming hosts! (API Key is not fully active, running in offline analytics mode).\n\nHere are some questions you can ask me:\n- "Who is the top-performing host this week?"\n- "Tell me about Dedi's attendance anomalies."\n- "Show me suspicious logs or duplicate entries."\n- "What are your smart recommendations for brand pairings?"`;
      }

      return res.json({
        content: responseText,
        demoMode: true
      });
    }

    // Convert datasets into brief strings for Gemini's context
    const hostsBrief = hosts ? hosts.map((h: any) => `${h.name} (${h.role}, ID: ${h.employeeId}, consistency: ${h.consistencyScore}%, brands: ${h.brands.join(', ')})`).join("\n") : "";
    const logsBrief = logs ? logs.slice(0, 40).map((l: any) => `- ${l.date} | ${l.hostName} | Status: ${l.status} | Platform: ${l.platform} | Brand: ${l.brandHandled} | Rev: Rp ${l.revenueGenerated.toLocaleString()} | Conv: ${l.conversionRate}% | Eng: ${l.engagementRate}%`).join("\n") : "";
    const activeAlertsBrief = alerts ? alerts.filter((a: any) => !a.resolved).map((a: any) => `ALERT: [${a.severity}] ${a.hostName} - ${a.message}`).join("\n") : "";

    const systemInstruction = `
You are the Lead SaaS Workflow Architect & AI Officer for the "Host Intelligence Platform", a premium system built for "Liva Media Kreatif", an elite live streaming agency.
Your task is to analyze employee attendance, performance metrics, and shifts to improve operations.
Here is the current agency database:

[ACTIVE HOST EMPLOYEES]
${hostsBrief}

[RECENT ATTENDANCE & STREAM PERFORMANCE LOGS]
${logsBrief}

[CURRENT UNRESOLVED KPI ALERTS / DETECTED ISSUES]
${activeAlertsBrief}

Your tone should be highly professional, structured, conversational, and direct. Avoid repeating unnecessary introductory filler. Use formatted markdown lists, bold metrics, or markdown tables when helpful!
When talking about monetary values, always use IDR formatted with standard prefixes (e.g. Rp 15.000.000). Answer the user's specific questions using exact facts from the payload.
`;

    // Package previous messages into the proper contents payload
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    res.json({
      content: response.text || "I was unable to analyze that. Please rephrase your query.",
      demoMode: false
    });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: "Error communicating with AI Assistant", details: getSafeErrorMessage(error) });
  }
});

// AI Weekly Summary Generator
app.post("/api/ai/weekly-summary", async (req, res) => {
  try {
    const { hosts, logs, alerts } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return a detailed, structured, pre-rendered summary in Markdown when API Key is missing.
      const summaryMarkdown = `
### 📊 Liva Media Kreatif - Performance Summary

#### 1. Core Operations & Performance Highlights
- **Total Agency Streaming Revenue**: **Rp 299.800.000 IDR** logged from 30 active sessions inside our index.
- **Top Performer**: **Amanda Putri (Senior Host)** leads the roster generating **Rp 77.400.000 IDR** with an average conversion rate of **4.82%**.
- **Channel Prowess**: **TikTok Live** is generating the maximum absolute engagement, while **Shopee Live** holds the highest order conversion on fashion products.

#### 2. 🚨 Attendance & Fraud Alerts
- **Dedi Kurniawan**: Flagged under **Critical Attendance Failure** due to **40% absenteeism** and recurrent lateness. This is hurting client scheduling targets for Wardah cosmetics.
- **Budi Wijaya**: Double-billing alert triggered on **May 21st**. Parallel sessions were registered on both TikTok and Tokopedia at the exact same hour with identical performance numbers. Needs urgent administrative review.

#### 3. 💡 Smart Recommendations for Future Shifts
- **Pairing Tip**: Assign **Amanda Putri** exclusively to **Somethinc** and **Somethinc's** weekend evening slots.
- **Platform Optimization**: Route **Clara Angelica** to **Shopee Live** for specialized fashion campaigns as she secures a premium **6.2% conversion rate** there.
- **Trainee Onboarding**: Pair trainee **Estella Rose** with a co-host or assign her to less saturated midday slots for **Wardah cosmetics** on Shopee to build live stamina.
`;
      return res.json({ summary: summaryMarkdown, demoMode: true });
    }

    const prompt = `
Analyze the host streaming statistics and recent logs to generate a comprehensive, executive-level **Agency Intelligence Summary** for management.
Make it highly professional, structured, and insightful.

Include three specific sections:
1. **Performance Highlights**: Total revenue generated (calculate from logs if possible), best platform, and top-performing hosts. Use Rp formatting.
2. **Attendance Anomalies & Fraud Risks**: Clearly call out hosts with repeated lateness/absences (like Dedi) and any suspicious duplicate logs flagged (like Budi's overlapping log).
3. **Actionable Recommendations**: Clear, specific recommendations on ideal pairing of hosts, platforms, and brands to maximize future revenue.

Hosts Dataset:
${JSON.stringify(hosts)}

Attendance Logs:
${JSON.stringify(logs)}

Unresolved Alerts:
${JSON.stringify(alerts)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite Operations Director and AI Analyst for a top Asian streaming MCN agency. Deliver highly structured, valuable, bulleted reports.",
        temperature: 0.15
      }
    });

    res.json({ summary: response.text || "Could not generate summary." });

  } catch (error: any) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: "Failed to generate AI summary", details: getSafeErrorMessage(error) });
  }
});

// AI Performance Scorer & KPI Evaluation
app.post("/api/ai/evaluate-host", async (req, res) => {
  try {
    const { host, logs } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Local fallback
      const result = {
        score: host.id === "h4" ? 45 : host.id === "h1" ? 98 : 85,
        grade: host.id === "h4" ? "D" : host.id === "h1" ? "A+" : "B",
        strengths: ["Loyal brand connection", "Engaged with local food niches"],
        growthAreas: ["Critical lateness issues", "High absenteeism"],
        recommendedAction: "Mandatory check-in rules or co-host assignment."
      };
      return res.json({ evaluation: result, demoMode: true });
    }

    const prompt = `
Generate a quick, precise KPI performance scoring card for of this host. Evaluate their logs for revenue, conversion rate, engagement, and punctuality.
Host profile:
${JSON.stringify(host)}

Logs for past week:
${JSON.stringify(logs)}

Format your output strictly as a JSON object with properties:
"score" (number from 0 to 100),
"grade" (string like "A+", "A", "B", "C", "D"),
"strengths" (array of 2 strings),
"growthAreas" (array of 2 strings),
"recommendedAction" (string).
Do not output markdown code blocks. Just direct stringified JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ evaluation: parsed, demoMode: false });

  } catch (error: any) {
    console.error("Evaluation API Error:", error);
    res.status(500).json({ error: "Failed to evaluate host KPI", details: getSafeErrorMessage(error) });
  }
});


// Serve static assets & build files as Vite middleware or standard production Static server
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Host Intelligence Platform Backend is listening on port ${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start server bootstrap:", err);
});
