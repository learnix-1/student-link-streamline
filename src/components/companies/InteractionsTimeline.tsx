
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AddInteractionDialog from './AddInteractionDialog';

interface Interaction {
  id: string;
  company_id: string;
  placement_officer_id: string;
  placement_officer_name?: string;
  interaction_type: string;
  description: string;
  interaction_date: string;
}

interface InteractionsTimelineProps {
  companyId: string;
}

const InteractionsTimeline: React.FC<InteractionsTimelineProps> = ({ companyId }) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('interactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'company_interactions', filter: `company_id=eq.${companyId}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newInteraction = payload.new as Interaction;
            // Fetch the officer name for the new interaction
            fetchOfficerName(newInteraction).then(updatedInteraction => {
              setInteractions(prev => [updatedInteraction, ...prev]);
            });
          } else if (payload.eventType === 'UPDATE') {
            setInteractions(prev => 
              prev.map(interaction => 
                interaction.id === payload.new.id ? payload.new as Interaction : interaction
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setInteractions(prev => 
              prev.filter(interaction => interaction.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_interactions')
        .select('*')
        .eq('company_id', companyId)
        .order('interaction_date', { ascending: false });
        
      if (error) throw error;

      // Fetch officer names for all interactions
      const interactionsWithNames = await Promise.all(
        (data || []).map(fetchOfficerName)
      );
      
      setInteractions(interactionsWithNames);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to load company interactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficerName = async (interaction: Interaction): Promise<Interaction> => {
    try {
      const { data, error } = await supabase
        .from('placement_officers')
        .select('name')
        .eq('id', interaction.placement_officer_id)
        .single();
        
      if (error) throw error;
      
      return {
        ...interaction,
        placement_officer_name: data?.name || 'Unknown Officer'
      };
    } catch (error) {
      console.error('Error fetching officer name:', error);
      return {
        ...interaction,
        placement_officer_name: 'Unknown Officer'
      };
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return '🤝';
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'site_visit':
        return '🏢';
      case 'job_fair':
        return '🎪';
      default:
        return '📝';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Interaction History</CardTitle>
          <CardDescription>
            Record of all interactions with this company
          </CardDescription>
        </div>
        <AddInteractionDialog companyId={companyId} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading interactions...</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No interactions recorded yet.</p>
            <p className="text-sm mt-1">Record your first interaction using the button above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-xl">
                  {getInteractionIcon(interaction.interaction_type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-base capitalize">
                      {interaction.interaction_type}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(interaction.interaction_date), 'PPP')}
                    </span>
                  </div>
                  <p className="mt-1 mb-2">{interaction.description}</p>
                  <div className="text-sm text-muted-foreground">
                    By: {interaction.placement_officer_name}
                  </div>
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
