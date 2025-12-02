import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { player1, player2 } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const systemMessage = `You are an expert fantasy football analyst. Compare two players and provide detailed insights on who is the better fantasy option and why. Be specific about matchups, recent performance, and future outlook. Format your response in clear paragraphs.`;

    const prompt = `Compare these two fantasy football players:

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const comparison = completion.choices[0].message.content;

    return NextResponse.json({ comparison });
  } catch (error: any) {
    console.error("Comparison API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate comparison" },
      { status: 500 }
    );
  }
}
