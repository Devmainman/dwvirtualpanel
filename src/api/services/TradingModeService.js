// TradingModeService.js
import axios from "axios";
import { API_BASE_URL } from "../config";

export const getTradingMode = (token) =>
  axios.get(`${API_BASE_URL}/admin/trading-mode`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const setTradingMode = (token, mode) =>
  axios.put(`${API_BASE_URL}/admin/trading-mode`, 
    { mode },
    { headers: { Authorization: `Bearer ${token}` } }
  );
