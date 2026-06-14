"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDB } from "@/lib/context";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, ShieldAlert, Landmark } from "lucide-react";

export default function LoginForm() {
  const { login, isAuthenticated } = useDB();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      setLoading(false);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to Surabaya Heritage Admin panel.",
          type: "success",
        });
        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid credentials.");
        toast({
          title: "Authentication Failed",
          description: result.error || "Please check your credentials and try again.",
          type: "error",
        });
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  // const handleFillDemoCredentials = () => {
  //   setEmail("admin@surabayaheritage.com");
  //   setPassword("admin123");
  //   setError("");
  // };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mt-2">
            Surabaya Heritage
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Centralized Content Administration System
          </p>
        </div>

        <Card className="border-zinc-200/80 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-zinc-900">Sign In</CardTitle>
            <CardDescription className="text-zinc-500">
              Enter your admin credentials to access the dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md animate-shake">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@surabayaheritage.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-zinc-200 bg-zinc-50/50 focus-visible:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-zinc-200 bg-zinc-50/50 focus-visible:bg-white"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-10 font-medium cursor-pointer" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              {/* <div className="relative flex py-2 items-center w-full">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Demonstration Info
                </span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full text-xs text-zinc-600 hover:text-zinc-900 border-dashed border-zinc-300 bg-zinc-50/40 hover:bg-zinc-50 cursor-pointer"
                onClick={handleFillDemoCredentials}
              >
                Autofill Administrator Credentials
              </Button> */}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
