
import React from 'react';

interface RiskClause {
	id: string;
	text: string;
	riskLevel: 'high' | 'medium' | 'low';
	explanation: string;
	suggestion?: string;
}

interface KeyTerm {
	term: string;
	definition: string;
}

interface DocumentData {
	name: string;
	summary: string;
	riskClauses: RiskClause[];
	keyTerms: KeyTerm[];
}

interface DocumentAnalysisProps {
	document: DocumentData | null;
}

export const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({ document }) => {
	if (!document) {
		return (
			<div className="rounded border p-4 text-center text-muted-foreground bg-muted/30">
				<p>No document analyzed yet. Please upload a document to see the analysis.</p>
			</div>
		);
	}

	return (
		<div className="rounded border p-4 bg-background">
			<h2 className="text-2xl font-semibold mb-2">Summary</h2>
			<p className="mb-4">{document.summary}</p>

			<h3 className="text-xl font-semibold mb-2">Risk Clauses</h3>
			<ul className="mb-4 space-y-2">
				{document.riskClauses.map((clause) => (
					<li key={clause.id} className="border rounded p-2 bg-muted/10">
						<div className="font-medium">{clause.text}</div>
						<div className="text-sm text-muted-foreground">Risk: <span className={`font-bold ${clause.riskLevel === 'high' ? 'text-red-600' : clause.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{clause.riskLevel.toUpperCase()}</span></div>
						<div className="text-sm">{clause.explanation}</div>
						{clause.suggestion && <div className="text-sm italic">Suggestion: {clause.suggestion}</div>}
					</li>
				))}
			</ul>

			<h3 className="text-xl font-semibold mb-2">Key Terms</h3>
			<ul className="space-y-1">
				{document.keyTerms.map((term, idx) => (
					<li key={idx} className="border rounded p-2 bg-muted/10">
						<span className="font-medium">{term.term}:</span> {term.definition}
					</li>
				))}
			</ul>
		</div>
	);
};
