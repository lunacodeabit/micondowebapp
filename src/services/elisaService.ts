import { supabase } from '../supabaseClient';

export interface BotConversation {
    id: string;
    condo_id: string;
    customer_id: string; // WhatsApp number
    status: 'active' | 'escalated' | 'resolved';
    last_messageTime: string;
    metadata: any;
    created_at: string;
    updated_at: string;
}

export interface ConversationMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
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
     * Fetch messages for a specific conversation
     */
    async getConversationMessages(conversationId: string) {
        const { data, error } = await supabase
            .from('conversation_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ConversationMessage[];
    },

    /**
     * Update conversation status (e.g., mark as resolved or escalate)
     */
    async updateConversationStatus(conversationId: string, status: 'active' | 'escalated' | 'resolved') {
        const { data, error } = await supabase
            .from('bot_conversations')
            .update({ status, updated_at: new Date().toISOString() })
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
    }
};
