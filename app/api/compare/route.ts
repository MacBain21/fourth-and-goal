import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Check if this is a trade analysis (new format) or simple player comparison (legacy)
    const isTrade = body.myTeam && body.theirTeam;

    let systemMessage = "";
    let prompt = "";

    if (isTrade) {
      // Multi-player trade analysis
      const { myTeam, theirTeam, scoringFormat } = body;

      systemMessage = `You are an expert fantasy football analyst specializing in trade evaluation. Analyze trades based on both teams' rosters, position needs, and overall team impact. Consider positional scarcity, depth, and playoff potential.`;

      // Calculate position counts for both teams
      const getPositionCounts = (roster: any[]) => {
        return roster.reduce((acc, p) => {
          acc[p.position] = (acc[p.position] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      };

      const myPositions = getPositionCounts(myTeam.roster);
      const theirPositions = getPositionCounts(theirTeam.roster);

      prompt = `Analyze this fantasy football trade proposal:

TRADE DETAILS:
Scoring Format: ${scoringFormat}

YOU GIVE:
${myTeam.giving.map((p: any) => `- ${p.name} (${p.position} - ${p.team || "FA"})${p.projectedPoints ? ` [Proj: ${p.projectedPoints.toFixed(1)} pts]` : ""}`).join("\n")}

YOU RECEIVE:
${theirTeam.giving.map((p: any) => `- ${p.name} (${p.position} - ${p.team || "FA"})${p.projectedPoints ? ` [Proj: ${p.projectedPoints.toFixed(1)} pts]` : ""}`).join("\n")}

YOUR CURRENT ROSTER (${myTeam.roster.length} players):
Position Breakdown: ${Object.entries(myPositions).map(([pos, count]) => `${count} ${pos}`).join(", ")}
${myTeam.roster.map((p: any) => `- ${p.name} (${p.position} - ${p.team || "FA"})${p.projectedPoints ? ` [${p.projectedPoints.toFixed(1)} pts]` : ""}`).join("\n")}

${theirTeam.name.toUpperCase()}'S CURRENT ROSTER (${theirTeam.roster.length} players):
Position Breakdown: ${Object.entries(theirPositions).map(([pos, count]) => `${count} ${pos}`).join(", ")}
${theirTeam.roster.map((p: any) => `- ${p.name} (${p.position} - ${p.team || "FA"})${p.projectedPoints ? ` [${p.projectedPoints.toFixed(1)} pts]` : ""}`).join("\n")}

PROVIDE A COMPREHENSIVE TRADE ANALYSIS:

1. TRADE VERDICT (Accept/Decline/Counter)
   - Overall recommendation with confidence level

2. VALUE ANALYSIS
   - Compare total projected points being exchanged
   - Assess player quality/upside of each side
   - Which side wins on raw value?

3. YOUR TEAM IMPACT
   - How does this affect your starting lineup?
   - Position depth before/after trade
   - Does this address a weakness or create one?
   - Positional needs analysis

4. THEIR TEAM IMPACT
   - Why this trade makes sense (or doesn't) for ${theirTeam.name}
   - What positions do they need?
   - Are they selling high or buying low?

5. RISKS & CONSIDERATIONS
   - Injury concerns
   - Bye week impacts
   - Schedule strength (playoff matchups)
   - Any players you'd regret trading?

6. COUNTER OFFER (if applicable)
   - If declining, suggest alternative players to target
   - More balanced swap proposal

Keep your analysis clear, actionable, and data-driven.`;
    } else {
      // Legacy simple player comparison
      const { player1, player2 } = body;

      systemMessage = `You are an expert fantasy football analyst. Compare two players and provide detailed insights on who is the better fantasy option and why. Be specific about matchups, recent performance, and future outlook. Format your response in clear paragraphs.`;

      prompt = `Compare these two fantasy football players:

Player 1: ${player1.name} (${player1.position} - ${player1.team || "Free Agent"})
${player1.projectedPoints ? `Projected Points: ${player1.projectedPoints}` : ""}

Player 2: ${player2.name} (${player2.position} - ${player2.team || "Free Agent"})
${player2.projectedPoints ? `Projected Points: ${player2.projectedPoints}` : ""}

Provide a comprehensive comparison covering:
1. Overall recommendation (which player to start/add)
2. Key strengths of each player
3. Matchup analysis and recent trends
4. Risk factors for each
5. Final verdict with confidence level`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500, // Increased for more detailed trade analysis
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis, comparison: analysis }); // Return both for compatibility
  } catch (error: any) {
    console.error("Trade Analysis API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
