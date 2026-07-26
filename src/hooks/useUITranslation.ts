export type UIKeys = 
  | 'Next'
  | 'Next Item'
  | 'Previous'
  | 'Submit'
  | 'Bookmark'
  | 'Flag'
  | 'Review'
  | 'Explanation'
  | 'Notes'
  | 'Translate'
  | 'Settings'
  | 'Calculator'
  | 'End Block'
  | 'Pause'
  | 'Resume'
  | 'Lab Values'
  | 'Flashcards'
  | 'Mark'
  | 'Strikethrough'
  | 'Highlight'
  | 'Clear'
  | 'Proceed'
  | 'Cancel';

const UI_DICTIONARY: Record<string, Record<UIKeys, string>> = {
  hi: { // Hindi
    Next: 'अगला',
    'Next Item': 'अगला आइटम',
    Previous: 'पिछला',
    Submit: 'जमा करें',
    Bookmark: 'बुकमार्क',
    Flag: 'फ़्लैग',
    Review: 'समीक्षा',
    Explanation: 'व्याख्या',
    Notes: 'नोट्स',
    Translate: 'अनुवाद',
    Settings: 'सेटिंग्स',
    Calculator: 'कैलकुलेटर',
    'End Block': 'ब्लॉक समाप्त करें',
    Pause: 'रोकें',
    Resume: 'फिर से शुरू करें',
    'Lab Values': 'लैब मान',
    Flashcards: 'फ्लैशकार्ड',
    Mark: 'चिह्नित करें',
    Strikethrough: 'काटें',
    Highlight: 'हाइलाइट',
    Clear: 'साफ़ करें',
    Proceed: 'आगे बढ़ें',
    Cancel: 'रद्द करें'
  },
  ta: { // Tamil
    Next: 'அடுத்தது',
    'Next Item': 'அடுத்த உருப்படி',
    Previous: 'முந்தையது',
    Submit: 'சமர்ப்பி',
    Bookmark: 'புக்மார்க்',
    Flag: 'கொடி',
    Review: 'விமர்சனம்',
    Explanation: 'விளக்கம்',
    Notes: 'குறிப்புகள்',
    Translate: 'மொழிபெயர்',
    Settings: 'அமைப்புகள்',
    Calculator: 'கால்குலேட்டர்',
    'End Block': 'தொகுதியை முடி',
    Pause: 'இடைநிறுத்து',
    Resume: 'தொடரவும்',
    'Lab Values': 'ஆய்வக மதிப்புகள்',
    Flashcards: 'ஃபிளாஷ் கார்டுகள்',
    Mark: 'குறி',
    Strikethrough: 'அடிக்கோடிடு',
    Highlight: 'முன்னிலைப்படுத்து',
    Clear: 'அழி',
    Proceed: 'தொடரவும்',
    Cancel: 'ரத்துசெய்'
  },
  te: { // Telugu
    Next: 'తరువాత',
    'Next Item': 'తదుపరి అంశం',
    Previous: 'మునుపటి',
    Submit: 'సమర్పించు',
    Bookmark: 'బుక్ మార్క్',
    Flag: 'ఫ్లాగ్',
    Review: 'సమీక్ష',
    Explanation: 'వివరణ',
    Notes: 'గమనికలు',
    Translate: 'అనువదించు',
    Settings: 'సెట్టింగ్‌లు',
    Calculator: 'క్యాలిక్యులేటర్',
    'End Block': 'బ్లాక్ ముగించు',
    Pause: 'పాజ్ చేయి',
    Resume: 'కొనసాగించు',
    'Lab Values': 'ల్యాబ్ విలువలు',
    Flashcards: 'ఫ్లాష్ కార్డ్‌లు',
    Mark: 'గుర్తు',
    Strikethrough: 'కొట్టివేయి',
    Highlight: 'హైలైట్',
    Clear: 'తొలగించు',
    Proceed: 'కొనసాగించు',
    Cancel: 'రద్దు చేయి'
  },
  bn: { // Bengali
    Next: 'পরবর্তী',
    'Next Item': 'পরবর্তী আইটেম',
    Previous: 'পূর্ববর্তী',
    Submit: 'জমা দিন',
    Bookmark: 'বুকমার্ক',
    Flag: 'ফ্ল্যাগ',
    Review: 'পর্যালোচনা',
    Explanation: 'ব্যাখ্যা',
    Notes: 'নোট',
    Translate: 'অনুবাদ',
    Settings: 'সেটিংস',
    Calculator: 'ক্যালকুলেটর',
    'End Block': 'ব্লক শেষ করুন',
    Pause: 'বিরতি',
    Resume: 'আবার শুরু করুন',
    'Lab Values': 'ল্যাব মান',
    Flashcards: 'ফ্ল্যাশকার্ড',
    Mark: 'চিহ্নিত করুন',
    Strikethrough: 'কাটা',
    Highlight: 'হাইলাইট',
    Clear: 'পরিষ্কার করুন',
    Proceed: 'এগিয়ে যান',
    Cancel: 'বাতিল করুন'
  },
  es: { // Spanish
    Next: 'Siguiente',
    'Next Item': 'Siguiente elemento',
    Previous: 'Anterior',
    Submit: 'Enviar',
    Bookmark: 'Marcador',
    Flag: 'Marcar',
    Review: 'Revisar',
    Explanation: 'Explicación',
    Notes: 'Notas',
    Translate: 'Traducir',
    Settings: 'Configuración',
    Calculator: 'Calculadora',
    'End Block': 'Finalizar bloque',
    Pause: 'Pausar',
    Resume: 'Reanudar',
    'Lab Values': 'Valores de laboratorio',
    Flashcards: 'Tarjetas de vocabulario',
    Mark: 'Marcar',
    Strikethrough: 'Tachar',
    Highlight: 'Resaltar',
    Clear: 'Borrar',
    Proceed: 'Proceder',
    Cancel: 'Cancelar'
  }
};

/**
 * Returns translated UI string for the active language.
 * Falls back to English if the language or key is not found.
 */
export function useUITranslation(targetLanguage: string | null | undefined) {
  const t = (key: UIKeys): string => {
    if (!targetLanguage) return key;
    
    // Support language codes with regions (e.g. "es-MX" -> "es")
    const langPrefix = targetLanguage.split('-')[0];
    
    if (UI_DICTIONARY[targetLanguage] && UI_DICTIONARY[targetLanguage][key]) {
      return UI_DICTIONARY[targetLanguage][key];
    }
    
    if (UI_DICTIONARY[langPrefix] && UI_DICTIONARY[langPrefix][key]) {
      return UI_DICTIONARY[langPrefix][key];
    }
    
    return key;
  };
  
  return { t };
}
