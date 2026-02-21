import { supabase } from '../supabaseClient';

export interface BotConversation {
    id: string;
    condo_id: string;
    phone: string; // WhatsApp number
    state: 'active' | 'escalated' | 'resolved' | string;
    messages: any[] | null;
    escalation_level: number;
    created_at: string;
    updated_at: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

export const elisaService = {
    /**
     * Fetch active conversations for a specific condo
     */
    async getConversations(condoId: string) {
        const { data, error } = await supabase
            .from('bot_conversations')
            .select('*')
            .eq('condo_id', condoId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as BotConversation[];
    },

    /**
     * Fetch all active conversations (for SuperAdmin global monitoring)
     */
    async getAllConversations() {
        const { data, error } = await supabase
            .from('bot_conversations')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as BotConversation[];
    },

    /**
     * Update conversation state (e.g., mark as resolved or escalate)
     */
    async updateConversationStatus(conversationId: string, state: 'active' | 'escalated' | 'resolved') {
        const { data, error } = await supabase
            .from('bot_conversations')
            .update({ state, updated_at: new Date().toISOString() })
            .eq('id', conversationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Subscribe to real-time updates for a condo's conversations
     */
    subscribeToConversations(condoId: string, onUpdate: (payload: any) => void) {
        return supabase
            .channel(`condo_conversations_${condoId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bot_conversations',
                    filter: `condo_id=eq.${condoId}`,
                },
                payload => onUpdate(payload)
            )
            .subscribe();
    },

    /**
     * Subscribe to real-time updates for ALL conversations (SuperAdmin)
     */
    subscribeToAllConversations(onUpdate: (payload: any) => void) {
        return supabase
            .channel('all_conversations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bot_conversations',
                },
                payload => onUpdate(payload)
            )
            .subscribe();
    }
};
