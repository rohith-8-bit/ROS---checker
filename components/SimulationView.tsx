import React from 'react';
import { SimulationResult } from '../types';
import { Terminal, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface SimulationViewProps {
  result: SimulationResult | null;
  isRunning: boolean;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ result, isRunning }) => {
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-xl border border-slate-700">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Initializing Simulation Environment</h3>
        <p className="text-slate-400 text-sm">Launching Gazebo instance & loading UR5 robot description...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Visual Preview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Gazebo Preview
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${result.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {result.success ? 'Goal Reached' : 'Failed'}
          </span>
        </div>
        
        <div className="flex-1 bg-black relative flex items-center justify-center group min-h-[300px]">
           {/* Scanlines effect overlay */}
           <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
           
           {result.frames.length > 0 ? (
             <img 
               src={result.frames[0]} 
               alt="Simulation Final State" 
               className="w-full h-full object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
             />
           ) : (
             <div className="text-slate-600 flex flex-col items-center">
                <span className="text-4xl mb-2">🦾</span>
                <span>No Visual Data Available</span>
             </div>
           )}
           
           {/* Overlay UI elements similar to Gazebo/RViz */}
           <div className="absolute top-4 left-4 text-[10px] font-mono text-green-500 bg-black/50 px-2 py-1 rounded">
             <div>FPS: 59.9</div>
             <div>RTF: 0.99</div>
           </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="bg-[#1e1e1e] rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-inner">
        <div className="p-3 border-b border-slate-700 bg-[#252526] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-mono">ros2_node_output.log</span>
        </div>
        <div className="p-4 font-mono text-xs overflow-y-auto flex-1 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {result.logs.map((log, idx) => (
            <div key={idx} className="mb-1 break-words">
              <span className="text-slate-500">[{log.timestamp}]</span>
              <span className={`mx-2 ${log.level === 'ERROR' ? 'text-red-500 font-bold' : log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'}`}>
                [{log.level}]
              </span>
              <span className="text-purple-400">[{log.node}]:</span>
              <span className="text-slate-300 ml-2">{log.message}</span>
            </div>
          ))}
          {result.success && (
            <div className="mt-4 pt-4 border-t border-slate-700 text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Process finished with exit code 0</span>
            </div>
          )}
          {!result.success && (
            <div className="mt-4 pt-4 border-t border-slate-700 text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Process terminated with errors</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
