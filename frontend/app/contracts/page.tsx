"use client"
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation";

export default function ContractsPage() {
    const router = useRouter();
    //TODO: when getting contracts, only display ones that are handshaked by the freelancer
  const contracts = [
      { hash: '1', title: "Sample contract", contract: "Sample contract content", agreement: { amount: 100, client: { address: "0x0000000000000000000000000000000000000000", username: "client" }, handshake: false, freelancer: { address: "0x0000000000000000000000000000000000000000", username: "freelancer" } } },
      { hash: '2', title: "Sample contract 2", contract: "Sample contract content 2", agreement: { amount: 200, client: { address: "0x0000000000000000000000000000000000000000", username: "client" }, handshake: true, freelancer: { address: "0x0000000000000000000000000000000000000000", username: "freelancer" } } },
  ];

  return (
    <>
      <h1 className="text-xl font-bold">My Contracts</h1>
      <div className="flex flex-row gap-4">
        {contracts.map(contract => (
          <a className="block" key={contract.hash}> 
            <Card onClick={() => {
              router.push(`/contracts/${contract.hash}`);
            }}>
              <CardHeader>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>{contract.contract}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount in Escrow: {contract.agreement.amount}</p>
                <p>Freelancer address: {contract.agreement.freelancer.address}</p>
                <p>Client address: {contract.agreement.client.address}</p>
                <p>Handshake: {contract.agreement.handshake ? "Yes" : "No"}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}