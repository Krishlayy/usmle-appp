import { useState, useEffect } from 'react';

export interface TranslatedData {
  questionText: string;
  explanation: string;
  options: { id: string; text: string }[];
}

export function useTranslation(questionId: string | undefined, targetLanguage: string | null | undefined) {
  const [translatedData, setTranslatedData] = useState<TranslatedData | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTranslation() {
      if (!questionId || !targetLanguage) {
        if (isMounted) setTranslatedData(null);
        return;
      }

      setIsTranslating(true);
      setError(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, targetLanguage }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch translation');
        }

        const data = await response.json();
        
        if (isMounted && data.translatedData) {
          setTranslatedData(data.translatedData);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    }

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [questionId, targetLanguage]);

  return { translatedData, isTranslating, error };
}
