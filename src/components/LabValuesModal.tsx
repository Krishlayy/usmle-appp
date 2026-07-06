'use client';

export function LabValuesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Normal Laboratory Values
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <div className="bg-slate-50 border-b px-4 py-2 text-sm font-bold text-slate-600 uppercase tracking-wider sticky top-0">Blood, Plasma, Serum</div>
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Sodium (Na+)</td><td className="p-3 text-slate-600">136–145 mEq/L</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Potassium (K+)</td><td className="p-3 text-slate-600">3.5–5.0 mEq/L</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Chloride (Cl-)</td><td className="p-3 text-slate-600">95–105 mEq/L</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Bicarbonate (HCO3-)</td><td className="p-3 text-slate-600">22–28 mEq/L</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">BUN</td><td className="p-3 text-slate-600">7–18 mg/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Creatinine</td><td className="p-3 text-slate-600">0.6–1.2 mg/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Glucose (Fasting)</td><td className="p-3 text-slate-600">70–110 mg/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Calcium</td><td className="p-3 text-slate-600">8.4–10.2 mg/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Magnesium</td><td className="p-3 text-slate-600">1.5–2.0 mEq/L</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Phosphorus</td><td className="p-3 text-slate-600">3.0–4.5 mg/dL</td></tr>
            </tbody>
          </table>

          <div className="bg-slate-50 border-y px-4 py-2 text-sm font-bold text-slate-600 uppercase tracking-wider sticky top-0">Hematologic</div>
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Hemoglobin, Men</td><td className="p-3 text-slate-600">13.5–17.5 g/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Hemoglobin, Women</td><td className="p-3 text-slate-600">12.0–16.0 g/dL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Hematocrit, Men</td><td className="p-3 text-slate-600">41%–53%</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Hematocrit, Women</td><td className="p-3 text-slate-600">36%–46%</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Mean Corpuscular Volume (MCV)</td><td className="p-3 text-slate-600">80–100 fL</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Platelet Count</td><td className="p-3 text-slate-600">150,000–400,000/mm³</td></tr>
              <tr className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-800">Leukocyte Count (WBC)</td><td className="p-3 text-slate-600">4,500–11,000/mm³</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
