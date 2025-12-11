import React from 'react';
import { AnalysisReport, IssueSeverity } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Info, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ReportCardProps {
  report: AnalysisReport;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const getSeverityIcon = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.ERROR: return <XCircle className="w-5 h-5 text-red-400" />;
      case IssueSeverity.WARNING: return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.ERROR: return 'bg-red-500/10 border-red-500/20 text-red-200';
      case IssueSeverity.WARNING: return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center">
          <div className="text-slate-400 text-sm font-medium mb-2">Code Health Score</div>
          <div className={`text-5xl font-bold ${report.score > 80 ? 'text-green-400' : report.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {report.score}
          </div>
        </div>

        {/* Safety Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-start justify-center">
          <div className="flex items-center gap-2 mb-2">
            {report.safetyCheck.safe ? 
              <ShieldCheck className="w-5 h-5 text-green-400" /> : 
              <ShieldAlert className="w-5 h-5 text-red-400" />
            }
            <span className="text-slate-400 text-sm font-medium">Safety Assessment</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{report.safetyCheck.details}</p>
        </div>

        {/* Structure Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-slate-400 text-sm font-medium mb-3">Structure Detection</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nodes:</span>
              <span className="text-slate-200">{report.detectedNodes.length > 0 ? report.detectedNodes.join(', ') : 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Topics:</span>
              <span className="text-slate-200 font-mono text-xs bg-slate-900 px-2 py-1 rounded">{report.detectedTopics.length > 0 ? report.detectedTopics[0] + (report.detectedTopics.length > 1 ? '...' : '') : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            Analysis Detail
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {report.issues.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No issues found! Great job.</div>
          ) : (
            report.issues.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 ${getSeverityColor(issue.severity)}`}>
                <div className="mt-0.5">{getSeverityIcon(issue.severity)}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm flex justify-between">
                    <span>{issue.message}</span>
                    {issue.line && <span className="opacity-60 text-xs">Line {issue.line}</span>}
                  </div>
                  {issue.suggestion && (
                    <div className="mt-1 text-xs opacity-80 border-t border-current pt-1 mt-2">
                      Suggestion: {issue.suggestion}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
