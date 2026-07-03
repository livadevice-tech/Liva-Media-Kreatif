import { Send, Sparkles } from "lucide-react";
import type { FormEvent } from "react";

import type { ChatMessage } from "../../types";

interface CopilotPanelProps {
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChatMessage: (e: FormEvent) => void;
}

export function CopilotPanel({
  chatMessages,
  chatLoading,
  chatInput,
  onChatInputChange,
  onSendChatMessage,
}: CopilotPanelProps) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      id="operator_copilot_content"
    >
      <div className="bg-[#f8f6fc] p-5 rounded-2xl border border-purple-100 h-fit space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-purple-700 font-black text-sm">
          <Sparkles className="w-4.5 h-4.5 text-purple-500" />
          AI AGENT COPILOT Liva Agency
        </div>
        <p className="text-xs text-purple-900 font-semibold leading-relaxed">
          Asisten intelijen ini mempelajari database operator secara dinamis.
          Anda dapat berkonsultasi tentang rekapitulasi gaji, keterlambatan
          host, denda, dan saran roster siaran dalam Bahasa Indonesia.
        </p>

        <div className="text-xs space-y-3.5 pt-3.5 border-t border-purple-100">
          <span className="font-extrabold uppercase text-[10px] tracking-widest text-purple-500 block">
            Analisis Absensi Host Terpadu:
          </span>
          <ul className="space-y-2 text-purple-950 list-disc list-inside font-semibold">
            <li>Menghitung persentase ketepatan waktu digital.</li>
            <li>Deteksi otomatis pola keterlambatan host.</li>
            <li>Kalkulator nominal penggajian per bulan secara instan.</li>
            <li>Skema insentif terbaik bagi performa studio streaming.</li>
          </ul>
        </div>

        <div className="p-3 bg-[#f3effa] rounded-xl border border-purple-100 text-[10.5px] text-purple-800 font-bold leading-normal">
          💡{" "}
          <em>
            Asisten ini memvalidasi data logs real-time, termasuk data absensi
            yang baru saja diisikan host lewat Portal Host!
          </em>
        </div>
      </div>

      <div
        className="lg:col-span-2 bg-[#fdfdfd] rounded-2xl border border-purple-100 flex flex-col h-[520px] shadow-sm overflow-hidden"
        id="copilot_chat_interface_container"
      >
        <div className="bg-white p-4 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-purple-950">
              Asisten Digital Liva Agency
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono text-purple-500">
            GEMINI AGENCY INTEGRATE v3.5
          </span>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans"
          id="chat_scroll_area"
        >
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10.5px] ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-purple-100 border border-purple-200 text-purple-700 shadow-sm"
                }`}
              >
                {msg.role === "user" ? "OP" : "AI"}
              </div>

              <div>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap font-semibold ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-none shadow-sm"
                      : "bg-[#f9f7fd] text-purple-950 border border-purple-100 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-purple-400 font-bold px-1 mt-1 block tracking-wider font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div
              className="flex gap-2 text-purple-500 text-[11px] font-bold items-center italic mt-2 pl-12"
              id="chat_ai_loading_indicator"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
              AI sedang menghitung rekap absensi dan performa kehadiran...
            </div>
          )}
        </div>

        <div className="bg-white p-3 border-t border-purple-100 flex flex-col gap-2 relative">
          <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => onChatInputChange("Siapa host yang paling disiplin?")}
              className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left"
            >
              🏆 Host Paling Disiplin
            </button>
            <button
              onClick={() => onChatInputChange("Ada host yang sering alpa?")}
              className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left"
            >
              ⚠️ Cek Host Sering Alpa
            </button>
            <button
              onClick={() =>
                onChatInputChange(
                  "Berikan ringkasan performa kehadiran tim minggu ini.",
                )
              }
              className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left"
            >
              📊 Ringkasan Kehadiran
            </button>
          </div>
          <form
            onSubmit={onSendChatMessage}
            className="flex gap-2"
            id="copilot_chat_input_form"
          >
            <input
              type="text"
              id="copilot_chat_input_text_box"
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              placeholder="Masukkan pertanyaan Anda dalam Bahasa Indonesia..."
              className="flex-1 bg-[#fcfaff] border border-purple-150 rounded-xl px-4 py-2.5 text-xs text-purple-950 font-bold placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-all"
            />
            <button
              type="submit"
              id="copilot_send_message_button"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-50 disabled:text-purple-300 text-white font-extrabold px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 h-full min-h-[42px] cursor-pointer shadow-xs"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
