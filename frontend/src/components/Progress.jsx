import { motion } from "framer-motion";
import { Loader2, CheckCircle, Clock } from "lucide-react";

export function ProgressBar({ progress = 0, label, darkMode = true }) {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <div className="flex justify-between items-center text-xs">
                    <span className={darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}>{label}</span>
                    <span className="font-mono font-medium text-[#00b894]">{Math.round(progress)}%</span>
                </div>
            )}
            <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#232938]" : "bg-gray-200"}`}>
                <motion.div
                    className="h-full bg-[#00b894] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                />
            </div>
        </div>
    );
}

export function StepProgress({ steps = [], currentStep = 0, darkMode = true }) {
    return (
        <div className="w-full space-y-3 py-2">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.label || index} className="flex-1 flex flex-col items-center relative">
                            {/* Connector line */}
                            {index !== 0 && (
                                <div
                                    className={`absolute top-3 right-1/2 left-[-50%] h-[2px] transition-colors duration-300 ${
                                        index <= currentStep ? "bg-[#00b894]" : darkMode ? "bg-white/10" : "bg-gray-200"
                                    }`}
                                />
                            )}
                            
                            {/* Icon / Circle */}
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-[11px] font-semibold transition-all duration-300 ${
                                    isCompleted
                                        ? "bg-[#00b894] text-[#0f1117]"
                                        : isCurrent
                                        ? "bg-[#00b894]/20 border-2 border-[#00b894] text-[#00b894]"
                                        : darkMode
                                        ? "bg-[#232938] text-[#7b82a0] border border-white/10"
                                        : "bg-gray-100 text-[#636e72] border border-gray-300"
                                }`}
                            >
                                {isCompleted ? (
                                    <CheckCircle size={14} />
                                ) : isCurrent ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] mt-1 text-center font-medium truncate max-w-[80px] ${
                                    isCurrent
                                        ? "text-[#00b894]"
                                        : isCompleted
                                        ? darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"
                                        : darkMode ? "text-[#7b82a0]" : "text-[#636e72]"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
