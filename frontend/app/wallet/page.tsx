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
import Cookies from 'js-cookie';
import useWallet from "@/hooks/useWallet";

// Zod schema for the form
const formSchema = z.object({
  payee: z.string().min(2, {
    message: "Payee must be at least 2 characters.",
  }),
  // convert the amount to a number
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(1, {
      message: "Amount must be at least 1.",
    })
  ),
});

export default function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payee: "",
      amount: 0,
    },
  });

  const username = Cookies.get("username") || "";
  const { balance, transfer } = useWallet(username);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await transfer(values.payee, values.amount);
    } catch (err) {
        // todo
    }
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>
          {balance >= 0 ? `${balance} Coin` : "N/A"}
        </h1>
      </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="payee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payee</FormLabel>
                <FormControl>
                  <Input placeholder="User you are paying to" {...field} />
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
                  <Input type="number" placeholder="Amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            Transfer
          </Button>
        </form>
      </Form>
    </div>
  );
}
