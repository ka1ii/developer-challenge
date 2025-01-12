"use client"
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useContracts from "@/hooks/useContracts";
import Cookies from "js-cookie";
import useApproveContract from "@/hooks/useApproveContract";
import Contract from "@/types/contract";

export default function ApprovePage() {

  const loggedInUser = Cookies.get("username") || "";

  const router = useRouter();
  const { contracts } = useContracts(loggedInUser);

  const { _approveContract } = useApproveContract(loggedInUser);

  const approveContract = async (contract: Contract) => {
    await _approveContract(contract.cid);
    // refresh the page
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold">My Contracts</h1>
      <div className="flex flex-row gap-4">
        {contracts.filter(contract => (contract.freelancer.username === loggedInUser && contract.handshake === false)).map(contract => (
          <a className="block" key={contract.cid}> 
            <Card>
              <CardHeader>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>{contract.contract}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contract ID: {contract.cid}</p>
                <p>Amount in Escrow: {contract.amount}</p>
                <p>Client: {contract.client.username}</p>
                <p>Client address: {contract.client.address}</p>
                <p>Handshake: {contract.handshake ? "Yes" : "No"}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  approveContract(contract);
                }}>Approve Contract</Button>
              </CardFooter>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}