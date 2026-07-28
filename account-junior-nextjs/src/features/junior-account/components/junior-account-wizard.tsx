'use client';

import React, { useState, useEffect } from 'react';
import {
  processJuniorAccountOpening,
  fetchBranches,
  fetchOccupations,
  checkPhone,
  sendOtp,
  verifyOtp,
  getCustomerInfoByCif,
  JuniorCustomerPayload,
  JuniorAccountResponse,
  CustomerInfo,
} from '../services/junior-account-service';
import {
  ShieldCheck,
  UserCheck,
  CreditCard,
  Sparkles,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Upload,
  Baby,
  AlertCircle,
  Phone,
  KeyRound,
  FileSpreadsheet,
  User,
  Building,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

export function JuniorAccountWizard() {
  // Main Steps:
  // 1 = Option Selection (With NID vs No NID)
  // 2 = Parent Phone Pre-Check & OTP Verification
  // 3 = Junior Personal Details (Animated UI)
  // 4 = Reference Document Upload
  // 5 = Junior Phone & OTP Verification
  // 6 = Location & Branch Selection
  // 7 = Review & Final Submit
  // 8 = Success Result
  const [step, setStep] = useState<number>(1);
  const [hasNid, setHasNid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);

  // Modals & States
  const [parentPhoneWarningModal, setParentPhoneWarningModal] = useState<boolean>(false);
  const [unregisteredPhone, setUnregisteredPhone] = useState<string>('');
  
  // OTP States
  const [parentOtpSent, setParentOtpSent] = useState<boolean>(false);
  const [parentOtpCode, setParentOtpCode] = useState<string>('');
  const [parentVerified, setParentVerified] = useState<boolean>(false);
  const [parentInfo, setParentInfo] = useState<CustomerInfo | null>(null);

  const [juniorOtpSent, setJuniorOtpSent] = useState<boolean>(false);
  const [juniorOtpCode, setJuniorOtpCode] = useState<string>('');
  const [juniorVerified, setJuniorVerified] = useState<boolean>(false);

  // Reference document state
  const [refDocType, setRefDocType] = useState<string>('BIRTH_CERTIFICATE');
  const [refDocFileName, setRefDocFileName] = useState<string>('');

  // Form Payload
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
    guardian_cif: '',
    referral_id: '',
    reference_doc_type: 'BIRTH_CERTIFICATE',
    reference_doc_name: '',
  });

  const [result, setResult] = useState<JuniorAccountResponse | null>(null);

  useEffect(() => {
    fetchBranches().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setBranches(data);
        if (!formData.branch_code && data[0]?.code) {
          setFormData((prev) => ({ ...prev, branch_code: data[0].code }));
        }
      }
    });
    fetchOccupations().then((data) => {
      if (Array.isArray(data)) {
        setOccupations(data);
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
      legal_id: withNidMode ? prev.legal_id : '',
      family_name: withNidMode ? prev.family_name : '',
      given_name: withNidMode ? prev.given_name : '',
    }));
    // If NO NID mode, go to Parent Phone Pre-check (Step 2)
    if (!withNidMode) {
      setStep(2);
    } else {
      setStep(3); // Direct With NID form
    }
  };

  // ==========================================
  // Step 2: Parent Phone Pre-Check & OTP
  // ==========================================
  const handleCheckParentPhone = async () => {
    if (!formData.guardian_phone) {
      setErrorMsg('Please enter parent/guardian phone number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await checkPhone(formData.guardian_phone);
      if (!res.hasAccount) {
        // Parent phone not registered in MB Core → Show Alert Modal
        setUnregisteredPhone(formData.guardian_phone);
        setParentPhoneWarningModal(true);
        return;
      }

      // Phone exists in MB Core → Get Parent Customer Info by CIF if available
      if (res.cif) {
        setFormData((prev) => ({ ...prev, guardian_cif: res.cif }));
        try {
          const info = await getCustomerInfoByCif(res.cif);
          setParentInfo(info);
          if (info.names && info.names.length > 0) {
            setFormData((prev) => ({ ...prev, guardian_name: info.names![0] }));
          }
          if (info.legalId) {
            setFormData((prev) => ({ ...prev, guardian_legal_id: info.legalId }));
          }
          if (info.streets && info.streets.length > 0) {
            setFormData((prev) => ({ ...prev, legal_address: info.streets![0] }));
          }
        } catch (e) {
          console.warn('Parent info lookup non-critical error', e);
        }
      }

      // Send OTP to parent
      await sendOtp(formData.guardian_phone);
      setParentOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to verify parent phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyParentOtp = async () => {
    if (!parentOtpCode || parentOtpCode.length !== 6) {
      setErrorMsg('Please enter valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyOtp(formData.guardian_phone || '', parentOtpCode);
      setParentVerified(true);
      setStep(3); // Proceed to Junior Personal Details
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Step 5: Junior Phone OTP Verification
  // ==========================================
  const handleSendJuniorOtp = async () => {
    if (!formData.phone_number) {
      setErrorMsg('Please enter junior contact phone number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await sendOtp(formData.phone_number);
      setJuniorOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send OTP to junior phone.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJuniorOtp = async () => {
    if (!juniorOtpCode || juniorOtpCode.length !== 6) {
      setErrorMsg('Please enter valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyOtp(formData.phone_number || '', juniorOtpCode);
      setJuniorVerified(true);
      setStep(6); // Proceed to Branch & Location Selection
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // File upload change handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRefDocFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        reference_doc_type: refDocType,
        reference_doc_name: file.name,
      }));
    }
  };

  // Final submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await processJuniorAccountOpening(formData);
      setResult(res);
      setStep(8);
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
            <Baby className="w-4 h-4" /> Junior Account Online Opening
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
          {/* Progress Indicator */}
          {step <= 7 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-2">
                <span>Step {step} of 7</span>
                <span>
                  {step === 1 && 'Option Selection'}
                  {step === 2 && 'Parent Phone Verification'}
                  {step === 3 && 'Junior Personal Details'}
                  {step === 4 && 'Reference Document Upload'}
                  {step === 5 && 'Junior Phone Verification'}
                  {step === 6 && 'Location & Branch'}
                  {step === 7 && 'Review & Final Submit'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${(step / 7) * 100}%` }}
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
                    Child has an existing Cambodian National ID card. Enter NID to pre-fill details automatically.
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
                    <FileText className="w-3.5 h-3.5" /> Parent Verification First
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    No National ID (NO NID)
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    For minors without NID. Verify parent phone number first, then enter child details and reference document.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Select Option <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PARENT PHONE PRE-CHECK & OTP (NO NID FLOW) */}
          {step === 2 && !hasNid && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Step 1: Parent / Guardian Verification</h2>
                <p className="text-xs text-slate-400">Please enter a parent phone number registered in CPBank Mobile Banking</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Registered Parent Phone Number *</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="guardian_phone"
                      value={formData.guardian_phone || ''}
                      onChange={handleChange}
                      placeholder="070411260"
                      disabled={parentOtpSent || parentVerified}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors disabled:opacity-50"
                    />
                    {!parentOtpSent && (
                      <button
                        type="button"
                        onClick={handleCheckParentPhone}
                        disabled={loading || !formData.guardian_phone}
                        className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} Verify Phone
                      </button>
                    )}
                  </div>
                </div>

                {/* Parent Info Auto-Filled */}
                {parentInfo && (
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <UserCheck className="w-4 h-4" /> Parent Customer Found in CPBank Core!
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div><span className="text-slate-400">Guardian CIF:</span> {parentInfo.cif}</div>
                      <div><span className="text-slate-400">Guardian NID:</span> {parentInfo.legalId || 'N/A'}</div>
                      <div className="col-span-2"><span className="text-slate-400">Guardian Name:</span> {parentInfo.names ? parentInfo.names.join(' / ') : 'N/A'}</div>
                    </div>
                  </div>
                )}

                {/* OTP Input Box */}
                {parentOtpSent && !parentVerified && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-medium text-teal-400">Enter 6-Digit Parent OTP Code *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={parentOtpCode}
                        onChange={(e) => setParentOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-lg tracking-widest text-teal-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyParentOtp}
                        disabled={loading || parentOtpCode.length !== 6}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Options
                </button>
                {parentVerified && (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    Enter Junior Details <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: JUNIOR PERSONAL DETAILS (ANIMATED FORM) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Step 2: Junior Personal Details</h2>
                  <p className="text-xs text-slate-400">Enter full child personal information</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${hasNid ? 'bg-teal-500/20 text-teal-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {hasNid ? 'WITH NID' : 'NO NID'}
                </span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">First Name (Khmer) *</label>
                  <input
                    type="text"
                    name="first_name_kh"
                    value={formData.first_name_kh || ''}
                    onChange={handleChange}
                    placeholder="ឧ. សុវណ្ណ"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Last Name (Khmer) *</label>
                  <input
                    type="text"
                    name="last_name_kh"
                    value={formData.last_name_kh || ''}
                    onChange={handleChange}
                    placeholder="ឧ. គឹម"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Family Name (English) *</label>
                  <input
                    type="text"
                    name="family_name"
                    value={formData.family_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. KIM"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Given Name (English) *</label>
                  <input
                    type="text"
                    name="given_name"
                    value={formData.given_name || ''}
                    onChange={handleChange}
                    placeholder="e.g. SOVANN"
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

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Marital Status *</label>
                  <select
                    name="marital_status"
                    value={formData.marital_status || 'SINGLE'}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Occupation *</label>
                  <select
                    name="occupation"
                    value={formData.occupation || 'STUDENT'}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  >
                    {occupations.length > 0 ? (
                      occupations.map((occ) => (
                        <option key={occ.code || occ.id} value={occ.code || occ.name}>
                          {occ.name || occ.code}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="STUDENT">Student</option>
                        <option value="UNDERAGE">Underage / Minor</option>
                        <option value="EMPLOYEE">Employee</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Referral Staff ID (Optional)</label>
                  <input
                    type="text"
                    name="referral_id"
                    value={formData.referral_id || ''}
                    onChange={handleChange}
                    placeholder="Staff referral code e.g. 3996"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(hasNid ? 1 : 2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  Upload Reference Doc <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REFERENCE DOCUMENT UPLOAD */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Step 3: Reference Document Upload</h2>
                <p className="text-xs text-slate-400">Select supporting identification document for minor registration</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Select Document Type *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', icon: Baby },
                      { id: 'PARENT_NID', label: 'Parent NID', icon: CreditCard },
                      { id: 'OTHER_DOC', label: 'Family Book / Other', icon: FileText },
                    ].map((doc) => {
                      const IconComp = doc.icon;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setRefDocType(doc.id);
                            setFormData((prev) => ({ ...prev, reference_doc_type: doc.id }));
                          }}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                            refDocType === doc.id
                              ? 'bg-teal-500/10 border-teal-400 text-teal-300 font-bold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <IconComp className="w-6 h-6" />
                          <span className="text-xs">{doc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload File Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Upload Document File *</label>
                  <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-teal-400 bg-slate-950/50 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-teal-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-200">
                      {refDocFileName ? refDocFileName : 'Click to Upload Document File'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG, PDF (Max 10MB)</span>
                    <input type="file" onChange={handleFileUpload} accept="image/*,.pdf" className="hidden" />
                  </label>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  Junior Phone OTP <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: JUNIOR PHONE VERIFICATION */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Step 4: Junior Contact Phone Verification</h2>
                <p className="text-xs text-slate-400">Enter junior contact phone number for account notifications</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Junior Phone Number *</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleChange}
                      placeholder="012345678"
                      disabled={juniorOtpSent || juniorVerified}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-400 text-slate-100 text-sm focus:outline-none transition-colors disabled:opacity-50"
                    />
                    {!juniorOtpSent && (
                      <button
                        type="button"
                        onClick={handleSendJuniorOtp}
                        disabled={loading || !formData.phone_number}
                        className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} Send OTP
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP Input Box */}
                {juniorOtpSent && !juniorVerified && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-medium text-teal-400">Enter 6-Digit Junior OTP Code *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={juniorOtpCode}
                        onChange={(e) => setJuniorOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-lg tracking-widest text-teal-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyJuniorOtp}
                        disabled={loading || juniorOtpCode.length !== 6}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {juniorVerified && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Junior Phone Verified Successfully!
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all"
                >
                  Branch Selection <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: LOCATION & BRANCH SELECTION */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Step 5: Location & Branch Selection</h2>
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
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all"
                >
                  Review Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & FINAL SUBMIT */}
          {step === 7 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-slate-100">Step 6: Review & Final Confirm</h2>
                <p className="text-xs text-slate-400">Verify all information before final creation</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Registration Mode:</span>
                  <p className="font-semibold text-teal-400 mt-0.5">{hasNid ? 'With National ID' : 'Without National ID'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Junior Full Name:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.last_name_kh} {formData.first_name_kh} ({formData.family_name} {formData.given_name})</p>
                </div>
                <div>
                  <span className="text-slate-400">Date of Birth:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Guardian Name & CIF:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.guardian_name || 'N/A'} (CIF: {formData.guardian_cif || 'N/A'})</p>
                </div>
                <div>
                  <span className="text-slate-400">Guardian Phone:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.guardian_phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Reference Doc Type:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{formData.reference_doc_type}</p>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(6)}
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
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating Accounts...
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

          {/* STEP 8: SUCCESS RESULT */}
          {step === 8 && result && (
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
                  setParentVerified(false);
                  setJuniorVerified(false);
                  setParentOtpSent(false);
                  setJuniorOtpSent(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
              >
                Open Another Junior Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* UNREGISTERED PARENT PHONE WARNING MODAL */}
      {parentPhoneWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              លេខទូរស័ព្ទអាណាព្យាបាលមិនទាន់ចុះឈ្មោះ!
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
              លេខទូរស័ព្ទ <span className="font-bold text-amber-400">{unregisteredPhone}</span> មិនទាន់មានគណនី Mobile Banking នៅក្នុងប្រព័ន្ធ CPBank ទេ។
              <br /><br />
              សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាលដែលមានចុះឈ្មោះ Mobile Banking រួចរាល់ ឬបង្កើតគណនីធនាគារធម្មតាជាមុនសិន។
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setParentPhoneWarningModal(false)}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors"
              >
                យល់ព្រម (Understand)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
