"use client"
import React from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

const formSchema = z.object({
    address: z.string().min(2, {
        message: "Address must be at least 2 characters.",
    }),
    amount: z.number().min(1, {
        message: "Amount must be at least 1.",
    }),
})

export default function ProfileForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "0x0000000000000000000000000000000000000000",
      amount: 0,
    },
  })
 
  function onSubmit(values: z.infer<typeof formSchema>) {

    console.log(values)
  }
    
    const [balance, setBalance] = React.useState(1000);

    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{balance} Coin</h1>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Job Title" {...field} />
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
                <Input placeholder="Job Budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Transfer</Button>
      </form>
            </Form>
      </div>
  )
}
