import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Car, Clock, DollarSign, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AssistantMessage, ParkingRecord, ParkingSpot } from '../types/parking';
import { processAssistantQuery } from '../utils/assistantEngine';
import { LicensePlateBadge } from './LicensePlateBadge';
import { formatMoney } from '../utils/tariffCalculator';

interface AssistantConsoleProps {
  spots: ParkingSpot[];
  records: ParkingRecord[];
  currentTime: number;
  onInitiateExit: (record: ParkingRecord) => void;
  onNavigateToTab: (tab: 'map' | 'history' | 'tariffs') => void;
}

export const AssistantConsole: React.FC<AssistantConsoleProps> = ({
  spots,
  records,
  currentTime,
  onInitiateExit,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      text: `Assalomu alaykum! Men professional parking boshqaruv tizimi yordamchisiman.\n\nAvtomobil raqamini kiriting (masalan: "01 A 777 AA"), men uning joyi, kirish vaqti, turgan muddati va tarif bo‘yicha aniq to‘lovini hisoblab beraman. Shuningdek, bo‘sh joylar yoki tariflar haqida so‘rashingiz mumkin.`,
      timestamp: Date.now(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputVal).trim();
    if (!query) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const response = processAssistantQuery(query, spots, records, currentTime);

    const assistantMsg: AssistantMessage = {
      id: `asst-${Date.now() + 1}`,
      role: 'assistant',
      text: response.text,
      timestamp: Date.now(),
      structuredRecord: response.foundRecord,
      actionType: response.foundRecord
        ? 'found_car'
        : response.isError
        ? 'not_found'
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Top Console Bar */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Parking Boshqaruv Yordamchisi</h3>
            <p className="text-[11px] text-slate-400">
              O‘zbek tilida tezkor qidiruv va hisob-kitob
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setMessages([
                {
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  text: 'Suhbat tozalandi. Avtomobil raqamini yoki buyruqni kiriting.',
                  timestamp: Date.now(),
                },
              ])
            }
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded bg-slate-800/60"
          >
            Tozalash
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/30 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs text-slate-300">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider shrink-0 font-medium">
          Tezkor:
        </span>
        <button
          onClick={() => handleSend('01 A 777 AA')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors font-mono"
        >
          01 A 777 AA (12 daq)
        </button>
        <button
          onClick={() => handleSend('01 555 BBB')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors font-mono"
        >
          01 555 BBB (1h 15m)
        </button>
        <button
          onClick={() => handleSend('Bo‘sh joylar bormi?')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors"
        >
          Bo‘sh joylar
        </button>
        <button
          onClick={() => handleSend('Tarif qoidalari qanday?')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors"
        >
          Tariflar
        </button>
        <button
          onClick={() => handleSend('99 Z 999 ZZ')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300/80 shrink-0 transition-colors font-mono"
          title="Mavjud bo'lmagan avtomobilni tekshirish"
        >
          99 Z 999 ZZ (Topilmaslik holati)
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-blue-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line font-normal">{msg.text}</div>

              {/* If found active car, provide direct action card */}
              {msg.structuredRecord && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <LicensePlateBadge plate={msg.structuredRecord.plateNumber} size="sm" />
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      Joy: {msg.structuredRecord.spotId}
                    </span>
                  </div>

                  {msg.structuredRecord.exitTime === null ? (
                    <button
                      onClick={() => onInitiateExit(msg.structuredRecord!)}
                      className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Chiqish va to‘lovni rasmiylashtirish</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400">
                      Chiqish qayd etilgan · To‘lov: {formatMoney(msg.structuredRecord.fee)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Avtomobil raqamini kiriting (masalan: 01 A 777 AA) yoki savol yozing..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Yuborish</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
