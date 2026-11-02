import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Link, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { store } from '../../lib/store';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedMigrationPath, setCopiedMigrationPath] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    saveCustomSupabaseConfig(url, anonKey);
    onClose();
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
  };

  const handleCopyMigrationPath = () => {
    navigator.clipboard.writeText('supabase/migrations/20261101_init_ecotrack.sql');
    setCopiedMigrationPath(true);
    setTimeout(() => setCopiedMigrationPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-[#E2E8E4] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17231C]">
                Supabase & PostgreSQL Database Configuration
              </h3>
              <p className="text-xs text-[#64748B]">
                Connect your live Supabase project or use the local reactive store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            currentConfig.isConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-slate-50 border-[#E2E8E4] text-[#17231C]'
          }`}>
            {currentConfig.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Database className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {currentConfig.isConfigured ? 'Supabase Project Connected' : 'Hybrid Local Store Active (Zero Config Required)'}
              </span>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                {currentConfig.isConfigured 
                  ? 'EcoTrack is wired to your live Supabase database instance. Real API calls are executed with full Row Level Security.'
                  : 'EcoTrack is operating in high-fidelity interactive local mode with realistic seed accounts for all 5 roles. You can paste your Supabase URL and Anon Key below at any time.'}
              </p>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-[#17231C] mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#17231C] mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Supabase Public Anon Key</span>
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-3.5 py-1.5 bg-white border border-[#E2E8E4] rounded-lg text-xs font-semibold text-[#17231C] hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                {isTesting ? 'Testing Connection...' : 'Test Connection'}
              </button>

              {testResult && (
                <span className={`text-xs font-medium flex items-center gap-1 ${
                  testResult.success ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{testResult.message}</span>
                </span>
              )}
            </div>
          </div>

          {/* Migration File Reference */}
          <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17231C] text-xs">Included SQL Migration (16 Tables)</span>
              <button
                type="button"
                onClick={handleCopyMigrationPath}
                className="text-[11px] text-[#15803D] hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedMigrationPath ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMigrationPath ? 'Copied' : 'Copy File Path'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Run the migrations in your Supabase SQL Editor:
            </p>
            <div className="p-2 bg-white rounded border border-[#E2E8E4] font-mono text-[11px] text-[#17231C] space-y-1">
              <div>1. supabase/migrations/20261101_init_ecotrack.sql</div>
              <div>2. supabase/migrations/20261102_security_rls_and_fixes.sql</div>
            </div>
          </div>

          {/* Refresh Data Button */}
          <div className="pt-2 border-t border-[#E2E8E4] flex items-center justify-between">
            <button
              type="button"
              onClick={async () => {
                await store.refreshData();
                onClose();
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Supabase Records</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 font-semibold text-[#64748B] hover:text-[#17231C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
