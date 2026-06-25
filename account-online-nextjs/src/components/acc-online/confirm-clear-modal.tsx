"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface ConfirmClearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
}

export const ConfirmClearModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}: ConfirmClearModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 60, scale: 0.97 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
                    >
                        <div className="h-1.5 w-full bg-primary" />

                        <div className="px-6 pt-7 pb-6">
                            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/20 rounded-lg mx-auto mb-4">
                                <Trash2 className="text-primary" style={{ width: 24, height: 24 }} />
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">
                                {title || "Clear Form?"}
                            </h3>
                            <p className="text-base text-gray-500 text-center mb-6 leading-relaxed">
                                {message || "Are you sure you want to clear all fields? This action cannot be undone."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={onClose}
                                    className="flex-1 h-auto min-h-12 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-base"
                                >
                                    <X className="w-4 h-4 flex-shrink-0" />
                                    <span className="whitespace-normal leading-tight text-center">Cancel</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={onConfirm}
                                    className="flex-1 h-auto min-h-12 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all shadow-sm text-base"
                                >
                                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="whitespace-normal leading-tight text-center">Clear All</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
