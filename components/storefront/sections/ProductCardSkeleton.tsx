"use client";

/**
 * Skeleton component for ProductCard
 * Shows a loading placeholder that matches the ProductCard layout
 */
export default function ProductCardSkeleton() {
    return (
        <div className="pb-20 sm:pb-6 lg:pb-10 animate-pulse">
            <div className="relative overflow-hidden">
                {/* Badge skeleton */}
                <div className="absolute top-3 left-3 bg-gray-200 h-6 w-20 z-10" />

                {/* Image skeleton */}
                <div className="w-full aspect-square bg-gray-200" />
            </div>

            {/* Content skeleton */}
            <div className="mt-4 space-y-2">
                {/* Title skeleton */}
                <div className="h-4 bg-gray-200 rounded w-3/4" />

                {/* Price and discount skeleton */}
                <div className="flex items-center space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
            </div>
        </div>
    );
}
