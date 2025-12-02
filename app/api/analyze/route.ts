import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    let prompt = "";
    let systemMessage = "";

    // Generate different prompts based on analysis type
    switch (type) {
      case "lineup":
        systemMessage = `You are an expert fantasy football analyst. Analyze the user's roster and provide specific start/sit recommendations based on matchups, recent performance, and projections. Be concise but insightful.`;
        prompt = `Analyze this fantasy football roster and provide start/sit recommendations:

Scoring Format: ${data.scoringFormat || "Standard"}
League Size: ${data.leagueSize || "Unknown"} teams

Roster:
${data.roster.map((p: any) => `${p.name} (${p.position} - ${p.team || "Unknown"})${p.projectedPoints ? ` - Proj: ${p.projectedPoints}` : ""}`).join("\n")}

Provide:
1. Top 3-5 players you'd confidently start this week with brief reasoning
2. Top 3-5 players you'd consider benching with brief reasoning
3. Any key matchup insights`;
        break;

      case "waiver":
        systemMessage = `You are an expert fantasy football analyst specializing in waiver wire pickups. Identify high-value players and explain why they're worth adding.`;
        prompt = `Analyze these available players and recommend waiver wire targets:

Scoring Format: ${data.scoringFormat || "Standard"}
League Size: ${data.leagueSize || "Unknown"} teams

Current Roster:
${data.roster.map((p: any) => `${p.name} (${p.position})`).join(", ")}

Available Players:
${data.availablePlayers.slice(0, 20).map((p: any) => `${p.name} (${p.position} - ${p.team || "Unknown"})`).join("\n")}

Provide:
1. Top 3-5 must-add players with priority ranking
2. Brief explanation for each (opportunity, matchup, trend)
3. Which roster positions need the most help`;
        break;

      case "overview":
        systemMessage = `You are an expert fantasy football analyst. Provide a comprehensive overview of the team's strengths, weaknesses, and strategy recommendations.`;
        prompt = `Analyze this fantasy football team:

Scoring Format: ${data.scoringFormat || "Standard"}
League Size: ${data.leagueSize || "Unknown"} teams

Roster:
${data.roster.map((p: any) => `${p.name} (${p.position} - ${p.team || "Unknown"})`).join("\n")}

Provide:
1. Team strengths (2-3 points)
2. Team weaknesses / areas of concern (2-3 points)
3. Recommended strategy for the next few weeks
4. Overall team grade (A-F) with justification`;
        break;

      default:
        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
