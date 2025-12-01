import React from "react";

const PopUp = ({ isOpen, isSuccess, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
        onClick={onClose}
        >
        <div
            className={`bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 ${
            isSuccess
                ? "border-t-4 border-green-500"
                : "border-t-4 border-red-500"
            }`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-center mb-6">
            <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isSuccess ? "bg-green-100" : "bg-red-100"
                }`}
            >
                <div
                className={`text-4xl font-bold ${
                    isSuccess ? "text-green-600" : "text-red-600"
                }`}
                >
                {isSuccess ? "✓" : "✕"}
                </div>
            </div>
            </div>
            <h2 className="text-center text-xl font-bold text-gray-800 mb-2">
            {isSuccess ? "Berhasil!" : "Oops, Ada Kesalahan"}
            </h2>
            <p className="text-center text-gray-600 mb-8 text-sm leading-relaxed">
            {message}
            </p>
            <button
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 transform hover:scale-105 active:scale-95 ${
                isSuccess
                ? "bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl"
                : "bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl"
            }`}
            onClick={onClose}
            >
            Tutup
            </button>
        </div>
        <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-in-out;
                    }
                `}</style>
        </div>
    );
};

export default PopUp;
