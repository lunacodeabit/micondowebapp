import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { elisaService, type BotConversation, type ConversationMessage } from '../../../services';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate, formatTime } from '../../../utils/date';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Spinner } from '../../../components/ui/Spinner';

export const ElisaAIContent = () => {
    const { selectedCondo } = useCondo();
    const { addToast } = useToast();
    const [conversations, setConversations] = useState<BotConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Filtered and sorted conversations
    const sortedConversations = useMemo(() => {
        return [...conversations].sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [conversations]);

    const selectedConversation = useMemo(() =>
        conversations.find(c => c.id === selectedConversationId),
        [conversations, selectedConversationId]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!selectedCondo?.id) return;
            try {
                setLoading(true);
                const data = await elisaService.getConversations(selectedCondo.id.toString());
                setConversations(data);
            } catch (error) {
                console.error('Error fetching Elisa conversations:', error);
                addToast('Error al cargar conversaciones de Elisa', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Subscribe to real-time updates
        if (selectedCondo?.id) {
            const subscription = elisaService.subscribeToConversations(selectedCondo.id.toString(), (payload) => {
                if (payload.eventType === 'INSERT') {
                    setConversations(prev => [payload.new as BotConversation, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setConversations(prev => prev.map(c => c.id === payload.new.id ? payload.new as BotConversation : c));
                } else if (payload.eventType === 'DELETE') {
                    setConversations(prev => prev.filter(c => c.id !== payload.old.id));
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [selectedCondo?.id]);

    // Fetch messages when conversation selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversationId) {
                setMessages([]);
                return;
            }
            try {
                setMessagesLoading(true);
                const data = await elisaService.getConversationMessages(selectedConversationId);
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
                addToast('Error al cargar mensajes', 'error');
            } finally {
                setMessagesLoading(false);
            }
        };

        fetchMessages();
    }, [selectedConversationId]);

    const handleStatusUpdate = async (id: string, newStatus: 'active' | 'escalated' | 'resolved') => {
        try {
            await elisaService.updateConversationStatus(id, newStatus);
            addToast(`Conversación marcada como ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            addToast('Error al actualizar estado', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner className="w-12 h-12 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-4 animate-in fade-in duration-500">
            {/* Sidebar: Conv List */}
            <div className="w-80 flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/80">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="message-square" size={20} className="text-blue-400" />
                        Conversaciones
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Monitoreo en tiempo real de Elisa</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sortedConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <Icon name="inbox" size={32} className="mx-auto text-neutral-700 mb-2" />
                            <p className="text-sm text-neutral-500">No hay chats activos</p>
                        </div>
                    ) : (
                        sortedConversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversationId(conv.id)}
                                className={`w-full text-left p-4 border-b border-neutral-800/50 transition-all hover:bg-neutral-800/50 ${selectedConversationId === conv.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-neutral-200 text-sm">{conv.customer_id}</span>
                                    <span className="text-[10px] text-neutral-500">{formatTime(conv.updated_at)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={conv.status} />
                                    {conv.status === 'escalated' && (
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
                {!selectedConversationId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-6">
                            <Icon name="bot" size={40} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Asistente Virtual Elisa</h3>
                        <p className="text-neutral-400 max-w-md">Selecciona una conversación a la izquierda para ver el historial y monitorear la interacción de Elisa con el residente.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-neutral-800 bg-neutral-900/80 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                                    {selectedConversation?.customer_id.slice(-2)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white leading-tight">{selectedConversation?.customer_id}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StatusBadge status={selectedConversation?.status || 'active'} />
                                        <span className="text-[10px] text-neutral-500">Iniciado {formatDate(selectedConversation?.created_at || '')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedConversation?.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedConversationId, 'resolved')}
                                        className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 border border-green-500/30 text-xs font-semibold hover:bg-green-600/30 transition-all flex items-center gap-1.5"
                                    >
                                        <Icon name="check" size={14} />
                                        Resolver
                                    </button>
                                )}
                                {selectedConversation?.status === 'escalated' && (
                                    <button
                                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                    >
                                        <Icon name="user" size={14} />
                                        Intervenir
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-neutral-950/20">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Spinner className="w-8 h-8 text-neutral-600" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 italic text-sm">No se encontraron mensajes en esta conversación.</div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : msg.role === 'assistant'
                                                ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
                                                : 'bg-neutral-900/50 text-neutral-500 text-[10px] italic border-none'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <div className={`text-[10px] mt-1.5 opacity-60 flex items-center gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'assistant' && <Icon name="bot" size={10} />}
                                                {formatTime(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Note area if escalated */}
                        {selectedConversation?.status === 'escalated' && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] p-3 bg-red-950/40 backdrop-blur-md border border-red-500/30 rounded-xl flex items-center gap-3 animate-bounce">
                                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                                    <Icon name="alert-triangle" size={16} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-200 text-xs font-bold">Residente solicitó atención humana</p>
                                    <p className="text-red-300/70 text-[10px]">Intervenga para tomar el control del chat de WhatsApp.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
