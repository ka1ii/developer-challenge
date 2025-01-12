"use client";

import { releaseFunds } from "@/services/apiService";
    
export default function useReleaseFunds(username: string) {

  const _releaseFunds = async (cid: string, amount: number) => {
    try {

      await releaseFunds(cid, username, amount);

      return true;
    } catch (err: any) {
      // error handling
    }
  };

  return {
    _releaseFunds
  };
}
