"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { z } from "zod";
import useJob from "@/hooks/useJob";
import useNewProposal from "@/hooks/useNewProposal";

// this shoudl be put in a separate file and exported
const proposalSchema = z.object({
  amount: z.string().nonempty("Amount is required"),
  coverletter: z.string().nonempty("Cover letter is required"),
});

export default function JobDetailPage() {
  const params = useParams();
  let jobId = params.id;
  const router = useRouter();

  // Ensure jobId is a string
  if (Array.isArray(jobId)) {
    jobId = jobId[0];
  }

  const loggedInUser = Cookies.get("username") || "";
  const { job } = useJob(jobId, loggedInUser);

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      amount: "",
      coverletter: "",
    },
  })

  const { submitProposal } = useNewProposal(loggedInUser);

  async function onSubmit(values: z.infer<typeof proposalSchema>) {
    if (Array.isArray(jobId)) {
      jobId = jobId[0];
    }
    try {
      await submitProposal({
        jobId: jobId,
        amount: Number(values.amount),
        coverletter: values.coverletter,
      });
      router.push("/jobs");
    } catch (err) {
      console.error("onSubmit error:", err);
    }
  }

  // hooks MUST be called in the same order upon render EVERYTIME!!
  // if not, the hooks will not work, therefore, this conditional check needs to be last
  // ensuring all hooks are called in the same order upon render
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
          <Button variant="outline">Create Proposal</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Proposal</DialogTitle>
            <DialogDescription>
              Make a proposal for this job.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <Label>Amount</Label>
                    <FormControl>
                      <Input placeholder="Bid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverletter"
                render={({ field }) => (
                  <FormItem>
                    <Label>Cover Letter</Label>
                    <FormControl>
                      <Textarea placeholder="Cover Letter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Send Proposal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      )}
      {loggedInUser == job.owner && (
        <div>
          <h1>Proposals</h1>
          {job.proposals.map(proposal => (
            <a className="block" key={proposal.id}> 
              <Card onClick={() => router.push(`/contracts/new?jobId=${job.id}&proposalId=${proposal.id}`)}>
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
