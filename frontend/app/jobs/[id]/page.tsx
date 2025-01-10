"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = Number(params.id);

  // In a real app, you would fetch job details from an API or database.
  // For now, we’ll re-use the same array from your example:
  const jobs = [
    {
      id: 1,
      title: "Software Engineer",
      description: "Develop and maintain softwasdfsodifns.",
      budget: "$100,000 - $120,000",
    },
    {
      id: 2,
      title: "Product Manager",
      description: "Oversee product development from start to finish.",
      budget: "$80,000 - $100,000",
    },
  ];

  // Find the relevant job
  const job = jobs.find((job) => job.id === jobId);

  // If the job doesn't exist, show an error or a 'not found' message
  if (!job) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Job Not Found</h1>
        <p>No job found with ID {jobId}.</p>
      </div>
    );
  }

  // Otherwise, render job details
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>{job.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Budget: {job.budget}</p>
        </CardContent>
      </Card>
    </div>
  );
}
