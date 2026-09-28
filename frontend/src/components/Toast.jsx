import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

const TOAST_DURATION = 3000;

export function Toast({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <Check size={16} className="text-[#00b894]" />,
        error: <X size={16} className="text-[#e17055]" />,
        warning: <AlertCircle size={16} className="text-[#fdcb6e]" />,
        info: <Info size={16} className="text-[#74b9ff]" />,
    };

    const bgColors = {
        success: "bg-[#00b894]/10 border-[#00b894]/30",
        error: "bg-[#e17055]/10 border-[#e17055]/30",
        warning: "bg-[#fdcb6e]/10 border-[#fdcb6e]/30",
        info: "bg-[#74b9ff]/10 border-[#74b9ff]/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, y: -50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: -50 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl ${bgColors[toast.type] || bgColors.info}`}
        >
            {icons[toast.type] || icons.info}
            <span className="text-xs">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-2 text-[#7b82a0] hover:text-[#e8eaf0] transition-colors"
            >
                <X size={12} />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

let toastId = 0;
export function toast(message, type = "info") {
    const id = ++toastId;
    return { id, message, type };
}
