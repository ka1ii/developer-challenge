// manages react component state for job data
import { useState, useEffect } from 'react';
import { fetchJob } from '@/services/apiService';
import { Job } from '@/types';

const useJob = (jobId: string, username: string) => {
  const [job, setJob] = useState<Job | null>(null);
//   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJob(jobId, username);
        setJob(data);
      } catch (error) {
        // setError("Failed to fetch job");
      }
    };

    fetchData();
  }, [jobId, username]);

  return { job };
};

export default useJob;
