import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. Types Define karein (TypeScript Best Practice)
interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface ChatbotProps {
  studentId: string | number | undefined;
}

export default function LibraryChatbot({ studentId }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Namaste! 🙏 Main Library Assistant hoon. Books ya Fines ke baare mein pucchiye.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll ke liye ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Auto-scroll Logic (Jab bhi naya message aaye)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  // 3. Send Message Handler
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    
    // User message add karein
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput("");
    setIsLoading(true);

    try {
      // Backend API Call
      const res = await fetch("http://localhost:5000/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: currentInput, 
            studentId: studentId // Student ID pass karna zaroori hai fines ke liye
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.reply || "Server Error");
      }

      // Bot message add karein
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);

    } catch (err) {
      console.error("Chat Error:", err);
      // Fallback Error Message
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "Maaf karein, connection mein dikkat hai. Kripya thodi der baad try karein." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl w-[350px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2 font-bold">
                <Bot className="h-6 w-6" /> 
                <span>Lib-Bot Assistant</span>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
            >
                <X size={18} />
            </Button>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm transition-all ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            {/* Invisible Div for Auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white dark:bg-slate-900 flex gap-2">
            <Input 
              placeholder="Ask about books..." 
              value={input} 
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="focus-visible:ring-blue-600"
            />
            <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="icon"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send size={18}/>}
            </Button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON (Toggle) */}
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        className="h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </Button>
    </div>
  );
}