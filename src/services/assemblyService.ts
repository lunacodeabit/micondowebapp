import { supabase } from '../supabaseClient';
import type { Assembly, AssemblyTopic, AssemblyVote, AssemblyAttendance } from '../types';

export const assemblyService = {
    async getAssemblies(condoId: string) {
        const { data, error } = await supabase
            .from('assemblies')
            .select('*')
            .eq('condo_id', condoId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAssemblyDetails(assemblyId: string) {
        const { data, error } = await supabase
            .from('assemblies')
            .select(`
        *,
        topics:assembly_topics(
          *,
          options:assembly_voting_options(*)
        )
      `)
            .eq('id', assemblyId)
            .single();

        if (error) throw error;
        return data;
    },

    async createAssembly(assembly: Omit<Assembly, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('assemblies')
            .insert(assembly)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createTopic(topic: Omit<AssemblyTopic, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('assembly_topics')
            .insert(topic)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async castVote(vote: Omit<AssemblyVote, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('assembly_votes')
            .insert(vote)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async trackAttendance(attendance: Omit<AssemblyAttendance, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('assembly_attendance')
            .upsert(attendance)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getVotingResults(topicId: string) {
        const { data, error } = await supabase
            .from('assembly_votes')
            .select('option_id, weight')
            .eq('topic_id', topicId);

        if (error) throw error;

        // Aggregate results by weight
        const results = data.reduce((acc: any, curr: { option_id: string, weight: number }) => {
            acc[curr.option_id] = (acc[curr.option_id] || 0) + curr.weight;
            return acc;
        }, {});

        return results;
    },

    async getAssemblyReportData(assemblyId: string) {
        // 1. Fetch Assembly & Topics
        const { data: assembly, error: assemblyError } = await supabase
            .from('assemblies')
            .select(`
                *,
                topics:assembly_topics(
                    *,
                    options:assembly_voting_options(*)
                )
            `)
            .eq('id', assemblyId)
            .single();

        if (assemblyError) throw assemblyError;

        // 2. Fetch Attendance
        const { data: attendance, error: attendanceError } = await supabase
            .from('assembly_attendance')
            .select(`
                *,
                unit:units(apartment_number, owner_name, percentage)
            `)
            .eq('assembly_id', assemblyId);

        if (attendanceError) throw attendanceError;

        // 3. Fetch all votes for this assembly
        const { data: votes, error: votesError } = await supabase
            .from('assembly_votes')
            .select('*')
            .in('topic_id', assembly.topics.map((t: any) => t.id));

        if (votesError) throw votesError;

        return {
            assembly,
            attendance,
            votes
        };
    }
};
