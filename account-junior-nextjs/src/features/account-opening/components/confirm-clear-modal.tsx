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
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="relative bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
                    >
                        {/* Native Mobile Drag Handle Pill */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight">{title || "Clear Form?"}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-center sm:text-left">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {message || "Are you sure you want to clear all fields? This action cannot be undone."}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50 flex flex-col sm:flex-row justify-end items-center gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto h-10 px-5 text-sm font-medium rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="w-full sm:w-auto h-10 px-6 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Clear All</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
