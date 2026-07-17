'use client';

import React, { useState } from 'react';
import { DraggableModal } from './DraggableModal';
import { FlaskConical } from 'lucide-react';

export function LabValuesModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('Serum');
  const [search, setSearch] = useState('');
  const [siUnits, setSiUnits] = useState(false);

  const tabs = ['Serum', 'Cerebrospinal', 'Blood', 'Urine and BMI'];

  // Simplified lab values for the mock
  const labValues = {
    Serum: [
      { name: 'Alanine aminotransferase (ALT)', range: '10-40 U/L', siRange: '10-40 U/L' },
      { name: 'Aspartate aminotransferase (AST)', range: '12-38 U/L', siRange: '12-38 U/L' },
      { name: 'Alkaline phosphatase', range: '25-100 U/L', siRange: '25-100 U/L' },
      { name: 'Amylase', range: '25-125 U/L', siRange: '25-125 U/L' },
      { name: 'Bilirubin, Total', range: '0.1-1.0 mg/dL', siRange: '2-17 µmol/L' },
      { name: 'Bilirubin, Direct', range: '0.0-0.3 mg/dL', siRange: '0-5 µmol/L' },
      { name: 'Calcium', range: '8.4-10.2 mg/dL', siRange: '2.1-2.6 mmol/L' },
      { name: 'Cholesterol, Total Normal', range: '<200 mg/dL', siRange: '<5.2 mmol/L' },
      { name: 'Cholesterol, High', range: '>240 mg/dL', siRange: '>6.2 mmol/L' },
      { name: 'Cholesterol, HDL', range: '40-60 mg/dL', siRange: '1.0-1.6 mmol/L' },
      { name: 'Cholesterol, LDL', range: '<160 mg/dL', siRange: '<4.1 mmol/L' },
      { name: 'Cortisol, 0800 h', range: '5-23 µg/dL', siRange: '138-635 nmol/L' },
      { name: 'Creatinine', range: '0.6-1.2 mg/dL', siRange: '53-106 µmol/L' },
      { name: 'Glucose (Fasting)', range: '70-110 mg/dL', siRange: '3.9-6.1 mmol/L' },
      { name: 'Potassium (K+)', range: '3.5-5.0 mEq/L', siRange: '3.5-5.0 mmol/L' },
      { name: 'Sodium (Na+)', range: '136-145 mEq/L', siRange: '136-145 mmol/L' },
    ],
    Cerebrospinal: [
      { name: 'Cell count', range: '0-5/mm³', siRange: '0-5 x 10^6/L' },
      { name: 'Chloride', range: '118-132 mEq/L', siRange: '118-132 mmol/L' },
      { name: 'Gamma globulin', range: '3-12% total proteins', siRange: '0.03-0.12' },
      { name: 'Glucose', range: '40-70 mg/dL', siRange: '2.2-3.9 mmol/L' },
      { name: 'Pressure', range: '70-180 mm H2O', siRange: '70-180 mm H2O' },
      { name: 'Proteins, total', range: '15-45 mg/dL', siRange: '150-450 mg/L' },
    ],
    Blood: [
      { name: 'Erythrocyte count, Male', range: '4.3-5.9 million/mm³', siRange: '4.3-5.9 x 10^12/L' },
      { name: 'Erythrocyte count, Female', range: '3.5-5.5 million/mm³', siRange: '3.5-5.5 x 10^12/L' },
      { name: 'Hematocrit, Male', range: '41-53%', siRange: '0.41-0.53' },
      { name: 'Hematocrit, Female', range: '36-46%', siRange: '0.36-0.46' },
      { name: 'Hemoglobin, Male', range: '13.5-17.5 g/dL', siRange: '135-175 g/L' },
      { name: 'Hemoglobin, Female', range: '12.0-16.0 g/dL', siRange: '120-160 g/L' },
      { name: 'Leukocyte count', range: '4,500-11,000/mm³', siRange: '4.5-11.0 x 10^9/L' },
      { name: 'Platelet count', range: '150,000-400,000/mm³', siRange: '150-400 x 10^9/L' },
    ],
    'Urine and BMI': [
      { name: 'BMI, Normal', range: '18.5-24.9 kg/m²', siRange: '18.5-24.9 kg/m²' },
      { name: 'BMI, Overweight', range: '25.0-29.9 kg/m²', siRange: '25.0-29.9 kg/m²' },
      { name: 'Calcium', range: '100-300 mg/24 h', siRange: '2.5-7.5 mmol/24 h' },
      { name: 'Creatinine clearance', range: '75-125 mL/min', siRange: '1.24-2.08 mL/s' },
      { name: 'Osmolality', range: '50-1200 mOsm/kg H2O', siRange: '50-1200 mmol/kg' },
      { name: 'pH', range: '4.5-8.0', siRange: '4.5-8.0' },
      { name: 'Protein', range: '<150 mg/24 h', siRange: '<0.15 g/24 h' },
    ]
  };

  const currentValues = labValues[activeTab as keyof typeof labValues].filter(
    v => v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DraggableModal 
      isOpen={true} 
      onClose={onClose} 
      title="Lab Values" 
      icon={<FlaskConical size={16} />}
      width="800px"
      height="600px"
      minWidth="500px"
      minHeight="400px"
    >
      <div className="flex flex-col h-full bg-[#f4f4f4] font-sans">
        {/* Top Controls */}
        <div className="p-3 pb-0 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded-sm px-2 py-1 text-[13px] w-[200px]"
            />
            <label className="flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={siUnits}
                onChange={(e) => setSiUnits(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              SI Reference Intervals
            </label>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-300">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[13px] border ${activeTab === tab ? 'bg-[#e0e0e0] border-gray-400 border-b-transparent' : 'bg-white border-gray-300'} rounded-t-sm -mb-[1px]`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Table Area */}
        <div className="flex-1 overflow-hidden p-2 bg-[#e8ecf1]">
          <div className="h-full overflow-y-auto bg-[#e8ecf1] border border-gray-300 text-[13px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#e8ecf1] z-10 border-b border-gray-400">
                <tr>
                  <th className="py-2 px-3 font-bold text-black">{activeTab}</th>
                  <th className="py-2 px-3 font-bold text-black w-1/2">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {currentValues.map((val, idx) => (
                  <tr key={idx} className="hover:bg-[#d8e0e8]">
                    <td className="py-1.5 px-3 text-black align-top">{val.name}</td>
                    <td className="py-1.5 px-3 text-black align-top">{siUnits ? val.siRange : val.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DraggableModal>
  );
}
