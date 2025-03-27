
import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

interface InteractionType {
  id: string;
  company_id: string;
  placement_officer_id: string;
  placement_officer_name?: string;
  interaction_date: string;
  description: string;
  interaction_type: string;
  created_at: string;
}

interface InteractionsTimelineProps {
  companyId: string;
}

const formSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  interaction_type: z.string().min(1, { message: "Interaction type is required" }),
  placement_officer_id: z.string().uuid({ message: "Valid placement officer is required" }),
});

const InteractionsTimeline: React.FC<InteractionsTimelineProps> = ({ companyId }) => {
  const [interactions, setInteractions] = useState<InteractionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [placementOfficers, setPlacementOfficers] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      interaction_type: "meeting",
      placement_officer_id: "",
    },
  });

  useEffect(() => {
    fetchInteractions();
    fetchPlacementOfficers();
  }, [companyId]);

  const fetchInteractions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_interactions')
        .select(`
          id, 
          company_id, 
          placement_officer_id, 
          interaction_date, 
          description, 
          interaction_type, 
          created_at,
          placement_officers(name)
        `)
        .eq('company_id', companyId)
        .order('interaction_date', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        placement_officer_name: item.placement_officers ? item.placement_officers.name : 'Unknown',
      }));

      setInteractions(formattedData);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to load interaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlacementOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('placement_officers')
        .select('id, name');

      if (error) throw error;
      setPlacementOfficers(data || []);
    } catch (error) {
      console.error('Error fetching placement officers:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from('company_interactions')
        .insert({
          company_id: companyId,
          placement_officer_id: values.placement_officer_id,
          description: values.description,
          interaction_type: values.interaction_type,
        });

      if (error) throw error;

      toast.success('Interaction added successfully');
      form.reset();
      setIsDialogOpen(false);
      fetchInteractions();
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to add interaction');
    }
  };

  const getInteractionTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting': return 'Meeting';
      case 'call': return 'Phone Call';
      case 'email': return 'Email';
      case 'visit': return 'Site Visit';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Interaction History</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="hover-transition">
              <Plus className="mr-2 h-4 w-4" />
              Add Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Interaction</DialogTitle>
              <DialogDescription>
                Record a new interaction with this company.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="interaction_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interaction Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="visit">Site Visit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placement_officer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placement Officer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select placement officer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {placementOfficers.map(officer => (
                            <SelectItem key={officer.id} value={officer.id}>
                              {officer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="Describe the interaction..." 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Interaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading interactions...</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No interactions recorded yet.</p>
            <p className="text-sm mt-1">Record your first interaction with this company.</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-3 top-5 bottom-0 w-px bg-border"></div>
            
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex gap-4 relative">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center relative z-10 mt-1">
                  <Clock className="h-3 w-3 text-accent-foreground" />
                </div>
                <div className="flex-1 bg-card border rounded-md p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-medium">{getInteractionTypeLabel(interaction.interaction_type)}</span>
                      <span className="text-muted-foreground ml-2 text-sm">with {interaction.placement_officer_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(interaction.interaction_date), 'MMM d, yyyy - h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{interaction.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractionsTimeline;
