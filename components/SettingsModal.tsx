import React from 'react';
import { X, Server, Bot, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    mode: 'AI' | 'BRIDGE';
    bridgeUrl: string;
  };
  onSave: (config: { mode: 'AI' | 'BRIDGE'; bridgeUrl: string }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [mode, setMode] = React.useState<'AI' | 'BRIDGE'>(config.mode);
  const [url, setUrl] = React.useState(config.bridgeUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ mode, bridgeUrl: url });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-xl font-semibold text-white">Simulation Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Simulation Backend</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('AI')}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  mode === 'AI' 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Bot className="w-6 h-6" />
                <span className="text-sm font-medium">Gemini AI</span>
              </button>
              
              <button 
                onClick={() => setMode('BRIDGE')}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  mode === 'BRIDGE' 
                  ? 'bg-green-600/20 border-green-500 text-green-200' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Server className="w-6 h-6" />
                <span className="text-sm font-medium">Gazebo Bridge</span>
              </button>
            </div>
          </div>

          {mode === 'BRIDGE' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-sm font-medium text-slate-300">Bridge Server URL</label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5000/simulate"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Point this to your local middleware API that communicates with ROS/Gazebo.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
