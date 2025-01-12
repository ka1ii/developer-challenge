"use client";

import { approveContract } from "@/services/apiService";
    
export default function useApproveContract(username: string) {

  const _approveContract = async (cid: string) => {
    try {

      await approveContract(cid, username);

      return true;
    } catch (err: any) {
      // error handling
    }
  };

  return {
    _approveContract
  };
}
