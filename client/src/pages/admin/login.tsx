
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user is already authenticated via Replit
  useEffect(() => {
    const checkReplitAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          if (user?.isAdmin) {
            setLocation("/admin/dashboard");
          }
        }
      } catch (error) {
        console.error("Replit auth check failed:", error);
      }
    };

    checkReplitAuth();
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple hardcoded authentication
    if (username === "HICUSTOUR" && password === "Wordpass3211") {
      // Store admin session
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminUser", JSON.stringify({
        username: "HICUSTOUR",
        isAdmin: true
      }));
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
      
      // Redirect to admin dashboard
      setLocation("/admin/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleReplitLogin = () => {
    window.addEventListener("message", authComplete);
    const h = 500;
    const w = 350;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    const authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + location.host,
      "_blank",
      "modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );

    function authComplete(e: MessageEvent) {
      if (e.data !== "auth_complete") {
        return;
      }

      window.removeEventListener("message", authComplete);
      authWindow?.close();
      location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleReplitLogin}
              className="w-full bg-orange-500 hover:bg-orange-600"
              data-testid="button-replit-login"
            >
              Login with Replit
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="input-username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
