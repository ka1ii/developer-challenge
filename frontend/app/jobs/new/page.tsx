"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import useNewJob from "@/hooks/useNewJob";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  // convert the budget to a number and validate
  budget: z.preprocess(
    (val) => Number(val),
    z.number().min(1, {
      message: "Budget must be at least 1.",
    })
  ),
});

export default function NewJobForm() {
  const router = useRouter();
  const username = Cookies.get("username") || "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
    },
  });

  const { submitJob, loading, error } = useNewJob(username);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await submitJob({
        title: values.title,
        description: values.description,
        budget: values.budget,
      });
      router.push("/jobs");
    } catch (err) {
      console.error("onSubmit error:", err);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Job Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <FormControl>
                <Input placeholder="Job Budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Job Description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Describe the job in detail.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-red-500">Error: {error}</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </Form>
  );
}
