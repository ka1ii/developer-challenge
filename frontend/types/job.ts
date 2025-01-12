import { Proposal } from "./proposal";
export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  owner: string;
  proposals: Proposal[];
}