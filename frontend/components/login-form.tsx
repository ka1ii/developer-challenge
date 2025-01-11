"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("")
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    document.cookie = `username=${username}; path=/;`;
    router.push("/jobs");
  }
  const router = useRouter();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Freelance Marketplace</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Freelance Marketplace</h1>
            <div className="text-center text-sm">
              Continue as client | freelancer | admin
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="client | freelancer | admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Update state on input change
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          </div>
        </div>
      </form>
    </div>
  );
}
