"use client"
import React from "react";
import {useEffect, useState} from "react";

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
import axios from "axios";

// server-side validation for the form
const formSchema = z.object({
    payee: z.string().min(2, {
        message: "Payee must be at least 2 characters.",
    }),
    // convert the amount to a number and validate it, html form inputs always return their values as strings.
    amount: z.preprocess((val) => Number(val), z.number().min(1, {
        message: "Amount must be at least 1.",
    })),
})

export default function ProfileForm() {

    // useForm hoomk uses the zodResolver to validate the data against the schema
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // default values are required otherwise we go from an uncontrolled component to a controlled component
        defaultValues: {
            payee: "", 
            amount: 0   
        }
    })

    const username = Cookies.get('username');
    const [balance, setBalance] = useState(-1);
    const [refreshKey, setRefreshKey] = useState(0); // State variable to control re-render

    function onSubmit(values: z.infer<typeof formSchema>) {
        // call the transfer endpoint with the form values
        axios.post('http://localhost:8000/api/v1/wallet/transfer', {
            payee: values.payee,
            amount: values.amount
        }, {
            headers: {
                'username': username
            }
        })
        // this isn't guaranteed to retrieve the latest balance since the blockchain is async
        // a better approach would be to use a websocket to get real-time updates via notifications of events captured from on-chain
        .then(() => {
            setRefreshKey(prevKey => prevKey + 1); // Increment the key to trigger re-render
        })
        .catch((error) => {
            console.error("Failed to transfer:", error);
        });
    }

    useEffect(() => {
        // Basic GET request
        axios
        .get("http://localhost:8000/api/v1/wallet/balance", {
            headers: { username: username },
        })
        .then((response) => {
            setBalance(response.data.balance);
        })
        .catch((error) => {
            console.error("Failed to fetch:", error);
        });
    }, [refreshKey]);

    return (
        <div key={refreshKey}>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{balance} Coin</h1>
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
        
        <Button type="submit">Transfer</Button>
      </form>
            </Form>
        </div>
  )
}
