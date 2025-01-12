"use client"
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import useJobs from "@/hooks/useJobs";

export default function JobsPage() {
  const router = useRouter();
  const username = Cookies.get('username') || '';
  const { jobs } = useJobs(username);

  return (
    <>
      <h1 className="text-xl font-bold">Available Jobs</h1>
      <div className="flex flex-row gap-4">
        {jobs.map(job => (
          <a className="block" key={job.id}> 
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
              <CardFooter>
                <p>Client: {job.owner}</p>
              </CardFooter>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}