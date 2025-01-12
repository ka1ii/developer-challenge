"use client"
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Cookies from "js-cookie";
import useContracts from "@/hooks/useContracts";

export default function PendingPage() {

  const username = Cookies.get('username') || '';
  const { contracts } = useContracts(username);

  return (
    <>
      <h1 className="text-xl font-bold">Pending Contracts</h1>
      <div className="flex flex-row gap-4">
        {contracts.filter(contract => (!contract.handshake && contract.client.username === username)).map(contract => (
          <a className="block" key={contract.cid}> 
            <Card>
              <CardHeader>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>{contract.contract}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contract ID: {contract.cid}</p>
                <p>Amount in Escrow: {contract.amount}</p>
                <p>Freelancer: {contract.freelancer.username}</p>
                <p>Freelancer address: {contract.freelancer.address}</p>
                <p>Client: {contract.client.username}</p>
                <p>Client address: {contract.client.address}</p>
                <p>Handshake: {contract.handshake ? "Yes" : "No"}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}