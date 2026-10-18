import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2, Check } from 'lucide-react';
import type { CampaignCreateInput, PlatformType } from '../types';

interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignCreateInput) => Promise<void>;
  isLoading: boolean;
}

export const CampaignCreateModal: React.FC<CampaignCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CampaignCreateInput>({
    brand_name: '',
    industry: '',
    target_audience: '',
    brand_voice: '',
    products_services: '',
    campaign_objective: '',
    platforms: ['Instagram', 'LinkedIn'],
    content_preferences: '',
    number_of_days: 7,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generationStep, setGenerationStep] = useState<string>('Initializing prompt...');

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand_name.trim() || formData.brand_name.trim().length < 2) {
      newErrors.brand_name = 'Brand name must be at least 2 characters';
    }
    if (!formData.industry.trim() || formData.industry.trim().length < 2) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.target_audience.trim() || formData.target_audience.trim().length < 3) {
      newErrors.target_audience = 'Target audience must be at least 3 characters';
    }
    if (!formData.brand_voice.trim() || formData.brand_voice.trim().length < 2) {
      newErrors.brand_voice = 'Brand voice/tone is required';
    }
    if (!formData.products_services.trim() || formData.products_services.trim().length < 3) {
      newErrors.products_services = 'Products or services details are required';
    }
    if (!formData.campaign_objective.trim() || formData.campaign_objective.trim().length < 3) {
      newErrors.campaign_objective = 'Campaign objective is required';
    }
    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform (Instagram or LinkedIn)';
    }
    if (formData.number_of_days < 1 || formData.number_of_days > 30) {
      newErrors.number_of_days = 'Calendar days must be between 1 and 30';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlatformToggle = (platform: PlatformType) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform);
      if (exists) {
        return { ...prev, platforms: prev.platforms.filter((p) => p !== platform) };
      } else {
        return { ...prev, platforms: [...prev.platforms, platform] };
      }
    });
  };

  const handlePreFillMaison = () => {
    setFormData({
      brand_name: 'Maison Living Studio',
      industry: 'Luxury Architectural Interior Design & Custom Furniture',
      target_audience:
        'High-net-worth homeowners, art collectors, real estate developers, and design purists seeking understated elegance.',
      brand_voice:
        'Refined, architectural, quiet luxury, contemplative, and deeply respectful of organic materiality.',
      products_services:
        'Full-service residential renovations, custom walnut and stone millwork, and the Signature Monolith travertine furniture collection.',
      campaign_objective:
        'Launch the Autumn/Winter Atelier Monograph and secure 5 bespoke residential commissions for 2026/2027.',
      platforms: ['Instagram', 'LinkedIn'],
      content_preferences:
        'Emphasize natural daylight transitions, raw honed Roman travertine, micro-joinery details, zero decorative clutter, and art collector sensibilities.',
      number_of_days: 7,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setGenerationStep('Synthesizing brand brief...');
      const interval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev.includes('Synthesizing')) return 'Formulating architectural themes & hooks...';
          if (prev.includes('Formulating')) return 'Crafting tailored captions & photography briefs...';
          return 'Validating structured Pydantic schema...';
        });
      }, 1400);

      await onSubmit(formData);
      clearInterval(interval);
    } catch {
      // Error handled by parent toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-borderMuted shadow-elevated w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-borderMuted flex items-center justify-between bg-ivory-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-olive-100 text-olive-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                New Content Campaign Brief
              </h2>
              <p className="text-xs text-charcoal-500">
                Provide client parameters to generate a 7-day structured calendar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreFillMaison}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg border border-borderMuted bg-white text-olive-800 hover:bg-olive-50 font-medium transition-colors"
            >
              Pre-fill Maison Studio
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Brand Name & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="e.g. Maison Living Studio"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                  errors.brand_name ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
                }`}
              />
              {errors.brand_name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.brand_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Industry & Niche <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Luxury Interior Architecture"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                  errors.industry ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
                }`}
              />
              {errors.industry && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.industry}
                </p>
              )}
            </div>
          </div>

          {/* Brand Voice & Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Brand Voice & Tone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand_voice}
                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                placeholder="e.g. Refined, Architectural, Understated Quiet Luxury"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                  errors.brand_voice ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
                }`}
              />
              {errors.brand_voice && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.brand_voice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Calendar Days
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.number_of_days}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_days: parseInt(e.target.value) || 7 })
                  }
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 font-semibold text-center"
                />
                <span className="text-xs text-charcoal-500 shrink-0">Days</span>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Target Audience <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="e.g. High-net-worth homeowners, art collectors, and real estate developers"
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                errors.target_audience ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
              }`}
            />
            {errors.target_audience && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.target_audience}
              </p>
            )}
          </div>

          {/* Products & Services */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Products or Key Services <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.products_services}
              onChange={(e) => setFormData({ ...formData, products_services: e.target.value })}
              placeholder="e.g. Turnkey architectural interior design, custom smoked oak millwork, and the Monolith travertine collection."
              disabled={isLoading}
              className={`w-full px-3.5 py-2 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                errors.products_services ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
              }`}
            />
            {errors.products_services && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.products_services}
              </p>
            )}
          </div>

          {/* Campaign Objective */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Campaign Objective <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.campaign_objective}
              onChange={(e) => setFormData({ ...formData, campaign_objective: e.target.value })}
              placeholder="e.g. Launch the Autumn/Winter Atelier Monograph and secure 5 residential commissions"
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all ${
                errors.campaign_objective ? 'border-rose-400 bg-rose-50/20' : 'border-borderMuted'
              }`}
            />
            {errors.campaign_objective && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.campaign_objective}
              </p>
            )}
          </div>

          {/* Platforms Selection */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
              Distribution Platforms <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4">
              {(['Instagram', 'LinkedIn'] as PlatformType[]).map((platform) => {
                const isChecked = formData.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-all flex-1 ${
                      isChecked
                        ? 'border-olive-600 bg-olive-50/60 text-olive-950 font-medium shadow-subtle'
                        : 'border-borderMuted bg-ivory-50/30 text-charcoal-600 hover:border-charcoal-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePlatformToggle(platform)}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-olive-700 border-olive-700 text-white' : 'border-charcoal-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span>{platform}</span>
                  </label>
                );
              })}
            </div>
            {errors.platforms && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.platforms}
              </p>
            )}
          </div>

          {/* Additional Preferences */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Content Preferences & Guardrails (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.content_preferences}
              onChange={(e) => setFormData({ ...formData, content_preferences: e.target.value })}
              placeholder="e.g. Focus on natural daylight transitions, raw travertine textures, zero decorative clutter..."
              disabled={isLoading}
              className="w-full px-3.5 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-borderMuted flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-borderMuted text-charcoal-600 hover:text-charcoal-900 text-sm font-medium hover:bg-ivory-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-charcoal-900 text-ivory-100 text-sm font-medium hover:bg-charcoal-800 transition-all shadow-subtle hover:shadow-elevated disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-olive-400" />
                  <span>{generationStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-olive-300" />
                  <span>Generate Content Calendar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
