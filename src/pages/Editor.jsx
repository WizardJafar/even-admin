import React, { useEffect, useState } from "react";
import { useSiteConfig } from "../hooks/useSiteConfig";

export default function Editor() {
  const { site, loading, error, saveSite } = useSiteConfig();
  const [data, setData] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("ru");

  useEffect(() => {
    if (site) setData(site);
  }, [site]);

  const handleChange = (path, value) => {
    if (!data) return;
    setData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let temp = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!temp[keys[i]]) temp[keys[i]] = {};
        temp = temp[keys[i]];
      }
      temp[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateI18n = () => {
    const ru = data?.i18n?.ru;
    const uz = data?.i18n?.uz;
    if (!ru || !uz) return false;

    const checkEmpty = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === "string" && obj[key].trim() === "") return false;
        if (typeof obj[key] === "object" && obj[key] && !checkEmpty(obj[key])) return false;
      }
      return true;
    };

    return checkEmpty(ru) && checkEmpty(uz);
  };

  const handleSave = async () => {
    if (!validateI18n()) {
      setMsg("Barcha matnlar rus va o'zbek tillarida to'ldirilishi kerak!");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      await saveSite(data); // ✅ теперь работает и на Vercel, и локально
      setMsg("✅ Ma'lumotlar muvaffaqiyatli saqlandi!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg(`❌ Xato: ${e?.message || "Saqlashda xatolik"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Хедер */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-3">
                Sayt kontentini tahrirlash
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                Bu yerda siz saytdagi barcha matnlarni tahrirlashingiz mumkin. O'zgarishlar ikki til uchun qo'llaniladi:
                <span className="font-semibold text-gray-100"> rus tili</span> va
                <span className="font-semibold text-gray-100"> o'zbek tili</span>.
                Ikkala tildagi barcha maydonlarni to'ldiring va o'zgarishlarni saqlash uchun "Saqlash" tugmasini bosing.
              </p>
            </div>
          </div>
        </div>

        {/* Табы языков */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="flex border-b-2 border-gray-700">
            <button
              onClick={() => setActiveTab("ru")}
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-all ${activeTab === "ru"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-700/50"
                }`}
            >
              <span className="mr-2">🇷🇺</span>
              Rus tili (RU)
            </button>
            <button
              onClick={() => setActiveTab("uz")}
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-all ${activeTab === "uz"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-700/50"
                }`}
            >
              <span className="mr-2">🇺🇿</span>
              O'zbek tili
            </button>
          </div>

          {/* Контент табов */}
          <div className="p-8">
            {activeTab === "ru" && (
              <div className="transition-opacity duration-300 ease-out">
                {renderFields(data.i18n.ru, "i18n.ru", 0, true)}
              </div>
            )}
            {activeTab === "uz" && (
              <div className="transition-opacity duration-300 ease-out">
                {renderFields(data.i18n.uz, "i18n.uz", 0, false)}
              </div>
            )}
          </div>
        </div>

        {/* Футер с кнопкой сохранения */}
        <div className=" p-6 sticky bottom-6 right-0 ">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {msg && (
                <div
                  className={`px-5 py-3 rounded-xl font-medium inline-flex items-center gap-2 ${msg.includes("✅")
                      ? " text-green-300 border-2 border-green-700"
                      : " text-red-300 border-2 border-red-700"
                    }`}
                >
                  {msg}
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={sending}
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all shadow-lg flex items-center gap-2 ${sending
                  ? "bg-gray-600 cursor-not-allowed text-gray-300"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105 active:scale-95"
                }`}
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <span>Saqlash</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}