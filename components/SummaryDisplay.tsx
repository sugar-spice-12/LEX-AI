import React, { useState, useEffect } from 'react';
import { CaseSummary } from '../types';
import { Accordion, AccordionItem } from './Accordion';

interface SummaryDisplayProps {
  summary: CaseSummary;
  onReset: () => void;
  onAskFollowUp: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, onReset, onAskFollowUp }) => {
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Cancel speech synthesis when component unmounts
    useEffect(() => {
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        };
    }, []);
    
    const formatSummaryForCopy = (html: boolean = false) => {
        let text = ``;
        const br = html ? '<br/>' : '\n';
        const h = (title: string) => html ? `<h3>${title}</h3>` : `\n--- ${title.toUpperCase()} ---\n`;
        
        text += `CASE SUMMARY${br}${br}`;
        text += `Case Name: ${summary.caseName}${br}`;
        text += `Citation: ${summary.citation}${br}`;

        text += h('Parties Involved');
        text += summary.parties.map(p => `- ${p}`).join(br) + br;
        
        text += h('Facts of the Case');
        text += summary.factsOfCase + br;
        
        text += h('Key Legal Issues');
        text += summary.legalIssues.map((issue, i) => `${i+1}. ${issue}`).join(br) + br;
        
        text += h('Judgment & Reasoning');
        text += summary.judgmentAndReasoning + br;
        
        text += h('Conclusion');
        text += summary.conclusion + br;

        return text;
    }

    const handleCopy = () => {
        const textToCopy = formatSummaryForCopy();
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    
    const handleReadAloud = () => {
        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const textToSpeak = formatSummaryForCopy(false).replace(/---/g, '');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };


    const handleExport = () => {
        const textToExport = formatSummaryForCopy();
        const blob = new Blob([textToExport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${summary.caseName.replace(/ /g, '_')}_Summary.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h2 className="text-2xl font-bold text-white">{summary.caseName}</h2>
            <p className="text-md text-slate-400">{summary.citation}</p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={onAskFollowUp}
              className="flex items-center px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              title="Ask Follow-up Questions"
            >
              Ask AI
            </button>
             <button
              onClick={handleReadAloud}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-sm"
              title={isSpeaking ? "Stop Reading" : "Read Summary Aloud"}
            >
              {isSpeaking ? 'Stop' : 'Read Aloud'}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-sm"
              title="Export as .txt"
            >
              Export
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-sm w-20 text-center"
              title={copied ? 'Copied!' : 'Copy to Clipboard'}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-sm"
              title="Summarize Another Document"
            >
              Reset
            </button>
        </div>
      </div>
      
      <div className="mt-6 text-slate-300 leading-relaxed">
        <Accordion>
          <AccordionItem title="Core Details">
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><strong className="text-slate-400 block">Jurisdiction:</strong> {summary.jurisdiction}</div>
                <div><strong className="text-slate-400 block">Case Category:</strong> {summary.caseCategory}</div>
                <div><strong className="text-slate-400 block">Outcome:</strong> {summary.outcomeClassification}</div>
                <div><strong className="text-slate-400 block">Judgment Ratio:</strong> {summary.judgmentRatio}</div>
            </div>
          </AccordionItem>
          {summary.tableOfContents && <AccordionItem title="Table of Contents"><ul className="list-disc list-inside space-y-1">{summary.tableOfContents.map((item, i) => <li key={i}>{item}</li>)}</ul></AccordionItem>}
          <AccordionItem title="Timeline of Legal Events"><ul className="list-disc list-inside space-y-2">{summary.timelineOfEvents.map((event, i) => <li key={i}><strong className="font-semibold text-slate-200">{event.date}:</strong> {event.event}</li>)}</ul></AccordionItem>
          <AccordionItem title="Parties & Witnesses">
            <h4 className="font-semibold text-slate-200 mb-2">Parties Involved</h4>
            <ul className="list-disc list-inside mb-4">{summary.parties.map((party, i) => <li key={i}>{party}</li>)}</ul>
            {summary.witnesses && summary.witnesses.length > 0 && <>
                <h4 className="font-semibold text-slate-200 mb-2">Key Witnesses</h4>
                <ul className="list-disc list-inside">{summary.witnesses.map((w, i) => <li key={i}><strong className="text-slate-100">{w.name}:</strong> {w.summary}</li>)}</ul>
            </>}
          </AccordionItem>
          <AccordionItem title="Facts of the Case"><p>{summary.factsOfCase}</p></AccordionItem>
          <AccordionItem title="Cause of Action"><p>{summary.causeOfAction}</p></AccordionItem>
          <AccordionItem title="Arguments Presented">
              <h4 className="font-semibold text-slate-200 mb-2">Petitioner's Arguments</h4>
              <ul className="list-decimal list-inside space-y-1 mb-4">{summary.arguments.petitioner.map((arg, i) => <li key={i}>{arg}</li>)}</ul>
              <h4 className="font-semibold text-slate-200 mb-2">Respondent's Arguments</h4>
              <ul className="list-decimal list-inside space-y-1">{summary.arguments.respondent.map((arg, i) => <li key={i}>{arg}</li>)}</ul>
          </AccordionItem>
          <AccordionItem title="Legal Issues"><ul className="list-decimal list-inside space-y-1">{summary.legalIssues.map((issue, i) => <li key={i}>{issue}</li>)}</ul></AccordionItem>
          <AccordionItem title="Judgment & Core Reasoning (Ratio Decidendi)"><p>{summary.ratioDecidendi}</p></AccordionItem>
          <AccordionItem title="Additional Commentary (Obiter Dicta)"><p>{summary.obiterDicta}</p></AccordionItem>
          <AccordionItem title="Conclusion"><p>{summary.conclusion}</p></AccordionItem>
          <AccordionItem title="Precedent Analysis">
              <p className="mb-4">{summary.precedentAnalysis}</p>
              <h4 className="font-semibold text-slate-200 mb-2">Cited Precedents</h4>
              <ul className="list-disc list-inside space-y-2">{summary.citedPrecedents.map((p, i) => <li key={i}><strong className="text-slate-100">{p.citation}:</strong> {p.summary}</li>)}</ul>
          </AccordionItem>
          <AccordionItem title="Strategic AI Insights">
              <h4 className="font-semibold text-slate-200 mb-2">Potential Grounds for Appeal</h4>
              <ul className="list-disc list-inside space-y-1 mb-4">{summary.groundsForAppeal.map((g, i) => <li key={i}>{g}</li>)}</ul>
              <h4 className="font-semibold text-slate-200 mb-2">Suggested Next Legal Steps</h4>
              <ul className="list-disc list-inside space-y-1 mb-4">{summary.nextLegalSteps.map((s, i) => <li key={i}>{s}</li>)}</ul>
              <h4 className="font-semibold text-slate-200 mb-2">Relevant Sections (Not Cited)</h4>
              <ul className="list-disc list-inside space-y-1">{summary.suggestedRelevantSections.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </AccordionItem>
          {summary.bailProbabilityAnalysis && <AccordionItem title="Bail Probability Analysis (Criminal Cases)"><p>{summary.bailProbabilityAnalysis}</p></AccordionItem>}
          <AccordionItem title="AI Analysis & Metadata">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong className="text-slate-400 block">AI Confidence Score:</strong> {(summary.aiConfidenceScore * 100).toFixed(1)}%</div>
                <div><strong className="text-slate-400 block">Legal Weight:</strong> {summary.legalWeight}</div>
                <div><strong className="text-slate-400 block">Sentiment Tone:</strong> {summary.sentimentAnalysis.overallTone} (Score: {summary.sentimentAnalysis.score.toFixed(2)})</div>
              </div>
              <p className="mt-4"><strong className="text-slate-400 block">Bias Indicators:</strong> {summary.biasIndicators}</p>
          </AccordionItem>
          <AccordionItem title="Generated Case FAQs"><ul className="list-disc list-inside space-y-2">{summary.caseFAQs.map((faq, i) => <li key={i}><strong className="font-semibold text-slate-200">{faq.question}</strong><br/>{faq.answer}</li>)}</ul></AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};