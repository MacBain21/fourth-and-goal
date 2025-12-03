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
        systemMessage = `You are an expert fantasy football analyst specializing in waiver wire pickups. Only recommend adds when the available player is clearly better than someone on the current roster. Always specify who to drop.`;
        prompt = `Analyze these available players and recommend waiver wire moves ONLY if they are upgrades:

Scoring Format: ${data.scoringFormat || "Standard"}
League Size: ${data.leagueSize || "Unknown"} teams

Current Roster (with projected points):
${data.roster.map((p: any) => `${p.name} (${p.position} - ${p.team || "Unknown"})${p.projectedPoints ? ` - Proj: ${p.projectedPoints.toFixed(1)}` : ""}`).join("\n")}

Top Available Players (with projected points):
${data.availablePlayers.slice(0, 30).map((p: any) => `${p.name} (${p.position} - ${p.team || "Unknown"})${p.projectedPoints ? ` - Proj: ${p.projectedPoints.toFixed(1)}` : ""}`).join("\n")}

IMPORTANT INSTRUCTIONS:
1. Only recommend adding a player if they are a clear upgrade over someone currently on the roster
2. For each recommended add, you MUST specify exactly which player to drop
3. Compare projected points and recent performance to justify the swap
4. If there are no clear upgrades available, say "No recommended moves - your roster is stronger than the available options"
5. Prioritize recommendations by position need and upside

Format each recommendation as:
ADD: [Player Name] ([Position] - [Team])
DROP: [Player Name] ([Position] - [Team])
REASON: [Brief explanation of why this is an upgrade]`;
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
