import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ChevronLeft, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIChatProps {
  userName: string;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ userName, onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'model',
      text: `Fala, ${userName}! 👊\nSou a inteligência do Team Leleco. Tamo junto pra buscar seu melhor resultado!\n\nPosso te ajudar com:\n**1.** Dúvidas sobre execução correta.\n**2.** Dicas de alimentação pré e pós treino.\n**3.** Aquela motivação extra.\n\nO que manda pra hoje?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      if (!line.trim()) return <div key={lineIndex} className="h-3" />;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIndex} className="mb-1 last:mb-0 leading-relaxed">
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIndex} className="font-bold text-white">{part.slice(2, -2)}</strong>;
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const systemInstruction = `
        Você é o 'Leleco AI', um assistente virtual de alta performance do Personal Trainer Leleco Coradini.
        Seu objetivo é motivar, instruir e tirar dúvidas do aluno ${userName} com precisão técnica, mas com uma linguagem acessível e enérgica.
        
        **Estilo:** Use gírias fitness (Bora, Pra cima, Shape) mas mantenha o profissionalismo.
        **Formatação:** Use **negrito** para destaque.
        **Segurança:** Não prescreva treinos médicos ou dietas restritivas complexas.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction, temperature: 0.8 },
        history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });

      const result = await chat.sendMessage({ message: userMessage.text });
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: result.text }]);
    } catch (error) {
      console.error("Erro na IA:", error);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "Falha na conexão. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] max-w-5xl mx-auto animate-fadeIn bg-surface/50 md:bg-surface border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center gap-4 z-10">
        <button onClick={onBack} className="md:hidden p-2 text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-primary/20 p-2.5 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.2)]">
          <Sparkles size={24} className="text-primary" fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg flex items-center gap-2">
            Leleco IA <span className="text-[10px] bg-primary text-slate-950 px-2 py-0.5 rounded font-bold uppercase">Beta</span>
          </h1>
          <p className="text-xs text-slate-400">Assistente Virtual Inteligente</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
              msg.role === 'user' ? 'bg-slate-700' : 'bg-slate-900 border border-primary/30'
            }`}>
              {msg.role === 'user' ? <User size={20} className="text-slate-300" /> : <Bot size={22} className="text-primary" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[70%] p-5 text-sm md:text-base leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-slate-950 rounded-2xl rounded-tr-none font-medium shadow-lg shadow-primary/5' 
                : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-none shadow-lg'
            }`}>
              {renderMessageText(msg.text)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
              <Bot size={22} className="text-primary" />
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm text-slate-500">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre dieta, treino, execução..."
            className="w-full bg-slate-900 text-white pl-5 pr-14 py-4 rounded-xl border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-500 shadow-inner"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-hover text-slate-950 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(163,230,53,0.2)] flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;