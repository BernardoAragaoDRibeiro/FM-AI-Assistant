import { motion } from "framer-motion";

export function Skeleton({ className }) {
    return (
        <motion.div
            className={`bg-[#232938]/50 rounded animate-pulse ${className}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden p-4">
            <div className="flex items-center gap-4 mb-3">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-12 h-3" />
                <Skeleton className="w-16 h-3" />
            </div>
            <div className="flex gap-6">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Skeleton className="w-16 h-3 mb-2" />
                    <Skeleton className="w-full h-8" />
                </div>
                <div>
                    <Skeleton className="w-12 h-3 mb-2" />
                    <Skeleton className="w-full h-8" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Skeleton className="w-20 h-3 mb-2" />
                    <Skeleton className="w-full h-8" />
                </div>
                <div>
                    <Skeleton className="w-14 h-3 mb-2" />
                    <Skeleton className="w-full h-8" />
                </div>
            </div>
            <Skeleton className="w-full h-24" />
        </div>
    );
}
