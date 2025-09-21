import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCustomTourSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const customTourFormSchema = insertCustomTourSchema.extend({
  tourType: z.enum(['day', 'night']),
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  groupSize: z.number().min(1).max(20),
});

type CustomTourFormData = z.infer<typeof customTourFormSchema>;

const activities = [
  "Hiking & Nature",
  "Beach & Water Sports", 
  "Cultural Sites",
  "Photography Spots",
  "Local Cuisine",
  "Shopping",
  "Snorkeling",
  "Sightseeing",
];

export default function CustomTour() {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [estimatedPrice, setEstimatedPrice] = useState(150);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CustomTourFormData>({
    resolver: zodResolver(customTourFormSchema),
    defaultValues: {
      tourType: 'day',
      activities: [],
      groupSize: 2,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      specialRequests: '',
    },
  });

  const createCustomTourMutation = useMutation({
    mutationFn: async (data: CustomTourFormData) => {
      const response = await apiRequest("POST", "/api/custom-tours", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Custom Tour Request Submitted",
        description: "We'll contact you within 24 hours to finalize your custom tour!",
      });
      form.reset();
      setSelectedActivities([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit custom tour request",
        variant: "destructive",
      });
    },
  });

  const handleActivityChange = (activity: string, checked: boolean) => {
    let newActivities: string[];
    if (checked) {
      newActivities = [...selectedActivities, activity];
    } else {
      newActivities = selectedActivities.filter(a => a !== activity);
    }
    setSelectedActivities(newActivities);
    form.setValue('activities', newActivities);
    
    // Update estimated price based on activities
    const basePrice = form.watch('tourType') === 'day' ? 150 : 120;
    const activityPrice = newActivities.length * 15;
    setEstimatedPrice(basePrice + activityPrice);
  };

  const onSubmit = (data: CustomTourFormData) => {
    const submitData = {
      ...data,
      estimatedPrice: estimatedPrice.toString(),
    };
    createCustomTourMutation.mutate(submitData);
  };

  return (
    <div className="pt-24 pb-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-foreground mb-6" data-testid="text-custom-title">
            Create Your Perfect Tour
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-custom-subtitle">
            Design a personalized experience tailored to your interests and schedule
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Tour Type Selection */}
                <FormField
                  control={form.control}
                  name="tourType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">Tour Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid md:grid-cols-2 gap-4"
                          data-testid="radio-group-tour-type"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="day" id="day" data-testid="radio-day" />
                            <Label htmlFor="day" className="cursor-pointer">
                              <div className="p-4 border border-border rounded-lg hover:bg-muted">
                                <div className="font-medium">Day Tour</div>
                                <div className="text-sm text-muted-foreground">6-8 hours of exploration</div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="night" id="night" data-testid="radio-night" />
                            <Label htmlFor="night" className="cursor-pointer">
                              <div className="p-4 border border-border rounded-lg hover:bg-muted">
                                <div className="font-medium">Night Tour</div>
                                <div className="text-sm text-muted-foreground">3-4 hours of evening magic</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Activity Preferences */}
                <FormField
                  control={form.control}
                  name="activities"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">Select Activities</FormLabel>
                      <div className="grid md:grid-cols-2 gap-3">
                        {activities.map((activity) => (
                          <div key={activity} className="flex items-center space-x-2">
                            <Checkbox
                              id={activity}
                              checked={selectedActivities.includes(activity)}
                              onCheckedChange={(checked) => handleActivityChange(activity, checked as boolean)}
                              data-testid={`checkbox-activity-${activity.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <Label 
                              htmlFor={activity} 
                              className="cursor-pointer p-3 border border-border rounded-lg hover:bg-muted flex-1"
                            >
                              {activity}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Group Size */}
                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">Group Size</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-group-size">
                            <SelectValue placeholder="Select group size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2">2 people</SelectItem>
                          <SelectItem value="3">3 people</SelectItem>
                          <SelectItem value="4">4 people</SelectItem>
                          <SelectItem value="5">5 people</SelectItem>
                          <SelectItem value="6">6 people</SelectItem>
                          <SelectItem value="7">7+ people (Private group)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Contact Information</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} data-testid="input-customer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Your phone number" {...field} data-testid="input-customer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Special Requests */}
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">Special Requests</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any specific locations you'd like to visit or special accommodations needed..."
                          className="h-24"
                          {...field}
                          data-testid="textarea-special-requests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estimated Pricing */}
                <Card className="bg-muted">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-pricing-title">Estimated Pricing</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Base Tour:</span>
                        <span className="text-xl font-semibold" data-testid="text-base-price">
                          ${form.watch('tourType') === 'day' ? '150' : '120'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Selected Activities:</span>
                        <span className="text-xl font-semibold" data-testid="text-activity-price">
                          ${selectedActivities.length * 15}
                        </span>
                      </div>
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-semibold">Total per person:</span>
                          <span className="text-2xl font-bold text-primary" data-testid="text-total-price">
                            ${estimatedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createCustomTourMutation.isPending}
                    data-testid="button-submit-custom-tour"
                  >
                    {createCustomTourMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Link href="/booking">
                    <Button type="button" variant="outline" data-testid="button-book-standard">
                      Book Standard Tour Instead
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
