"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  
  const handleSuccess = () => {
    router.push("/");
  };
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[400px] gap-6">
        <div className="grid gap-2 text-center">
          <Clapperboard className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold font-headline">Welcome to PlayWave</h1>
          <p className="text-balance text-muted-foreground">
            {activeTab === 'login' ? 'Log in to continue' : 'Create an account to get started'}
          </p>
        </div>
        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
