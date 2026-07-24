'use client';

import React, { useState, useEffect } from 'react';
import { processJuniorAccountOpening, fetchBranches, JuniorCustomerPayload, JuniorAccountResponse } from '../services/junior-account-service';
import { CreditCard, Sparkles, FileText, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Baby, AlertCircle } from 'lucide-react';

export function JuniorAccountWizard() {
  // Step navigation: 1 = Mode Selection, 2 = Personal & Guardian Info, 3 = Address & Branch, 4 = Review & Submit, 5 = Success
  const [step, setStep] = useState<number>(1);
  const [hasNid, setHasNid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<JuniorCustomerPayload>({
    has_nid: true,
    legal_id: '',
    family_name: '',
    given_name: '',
    last_name_kh: '',
    first_name_kh: '',
    date_of_birth: '',
    gender: 'MALE',
    phone_number: '',
    branch_code: '',
    marital_status: 'SINGLE',
    occupation: 'STUDENT',
    legal_address: '',
    legal_iss_date: '',
    legal_exp_date: '',
    customer_current_province: '',
    customer_current_district: '',
    customer_current_commune: '',
    customer_current_village: '',
    guardian_legal_id: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relationship: 'FATHER',
  });

  const [result, setResult] = useState<JuniorAccountResponse | null>(null);

  useEffect(() => {
    fetchBranches().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setBranches(data);
        setFormData((prev) => (prev.branch_code ? prev : { ...prev, branch_code: data[0].code }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMode = (withNidMode: boolean) => {
    setHasNid(withNidMode);
    setFormData((prev) => ({
      ...prev,
      has_nid: withNidMode,
      // Clear fields if switching to NO NID
      legal_id: withNidMode ? prev.legal_id : '',
      family_name: withNidMode ? prev.family_name : '',
      given_name: withNidMode ? prev.given_name : '',
    }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await processJuniorAccountOpening(formData);
      setResult(res);
      setStep(5);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to open Junior Account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-3xl mx-auto w-full my-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Baby className="w-4 h-4" /> Junior Account Opening
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
            CPBank Junior Savings
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Instant digital bank account for minors & students with or without National ID
          </p>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/50">
          {/* Progress Indicator (Steps 1 to 4) */}
          {step <= 4 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-2">
                <span>Step {step} of 4</span>
                <span>
                  {step === 1 && 'Option Selection'}
                  {step === 2 && 'Child & Guardian Information'}
                  {step === 3 && 'Location & Branch'}
                  {step === 4 && 'Review & Final Submit'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: MODE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-100">Choose Identification Option</h2>
                <p className="text-slate-400 text-sm mt-1">Select how you would like to register the child</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: With NID */}
                <button
                  type="button"
                  onClick={() => handleSelectMode(true)}
                  className="group relative flex flex-col p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-teal-400/80 hover:bg-teal-500/5 transition-all text-left duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Supported
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    With National ID (NID)
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Child has an existing Cambodian National ID card. Scan or upload NID to pre-fill details automatically.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
                    Select Option <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Option 2: Without NID */}
                <button
                  type="button"
                  onClick={() => handleSelectMode(false)}
                  className="group relative flex flex-col p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-emerald-400/80 hover:bg-emerald-500/5 transition-all text-left duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Baby className="w-6 h-6" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase mb-1">
                    <FileText className="w-3.5 h-3.5" /> Manual Entry Form
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    No National ID (NO NID)
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    For minors without NID. Opens an empty registration form to enter child details along with guardian NID info.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Select Option <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL & GUARDIAN DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Child & Guardian Information</h2>
                  <p className="text-xs text-slate-400">
                    {hasNid ? 'Registering with Child NID' : 'Registering Without Child NID (Manual Entry)'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${hasNid ? 'bg-teal-500/20 text-teal-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {hasNid ? 'WITH NID' : 'NO NID'}
                </span>
              </div>

              {/* Child Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Child Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hasNid && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Child National ID Number</label>
                      <input
                        type="text"
                        name="legal_id"
                        value={formData.legal_id || ''}
                        onChange={handleChange}
                        placeholder="e.g. 0102030405"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Family Name (EN) *</label>
                    <input
                      type="text"
                      name="family_name"
                      value={formData.family_name || ''}
                      onChange={handleChange}
                      placeholder="Family Name"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Given Name (EN) *</label>
                    <input
                      type="text"
                      name="given_name"
                      value={formData.given_name || ''}
                      onChange={handleChange}
                      placeholder="Given Name"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender || 'MALE'}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Parent / Legal Guardian Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guardian National ID Number *</label>
                    <input
                      type="text"
                      name="guardian_legal_id"
                      value={formData.guardian_legal_id || ''}
                      onChange={handleChange}
                      placeholder="Guardian NID e.g. 0101928374"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      name="guardian_name"
                      value={formData.guardian_name || ''}
                      onChange={handleChange}
                      placeholder="Guardian Full Name"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guardian Phone Number *</label>
                    <input
                      type="tel"
                      name="guardian_phone"
                      value={formData.guardian_phone || ''}
                      onChange={handleChange}
                      placeholder="012345678"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Relationship to Child *</label>
                    <select
                      name="guardian_relationship"
                      value={formData.guardian_relationship || 'FATHER'}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                    >
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Option
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  Continue to Address <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS & BRANCH SELECTION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Location & Branch Selection</h2>
                <p className="text-xs text-slate-400">Specify home address and home branch location</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Address *</label>
                  <input
                    type="text"
                    name="legal_address"
                    value={formData.legal_address || ''}
                    onChange={handleChange}
                    placeholder="House No, Street, Village, Sangkat, Khan, Province"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Account Opening Branch *</label>
                  <select
                    name="branch_code"
                    value={formData.branch_code || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  >
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b.code || b.branchCode} value={b.code || b.branchCode}>
                          {b.name || b.branchName || b.code} ({b.code || b.branchCode})
                        </option>
                      ))
                    ) : (
                      <option value="001">Head Office Main Branch (001)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    placeholder="012345678"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  Review Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Review & Confirm Junior Account</h2>
                <p className="text-xs text-slate-400">Please verify all information before final creation</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Registration Mode:</span>
                  <p className="font-semibold text-teal-400 mt-0.5">{hasNid ? 'With National ID' : 'Without National ID'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Child Name:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.family_name} {formData.given_name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Date of Birth:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Guardian Name & NID:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.guardian_name} ({formData.guardian_legal_id})</p>
                </div>
                <div>
                  <span className="text-slate-400">Guardian Phone:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.guardian_phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Branch Code:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.branch_code}</p>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Account...
                    </>
                  ) : (
                    <>
                      Create Junior Account <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS RESULT */}
          {step === 5 && result && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-teal-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-100">Junior Account Created!</h2>
                <p className="text-slate-400 text-sm mt-1">Your CPBank Junior Savings Accounts are ready for use.</p>
              </div>

              {/* Account Card Details */}
              <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 text-left space-y-4 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Customer CIF</span>
                  <span className="text-sm font-mono font-bold text-teal-400">{result.cif}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">KHR Savings Account</span>
                  <span className="text-sm font-mono font-bold text-slate-100">{result.khrAccount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">USD Savings Account</span>
                  <span className="text-sm font-mono font-bold text-slate-100">{result.usdAccount}</span>
                </div>
                {result.mbActivationCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Mobile Banking Code</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{result.mbActivationCode}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setResult(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
              >
                Open Another Junior Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
