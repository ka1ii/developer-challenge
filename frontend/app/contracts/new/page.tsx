"use client"

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

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    contract: z.string().min(2, {
        message: "Contract must be at least 2 characters.",
    }),
    amount: z.number().min(0, {
        message: "Amount must be at least 0.",
    }),
    // only clients can create contracts for now
    freelancer: z.string().min(2, {
        message: "Freelancer must be at least 2 characters.",
    }),
})

export default function NewContractForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
    
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId");
 
  function onSubmit(values: z.infer<typeof formSchema>) {

    console.log(values)
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
