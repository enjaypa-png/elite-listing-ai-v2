'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ListingOptimizerResults from './listing-optimizer-results';

export default function TestOptimize() {
  const router = useRouter();
  
  // Guard: Block access in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.push('/404');
    }
  }, [router]);

  // If production, don't render anything
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const [activeTab, setActiveTab] = useState<'optimize' | 'image' | 'keywords' | 'seo'>('optimize');
  
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

  // SEO Audit State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoTags, setSeoTags] = useState('');
  const [seoPlatform, setSeoPlatform] = useState('Etsy');
  const [seoCategory, setSeoCategory] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResponse, setSeoResponse] = useState<any>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

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

  const handleSEOAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeoLoading(true);
    setSeoError(null);
    setSeoResponse(null);

    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: seoPlatform,
          title: seoTitle,
          description: seoDescription,
          tags: seoTags,
          category: seoCategory || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to perform SEO audit');
      }

      setSeoResponse(data);
    } catch (err: any) {
      setSeoError(err.message);
    } finally {
      setSeoLoading(false);
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
          <p className="text-xs text-red-500 mt-2">⚠️ Development Testing Page</p>
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
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'seo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 SEO Audit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {activeTab === 'optimize' ? 'Input Form' : activeTab === 'image' ? 'Image Analysis' : activeTab === 'keywords' ? 'Keyword Generation' : 'SEO Audit'}
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
                    placeholder="Describe your product..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="art, painting, landscape"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
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
                    onChange={(e) => setPhotoScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Optimizing...' : 'Optimize Listing'}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
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

                <button
                  type="submit"
                  disabled={imageLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {imageLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>

                {imageError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{imageError}</p>
                  </div>
                )}
              </form>
            ) : activeTab === 'keywords' ? (
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={keywordTitle}
                    onChange={(e) => setKeywordTitle(e.target.value)}
                    placeholder="Handmade Leather Wallet"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={keywordDescription}
                    onChange={(e) => setKeywordDescription(e.target.value)}
                    placeholder="Describe your product..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={keywordCategory}
                    onChange={(e) => setKeywordCategory(e.target.value)}
                    placeholder="Accessories"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={keywordLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {keywordLoading ? 'Generating...' : 'Generate Keywords'}
                </button>

                {keywordError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{keywordError}</p>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleSEOAudit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Platform
                  </label>
                  <select
                    value={seoPlatform}
                    onChange={(e) => setSeoPlatform(e.target.value)}
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Your listing title"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Your listing description"
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={seoTags}
                    onChange={(e) => setSeoTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={seoCategory}
                    onChange={(e) => setSeoCategory(e.target.value)}
                    placeholder="Home & Living"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={seoLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {seoLoading ? 'Auditing...' : 'Run SEO Audit'}
                </button>

                {seoError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{seoError}</p>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Results</h2>

            {activeTab === 'optimize' && response && (
              <ListingOptimizerResults response={response} />
            )}

            {activeTab === 'image' && imageResponse && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Image Analysis Results
                  </h3>
                  
                  {/* Overall Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(imageResponse.overallScore)}`}>
                        {imageResponse.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getScoreBgColor(imageResponse.overallScore)}`}
                        style={{ width: `${imageResponse.overallScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Category Scores */}
                  <div className="space-y-4 mb-6">
                    {Object.entries(imageResponse.categoryScores || {}).map(([category, score]: [string, any]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`font-semibold ${getScoreColor(score)}`}>
                            {score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreBgColor(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {imageResponse.suggestions && imageResponse.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Improvement Suggestions</h4>
                      <ul className="space-y-2">
                        {imageResponse.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'keywords' && keywordResponse && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Generated Keywords
                  </h3>
                  
                  {keywordResponse.keywords && keywordResponse.keywords.length > 0 && (
                    <div className="space-y-3">
                      {keywordResponse.keywords.map((kw: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900">{kw.keyword}</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              kw.competition === 'Low' ? 'bg-green-100 text-green-700' :
                              kw.competition === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {kw.competition}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Volume: <span className="font-medium">{kw.searchVolume}</span></div>
                            <div>Intent: <span className="font-medium">{kw.intent}</span></div>
                            <div>CTR: <span className="font-medium">{kw.ctrPotential}%</span></div>
                            <div>Relevance: <span className="font-medium">{kw.relevanceScore}/100</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seo' && seoResponse && seoResponse.overallScore && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    SEO Audit Results
                  </h3>
                  
                  {/* Overall Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall SEO Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(seoResponse.overallScore)}`}>
                        {seoResponse.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getScoreBgColor(seoResponse.overallScore)}`}
                        style={{ width: `${seoResponse.overallScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {seoResponse.categoryBreakdown && (
                    <div className="space-y-4 mb-6">
                      {Object.entries(seoResponse.categoryBreakdown).map(([category, score]: [string, any]) => (
                        <div key={category}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {category}
                            </span>
                            <span className={`font-semibold ${getScoreColor(score)}`}>
                              {score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues */}
                  {seoResponse.issues && seoResponse.issues.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Issues Found</h4>
                      <div className="space-y-2">
                        {seoResponse.issues.map((issue: any, idx: number) => (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            issue.severity === 'critical' ? 'bg-red-50 border-red-200' :
                            issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              <span className={`text-xs font-semibold uppercase ${
                                issue.severity === 'critical' ? 'text-red-700' :
                                issue.severity === 'warning' ? 'text-yellow-700' :
                                'text-blue-700'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-sm text-gray-700">{issue.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {seoResponse.recommendations && seoResponse.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {seoResponse.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-600 mt-0.5">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!response && !imageResponse && !keywordResponse && !seoResponse && (
              <div className="text-center text-gray-400 py-12">
                <p>Submit a form to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

