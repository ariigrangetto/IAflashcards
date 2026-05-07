import { useState } from 'react';
import IAGenerator from './IAgenerator';

function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [studyText, setStudyText] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');

    let currentStudyText = studyText;
    if (!currentStudyText) {
      currentStudyText = input;
      setStudyText(input);
    }

    const IAresponse = await IAGenerator(currentStudyText, updatedMessages);

    const botText = IAresponse.feedback
      ? `${IAresponse.feedback}\n\n${IAresponse.pregunta}`
      : IAresponse.pregunta;

    setMessages(prev => [...prev, { role: 'bot', text: botText }]);
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col h-screen">

        <header className="py-6 px-4 border-b border-neutral-100 flex justify-between items-center">
          <h1 className="text-lg font-medium tracking-tight">Flashcards</h1>
          {studyText && (
            <span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
              Tema memorizado
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
              </div>
              <p className="text-sm">Envía el texto que quieres estudiar para comenzar.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>

                  {!isUser && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end mb-1 bg-neutral-900 text-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                    </div>
                  )}
                  <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1 px-1">
                      {isUser ? 'Tú' : 'Tutor'}
                    </span>
                    <div className={`px-4 py-3 leading-relaxed text-[15px] whitespace-pre-wrap shadow-sm border ${isUser
                        ? 'bg-neutral-800 text-white rounded-2xl rounded-br-sm border-neutral-800'
                        : 'bg-white text-neutral-800 rounded-2xl rounded-bl-sm border-neutral-200'
                      }`}>
                      {msg.text}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end mb-1 bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white border-t border-neutral-100">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyText ? "Responde a la pregunta..." : "Pega tu texto de estudio aquí..."}
              className="w-full bg-neutral-50 hover:bg-neutral-100 transition-colors text-neutral-900 rounded-full pl-6 pr-24 py-4 focus:outline-none focus:ring-1 focus:ring-neutral-200 border border-transparent focus:border-neutral-200"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white px-5 py-2.5 rounded-full transition-all"
            >
              Enviar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;
