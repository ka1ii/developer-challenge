"use client"

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useNewContract from "@/hooks/useNewContract";
import useProposal from "@/hooks/useProposal";
import useJob from "@/hooks/useJob"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    contract: z.string().min(2, {
        message: "Contract must be at least 2 characters.",
    }),
    // convert from string to number
    amount: z.preprocess(
      (val) => Number(val),
      z.number().min(0, {
        message: "Amount must be at least 0.",
      })
    ),
    // only clients can create contracts for now
    freelancer: z.string().min(2, {
        message: "Freelancer must be at least 2 characters.",
    }),
})

export default function NewContractForm() {

    
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId") || '';
  const jobId = searchParams.get("jobId") || '';
  const username = Cookies.get('username') || '';
  const router = useRouter();

  // hooks 
  const { submitContract } = useNewContract(username);
  const { job } = useJob(jobId, username);
  const { proposal } = useProposal(jobId, proposalId, username);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      contract: '',
      amount: 0,
      freelancer: '',
    }
  })

  useEffect(() => {
    if (job && proposal) {
      form.reset({
        title: job.title ?? "",
        contract: job.description ?? "",
        amount: proposal.amount ?? 0,
        freelancer: proposal.freelancer ?? "",
      })
    }
  }, [job, proposal, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await submitContract({
        title: values.title,
        contract: values.contract,
        amount: values.amount,
        freelancer: values.freelancer,
      });
      router.push("/contracts/pending");
    } catch (err) {
      console.error("onSubmit error:", err);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Title</FormLabel>
              <FormControl>
                <Input placeholder="Contract Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
              />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="Amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
              />
        <FormField
          control={form.control}
          name="freelancer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Freelancer</FormLabel>
              <FormControl>
                <Input placeholder="Freelancer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contract"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contract"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Create Contract</Button>
      </form>
    </Form>
  )
}
