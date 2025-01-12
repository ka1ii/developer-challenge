"use client";

import { useState, useEffect } from "react";
import { fetchBalance, transferFunds } from "@/services/apiService";

export const useWallet = (username: string = "") => {
  const [balance, setBalance] = useState<number>(-1);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBalance(username);
        console.log("fetching balance", data);
        setBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch balance");
      }
    };

    fetchData();
  }, [username, refreshKey]);

  const transfer = async (payee: string, amount: number) => {
    try {
      await transferFunds(username, payee, amount);
      // Force a refresh of the balance
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to transfer:", err);
      throw err;
    }
  };

  return {
    balance,
    transfer,
  };
};

export default useWallet;