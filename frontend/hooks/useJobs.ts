// manages react component state for job data
import { useState, useEffect } from 'react';
import { fetchJobs } from '@/services/apiService';
import { Job } from '@/types';

const useJobs = (username: string) => {
  const [jobs, setJobs] = useState<Job[]>([]);
//   const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchJobs(username);
        setJobs(data);
      } catch (error) {
        // setError("Failed to fetch job");
        console.error("Failed to fetch job");
      }
    };

    fetchData();
  }, [username]);

  return { jobs };
};

export default useJobs;
