interface KeywordData {
  keyword: string;
  searches: number;
  results: number;
  score: number;
}

interface NicheOpportunity {
  name: string;
  angle: string;
  searchVolume: number;
  listingCount: number;
  demandSupplyRatio: number;
  opportunityScore: number;
  trend: 'Rising' | 'Stable' | 'Declining';
  profitPotential: 'Low' | 'Medium' | 'High';
  exampleKeywords: string[];
  recommendation: string;
}

export function analyzeNiches(
  keywords: KeywordData[],
  category: string,
  productType: string
): NicheOpportunity[] {
  const niches: NicheOpportunity[] = [];

  const angles = [
    { type: 'Material', modifiers: ['ceramic', 'stoneware', 'porcelain', 'glass', 'metal'] },
    { type: 'Size', modifiers: ['small', 'large', '8oz', '12oz', '16oz', '20oz', 'oversized'] },
    { type: 'Style', modifiers: ['minimalist', 'vintage', 'modern', 'rustic', 'boho', 'elegant'] },
    { type: 'Use Case', modifiers: ['camping', 'office', 'travel', 'home', 'outdoor', 'gym'] },
    { type: 'Recipient', modifiers: ['mom', 'dad', 'teacher', 'coworker', 'boss', 'friend'] },
    { type: 'Occasion', modifiers: ['birthday', 'christmas', 'wedding', 'graduation', 'anniversary'] },
  ];

  angles.forEach(angle => {
    angle.modifiers.forEach(modifier => {
      const nicheName = `${modifier} ${productType}`;
      
      const matchingKeyword = keywords.find(k => 
        k.keyword.toLowerCase().includes(modifier.toLowerCase())
      );

      if (matchingKeyword) {
        const ratio = matchingKeyword.searches / matchingKeyword.results;
        const opportunityScore = calculateOpportunityScore(ratio, matchingKeyword.searches);
        
        niches.push({
          name: nicheName,
          angle: angle.type,
          searchVolume: matchingKeyword.searches,
          listingCount: matchingKeyword.results,
          demandSupplyRatio: ratio,
          opportunityScore,
          trend: determineTrend(matchingKeyword.searches),
          profitPotential: determineProfitPotential(opportunityScore, matchingKeyword.searches),
          exampleKeywords: generateExampleKeywords(nicheName, modifier, productType),
          recommendation: generateRecommendation(opportunityScore, ratio),
        });
      }
    });
  });

  return niches.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function calculateOpportunityScore(ratio: number, searches: number): number {
  let score = 0;
  
  if (ratio >= 0.01) score = 10;
  else if (ratio >= 0.005) score = 9;
  else if (ratio >= 0.003) score = 8;
  else if (ratio >= 0.002) score = 7;
  else if (ratio >= 0.001) score = 5;
  else if (ratio >= 0.0005) score = 3;
  else score = 1;
  
  if (searches < 5) score = Math.max(1, score - 3);
  else if (searches < 10) score = Math.max(1, score - 1);
  
  return score;
}

function determineTrend(searches: number): 'Rising' | 'Stable' | 'Declining' {
  if (searches > 100) return 'Rising';
  if (searches > 20) return 'Stable';
  return 'Declining';
}

function determineProfitPotential(score: number, searches: number): 'Low' | 'Medium' | 'High' {
  if (score >= 7 && searches >= 20) return 'High';
  if (score >= 4 && searches >= 10) return 'Medium';
  return 'Low';
}

function generateExampleKeywords(nicheName: string, modifier: string, productType: string): string[] {
  return [
    nicheName,
    `${modifier} ${productType} handmade`,
    `unique ${modifier} ${productType}`,
    `${modifier} ${productType} gift`,
    `personalized ${modifier} ${productType}`,
  ];
}

function generateRecommendation(score: number, ratio: number): string {
  if (score >= 8) {
    return `Excellent opportunity! Low competition with decent demand. Strong candidate for your next product.`;
  } else if (score >= 6) {
    return `Good niche with moderate competition. Consider if it aligns with your brand and capabilities.`;
  } else if (score >= 4) {
    return `Competitive but achievable. You'll need strong optimization (250+/285 R.A.N.K. score) to succeed here.`;
  } else {
    return `Red ocean - avoid unless you have a unique angle. Too much competition relative to demand.`;
  }
}

export function analyzeCategoryBenchmarks(
  keywords: KeywordData[],
  category: string
): any[] {
  return keywords.map(kw => {
    const ratio = kw.searches / kw.results;
    
    let competitionTier: 'Low' | 'Medium' | 'High' | 'Extreme';
    if (kw.results < 10000) competitionTier = 'Low';
    else if (kw.results < 50000) competitionTier = 'Medium';
    else if (kw.results < 200000) competitionTier = 'High';
    else competitionTier = 'Extreme';
    
    let difficultyTier: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
    if (ratio >= 0.005) difficultyTier = 'Easy';
    else if (ratio >= 0.002) difficultyTier = 'Moderate';
    else if (ratio >= 0.0005) difficultyTier = 'Hard';
    else difficultyTier = 'Very Hard';
    
    return {
      keyword: kw.keyword,
      searchVolume: kw.searches,
      listingCount: kw.results,
      competitionTier,
      difficultyTier,
      categoryRelevance: 85,
      demandSupplyRatio: ratio,
    };
  });
}
