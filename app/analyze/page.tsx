"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnalysisResult {
  ok: boolean;
  score: number;
  lighting: number;
  composition: number;
  clarity: number;
  appeal: number;
  technicalCompliance: number;
  algorithmFit: number;
  productDominance: number;
  backgroundQuality: number;
  colorBalance: number;
  estimatedResolution: string;
  aspectRatioEstimate: string;
  feedback: string;
  complianceIssues: string[];
  suggestions: string[];
  platformRequirements: any;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState("etsy");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/optimize/image/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          platform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Analysis failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-900/30 border-green-700";
    if (score >= 60) return "bg-yellow-900/30 border-yellow-700";
    return "bg-red-900/30 border-red-700";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              Elite Listing AI
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📸 Image Analysis
          </h1>
          <p className="text-gray-400">
            Analyze your product photos with AI-powered insights
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="etsy">Etsy</option>
              <option value="shopify">Shopify</option>
              <option value="ebay">eBay</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product-image.jpg"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter a direct URL to your product image
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isAnalyzing
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {/* Preview Section */}
        {imageUrl && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="aspect-square max-w-md mx-auto bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Product preview"
                className="w-full h-full object-contain"
                onError={() => setError("Failed to load image")}
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div
              className={`border rounded-lg p-8 text-center ${getScoreBgColor(
                result.score
              )}`}
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                Overall Score
              </h2>
              <p className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}
                <span className="text-3xl">/100</span>
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Detailed Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Lighting", value: result.lighting },
                  { label: "Composition", value: result.composition },
                  { label: "Clarity", value: result.clarity },
                  { label: "Appeal", value: result.appeal },
                  {
                    label: "Technical Compliance",
                    value: result.technicalCompliance,
                  },
                  { label: "Algorithm Fit", value: result.algorithmFit },
                  {
                    label: "Product Dominance",
                    value: result.productDominance,
                  },
                  {
                    label: "Background Quality",
                    value: result.backgroundQuality,
                  },
                  { label: "Color Balance", value: result.colorBalance },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        item.value
                      )}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Technical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Estimated Resolution</p>
                  <p className="text-lg text-white">
                    {result.estimatedResolution}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Aspect Ratio</p>
                  <p className="text-lg text-white">
                    {result.aspectRatioEstimate}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                AI Feedback
              </h3>
              <p className="text-gray-300 leading-relaxed">{result.feedback}</p>
            </div>

            {/* Compliance Issues */}
            {result.complianceIssues.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4">
                  ⚠️ Compliance Issues
                </h3>
                <ul className="space-y-2">
                  {result.complianceIssues.map((issue, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">
                💡 Improvement Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

