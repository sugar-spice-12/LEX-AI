import React, { useState, ReactNode } from 'react';

interface AccordionProps {
  children: ReactNode;
}

interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children }) => {
  return <div className="space-y-2">{children}</div>;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <h3 className="text-md font-semibold text-yellow-400">{title}</h3>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4 bg-slate-900/30 text-sm">{children}</div>}
    </div>
  );
};
