interface RankingEstimate {
  currentRanking: {
    min: number;
    max: number;
    description: string;
  };
  optimizedRanking: {
    min: number;
    max: number;
    description: string;
  };
  trafficEstimate: {
    current: {
      monthlyViews: { min: number; max: number };
      clickProbability: string;
    };
    optimized: {
      monthlyViews: { min: number; max: number };
      clickProbability: string;
    };
  };
  revenueImpact: {
    min: number;
    max: number;
    currency: string;
  };
}

export function estimateRanking(
  currentScore: number,
  optimizedScore: number,
  maxScore: number,
  category: string,
  averagePrice: number = 25
): RankingEstimate {
  
  // Calculate ranking positions based on score
  const currentPercentage = (currentScore / maxScore) * 100;
  const optimizedPercentage = (optimizedScore / maxScore) * 100;

  // Ranking estimation (inverse relationship with score)
  const getCurrentRank = (pct: number) => {
    if (pct >= 90) return { min: 1, max: 5 };
    if (pct >= 80) return { min: 5, max: 12 };
    if (pct >= 70) return { min: 12, max: 25 };
    if (pct >= 60) return { min: 25, max: 45 };
    if (pct >= 50) return { min: 45, max: 85 };
    return { min: 85, max: 200 };
  };

  const currentRank = getCurrentRank(currentPercentage);
  const optimizedRank = getCurrentRank(optimizedPercentage);

  // Traffic estimation based on ranking
  const getTrafficEstimate = (rank: { min: number; max: number }) => {
    const avgRank = (rank.min + rank.max) / 2;
    
    if (avgRank <= 5) {
      return { 
        monthlyViews: { min: 5000, max: 12000 },
        clickProbability: '8-12%'
      };
    }
    if (avgRank <= 12) {
      return {
        monthlyViews: { min: 2400, max: 5000 },
        clickProbability: '4-8%'
      };
    }
    if (avgRank <= 25) {
      return {
        monthlyViews: { min: 800, max: 2400 },
        clickProbability: '2-4%'
      };
    }
    if (avgRank <= 45) {
      return {
        monthlyViews: { min: 300, max: 800 },
        clickProbability: '1-2%'
      };
    }
    if (avgRank <= 85) {
      return {
        monthlyViews: { min: 120, max: 300 },
        clickProbability: '0.5-1%'
      };
    }
    return {
      monthlyViews: { min: 20, max: 120 },
      clickProbability: '0.1-0.5%'
    };
  };

  const currentTraffic = getTrafficEstimate(currentRank);
  const optimizedTraffic = getTrafficEstimate(optimizedRank);

  // Revenue impact (assumes 2% conversion rate)
  const conversionRate = 0.02;
  const currentRevenue = currentTraffic.monthlyViews.min * conversionRate * averagePrice;
  const optimizedRevenue = optimizedTraffic.monthlyViews.max * conversionRate * averagePrice;
  const revenueIncrease = optimizedRevenue - currentRevenue;

  return {
    currentRanking: {
      ...currentRank,
      description: `Ranking in bottom ${Math.round(100 - currentPercentage)}% of listings`,
    },
    optimizedRanking: {
      ...optimizedRank,
      description: `Ranking in top ${Math.round(100 - optimizedPercentage)}% of listings`,
    },
    trafficEstimate: {
      current: currentTraffic,
      optimized: optimizedTraffic,
    },
    revenueImpact: {
      min: Math.round(revenueIncrease * 0.7),
      max: Math.round(revenueIncrease * 1.3),
      currency: 'USD',
    },
  };
}
