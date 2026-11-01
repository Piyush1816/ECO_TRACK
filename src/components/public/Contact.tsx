import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  FileCheck2 
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    organizationName: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section className="py-14 lg:py-20 bg-white border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Platform Helpdesk & Regional Offices */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">Helpdesk & Compliance</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231C] mt-1">
                Get in touch with the EcoTrack team
              </h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Have questions about municipal drop-off points, collection partner onboarding, recycling facility audits, or corporate EPR credit quotas? Our environmental specialists are here to assist.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#E2E8E4] text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#17231C] block">Direct Electronic Mail</span>
                  <a href="mailto:support@ecotrack.org" className="text-[#64748B] hover:text-[#15803D]">
                    support@ecotrack.org (Inquiries)
                  </a>
                  <div className="text-[#64748B]">compliance@ecotrack.org (EPR Audits)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#17231C] block">Toll-Free Helpline</span>
                  <span className="text-[#64748B] font-mono tabular-nums">+1 (800) 492-3268 (ECO-WASTE)</span>
                  <div className="text-[11px] text-[#64748B]">Mon – Sat: 8:00 AM – 7:00 PM EST</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#17231C] block">National Operations Centre</span>
                  <span className="text-[#64748B]">
                    EcoTrack Systems Inc., CleanTech Park, Building 4<br />
                    Sector 9, Sustainable Way, Innovation District
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] text-xs space-y-1.5">
              <span className="font-semibold text-[#17231C] block flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#15803D]" />
                Corporate ITAD & EPR Consultation
              </span>
              <p className="text-[#64748B]">
                Organizations disposing of {'>'} 200 kg of servers, workstations, or batteries receive dedicated on-site logistics and a tamper-sealed transport manifest.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-[#F8FAF8] p-6 lg:p-8 rounded-2xl border border-[#E2E8E4]">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#17231C]">Inquiry Dispatched Successfully</h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Thank you, <span className="font-medium text-[#17231C]">{formData.name}</span>. A logistics officer or EPR compliance specialist will review your details and respond within 24 business hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        inquiryType: 'general',
                        organizationName: '',
                        message: ''
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#15803D] bg-white border border-[#E2E8E4] rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-[#17231C]">
                  Send a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#17231C] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#17231C] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#17231C] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#17231C] mb-1">
                      Inquiry Nature
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    >
                      <option value="general">General Platform Inquiry</option>
                      <option value="pickup">Household Pickup Question</option>
                      <option value="partner">Collection Partner Licensing</option>
                      <option value="recycler">Recycler Facility Onboarding</option>
                      <option value="enterprise">Corporate ITAD & EPR Audit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17231C] mb-1">
                    Organization / Entity Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp or Residential"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17231C] mb-1">
                    Message / Specifications *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please specify estimated e-waste weight, hardware categories, or licensing queries..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Dispatch...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
