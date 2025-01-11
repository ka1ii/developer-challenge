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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Cookies from "js-cookie"

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = params.id;

  const contracts = [
    { id: '1', title: "Sample contract", contract: "Sample contract content", agreement: { amount: 100, client: {address: "0x0000000000000000000000000000000000000000", username: "client"}, handshake: false, freelancer: {address: "0x0000000000000000000000000000000000000000", username: "freelancer"}   } },
  ];

  const contract = contracts.find((contract) => contract.id === contractId);

  const loggedInUser = Cookies.get("username");

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
      <p>Contract ID: {contract.id}</p>
      <p>Contract Content: {contract.contract}</p>
      <p>Amount in Escrow: {contract.agreement.amount}</p>
      <p>Client Address: {contract.agreement.client.address}</p>
      <p>Freelancer Address: {contract.agreement.freelancer.address}</p>
      <p>Handshake: {contract.agreement.handshake ? "Yes" : "No"}</p>
      {loggedInUser === contract.agreement.client.username && (
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Funds</Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-black text-white px-4 py-2 rounded-md">Release Funds</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>
                Add funds to the contract, this is irreversible action and funds will be locked in the contract.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input id="amount" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Funds</Button>
            </DialogFooter>
          </DialogContent>
            </Dialog>
        </>
      )}
    </div>
  );
}
