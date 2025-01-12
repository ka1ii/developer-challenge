"use client";

import { postProposal } from "@/services/apiService";
import ProposalInput from "@/types/proposalInput";
    
export default function useNewProposal(username: string) {

  const submitProposal = async (proposalData: ProposalInput) => {
    try {

      await postProposal(proposalData, username);

      return true;
    } catch (err: any) {
      // error handling
    }
  };

  return {
    submitProposal
  };
}
