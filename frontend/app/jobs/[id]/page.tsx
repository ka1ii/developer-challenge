"use client";

import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;
  const router = useRouter();

  const loggedInUser = Cookies.get("username");

  // backend does not send proposals field if the user isn't the owner

  const job = {
    id: '1',
    title: "Software Engineer",
    description: "Develop and maintain softwasdfsodifns.",
    budget: "$100,000 - $120,000",
    owner: "client",
    proposals: [
      {
        id: "1",
        freelancer: "freelance_user",
        coverletter: "I am a software engineer with 5 years of experience.",
        amount: 100000,
      },
      {
        id: "2",
        freelancer: "freelance_user2",
        coverletter: "I am a software engineer with 10 years of experience.",
        amount: 120000,
      }
    ]
  }

  if (!job) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Job Not Found</h1>
        <p>No job found with ID {jobId}.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Job Details</h1>
      <p>ID: {job.id}</p>
      <p>Title: {job.title}</p>
      <p>Description: {job.description}</p>
      <p>Budget: {job.budget}</p>
      {loggedInUser != job.owner && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-black text-white px-4 py-2 rounded-md">Create Proposal</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Proposal</DialogTitle>
            <DialogDescription>
              Create a proposal for this job.
            </DialogDescription>
          </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coverletter" className="text-right">
                Cover Letter
              </Label>
              <Textarea id="coverletter" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Proposal</Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {loggedInUser == job.owner && (
        <div>
          <h1>Proposals</h1>
          {job.proposals.map(proposal => (
            <a className="block" key={proposal.id}> 
              <Card onClick={() => router.push(`/contracts/new?proposalId=${proposal.id}`)}>
                <CardHeader>
                  <CardTitle>{proposal.amount}</CardTitle>
                  <CardDescription>{proposal.freelancer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{proposal.coverletter}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
