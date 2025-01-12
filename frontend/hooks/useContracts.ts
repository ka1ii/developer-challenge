// manages react component state for job data
import { useState, useEffect } from 'react';
import { fetchContracts } from '@/services/apiService';
import Contract from '@/types/contract';

const useContracts = (username: string) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
//   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchContracts(username);
        setContracts(data);
      } catch (error) {
        // setError("Failed to fetch contract");
        console.error("Failed to fetch contract");
      }
    };

    fetchData();
  }, [username]);

  return { contracts };
};

export default useContracts;