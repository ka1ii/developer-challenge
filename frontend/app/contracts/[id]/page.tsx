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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Cookies from "js-cookie"
import useContract from "@/hooks/useContract"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddFunds from "@/hooks/useAddFunds";
import useReleaseFunds from "@/hooks/useReleaseFunds";

const fundsSchema = z.object({
  amount: z.string().nonempty("Amount is required"),
});

export default function ContractDetailPage() {
  const params = useParams();
  let contractId = params.id;
  const loggedInUser = Cookies.get("username") || "";
  if (Array.isArray(contractId)) {
    contractId = contractId[0];
  }

  const { contract } = useContract(contractId, loggedInUser);

  const form = useForm<z.infer<typeof fundsSchema>>({
    resolver: zodResolver(fundsSchema),
    defaultValues: {
      amount: "",
    },
  })

  const { _addFunds } = useAddFunds(loggedInUser);

  async function onSubmitAddFunds(values: z.infer<typeof fundsSchema>) {
    if (Array.isArray(contractId)) {
      contractId = contractId[0];
    }
    await _addFunds(contractId, Number(values.amount));
  }

  const { _releaseFunds } = useReleaseFunds(loggedInUser);

  async function onSubmitReleaseFunds(values: z.infer<typeof fundsSchema>) {
    if (Array.isArray(contractId)) {
      contractId = contractId[0];
    }
    await _releaseFunds(contractId, Number(values.amount));
  }


  if (!contract) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Contract Not Found</h1>
        <p>No contract found with ID {contractId}.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Contract Details</h1>
      <p>Contract ID: {contract.cid}</p>
      <p>Contract Title: {contract.title}</p>
      <p>Contract Content: {contract.contract}</p>
      <p>Amount in Escrow: {contract.amount}</p>
      <p>Client: {contract.client.username}</p>
      <p>Client Address: {contract.client.address}</p>
      <p>Freelancer: {contract.freelancer.username}</p>
      <p>Freelancer Address: {contract.freelancer.address}</p>
      <p>Handshake: {contract.handshake ? "Yes" : "No"}</p>
      {loggedInUser === contract.client.username && (
        <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-black text-white px-4 py-2 rounded-md">Add Funds</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Add funds to the contract, this is irreversible action and funds will be locked in the contract.
            </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAddFunds)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Amount</Label>
                        <FormControl>
                          <Input placeholder="amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">Add Funds</Button>
                  </DialogFooter>
                </form>
              </Form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-black text-white px-4 py-2 rounded-md">Release Funds</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Release Funds</DialogTitle>
            <DialogDescription>
              Release funds to the freelancer, this is irreversible action and funds will be released to the freelancer.
            </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitReleaseFunds)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Amount</Label>
                        <FormControl>
                          <Input placeholder="amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">Release Funds</Button>
                  </DialogFooter>
                </form>
              </Form>
          </DialogContent>
        </Dialog>
        </>
      )}
    </div>
  );
}
