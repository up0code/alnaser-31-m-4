"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X as CloseIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { chatbotAnswerQuestions } from '@/ai/flows/chatbot-answer-questions';
import { cn } from '@/lib/utils';
import { useLanguage } from './LanguageContext';

export function Chatbot() {
  const { t, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string, time: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      role: 'user' as const, 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotAnswerQuestions({ question: input });
      const aiMessage = { 
        role: 'ai' as const, 
        text: response.answer, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: t.chatbot.error, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50`}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="icon" 
            className="w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 bg-primary text-white border-4 border-white/20"
          >
            <MessageCircle size={28} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] w-[95vw] h-[650px] max-h-[85vh] rounded-[1.5rem] p-0 overflow-hidden flex flex-col border-none shadow-3xl bg-white focus:outline-none">
          <div className="bg-primary p-5 flex items-center justify-between text-white shadow-lg shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Bot size={26} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold leading-none text-white">{t.chatbot.title}</DialogTitle>
                <p className="text-[10px] opacity-80 mt-1.5 font-bold uppercase tracking-wider">{t.chatbot.status}</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto bg-secondary/10 space-y-5">
            {messages.length === 0 && (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                  <Bot size={44} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t.chatbot.welcome}</h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{t.chatbot.welcomeDesc}</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-4 max-w-[88%] animate-in fade-in slide-in-from-bottom-2",
                msg.role === 'user' ? "flex-row-reverse ml-auto" : "mr-auto"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm",
                  msg.role === 'ai' ? "bg-primary text-white" : "bg-white text-primary border"
                )}>
                  {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm shadow-sm leading-relaxed",
                  msg.role === 'ai' ? "bg-white rounded-tl-none border border-primary/5 text-foreground" : "bg-primary text-white rounded-tr-none"
                )}>
                  <p>{msg.text}</p>
                  <p className={cn("text-[10px] mt-2 font-black uppercase tracking-wider opacity-60", msg.role === 'ai' ? "text-muted-foreground" : "text-white")}>{msg.time}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 items-start animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center border border-primary/5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white shrink-0">
            <div className="flex gap-2 items-center bg-secondary/20 p-1.5 rounded-2xl w-full">
              <Input 
                placeholder={t.chatbot.placeholder} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="rounded-xl h-10 text-sm bg-transparent border-none shadow-none px-4 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="rounded-xl h-10 w-10 shrink-0 shadow-lg active:scale-95 transition-all bg-primary hover:bg-primary/90">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
