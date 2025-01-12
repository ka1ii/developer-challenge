"use client";

import { useState } from "react";
import { postJob } from "@/services/apiService";
import JobInput from "@/types/jobInput";

export default function useNewJob(username: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitJob = async (jobData: JobInput) => {
    try {
      setLoading(true);
      setError(null);

      await postJob(jobData, username);

      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to post job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitJob,
    loading,
    error,
  };
}
