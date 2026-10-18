import React from 'react';
import { X, KeyRound, Check, Copy } from 'lucide-react';

interface ApiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSetupModal: React.FC<ApiSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const envSnippet = `# LLM Provider Configuration
LLM_PROVIDER="gemini" # Options: "gemini" | "openai" | "demo"

# Set your API Key (e.g. Gemini from Google AI Studio)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"

# Or use OpenAI:
# LLM_PROVIDER="openai"
# OPENAI_API_KEY="sk-proj-..."
# OPENAI_MODEL="gpt-4o-mini"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-borderMuted shadow-elevated w-full max-w-xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-borderMuted flex items-center justify-between bg-ivory-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-olive-100 text-olive-800 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-olive-700" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                LLM Provider & API Key Setup
              </h2>
              <p className="text-xs text-charcoal-500">
                Switch seamlessly between labelled Demo Mode and Live AI models.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-charcoal-700 leading-relaxed">
          <p>
            ContentFlow AI features a clean <strong>provider abstraction layer</strong> located at{' '}
            <code>backend/app/services/llm_provider.py</code>. By default, it operates in an explicitly
            labelled <strong>DEMO MODE</strong> with realistic luxury lifestyle copy so reviewers can evaluate
            the full application immediately without billing setup.
          </p>

          <div className="p-4 rounded-xl bg-ivory-100/70 border border-sand space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal-900 uppercase tracking-wider text-[10px]">
                backend/.env configuration snippet
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-olive-700 hover:text-olive-900"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-charcoal-900 text-ivory-200 font-mono text-[11px] overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          <div className="space-y-1.5 pt-1">
            <h4 className="font-semibold text-charcoal-900 text-xs">Supported Live Models & Official SDK:</h4>
            <ul className="list-disc list-inside space-y-1 text-charcoal-600">
              <li>
                <strong>Google Gemini:</strong> Powered by the official <code>google-genai</code> Python SDK (<code>from google import genai</code>). Supports <code>gemini-2.5-flash</code> and <code>gemini-3.8-flash</code> via Google AI Studio.
              </li>
              <li>
                <strong>OpenAI:</strong> <code>gpt-4o-mini</code>, <code>gpt-4o</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-borderMuted bg-ivory-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
