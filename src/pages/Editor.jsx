import React, { useEffect, useState } from "react";
import { useSiteConfig } from "../hooks/useSiteConfig";

export default function Editor() {
  const { site, loading, error } = useSiteConfig();
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

  // Проверка на пустые поля в обоих языках
  const validateI18n = () => {
    const ru = data?.i18n?.ru;
    const uz = data?.i18n?.uz;
    if (!ru || !uz) return false;

    const checkEmpty = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === "string" && obj[key].trim() === "") return false;
        if (typeof obj[key] === "object" && !checkEmpty(obj[key])) return false;
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
      const res = await fetch("http://localhost:5050/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP xatosi ${res.status}`);
      setMsg("✅ Ma'lumotlar muvaffaqiyatli saqlandi!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg(`❌ Xato: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Xato</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Ma'lumot yo'q</p>
      </div>
    );
  }

  // Генератор полей для всех текстов i18n
  const renderFields = (obj, pathPrefix = "", depth = 0, isRussian = false) =>
    Object.entries(obj).map(([key, value]) => {
      const path = pathPrefix ? `${pathPrefix}.${key}` : key;
      
      // Более понятные названия полей на основе пути
      const getFieldLabel = (key, path) => {
        const pathParts = path.split('.');
        const context = pathParts[pathParts.length - 2] || '';
        
        // Словарь понятных названий на узбекском
        const labels = {
          title: 'Sarlavha',
          description: 'Tavsif',
          subtitle: 'Kichik sarlavha',
          text: 'Matn',
          button: 'Tugma matni',
          label: 'Belgi',
          placeholder: 'Yordam matni',
          name: 'Nom',
          content: 'Kontent',
          message: 'Xabar',
          heading: 'Bo\'lim sarlavhasi'
        };
        
        const cleanKey = key.toLowerCase().replace(/_/g, ' ');
        return labels[key.toLowerCase()] || cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
      };
      
      const displayKey = getFieldLabel(key, path);
      const langLabel = isRussian ? " (RU)" : "";

      if (typeof value === "string") {
        return (
          <div className="mb-5 group" key={path}>
            <label className="block text-sm font-semibold text-gray-300 mb-2 transition-colors group-focus-within:text-red-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {displayKey}{langLabel}
              <span className="text-xs font-normal text-gray-500 ml-1">({path.split('.').slice(2).join(' › ')})</span>
            </label>
            <textarea
              rows={value.length > 50 ? 4 : 2}
              className="w-full border-2 border-gray-700 bg-gray-800 text-gray-100 rounded-xl p-3 focus:border-red-500 focus:ring-4 focus:ring-red-900/50 transition-all resize-none outline-none shadow-sm hover:border-gray-600 placeholder-gray-500"
              value={value}
              onChange={(e) => handleChange(path, e.target.value)}
              placeholder={value || `${displayKey.toLowerCase()} kiriting...`}
            />
          </div>
        );
      } else if (typeof value === "object") {
        return (
          <div
            className={`mb-6 ${
              depth === 0
                ? "bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 shadow-sm border border-gray-600"
                : "border-l-4 border-red-600 pl-6"
            }`}
            key={path}
          >
            <h3 className="font-bold text-gray-100 mb-4 flex items-center text-lg">
              <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">
                {displayKey.charAt(0)}
              </span>
              {displayKey}{langLabel}
            </h3>
            {renderFields(value, path, depth + 1, isRussian)}
          </div>
        );
      } else return null;
    });

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
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-all ${
                activeTab === "ru"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              <span className="mr-2">🇷🇺</span>
              Rus tili (RU)
            </button>
            <button
              onClick={() => setActiveTab("uz")}
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-all ${
                activeTab === "uz"
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
                  className={`px-5 py-3 rounded-xl font-medium inline-flex items-center gap-2 ${
                    msg.includes("✅")
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
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all shadow-lg flex items-center gap-2 ${
                sending
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