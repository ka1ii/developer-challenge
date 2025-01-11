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
import { Button } from "@/components/ui/button";

export default function PendingPage() {
    // only contracts that awaits to be handshaked by the freelancer and the client is the current user
  const contracts = [
      { hash: '1', title: "Sample contract", contract: "Sample contract content", agreement: { amount: 100, client: { address: "0x0000000000000000000000000000000000000000", username: "client" }, handshake: false, freelancer: { address: "0x0000000000000000000000000000000000000000", username: "freelancer" } } }
  ];

  return (
    <>
      <h1 className="text-xl font-bold">My Contracts</h1>
      <div className="flex flex-row gap-4">
        {contracts.map(contract => (
          <a className="block" key={contract.hash}> 
            <Card>
              <CardHeader>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>{contract.contract}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Amount in Escrow: {contract.agreement.amount}</p>
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