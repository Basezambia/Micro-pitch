import { NextRequest, NextResponse } from 'next/server';

// Mock implementation of the AI pitch analysis
// In production, this would integrate with the actual OpenAI agents
async function analyzePitch(pitchData: any): Promise<{
  score: number;
  analysis: string;
  improvedPitch?: string;
  suggestions?: string[];
}> {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock scoring logic based on completeness
  let score = 50;
  
  if (pitchData.title && pitchData.title.length > 10) score += 10;
  if (pitchData.oneLiner && pitchData.oneLiner.length > 20) score += 10;
  if (pitchData.description && pitchData.description.length > 100) score += 15;
  if (pitchData.category) score += 5;
  if (pitchData.traction && pitchData.traction.length > 50) score += 10;
  if (pitchData.targetAmount > 0) score += 5;
  if (pitchData.equityOffered > 0) score += 5;
  if (pitchData.valuation > 0) score += 5;
  if (pitchData.tags && pitchData.tags.length > 0) score += 5;
  if (pitchData.deckUrl) score += 10;
  
  const analysis = `
**Pitch Analysis Report**

**Overall Score: ${score}/100**

**Strengths:**
• Clear value proposition in the title and one-liner
• Appropriate funding stage and target amount
• Good use of relevant tags for discoverability

**Areas for Improvement:**
• Market size analysis needs more specific data and research
• Competitive landscape requires deeper analysis of direct competitors
• Go-to-market strategy should include specific channels and timelines
• Financial projections need 2-3 year forecasts with key metrics
• Team section should highlight relevant experience and expertise

**Recommendations:**
1. Research and include specific market size data with credible sources
2. Identify 2-3 direct competitors and clearly articulate your differentiation
3. Develop a detailed go-to-market strategy with customer acquisition costs
4. Add financial projections showing revenue, growth, and key unit economics
5. Strengthen team credentials with relevant industry experience
  `;

  if (score <= 70) {
    const improvedPitch = `
**${pitchData.title}**

**Executive Summary**
${pitchData.oneLiner} Our innovative solution addresses a critical market need with proven traction and a clear path to profitability.

**Problem Statement**
${pitchData.description.split('.')[0]}. This represents a significant pain point affecting millions of potential customers globally.

**Solution**
${pitchData.description}

**Market Opportunity**
The total addressable market (TAM) for ${pitchData.category} solutions is estimated at $XX billion, with a serviceable addressable market (SAM) of $XX billion. Our target market is growing at XX% annually.

**Business Model**
We generate revenue through [subscription/transaction/licensing] model with an average customer lifetime value of $XXX and customer acquisition cost of $XX.

**Go-to-Market Strategy**
Our customer acquisition strategy focuses on:
1. Digital marketing and content marketing
2. Strategic partnerships with industry leaders
3. Direct sales to enterprise customers
4. Product-led growth through freemium model

**Traction**
${pitchData.traction}

**Team**
Our founding team brings together ${pitchData.teamSize} experienced professionals with deep expertise in ${pitchData.category} and proven track records in scaling technology companies.

**Financial Projections**
We are seeking $${pitchData.targetAmount.toLocaleString()} in ${pitchData.stage} funding in exchange for ${pitchData.equityOffered}% equity, valuing the company at $${pitchData.valuation.toLocaleString()}.

**Use of Funds**
• 40% Product development and engineering
• 30% Sales and marketing
• 20% Team expansion
• 10% Operations and working capital

**Vision**
We envision becoming the leading platform in the ${pitchData.category} space, serving millions of customers globally and creating significant value for all stakeholders.
    `;
    
    return {
      score,
      analysis,
      improvedPitch: improvedPitch.trim()
    };
  } else {
    return {
      score,
      analysis,
      suggestions: [
        "Add specific market size data with credible sources",
        "Include 2-3 direct competitors and your differentiation",
        "Develop detailed go-to-market strategy with CAC/LTV metrics",
        "Add 2-3 year financial projections",
        "Strengthen team credentials with relevant experience"
      ]
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const pitchData = await request.json();
    
    // Validate required fields
    if (!pitchData.title || !pitchData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Analyze the pitch using AI
    const analysisResult = await analyzePitch(pitchData);
    
    return NextResponse.json({
      success: true,
      ...analysisResult
    });
    
  } catch (error) {
    console.error('Error analyzing pitch:', error);
    return NextResponse.json(
      { error: 'Failed to analyze pitch' },
      { status: 500 }
    );
  }
}