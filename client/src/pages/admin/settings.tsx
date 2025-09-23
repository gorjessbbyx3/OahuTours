import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Settings as SettingsIcon, Check, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Settings } from "@shared/schema";

const settingsFormSchema = insertSettingsSchema.extend({
  taxRate: z.number().min(0).max(100),
  defaultTourDuration: z.number().min(1).max(24),
  maxGroupSize: z.number().min(1).max(50),
  advanceBookingDays: z.number().min(0).max(365),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function AdminSettings() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuthenticated");
    const adminUser = localStorage.getItem("adminUser");

    if (adminAuth === "true" && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.username === "HICUSTOUR" && user.isAdmin) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("adminUser");
          window.location.href = "/admin/login";
        }
      } catch {
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      }
    } else {
      window.location.href = "/admin/login";
    }

    setIsLoading(false);
  }, []);

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      cloverAppId: '',
      cloverApiToken: '',
      cloverEnvironment: 'sandbox',
      businessName: 'Oahu Elite Tours',
      contactEmail: '',
      phoneNumber: '',
      taxRate: 8.25,
      defaultTourDuration: 6,
      maxGroupSize: 8,
      advanceBookingDays: 2,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        cloverAppId: settings.cloverAppId || '',
        cloverApiToken: settings.cloverApiToken || '',
        cloverEnvironment: settings.cloverEnvironment || 'sandbox',
        businessName: settings.businessName || 'Oahu Elite Tours',
        contactEmail: settings.contactEmail || '',
        phoneNumber: settings.phoneNumber || '',
        taxRate: settings.taxRate ? parseFloat(settings.taxRate) : 8.25,
        defaultTourDuration: settings.defaultTourDuration || 6,
        maxGroupSize: settings.maxGroupSize || 8,
        advanceBookingDays: settings.advanceBookingDays || 2,
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await apiRequest("POST", "/api/admin/settings", {
        ...data,
        taxRate: data.taxRate.toString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = async () => {
    const cloverAppId = form.getValues('cloverAppId');
    const cloverApiToken = form.getValues('cloverApiToken');
    const environment = form.getValues('cloverEnvironment');

    if (!cloverAppId || !cloverApiToken) {
      toast({
        title: "Missing Information",
        description: "Please enter both Clover App ID and API Token to test the connection.",
        variant: "destructive",
      });
      return;
    }

    setTestConnectionStatus('testing');

    try {
      // Test connection with a small test payment
      const response = await apiRequest("POST", "/api/create-clover-payment", {
        amount: 100, // $1.00 test
        currency: "usd",
        card: {
          number: "4111111111111111", // Clover test card
          exp_month: "12",
          exp_year: "2025",
          cvv: "123",
        },
        billing: {
          name: "Test Connection",
        },
        test: true, // Mark as test transaction
      });

      const result = await response.json();

      if (result.success) {
        setTestConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Clover payment system.",
        });
      } else {
        setTestConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: result.error || "Unable to connect to Clover. Please check your credentials.",
          variant: "destructive",
        });
      }

      setTimeout(() => setTestConnectionStatus('idle'), 3000);
    } catch (error) {
      setTestConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Clover. Please check your credentials and network connection.",
        variant: "destructive",
      });

      setTimeout(() => setTestConnectionStatus('idle'), 3000);
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-muted min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="pt-24 pb-20 bg-muted min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mr-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-light text-foreground" data-testid="text-settings-title">
            Settings
          </h1>
        </div>

        <Card className="shadow-xl" data-testid="card-settings">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Clover Integration Settings */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <SettingsIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-semibold" data-testid="text-clover-title">
                      Clover Payment Integration
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cloverAppId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clover App ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your Clover App ID" 
                              {...field} 
                              data-testid="input-clover-app-id"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cloverApiToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Token</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your API token" 
                              {...field} 
                              data-testid="input-clover-api-token"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cloverEnvironment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-clover-environment">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testConnectionStatus === 'testing'}
                      className="w-full sm:w-auto"
                      data-testid="button-test-connection"
                    >
                      {testConnectionStatus === 'testing' && (
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      )}
                      {testConnectionStatus === 'success' && <Check className="mr-2 h-4 w-4 text-green-600" />}
                      {testConnectionStatus === 'error' && <X className="mr-2 h-4 w-4 text-red-600" />}
                      {testConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </div>

                {/* Business Settings */}
                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-semibold mb-6" data-testid="text-business-title">
                    Business Settings
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-business-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="info@oahuelitetours.com" 
                              {...field} 
                              data-testid="input-contact-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="(808) 555-0123" 
                              {...field} 
                              data-testid="input-phone-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="100"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value || ''}
                              data-testid="input-tax-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tour Settings */}
                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-semibold mb-6" data-testid="text-tour-settings-title">
                    Tour Settings
                  </h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="defaultTourDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tour Duration (hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              max="24"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              value={field.value || ''}
                              data-testid="input-default-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGroupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Group Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              max="50"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              value={field.value || ''}
                              data-testid="input-max-group-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="advanceBookingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Booking Required (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              max="365"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value || ''}
                              data-testid="input-advance-booking"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/admin/dashboard">
                    <Button type="button" variant="outline" data-testid="button-cancel">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Clover Setup Instructions */}
        <Card className="mt-8 shadow-xl" data-testid="card-instructions">
          <CardHeader>
            <CardTitle>Clover Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-4">
                To integrate with Clover payment processing, follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Log into your Clover merchant dashboard at{" "}
                  <a 
                    href="https://www.clover.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-clover-dashboard"
                  >
                    clover.com/dashboard
                  </a>
                </li>
                <li>Navigate to "Setup" → "Apps & Services" → "API Tokens"</li>
                <li>Create a new API token with payment processing permissions</li>
                <li>Copy your App ID and API Token and enter them above</li>
                <li>Use "Sandbox" environment for testing, "Production" for live payments</li>
                <li>Test the connection to ensure everything is working properly</li>
              </ol>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Security Note:
                </p>
                <p className="text-sm text-muted-foreground">
                  Your API credentials are encrypted and stored securely. Never share your API tokens
                  with unauthorized parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}