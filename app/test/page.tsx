'use client';

import { useState } from 'react';
import ListingOptimizerResults from './listing-optimizer-results';

export default function TestOptimize() {
  const [activeTab, setActiveTab] = useState<'optimize' | 'image' | 'keywords'>('optimize');
  
  // Listing Optimizer State
  const [platform, setPlatform] = useState('etsy');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [photoScore, setPhotoScore] = useState(75);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Image Analysis State
  const [imageUrl, setImageUrl] = useState('');
  const [imagePlatform, setImagePlatform] = useState('etsy');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResponse, setImageResponse] = useState<any>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Keyword Generation State
  const [keywordTitle, setKeywordTitle] = useState('');
  const [keywordDescription, setKeywordDescription] = useState('');
  const [keywordCategory, setKeywordCategory] = useState('');
  const [keywordPlatform, setKeywordPlatform] = useState('Etsy');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordResponse, setKeywordResponse] = useState<any>(null);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          title,
          description: description.length > 0 ? description : undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          photoScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to optimize listing');
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageLoading(true);
    setImageError(null);
    setImageResponse(null);

    try {
      const res = await fetch('/api/optimize/image/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          platform: imagePlatform,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to analyze image');
      }

      setImageResponse(data);
    } catch (err: any) {
      setImageError(err.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleKeywordGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeywordLoading(true);
    setKeywordError(null);
    setKeywordResponse(null);

    try {
      const res = await fetch('/api/keywords/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: keywordTitle,
          description: keywordDescription,
          category: keywordCategory || undefined,
          platform: keywordPlatform,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate keywords');
      }

      setKeywordResponse(data);
    } catch (err: any) {
      setKeywordError(err.message);
    } finally {
      setKeywordLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-gray-600';
    return 'text-gray-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-blue-500';
    if (score >= 60) return 'bg-gray-400';
    return 'bg-gray-300';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 text-gray-900">
            Elite Listing AI
          </h1>
          <p className="text-gray-600">Optimize your Etsy listings with AI</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('optimize')}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'optimize'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Listing Optimizer
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'image'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🖼️ Image Analysis
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'keywords'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔑 Keyword Generator
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {activeTab === 'optimize' ? 'Input Form' : activeTab === 'image' ? 'Image Analysis' : 'Keyword Generation'}
            </h2>

            {activeTab === 'optimize' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    required
                  >
                    <option value="etsy">Etsy</option>
                    <option value="shopify">Shopify</option>
                    <option value="ebay">eBay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Fall Oil Painting, Country Cottage Landscape..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beautiful handcrafted ceramic coffee mug..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <textarea
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="oil painting, country cottage landscape, picture"
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Photo Score: {photoScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={photoScore}
                    onChange={(e) => setPhotoScore(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Optimizing...' : 'Optimize Listing'}
                </button>
              </form>
            ) : activeTab === 'image' ? (
              <form onSubmit={handleImageAnalysis} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Platform
                  </label>
                  <select
                    value={imagePlatform}
                    onChange={(e) => setImagePlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    required
                  >
                    <option value="etsy">Etsy</option>
                    <option value="shopify">Shopify</option>
                    <option value="ebay">eBay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                {imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview</p>
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={imageLoading}
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {imageLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleKeywordGeneration} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Platform
                  </label>
                  <select
                    value={keywordPlatform}
                    onChange={(e) => setKeywordPlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    required
                  >
                    <option value="Etsy">Etsy</option>
                    <option value="Shopify">Shopify</option>
                    <option value="eBay">eBay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={keywordTitle}
                    onChange={(e) => setKeywordTitle(e.target.value)}
                    placeholder="Handmade Ceramic Coffee Mug..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Product Description
                  </label>
                  <textarea
                    value={keywordDescription}
                    onChange={(e) => setKeywordDescription(e.target.value)}
                    placeholder="Describe your product in detail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={keywordCategory}
                    onChange={(e) => setKeywordCategory(e.target.value)}
                    placeholder="e.g., Home & Living, Jewelry, Art"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={keywordLoading}
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {keywordLoading ? 'Generating Keywords...' : 'Generate Keywords'}
                </button>
              </form>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {activeTab === 'optimize' ? 'Results' : activeTab === 'image' ? 'Analysis Results' : 'Generated Keywords'}
            </h2>

            {activeTab === 'optimize' ? (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {!response && !error && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-sm">Fill out the form to optimize your listing</p>
                  </div>
                )}

                {response && response.ok && (
                  <ListingOptimizerResults 
                    response={response} 
                    getScoreColor={getScoreColor}
                    getScoreBgColor={getScoreBgColor}
                  />
                )}
              </>
            ) : activeTab === 'image' ? (
              <>
                {imageError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
                    <strong>Error:</strong> {imageError}
                  </div>
                )}

                {!imageResponse && !imageError && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-sm">Enter an image URL to analyze quality</p>
                  </div>
                )}

                {imageResponse && imageResponse.ok && (
                  <div className="space-y-5">
                    {/* Weighted Image Optimization Index */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Weighted Image Optimization Index</span>
                        <span className="text-xs text-gray-500">Overall Score</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-5xl font-bold ${getScoreColor(imageResponse.score)}`}>
                          {imageResponse.score}
                        </span>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBgColor(imageResponse.score)} transition-all duration-500`}
                              style={{ width: `${imageResponse.score}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {imageResponse.score >= 90 ? 'Excellent - Optimized for maximum visibility' :
                             imageResponse.score >= 80 ? 'Good - Minor improvements needed' :
                             imageResponse.score >= 70 ? 'Fair - Several optimization opportunities' :
                             imageResponse.score >= 60 ? 'Poor - Significant issues affecting performance' :
                             'Critical - Major compliance and quality issues'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Core Quality Metrics */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-base mb-4 text-gray-900">Core Quality Metrics</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Lighting', score: imageResponse.lighting },
                          { label: 'Composition', score: imageResponse.composition },
                          { label: 'Clarity', score: imageResponse.clarity },
                          { label: 'Appeal', score: imageResponse.appeal },
                        ].map((metric, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">{metric.label}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${getScoreBgColor(metric.score)}`}
                                  style={{ width: `${metric.score}%` }}
                                />
                              </div>
                              <span className={`text-sm font-semibold ${getScoreColor(metric.score)}`}>
                                {metric.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Metrics */}
                    {(imageResponse.technicalCompliance || imageResponse.algorithmFit || imageResponse.productDominance) && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-base mb-4 text-gray-900">Advanced Analysis</h3>
                        <div className="space-y-3">
                          {imageResponse.technicalCompliance !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">Technical Compliance (40%)</span>
                              <span className={`font-semibold ${getScoreColor(imageResponse.technicalCompliance)}`}>
                                {imageResponse.technicalCompliance}
                              </span>
                            </div>
                          )}
                          {imageResponse.algorithmFit !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">Algorithm Fit (30%)</span>
                              <span className={`font-semibold ${getScoreColor(imageResponse.algorithmFit)}`}>
                                {imageResponse.algorithmFit}
                              </span>
                            </div>
                          )}
                          {imageResponse.productDominance !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">Product Dominance</span>
                              <span className={`font-semibold ${getScoreColor(imageResponse.productDominance)}`}>
                                {imageResponse.productDominance}%
                              </span>
                            </div>
                          )}
                          {imageResponse.backgroundQuality !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">Background Quality</span>
                              <span className={`font-semibold ${getScoreColor(imageResponse.backgroundQuality)}`}>
                                {imageResponse.backgroundQuality}
                              </span>
                            </div>
                          )}
                          {imageResponse.colorBalance !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm text-gray-700">Color Balance</span>
                              <span className={`font-semibold ${getScoreColor(imageResponse.colorBalance)}`}>
                                {imageResponse.colorBalance}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    {(imageResponse.estimatedResolution || imageResponse.aspectRatioEstimate) && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-base mb-3 text-gray-900">Technical Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {imageResponse.estimatedResolution && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Estimated Resolution</p>
                              <p className="text-sm font-medium text-gray-900">{imageResponse.estimatedResolution}</p>
                            </div>
                          )}
                          {imageResponse.aspectRatioEstimate && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Aspect Ratio</p>
                              <p className="text-sm font-medium text-gray-900">{imageResponse.aspectRatioEstimate}</p>
                            </div>
                          )}
                        </div>
                        {imageResponse.platformRequirements && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-medium text-blue-900 mb-2">Platform Requirements ({imagePlatform})</p>
                            <div className="text-xs text-blue-800 space-y-1">
                              <p>• Min Resolution: {imageResponse.platformRequirements.minResolution}px</p>
                              <p>• Preferred Aspect: {imageResponse.platformRequirements.preferredAspectRatio}</p>
                              <p>• Product Dominance: ≥{imageResponse.platformRequirements.minProductDominance}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compliance Issues */}
                    {imageResponse.complianceIssues && imageResponse.complianceIssues.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-base mb-3 text-red-900">⚠️ Compliance Issues</h3>
                        <ul className="space-y-2">
                          {imageResponse.complianceIssues.map((issue: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Feedback */}
                    {imageResponse.feedback && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-base mb-2 text-gray-900">Detailed Feedback</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{imageResponse.feedback}</p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {imageResponse.suggestions && imageResponse.suggestions.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-semibold text-base mb-3 text-green-900">💡 Improvement Suggestions</h3>
                        <ul className="space-y-2">
                          {imageResponse.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <details className="bg-white rounded-2xl p-5 shadow-sm">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                        View Raw JSON
                      </summary>
                      <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-xl overflow-auto max-h-64 text-gray-700">
                        {JSON.stringify(imageResponse, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </>
            ) : (
              <>
                {keywordError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
                    <strong>Error:</strong> {keywordError}
                  </div>
                )}

                {!keywordResponse && !keywordError && (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">🔑</div>
                    <p className="text-sm">Fill out the form to generate keywords</p>
                  </div>
                )}

                {keywordResponse && keywordResponse.ok && (
                  <div className="space-y-5">
                    {/* Summary Stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{keywordResponse.totalKeywords}</div>
                          <div className="text-xs text-gray-600">Total Keywords</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{keywordResponse.averageRelevance}</div>
                          <div className="text-xs text-gray-600">Avg Relevance</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600 capitalize">{keywordResponse.topIntent}</div>
                          <div className="text-xs text-gray-600">Top Intent</div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {keywordResponse.suggestions && keywordResponse.suggestions.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <h3 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-2">
                          💡 Suggestions
                        </h3>
                        <ul className="space-y-1">
                          {keywordResponse.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Primary Keywords */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-base mb-4 text-gray-900">Primary Keywords ({keywordResponse.primaryKeywords.length})</h3>
                      <div className="space-y-3">
                        {keywordResponse.primaryKeywords.map((kw: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{kw.keyword}</div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg capitalize">{kw.intent}</span>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg capitalize">{kw.competition}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">{kw.keywordScore}</div>
                                <div className="text-xs text-gray-500">Score</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                              <div>
                                <div className="text-gray-500">Volume</div>
                                <div className="font-semibold text-gray-900">{kw.searchVolume}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">CTR Potential</div>
                                <div className="font-semibold text-gray-900">{kw.ctrPotential}%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Relevance</div>
                                <div className="font-semibold text-gray-900">{kw.relevanceScore}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Keywords */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="font-semibold text-base mb-4 text-gray-900">Secondary Keywords ({keywordResponse.secondaryKeywords.length})</h3>
                      <div className="space-y-3">
                        {keywordResponse.secondaryKeywords.map((kw: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{kw.keyword}</div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg capitalize">{kw.intent}</span>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg capitalize">{kw.competition}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">{kw.keywordScore}</div>
                                <div className="text-xs text-gray-500">Score</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                              <div>
                                <div className="text-gray-500">Volume</div>
                                <div className="font-semibold text-gray-900">{kw.searchVolume}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">CTR Potential</div>
                                <div className="font-semibold text-gray-900">{kw.ctrPotential}%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Relevance</div>
                                <div className="font-semibold text-gray-900">{kw.relevanceScore}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw JSON */}
                    <details className="bg-white rounded-2xl p-5 shadow-sm">
                      <summary className="cursor-pointer font-semibold text-sm text-gray-700">View Raw JSON</summary>
                      <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-xl overflow-auto max-h-64 text-gray-700">
                        {JSON.stringify(keywordResponse, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

