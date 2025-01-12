"use client";

import { postContract } from "@/services/apiService";
import ContractInput from "@/types/contractInput";
    
export default function useNewContract(username: string) {

  const submitContract = async (contractData: ContractInput) => {
    try {

      await postContract(contractData, username);

      return true;
    } catch (err: any) {
      // error handling
    }
  };

  return {
    submitContract
  };
}
