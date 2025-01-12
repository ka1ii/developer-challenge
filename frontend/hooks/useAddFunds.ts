"use client";

import { addFunds } from "@/services/apiService";
    
export default function useAddFunds(username: string) {

  const _addFunds = async (cid: string, amount: number) => {
    try {

      await addFunds(cid, username, amount);

      return true;
    } catch (err: any) {
      // error handling
    }
  };

  return {
    _addFunds
  };
}
