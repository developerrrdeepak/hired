'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect } from "react";
import type { Challenge } from "@/lib/definitions";
import { useSearchParams } from "next/navigation";
import { useDocument } from "@/firebase/firestore/use-doc";

const challengeFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description is required."),
  type: z.enum(["Hackathon", "Case Study", "Quiz", "Coding Challenge"], { required_error: "Please select a challenge type."}),
  reward: z.string().optional(),
  deadline: z.date({ required_error: "A deadline is required." }),
});

type ChallengeFormData = z.infer<typeof challengeFormSchema>;

export default function EditChallengePage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const challengeId = params.id as string;
    const orgId = searchParams.get('orgId') || 'org-demo-owner-id';

    const { data: challenge, isLoading } = useDocument<Challenge>(
        firestore ? doc(firestore, `organizations/${orgId}/challenges`, challengeId) : null
    );

    const form = useForm<ChallengeFormData>({
        resolver: zodResolver(challengeFormSchema),
        defaultValues: {
            title: "",
            description: "",
            reward: "",
        },
    });

    useEffect(() => {
        if (challenge) {
            form.reset({
                title: challenge.title,
                description: challenge.description,
                type: challenge.type,
                reward: challenge.reward,
                deadline: new Date(challenge.deadline),
            });
        }
    }, [challenge, form]);

    async function onSubmit(values: ChallengeFormData) {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Firestore not initialized." });
            return;
        }

        try {
            const challengeRef = doc(firestore, `organizations/${orgId}/challenges`, challengeId);
            await updateDoc(challengeRef, {
                ...values,
                deadline: values.deadline.toISOString(),
                updatedAt: new Date().toISOString(),
            });

            toast({
                title: "Challenge Updated",
                description: `The challenge "${values.title}" has been successfully updated.`,
            });
            router.push("/challenges");
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update challenge." });
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <>
      <PageHeader title="Edit Challenge" description="Update challenge details." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Details</CardTitle>
              <CardDescription>Update the competition information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Challenge Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 Frontend Hackathon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a challenge type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {['Hackathon', 'Case Study', 'Quiz', 'Coding Challenge'].map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

             <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Submission Deadline</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal justify-start",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP")
                                ) : (
                                <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Describe the challenge, rules, and evaluation criteria."
                            className="min-h-[150px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               <div className="md:col-span-2">
                <FormField
                    control={form.control}
                    name="reward"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prize / Reward</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., $1000 cash prize, internship interview" {...field} />
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={form.formState.isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Challenge
              </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
