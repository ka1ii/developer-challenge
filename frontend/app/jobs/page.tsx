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

export default function JobsPage() {
  const jobs = [
    { id: 1, title: "Software Engineer", description: "Develop and maintain software solutions.", budget: "$100,000 - $120,000" },
    { id: 2, title: "Product Manager", description: "Oversee product development from start to finish.", budget: "$80,000 - $100,000" },
    // Add more job objects as needed
  ];

  return (
    <>
      <h1 className="text-xl font-bold">Available Jobs</h1>
      <div className="flex flex-row gap-4">
        {jobs.map(job => (
          <Card>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Budget: {job.budget}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}