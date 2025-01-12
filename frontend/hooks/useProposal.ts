// manages react component state for job data
import { useState, useEffect } from 'react';
import { fetchProposal } from '@/services/apiService';
import { Proposal } from '@/types';

const useProposal = (jobId: string, proposalId: string, username: string) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
//   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProposal(jobId, proposalId, username);
        setProposal(data);
      } catch (error) {
        // setError("Failed to fetch proposal");
      }
    };

    fetchData();
  }, [proposalId, username]);

  return { proposal };
};

export default useProposal;