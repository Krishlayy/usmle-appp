'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-slate-100 animate-pulse rounded-md border border-slate-200"></div>
});

import ExplanationMedia, { QuestionMediaItem } from './ExplanationMedia';

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export function QuestionForm({ 
  qbankId, 
  initialData 
}: { 
  qbankId: string, 
  initialData?: Record<string, unknown> | null
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState(initialData?.questionText as string || '');
  const [explanation, setExplanation] = useState(initialData?.explanation as string || '');
  const [media, setMedia] = useState<QuestionMediaItem[]>(initialData?.media as QuestionMediaItem[] || []);
  const [difficulty, setDifficulty] = useState(initialData?.difficulty as string || 'medium');
  const [subtopic, setSubtopic] = useState(initialData?.subtopic as string || '');
  const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(initialData?.acceptableAnswers as string[] || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags as string[] || []);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Default to 4 options A, B, C, D
  const [options, setOptions] = useState<Option[]>(initialData?.options as Option[] || [
    { id: '1', text: '', isCorrect: true, explanation: '' },
    { id: '2', text: '', isCorrect: false, explanation: '' },
    { id: '3', text: '', isCorrect: false, explanation: '' },
    { id: '4', text: '', isCorrect: false, explanation: '' },
  ]);

  useEffect(() => {
    if (tagInput.length > 0) {
      fetch(`/api/admin/tags/suggestions?q=${encodeURIComponent(tagInput)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.filter((t: string) => !tags.includes(t)));
        })
        .catch(console.error);
    } else {
      setSuggestions([]);
    }
  }, [tagInput, tags]);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 4) {
      setTags([...tags, trimmed]);
      setTagInput('');
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addOption = () => {
    setOptions([...options, { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false, explanation: '' }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const setCorrectOption = (id: string) => {
    setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const updateOptionExplanation = (id: string, explanation: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, explanation } : o));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const correctOption = options.find(o => o.isCorrect);
      if (!correctOption) {
        throw new Error("You must select a correct option.");
      }

      const payload = {
        qbankId,
        questionText,
        explanation,
        media,
        difficulty,
        subtopic,
        correctAnswer: correctOption.id,
        acceptableAnswers: acceptableAnswers.filter(id => id !== correctOption.id),
        tags,
        options,
      };

      const res = await fetch(`/api/admin/questions${initialData ? `/${initialData.id}` : ''}`, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push(`/admin/qbanks/${qbankId}/edit`);
      router.refresh();
    } catch (err: unknown) {
      alert(`Error saving question: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Question Body */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold text-slate-800">1. Clinical Vignette & Metadata</h2>
          {typeof initialData?.qid === 'string' && (
            <span className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded font-mono border">
              QID: {initialData.qid}
            </span>
          )}
        </div>
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtopic (Optional)</label>
              <input 
                type="text" 
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2"
                placeholder="e.g., Arrhythmias, Heart Failure"
              />
            </div>
          </div>

          <div className="pb-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Max 4)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-700">×</button>
                </span>
              ))}
            </div>
            {tags.length < 4 && (
              <div className="relative">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        handleAddTag(tagInput);
                      }
                    } else if (e.key === ',' || e.key === ' ') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        handleAddTag(tagInput);
                      }
                    }
                  }}
                  className="w-full border border-slate-300 rounded-md p-2"
                  placeholder="Type a tag and press Enter..."
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {suggestions.map(s => (
                      <li 
                        key={s} 
                        className="p-2 hover:bg-slate-100 cursor-pointer text-sm"
                        onClick={() => handleAddTag(s)}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question Text (Clinical Vignette)</label>
            <div className="bg-slate-50 border border-slate-200 rounded-md overflow-hidden p-1">
              <RichTextEditor 
                value={questionText}
                onChange={setQuestionText}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Options Builder */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold text-slate-800">2. Answer Options</h2>
          <button type="button" onClick={addOption} className="text-blue-600 text-sm font-medium hover:underline">
            + Add Option
          </button>
        </div>
        
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={option.id} className={`p-4 border rounded-lg flex gap-4 transition-colors ${option.isCorrect ? 'border-green-400 bg-green-50' : acceptableAnswers.includes(option.id) ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="pt-2 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center" title="Best Answer">
                  <input 
                    type="radio" 
                    name="correctOption"
                    checked={option.isCorrect}
                    onChange={() => {
                      setCorrectOption(option.id);
                      if (acceptableAnswers.includes(option.id)) {
                        setAcceptableAnswers(acceptableAnswers.filter(id => id !== option.id));
                      }
                    }}
                    className="w-5 h-5 text-green-600 border-slate-300 focus:ring-green-500 cursor-pointer mb-1"
                  />
                  <span className="text-[10px] text-green-700 font-medium">Best</span>
                </div>
                {!option.isCorrect && (
                  <div className="flex flex-col items-center" title="Acceptable (2nd Best)">
                    <input 
                      type="checkbox"
                      checked={acceptableAnswers.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAcceptableAnswers([...acceptableAnswers, option.id]);
                        } else {
                          setAcceptableAnswers(acceptableAnswers.filter(id => id !== option.id));
                        }
                      }}
                      className="w-4 h-4 text-yellow-600 border-slate-300 focus:ring-yellow-500 cursor-pointer mb-1"
                    />
                    <span className="text-[10px] text-yellow-700 font-medium leading-tight text-center">Acceptable</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-lg">{String.fromCharCode(65 + index)}.</span>
                  <input 
                    type="text" 
                    required
                    value={option.text}
                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md p-2"
                    placeholder="Option text..."
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(option.id)} className="text-red-500 hover:bg-red-100 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
                <div>
                  <textarea 
                    value={option.explanation}
                    onChange={(e) => updateOptionExplanation(option.id, e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-sm text-slate-600"
                    placeholder={`Why is this option ${option.isCorrect ? 'correct' : 'incorrect'}? (Optional)`}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Objective / Explanation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">3. Overall Explanation (Educational Objective)</h2>
        <div>
          <RichTextEditor 
            value={explanation}
            onChange={setExplanation}
          />
        </div>
        
        <ExplanationMedia 
          media={media}
          onChange={setMedia}
        />
      </div>

      <div className="flex justify-end gap-4 pb-12">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 disabled:opacity-50 shadow-sm">
          {loading ? 'Saving...' : (initialData ? 'Update Question' : 'Save New Question')}
        </button>
      </div>
    </form>
  );
}
