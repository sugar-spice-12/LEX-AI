import React from 'react';
import { Case } from '../types';

interface CaseComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    cases: Case[];
}

const ComparisonField: React.FC<{ label: string; valueA: React.ReactNode; valueB: React.ReactNode }> = ({ label, valueA, valueB }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-slate-700">
        <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
            <div className="text-sm text-slate-200">{valueA}</div>
        </div>
         <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 md:invisible">{label}</p>
            <div className="text-sm text-slate-200">{valueB}</div>
        </div>
    </div>
);


export const CaseComparisonModal: React.FC<CaseComparisonModalProps> = ({ isOpen, onClose, cases }) => {
    if (!isOpen || cases.length !== 2) return null;

    const [caseA, caseB] = cases;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white">Case Comparison</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <h3 className="text-lg font-bold text-yellow-400 truncate">{caseA.summary.caseName}</h3>
                        <h3 className="text-lg font-bold text-yellow-400 truncate">{caseB.summary.caseName}</h3>
                    </div>
                    <ComparisonField label="Citation" valueA={caseA.summary.citation} valueB={caseB.summary.citation} />
                    <ComparisonField label="Jurisdiction" valueA={caseA.summary.jurisdiction} valueB={caseB.summary.jurisdiction} />
                    <ComparisonField label="Case Category" valueA={caseA.summary.caseCategory} valueB={caseB.summary.caseCategory} />
                    <ComparisonField label="Outcome" valueA={caseA.summary.outcomeClassification} valueB={caseB.summary.outcomeClassification} />
                     <ComparisonField 
                        label="Legal Issues" 
                        valueA={<ul className="list-disc list-inside">{caseA.summary.legalIssues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
                        valueB={<ul className="list-disc list-inside">{caseB.summary.legalIssues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
                    />
                    <ComparisonField 
                        label="Conclusion" 
                        valueA={<p className="line-clamp-4">{caseA.summary.conclusion}</p>}
                        valueB={<p className="line-clamp-4">{caseB.summary.conclusion}</p>}
                    />
                </main>
            </div>
        </div>
    );
};