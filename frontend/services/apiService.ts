// handles api requests
import ContractInput from '@/types/contractInput';
import JobInput from '@/types/jobInput';
import ProposalInput from '@/types/proposalInput';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1"
});

export const fetchJob = async (jobId: string, username: string) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}`, {
      headers: {
        'username': username,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response.status !== 404) {
      console.error("Failed to fetch job:", error);
    }
  }
};

export const fetchJobs = async (username: string) => {
  try {
    const response = await apiClient.get('/jobs', {
      headers: { 'username': username },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  }
};

export const postJob = async (jobInput: JobInput, username: string) => {
  try {
    await apiClient.post('/jobs', jobInput, {
      headers: {
        'username': username,
      },
    });
  } catch (error) {
    console.error("Failed to post job:", error);
  }
};

export const fetchBalance = async (username: string) => {
  try {
    const response = await apiClient.get('/wallet/balance', {
      headers: { 'username': username },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
};

export const transferFunds = async (
  username: string,
  payee: string,
  amount: number
) => {
  await apiClient.post(
    "/wallet/transfer",
    { payee, amount },
    {
      headers: { username },
    }
  );
};

export const postProposal = async (proposalInput: ProposalInput, username: string) => {
    try {
        await apiClient.post(`/jobs/${proposalInput.jobId}/proposals`, proposalInput, {
            headers: { 'username': username },
        });
    } catch (error) {
        console.error("Failed to post proposal:", error);
    }
};

export const fetchProposal = async (jobId: string, proposalId: string, username: string) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}/proposals/${proposalId}`, {
      headers: { 'username': username },
    });
    return response.data;
  } catch (error: any) {
    // ignore 404 errors
    if (error.response.status !== 404) {
      console.error("Failed to fetch proposal:", error);
    }
  }
};

export const fetchContracts = async (username: string) => {
  try {
    const response = await apiClient.get('/contracts', {
      headers: { 'username': username },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
  }
};

export const postContract = async (contractInput: ContractInput, username: string) => {
  try {
    await apiClient.post('/contracts', contractInput, {
      headers: { 'username': username },
    });
  } catch (error) {
    console.error("Failed to post contract:", error);
  }
};

export const approveContract = async (cid: string, username: string) => {
  try {
    await apiClient.post(`/contracts/${cid}/approve`, {}, {
      headers: { 'username': username },
    });
  } catch (error) {
    console.error("Failed to approve contract:", error);
  }
};

export const fetchContract = async (cid: string, username: string) => {
  try {
    const response = await apiClient.get(`/contracts/${cid}`, {
      headers: { 'username': username },
    });
    return response.data;
  } catch (error: any) {
    if (error.response.status !== 404) {
      console.error("Failed to fetch contract:", error);
    }
  }
};

export const addFunds = async (cid: string, username: string, amount: number) => {
  try {
    await apiClient.post(`/contracts/${cid}/addFunds`, { amount: amount }, {
      headers: { 'username': username },
    });
  } catch (error) {
    console.error("Failed to add funds:", error);
  }
};

export const releaseFunds = async (cid: string, username: string, amount: number) => {
  try {
    await apiClient.post(`/contracts/${cid}/releaseFunds`, { amount: amount }, {
      headers: { 'username': username },
    });
  } catch (error) {
    console.error("Failed to release funds:", error);
  }
};