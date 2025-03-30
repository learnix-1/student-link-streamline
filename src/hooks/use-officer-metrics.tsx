
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OfficerMetrics, Placement, PlacementOfficer } from '@/types';
import { toast } from 'sonner';

export const useOfficerMetrics = () => {
  const [metrics, setMetrics] = useState<OfficerMetrics[]>([]);
  const [officers, setOfficers] = useState<PlacementOfficer[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch placement officers
        const { data: officersData, error: officersError } = await supabase
          .from('placement_officers')
          .select('*');
        
        if (officersError) throw officersError;
        
        // Fetch placements
        const { data: placementsData, error: placementsError } = await supabase
          .from('placements')
          .select('*');
        
        if (placementsError) throw placementsError;
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*');
        
        if (companiesError) throw companiesError;
        
        setOfficers(officersData || []);
        setPlacements(placementsData || []);
        setCompanies(companiesData || []);
        
        // Calculate metrics with any active filters
        calculateMetrics(placementsData || [], officersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Recalculate metrics when filters change
    calculateMetrics(placements, officers);
  }, [selectedMonth, selectedYear, selectedOfficer, placements, officers]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to changes in placements
    const placementsChannel = supabase
      .channel('placements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'placements' }, 
        async (payload) => {
          // Refetch all placements when there's a change
          try {
            const { data, error } = await supabase
              .from('placements')
              .select('*');
            
            if (error) throw error;
            
            setPlacements(data || []);
            calculateMetrics(data || [], officers);
          } catch (error) {
            console.error('Error refetching placements:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to changes in placement officers
    const officersChannel = supabase
      .channel('officers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'placement_officers' }, 
        async (payload) => {
          // Refetch all officers when there's a change
          try {
            const { data, error } = await supabase
              .from('placement_officers')
              .select('*');
            
            if (error) throw error;
            
            setOfficers(data || []);
            calculateMetrics(placements, data || []);
          } catch (error) {
            console.error('Error refetching officers:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to changes in companies
    const companiesChannel = supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' }, 
        async (payload) => {
          // Refetch all companies when there's a change
          try {
            const { data, error } = await supabase
              .from('companies')
              .select('*');
            
            if (error) throw error;
            
            setCompanies(data || []);
          } catch (error) {
            console.error('Error refetching companies:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(placementsChannel);
      supabase.removeChannel(officersChannel);
      supabase.removeChannel(companiesChannel);
    };
  }, [officers, placements]);

  const calculateMetrics = (placements: Placement[], officers: PlacementOfficer[]) => {
    try {
      // Filter placements by month and year if selected
      let filteredPlacements = [...placements];
      
      if (selectedMonth !== null && selectedYear) {
        filteredPlacements = filteredPlacements.filter(p => {
          const placementDate = new Date(p.placement_date);
          return placementDate.getMonth() === selectedMonth && 
                 placementDate.getFullYear() === selectedYear;
        });
      } else if (selectedYear) {
        filteredPlacements = filteredPlacements.filter(p => {
          const placementDate = new Date(p.placement_date);
          return placementDate.getFullYear() === selectedYear;
        });
      }
      
      // Filter by selected officer if any
      if (selectedOfficer) {
        filteredPlacements = filteredPlacements.filter(p => 
          p.placement_officer_id === selectedOfficer
        );
      }

      // Group placements by officer
      const officerPlacements = new Map<string, Placement[]>();
      officers.forEach(officer => {
        officerPlacements.set(
          officer.id, 
          filteredPlacements.filter(p => p.placement_officer_id === officer.id)
        );
      });

      // Calculate metrics for each officer
      const officerMetrics: OfficerMetrics[] = officers.map(officer => {
        const officerPlacementsList = officerPlacements.get(officer.id) || [];
        const totalPlacements = officerPlacementsList.length;
        const completedPlacements = officerPlacementsList.filter(p => p.status === 'completed').length;
        const inProgressPlacements = officerPlacementsList.filter(p => p.status === 'in_progress').length;
        
        // Find unique companies this officer has worked with
        const uniqueCompanies = new Set(officerPlacementsList.map(p => p.company_id));
        
        // Calculate average placement time (in days) - using a mock calculation for demo
        const averagePlacementTime = totalPlacements > 0 ? Math.floor(Math.random() * 20) + 10 : 0;
        
        // Calculate placement success rate
        const placementSuccessRate = totalPlacements > 0 
          ? Math.round((completedPlacements / totalPlacements) * 100) 
          : 0;
        
        // Find last placement date
        const sortedPlacements = [...officerPlacementsList].sort(
          (a, b) => new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime()
        );
        const lastPlacementDate = sortedPlacements.length > 0 
          ? sortedPlacements[0].placement_date 
          : '';
        
        return {
          id: officer.id,
          name: officer.name,
          totalPlacements,
          completedPlacements,
          inProgressPlacements,
          companiesCollaborated: uniqueCompanies.size,
          averagePlacementTime,
          placementSuccessRate,
          lastPlacementDate
        };
      });
      
      setMetrics(officerMetrics);
    } catch (error) {
      console.error('Error calculating officer metrics:', error);
      toast.error('Failed to calculate performance metrics');
    }
  };

  // Add a method to get placements for use in components
  const getPlacements = () => placements;

  return { 
    metrics, 
    loading, 
    companies, 
    officers,
    selectedMonth, 
    setSelectedMonth,
    selectedYear, 
    setSelectedYear,
    selectedOfficer, 
    setSelectedOfficer,
    getPlacements
  };
};
