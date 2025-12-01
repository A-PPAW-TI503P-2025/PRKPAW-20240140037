import { useState } from "react";

/**
 * Custom hook untuk mengelola state popup
 * @returns {Object} Popup state dan handlers
 */
export const usePopup = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  /**
   * Menampilkan popup notification
   * @param {string} msg - Pesan yang akan ditampilkan
   * @param {boolean} success - Status berhasil/gagal
   */
  const showNotification = (msg, success = false) => {
    setMessage(msg);
    setIsSuccess(success);
    setShowPopup(true);
  };

  /**
   * Menutup popup
   */
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  /**
   * Reset popup state
   */
  const resetPopup = () => {
    setMessage("");
    setIsSuccess(false);
    setShowPopup(false);
  };

  return {
    // States
    isSuccess,
    message,
    showPopup,
    // Handlers
    showNotification,
    handleClosePopup,
    resetPopup,
    // Setters (jika diperlukan kontrol manual)
    setMessage,
    setIsSuccess,
    setShowPopup,
  };
};
