import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid h-screen lg:grid-cols-2 relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Link href="/dashboard">
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative h-full">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex h-full flex-col justify-between p-10 text-primary-foreground">
          <div className="flex items-center text-lg font-medium">
            <ShieldCheck className="mr-2 h-6 w-6" />
            Admin Portal
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Control is not about micromanagement, but about empowering
                the right people with the right tools.&rdquo;
              </p>
              <footer className="text-sm">System Administrator</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
