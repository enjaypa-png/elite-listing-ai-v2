import React from 'react';

interface Variant {
  title: string;
  description: string;
  tags: string[];
  copyScore: number;
  clarity?: number;
  persuasion?: number;
  seoDensity?: number;
  keywordHarmony?: number;
  readabilityScore?: number;
  emotionScore?: number;
  ctrProbability?: number;
  conversionProbability?: number;
}

interface ListingOptimizerResultsProps {
  response: any;
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
}

export default function ListingOptimizerResults({ response, getScoreColor, getScoreBgColor }: ListingOptimizerResultsProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Listing Health Index */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Listing Health Index</span>
          <span className="text-xs text-gray-500">Overall Score</span>
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className={`text-5xl font-bold ${getScoreColor(response.healthScore)}`}>
            {response.healthScore}
          </span>
          <span className="text-sm text-gray-600">{getScoreLabel(response.healthScore)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full ${getScoreBgColor(response.healthScore)}`}
            style={{ width: `${response.healthScore}%` }}
          />
        </div>
      </div>

      {/* Health Breakdown */}
      {response.healthBreakdown && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-4 text-gray-900">Health Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SEO Alignment (40%)</span>
              <span className="text-sm font-semibold text-gray-900">{response.healthBreakdown.seoAlignment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Engagement Likelihood (30%)</span>
              <span className="text-sm font-semibold text-gray-900">{response.healthBreakdown.engagementLikelihood}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Competitive Positioning (20%)</span>
              <span className="text-sm font-semibold text-gray-900">{response.healthBreakdown.competitivePositioning}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compliance (10%)</span>
              <span className="text-sm font-semibold text-gray-900">{response.healthBreakdown.compliance}</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      {response.analytics && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-4 text-gray-900">Performance Prediction</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{response.analytics.avgCtrProbability}%</div>
              <div className="text-xs text-gray-600 mt-1">CTR Probability</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{response.analytics.avgConversionProbability}%</div>
              <div className="text-xs text-gray-600 mt-1">Conversion Probability</div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Issues */}
      {response.complianceIssues && response.complianceIssues.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-200">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-red-600 text-lg">⚠️</span>
            <h3 className="font-semibold text-base text-red-900">Compliance Issues</h3>
          </div>
          <ul className="space-y-2">
            {response.complianceIssues.map((issue: string, index: number) => (
              <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {response.suggestions && response.suggestions.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-200">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-green-600 text-lg">💡</span>
            <h3 className="font-semibold text-base text-green-900">Improvement Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {response.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimized Variants */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-900">Optimized Variants</h3>
        {response.variants?.map((variant: Variant, index: number) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-base text-gray-900">Variant {index + 1}</h4>
              <span className={`text-2xl font-bold ${getScoreColor(variant.copyScore)}`}>
                {variant.copyScore}
              </span>
            </div>

            {/* Advanced Metrics */}
            {(variant.clarity || variant.persuasion || variant.seoDensity || variant.keywordHarmony) && (
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                {variant.clarity !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Clarity</span>
                      <span className="text-xs font-semibold text-gray-900">{variant.clarity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${variant.clarity}%` }} />
                    </div>
                  </div>
                )}
                {variant.persuasion !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Persuasion</span>
                      <span className="text-xs font-semibold text-gray-900">{variant.persuasion}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${variant.persuasion}%` }} />
                    </div>
                  </div>
                )}
                {variant.seoDensity !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">SEO Density</span>
                      <span className="text-xs font-semibold text-gray-900">{variant.seoDensity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${variant.seoDensity}%` }} />
                    </div>
                  </div>
                )}
                {variant.keywordHarmony !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Keyword Harmony</span>
                      <span className="text-xs font-semibold text-gray-900">{variant.keywordHarmony}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${variant.keywordHarmony}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Metrics */}
            {(variant.ctrProbability || variant.conversionProbability) && (
              <div className="flex gap-3 mb-4">
                {variant.ctrProbability !== undefined && (
                  <div className="flex-1 text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{variant.ctrProbability}%</div>
                    <div className="text-xs text-gray-600">CTR</div>
                  </div>
                )}
                {variant.conversionProbability !== undefined && (
                  <div className="flex-1 text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{variant.conversionProbability}%</div>
                    <div className="text-xs text-gray-600">Conversion</div>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Title ({variant.title.length} chars)</p>
                <p className="text-sm text-gray-900 leading-relaxed">{variant.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{variant.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Tags ({variant.tags?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {variant.tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rationale */}
      {response.rationale && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-2 text-gray-900">Optimization Strategy</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{response.rationale}</p>
        </div>
      )}

      {/* Primary Keyword */}
      {response.primaryKeyword && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-base mb-2 text-gray-900">Primary Keyword</h3>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
            {response.primaryKeyword}
          </span>
        </div>
      )}

      {/* Raw JSON */}
      <details className="bg-white rounded-2xl p-5 shadow-sm">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
          View Raw JSON
        </summary>
        <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-xl overflow-auto max-h-64 text-gray-700">
          {JSON.stringify(response, null, 2)}
        </pre>
      </details>
    </div>
  );
}
