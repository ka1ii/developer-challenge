// manages react component state for contract data
import { useState, useEffect } from 'react';
import { fetchContract } from '@/services/apiService';
import Contract from '@/types/contract';

const useContract = (cid: string, username: string) => {
  const [contract, setContract] = useState<Contract | null>(null);
//   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchContract(cid, username);
        setContract(data);
      } catch (error) {
        // setError("Failed to fetch contract");
      }
    };

    fetchData();
  }, [cid, username]);

  return { contract };
};

export default useContract;
