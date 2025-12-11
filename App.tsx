import React, { useState } from 'react';
import { Play, RefreshCcw, Github, BookOpen, Settings } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ReportCard } from './components/ReportCard';
import { SimulationView } from './components/SimulationView';
import { SettingsModal } from './components/SettingsModal';
import { analyzeRosCode, generateSimulationPreview } from './services/gemini';
import { executeRemoteSimulation } from './services/bridge';
import { AppState, AnalysisReport, SimulationResult } from './types';
import { INITIAL_CODE_PYTHON } from './constants';

interface SimConfig {
  mode: 'AI' | 'BRIDGE';
  bridgeUrl: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [code, setCode] = useState<string>(INITIAL_CODE_PYTHON);
  const [fileName, setFileName] = useState<string>('simple_publisher.py');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [simConfig, setSimConfig] = useState<SimConfig>({
    mode: 'AI',
    bridgeUrl: 'http://localhost:5000/api/simulate'
  });

  const handleCodeUpload = (newCode: string, name: string) => {
    setCode(newCode);
    setFileName(name);
    setAppState(AppState.IDLE);
    setReport(null);
    setSimResult(null);
  };

  const runAnalysis = async () => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeRosCode(code);
      setReport(result);
      setAppState(AppState.REPORT_READY);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const runSimulation = async () => {
    if (!report) return;
    setAppState(AppState.SIMULATING);
    try {
      let result: SimulationResult;
      
      if (simConfig.mode === 'BRIDGE') {
        result = await executeRemoteSimulation(simConfig.bridgeUrl, code, report.detectedNodes);
      } else {
        result = await generateSimulationPreview(report.detectedNodes);
      }

      setSimResult(result);
      setAppState(AppState.SIMULATION_COMPLETE);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setReport(null);
    setSimResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={simConfig}
        onSave={setSimConfig}
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
              R
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              ROS <span className="text-slate-400 font-normal">Validator & Sim</span>
            </h1>
          </div>
          <div className="flex gap-4 items-center">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
               title="Simulation Settings"
             >
               <Settings className="w-4 h-4" />
             </button>
             <div className="h-4 w-px bg-slate-700 mx-1"></div>
             <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
               <BookOpen className="w-4 h-4" /> Docs
             </a>
             <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
               <Github className="w-4 h-4" /> Repo
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-12">
          
          {/* Step 1: Upload & Editor */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">1. Code Submission</h2>
                <p className="text-slate-400">Upload your ROS node script for static analysis and safety validation.</p>
              </div>
              {appState !== AppState.IDLE && (
                <button 
                  onClick={reset}
                  className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors uppercase tracking-wider font-semibold"
                >
                  <RefreshCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FileUpload onCodeLoaded={handleCodeUpload} />
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                  <h4 className="text-blue-200 font-semibold text-sm mb-1">Current File</h4>
                  <p className="text-slate-400 text-xs font-mono truncate">{fileName}</p>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="relative h-[240px] rounded-xl overflow-hidden border border-slate-700 bg-[#1e1e1e]">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-[#252526] border-b border-slate-700 flex items-center px-4 text-xs text-slate-400 select-none">
                    {fileName}
                  </div>
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full pt-10 pb-4 px-4 bg-transparent text-sm font-mono text-slate-300 resize-none focus:outline-none"
                    spellCheck={false}
                  />
                  {appState === AppState.IDLE && (
                    <div className="absolute bottom-4 right-4">
                      <button 
                        onClick={runAnalysis}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Analyze Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Analysis Report */}
          {(appState === AppState.ANALYZING || appState === AppState.REPORT_READY || appState === AppState.SIMULATING || appState === AppState.SIMULATION_COMPLETE) && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-100">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">2. Checker Report</h2>
                 {appState === AppState.ANALYZING && (
                    <span className="text-sm text-blue-400 animate-pulse">Running static analysis...</span>
                 )}
               </div>
               
               {appState === AppState.ANALYZING ? (
                 <div className="h-40 bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center">
                   <div className="text-slate-500">Checking syntax and logic safety...</div>
                 </div>
               ) : report ? (
                 <div className="relative">
                   <ReportCard report={report} />
                   {(appState === AppState.REPORT_READY && report.isValid) && (
                     <div className="flex justify-center mt-8">
                       <button 
                         onClick={runSimulation}
                         className={`text-white px-8 py-3 rounded-xl font-bold text-lg shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${
                           simConfig.mode === 'BRIDGE' 
                           ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
                           : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                         }`}
                       >
                         <Play className="w-5 h-5 fill-current" /> 
                         {simConfig.mode === 'BRIDGE' ? 'Execute on Gazebo' : 'Launch AI Simulation'}
                       </button>
                     </div>
                   )}
                 </div>
               ) : null}
            </section>
          )}

          {/* Step 3: Simulation Runner */}
          {(appState === AppState.SIMULATING || appState === AppState.SIMULATION_COMPLETE) && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200 pb-20">
               <div className="flex justify-between items-end mb-6">
                 <h2 className="text-2xl font-bold text-white">3. Simulation Runner</h2>
                 <span className="text-xs font-mono text-slate-500 uppercase">
                   Source: {simConfig.mode === 'BRIDGE' ? `Bridge (${simConfig.bridgeUrl})` : 'Gemini 2.5 AI'}
                 </span>
               </div>
              <SimulationView 
                result={simResult} 
                isRunning={appState === AppState.SIMULATING} 
              />
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
