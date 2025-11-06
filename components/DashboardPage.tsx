import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { Case, CaseSummary } from '../types';
import { CaseContext } from '../contexts/CaseContext';
import { AuthContext } from '../contexts/AuthContext';
import { NewSummaryIcon, SearchIcon } from './icons';
import { searchIndianKanoon, searchECourts, KanoonResult, EcourtsResult } from '../services/legalSearchService';
import { SearchResultsModal } from './SearchResultsModal';
import { CaseComparisonModal } from './CaseComparisonModal';
import { Loader } from './Loader';


declare const Chart: any;

interface DashboardPageProps {
    onSelectCase: (selectedCase: Case) => void;
    setPage: (page: 'upload') => void;
}

const StatCard: React.FC<{ title: string, value: string | number, subtext: string }> = ({ title, value, subtext }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-semibold text-white mt-1">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{subtext}</p>
    </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectCase, setPage }) => {
    const { currentUser } = useContext(AuthContext);
    const { cases } = useContext(CaseContext);
    
    // State for searches
    const [kanoonQuery, setKanoonQuery] = useState('');
    const [cnrNumber, setCnrNumber] = useState('');
    const [searchState, setSearchState] = useState<{
        isOpen: boolean;
        title: string;
        isLoading: boolean;
        loadingMessage: string;
        error: string | null;
        kanoonResults: KanoonResult[] | null;
        ecourtsResult: EcourtsResult | null;
    }>({ isOpen: false, title: '', isLoading: false, loadingMessage: '', error: null, kanoonResults: null, ecourtsResult: null });

    // State for Case Comparison
    const [compareCases, setCompareCases] = useState<Case[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Refs for Charts
    const jurisdictionChartRef = useRef<HTMLCanvasElement>(null);
    const sentimentChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstancesRef = useRef<{ jurisdiction?: any; sentiment?: any }>({});

    const dashboardStats = useMemo(() => {
        const jurisdictions = new Set(cases.map(c => c.summary.jurisdiction));
        return { totalCases: cases.length, jurisdictionCount: jurisdictions.size };
    }, [cases]);
    
    const handleCompareToggle = (caseToToggle: Case) => {
        setCompareCases(prev => {
            const isSelected = prev.some(c => c.id === caseToToggle.id);
            if (isSelected) {
                return prev.filter(c => c.id !== caseToToggle.id);
            } else {
                if (prev.length < 2) {
                    return [...prev, caseToToggle];
                }
                return [prev[1], caseToToggle]; // Keep the last one and add the new one
            }
        });
    };

    const canCompare = compareCases.length === 2;
    
    useEffect(() => {
        const destroyCharts = () => {
            Object.values(chartInstancesRef.current).forEach(chart => chart?.destroy());
        };
        destroyCharts();

        if (cases.length > 0) {
            // Jurisdiction Chart
            if (jurisdictionChartRef.current) {
                const jurData = cases.reduce((acc, c) => {
                    const jur = c.summary.jurisdiction || 'Unknown';
                    acc[jur] = (acc[jur] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                chartInstancesRef.current.jurisdiction = new Chart(jurisdictionChartRef.current.getContext('2d'), {
                    type: 'doughnut', data: { labels: Object.keys(jurData), datasets: [{ data: Object.values(jurData), backgroundColor: ['#FACC1580', '#3B82F680', '#A855F780', '#EC489980', '#22C55E80'], borderColor: '#1e293b' }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } } }
                });
            }
            // Sentiment Chart
            if (sentimentChartRef.current) {
                 const sentimentData = cases.reduce((acc, c) => {
                    const tone = c.summary.sentimentAnalysis?.overallTone || 'Neutral';
                    acc[tone] = (acc[tone] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                chartInstancesRef.current.sentiment = new Chart(sentimentChartRef.current.getContext('2d'), {
                    type: 'bar', data: { labels: Object.keys(sentimentData), datasets: [{ label: 'Case Tone', data: Object.values(sentimentData), backgroundColor: ['#22C55E80', '#EF444480', '#64748B80'] }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 } }, x: { ticks: { color: '#94a3b8' } } } }
                });
            }
        }
        return destroyCharts;
    }, [cases]);
    
    // FIX: Implemented search handlers to update state and trigger modal.
    const handleKanoonSearch = async () => {
        if (!kanoonQuery.trim()) return;
        setSearchState({
            isOpen: true,
            title: `Indian Kanoon Results for "${kanoonQuery}"`,
            isLoading: true,
            loadingMessage: 'Searching Indian Kanoon...',
            error: null,
            kanoonResults: null,
            ecourtsResult: null,
        });
        try {
            const results = await searchIndianKanoon(kanoonQuery);
            setSearchState(prev => ({ ...prev, isLoading: false, kanoonResults: results }));
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setSearchState(prev => ({ ...prev, isLoading: false, error: message }));
        }
    };
    
    const handleCnrSearch = async () => {
        if (!cnrNumber.trim()) return;
        setSearchState({
            isOpen: true,
            title: `eCourts Status for CNR: ${cnrNumber}`,
            isLoading: true,
            loadingMessage: 'Fetching case status from eCourts...',
            error: null,
            kanoonResults: null,
            ecourtsResult: null,
        });
        try {
            const result = await searchECourts(cnrNumber);
            setSearchState(prev => ({ ...prev, isLoading: false, ecourtsResult: result }));
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setSearchState(prev => ({ ...prev, isLoading: false, error: message }));
        }
    };
    const closeModal = () => setSearchState(prev => ({ ...prev, isOpen: false }));

    // FIX: Implemented modal content rendering based on search state.
    const renderModalContent = () => {
        if (searchState.isLoading) {
            return <Loader message={searchState.loadingMessage} />;
        }

        if (searchState.error) {
            return (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                    <p>{searchState.error}</p>
                </div>
            );
        }

        if (searchState.kanoonResults) {
            return (
                <div className="space-y-4">
                    {searchState.kanoonResults.length > 0 ? (
                        searchState.kanoonResults.map((result, index) => (
                            <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-bold text-yellow-400">{result.caseName}</h4>
                                <p className="text-sm text-slate-300">{result.court} ({result.date})</p>
                                <p className="text-sm mt-2 text-slate-400">{result.summary}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center">No results found for your query.</p>
                    )}
                </div>
            );
        }

        if (searchState.ecourtsResult) {
            const result = searchState.ecourtsResult;
            return (
                <div className="space-y-2 text-sm text-slate-300">
                    <div className="grid grid-cols-3 gap-2">
                        <strong className="text-slate-400 col-span-1">Status:</strong>
                        <span className={`font-semibold col-span-2 ${result.caseStatus.toLowerCase().includes('disposed') ? 'text-red-400' : 'text-green-400'}`}>{result.caseStatus}</span>
                        
                        <strong className="text-slate-400 col-span-1">Case Type:</strong>
                        <span className="col-span-2">{result.caseType}</span>

                        <strong className="text-slate-400 col-span-1">First Hearing:</strong>
                        <span className="col-span-2">{result.firstHearing}</span>

                        <strong className="text-slate-400 col-span-1">Next Hearing:</strong>
                        <span className="col-span-2">{result.nextHearing}</span>

                        <strong className="text-slate-400 col-span-1">Court & Judge:</strong>
                        <span className="col-span-2">{result.courtNumber} ({result.judge})</span>
                    </div>
                    {result.source && <p className="text-xs text-slate-500 mt-4 text-right">Source: {result.source}</p>}
                </div>
            );
        }

        return null;
    };


    return (
        <>
            <div className="container mx-auto p-4 md:p-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h2>
                        <p className="mt-2 text-lg text-slate-400">Welcome back, {currentUser?.role}! Here's your mission control.</p>
                    </div>
                    <button onClick={() => setPage('upload')} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-slate-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-slate-900 transition-colors">
                        <NewSummaryIcon /> New Summary
                    </button>
                </div>
                
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Total Cases" value={dashboardStats.totalCases} subtext="Summaries generated" />
                    <StatCard title="Jurisdictions" value={dashboardStats.jurisdictionCount} subtext="Unique legal areas" />
                    <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                         <h3 className="text-base font-semibold text-white mb-4">Case Sentiment Analysis</h3>
                         <div className="h-40"><canvas ref={sentimentChartRef}></canvas></div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-semibold text-white">Recent Cases</h3>
                                <button onClick={() => setIsCompareModalOpen(true)} disabled={!canCompare} className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-400 text-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                                    Compare ({compareCases.length}/2)
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto pr-2 -mr-2">
                                 {cases.length > 0 ? (
                                    <div className="divide-y divide-slate-700/50">
                                        {cases.map((c) => (
                                            <div key={c.id} className="flex justify-between items-center py-3 -mx-6 px-6">
                                                <div onClick={() => onSelectCase(c)} className="cursor-pointer group flex-grow">
                                                    <p className="font-medium text-slate-200 group-hover:text-yellow-400 transition-colors text-sm">{c.summary.caseName}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{c.summary.jurisdiction}</p>
                                                </div>
                                                <input type="checkbox" checked={compareCases.some(comp => comp.id === c.id)} onChange={() => handleCompareToggle(c)} className="ml-4 h-4 w-4 rounded bg-slate-700 border-slate-500 text-yellow-400 focus:ring-yellow-500 cursor-pointer"/>
                                            </div>
                                        ))}
                                    </div>
                                ) : ( <p className="text-center text-slate-400 py-8 text-sm">No cases summarized yet.</p> )}
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* FIX: Implemented search cards UI. */}
                           <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-base font-semibold text-white mb-4">Search Indian Kanoon</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={kanoonQuery}
                                        onChange={(e) => setKanoonQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleKanoonSearch()}
                                        placeholder="e.g., 'basic structure doctrine'"
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm"
                                    />
                                    <button onClick={handleKanoonSearch} className="p-2 bg-yellow-400 text-slate-900 rounded-md hover:bg-yellow-500 transition-colors">
                                        <SearchIcon />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-base font-semibold text-white mb-4">Check eCourts Case Status</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={cnrNumber}
                                        onChange={(e) => setCnrNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCnrSearch()}
                                        placeholder="16-digit CNR Number"
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 px-3 py-2 text-sm"
                                    />
                                    <button onClick={handleCnrSearch} className="p-2 bg-yellow-400 text-slate-900 rounded-md hover:bg-yellow-500 transition-colors">
                                        <SearchIcon />
                                    </button>
                                </div>
                            </div>
                         </div>

                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-base font-semibold text-white mb-2">Law Evolution Tracker (Demo)</h3>
                            <p className="text-sm text-slate-400 mb-4">Shows how a section of law has changed over time.</p>
                            <div className="text-sm">
                                <strong className="text-yellow-400">IPC Section 377:</strong>
                                <p className="mt-2 p-3 bg-red-900/30 rounded-md border border-red-700/50"><strong className="text-red-300">Before 2018:</strong> "Whoever voluntarily has carnal intercourse against the order of nature with any man, woman or animal, shall be punished..."</p>
                                <p className="mt-2 p-3 bg-green-900/30 rounded-md border border-green-700/50"><strong className="text-green-300">After 2018 (Navtej Singh Johar v. UOI):</strong> Decriminalized consensual homosexual acts. The section now applies only to non-consensual acts, bestiality, and acts with minors.</p>
                            </div>
                        </div>

                    </div>
                    {/* Right Column */}
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                         <h3 className="text-base font-semibold text-white mb-4">Jurisdiction Distribution</h3>
                         <div className="h-80">
                             {cases.length > 0 ? <canvas ref={jurisdictionChartRef}></canvas> : <p className="text-center text-slate-400 pt-16 text-sm">No data to display.</p>}
                         </div>
                    </div>
                </div>
            </div>
            {/* FIX: Passed children to the modal to fix the TypeScript error. */}
            <SearchResultsModal isOpen={searchState.isOpen} onClose={closeModal} title={searchState.title}>
                 {renderModalContent()}
            </SearchResultsModal>
            {canCompare && <CaseComparisonModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} cases={compareCases} />}
        </>
    );
};
