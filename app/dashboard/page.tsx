import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user's connected shops
  const shops = await prisma.shop.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  // Get recent listings
  const listings = await prisma.listing.findMany({
    where: {
      shop: {
        userId: session.user.id,
        isActive: true,
      },
    },
    include: {
      shop: true,
    },
    orderBy: {
      lastSyncedAt: "desc",
    },
    take: 6,
  });

  // Get optimization stats
  const totalOptimizations = await prisma.optimization.count({
    where: {
      listing: {
        shop: {
          userId: session.user.id,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Elite Listing AI</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session.user.name || session.user.email}!
          </h2>
          <p className="text-gray-400">Your listing optimization dashboard</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Connected Shops Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Connected Shops
            </h3>
            <p className="text-3xl font-bold text-white mb-2">{shops.length}</p>
            <p className="text-gray-400 mb-4">
              {shops.length === 0 ? "No shops connected yet" : "Active connections"}
            </p>
            {shops.length === 0 ? (
              <Link
                href="/api/etsy/connect"
                className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Connect Shop
              </Link>
            ) : (
              <Link
                href="/api/etsy/connect"
                className="block w-full text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Add Another Shop
              </Link>
            )}
          </div>

          {/* Listings Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Listings</h3>
            <p className="text-3xl font-bold text-white mb-2">{listings.length}</p>
            <p className="text-gray-400 mb-4">
              {listings.length === 0 ? "Connect a shop to see listings" : "Ready to optimize"}
            </p>
            <button
              disabled={listings.length === 0}
              className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors ${
                listings.length > 0
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              View Listings
            </button>
          </div>

          {/* Optimizations Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Optimizations</h3>
            <p className="text-3xl font-bold text-white mb-2">{totalOptimizations}</p>
            <p className="text-gray-400 mb-4">
              {totalOptimizations === 0 ? "No optimizations yet" : "Completed"}
            </p>
            <button
              disabled={totalOptimizations === 0}
              className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors ${
                totalOptimizations > 0
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              View History
            </button>
          </div>
        </div>

        {/* Connected Shops List */}
        {shops.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Your Shops</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{shop.shopName}</h4>
                      <p className="text-sm text-gray-400">{shop.platform}</p>
                      {shop.shopUrl && (
                        <a
                          href={shop.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 mt-1 inline-block"
                        >
                          View Shop →
                        </a>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Listings */}
        {listings.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Recent Listings</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                >
                  {listing.imageUrls && listing.imageUrls.length > 0 && (
                    <div className="aspect-square bg-gray-800 relative">
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-1 line-clamp-2">
                      {listing.title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">{listing.shop.shopName}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-400">
                        {listing.currency} {listing.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">Qty: {listing.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">📸 Image Analysis</h4>
              <p className="text-gray-400 text-sm mb-3">
                Analyze your product photos with AI
              </p>
              <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                Coming Soon →
              </button>
            </div>
            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">✍️ Text Optimization</h4>
              <p className="text-gray-400 text-sm mb-3">
                Optimize titles and descriptions
              </p>
              <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                Coming Soon →
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h4 className="font-semibold text-green-400 mb-1">
                Phase 2: Core Experience Complete!
              </h4>
              <p className="text-gray-300 text-sm">
                Etsy integration is ready. Connect your shop to start optimizing your listings.
                Next up: Building the image analysis feature.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

