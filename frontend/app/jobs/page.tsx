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

export default function JobsPage() {
  const router = useRouter();
  const jobs = [
    { id: 1, title: "Software Engineer", description: "Develop and maintain softwasdfsodifns.", budget: "$100,000 - $120,000" },
    { id: 2, title: "Product Manager", description: "Oversee product development from start to finish.", budget: "$80,000 - $100,000" },
  ];

  return (
    <>
      <h1 className="text-xl font-bold">Available Jobs</h1>
      <div className="flex flex-row gap-4">
        {jobs.map(job => (
          <a className="block"> 
            <Card onClick={() => {
              router.push(`/jobs/${job.id}`);
            }}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Budget: {job.budget}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}