import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  Package, 
  Check, 
  FileCheck 
} from 'lucide-react';
import { store } from '../../lib/store';
import { PickupRequest } from '../../types';
import { INITIAL_PARTNER_DETAILS } from '../../lib/seedData';

interface PartnerDashboardProps {
  onOpenCollectWeight: (pickup: PickupRequest) => void;
  activeSubTab: string;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  onOpenCollectWeight,
  activeSubTab
}) => {
  const currentUser = store.getCurrentUser();
  const state = store.getState();
  const partnerDetail = INITIAL_PARTNER_DETAILS[0];

  const [schedulingPickupId, setSchedulingPickupId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>('2026-11-03T10:00');
  const [assignedAgentName, setAssignedAgentName] = useState<string>('Robert Gomez');
  const [vehicleReg, setVehicleReg] = useState<string>('EV-TRK-708');

  // Filter pickups assigned to this partner (or all in demo mode)
  const assignedPickups = state.pickups.filter(
    p => p.assignment && p.assignment.partnerId === currentUser.id
  );

  const pendingAcceptance = assignedPickups.filter(
    p => p.assignment?.status === 'assigned'
  );
  const readyToSchedule = assignedPickups.filter(
    p => p.assignment?.status === 'accepted' && p.status === 'assigned'
  );
  const readyToCollect = assignedPickups.filter(
    p => p.status === 'scheduled'
  );
  const completedCollections = assignedPickups.filter(
    p => ['collected', 'verified', 'recycled'].includes(p.status)
  );

  const totalCollectedKg = completedCollections.reduce(
    (sum, p) => sum + (p.collectionRecord?.actualWeightKg || 0), 0
  );

  const handleAccept = (requestId: string) => {
    store.respondToAssignment(requestId, true);
  };

  const handleReject = (requestId: string) => {
    const reason = window.prompt('Specify rationale for route rejection (e.g., Fleet capacity exceeded):') || 'Capacity limit';
    store.respondToAssignment(requestId, false, reason);
  };

  const handleScheduleSubmit = (requestId: string) => {
    store.schedulePickup(requestId, scheduledAt, assignedAgentName, vehicleReg);
    setSchedulingPickupId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Partner License Status Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">
              Authorized Logistics Agency
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> License Active: {partnerDetail.licenseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            {partnerDetail.companyName}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
            <span>Fleet Size: {partnerDetail.fleetSize} Electric Vans</span>
            <span>·</span>
            <span>Zones: {partnerDetail.serviceZones.join(', ')}</span>
          </div>
        </div>

        <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] text-xs">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold">Scale Calibration</span>
          <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> ISO/IEC 17025 Certified
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Pending Dispatch</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums font-mono">
            {pendingAcceptance.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Requires acceptance</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Scheduled Routes</span>
          <div className="text-2xl font-extrabold text-[#15803D] mt-1 tabular-nums font-mono">
            {readyToCollect.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Active vehicle runs</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Executed Pickups</span>
          <div className="text-2xl font-extrabold text-[#17231C] mt-1 tabular-nums font-mono">
            {completedCollections.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Weighed & sealed</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Total Mass Collected</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums font-mono">
            {totalCollectedKg.toFixed(1)} <span className="text-xs font-sans font-normal text-[#64748B]">kg</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Dispatched to recyclers</span>
        </div>
      </div>

      {/* SECTION 1: Pending Acceptance Dispatches */}
      {pendingAcceptance.length > 0 && (
        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm text-amber-900">
                New Dispatches Awaiting Fleet Acceptance ({pendingAcceptance.length})
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-semibold">Admin Assigned</span>
          </div>

          <div className="space-y-3">
            {pendingAcceptance.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#17231C]">{p.requestNumber}</span>
                    <span className="font-semibold text-[#15803D]">{p.categoryName}</span>
                    <span className="text-[#64748B]">({p.estimatedWeightKg} kg est.)</span>
                  </div>
                  <div className="text-[#17231C] mt-1 font-medium">{p.itemDescription}</div>
                  <div className="text-[#64748B] mt-0.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{p.pickupAddress}, {p.pickupCity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleReject(p.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                  >
                    Reject Route
                  </button>
                  <button
                    onClick={() => handleAccept(p.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm"
                  >
                    Accept Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Ready to Schedule Pickups */}
      {readyToSchedule.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#17231C]">
            Accepted Assignments Ready for Scheduling ({readyToSchedule.length})
          </h3>

          <div className="space-y-3">
            {readyToSchedule.map((p) => (
              <div key={p.id} className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#15803D]">{p.requestNumber}</span>
                    <h4 className="font-bold text-sm text-[#17231C]">{p.userFullName} · {p.categoryName}</h4>
                    <p className="text-[#64748B] mt-0.5">{p.pickupAddress}, {p.pickupCity}</p>
                  </div>
                  <button
                    onClick={() => setSchedulingPickupId(schedulingPickupId === p.id ? null : p.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg shadow-sm self-start sm:self-auto"
                  >
                    {schedulingPickupId === p.id ? 'Close Scheduler' : 'Schedule Vehicle & Agent'}
                  </button>
                </div>

                {schedulingPickupId === p.id && (
                  <div className="p-4 bg-white rounded-lg border border-[#15803D] space-y-3 pt-3">
                    <h5 className="font-bold text-xs text-[#17231C]">Dispatch Details</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Pickup Date & Time</label>
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF8] border border-[#E2E8E4] rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Field Agent Name</label>
                        <input
                          type="text"
                          value={assignedAgentName}
                          onChange={(e) => setAssignedAgentName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF8] border border-[#E2E8E4] rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64748B] block mb-1">Vehicle Registration</label>
                        <input
                          type="text"
                          value={vehicleReg}
                          onChange={(e) => setVehicleReg(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F8FAF8] border border-[#E2E8E4] rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleScheduleSubmit(p.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded"
                      >
                        Confirm Route Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Active Scheduled Collections (Execute & Weigh) */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">
              En-Route Collections Ready for On-Site Weighing ({readyToCollect.length})
            </h3>
            <p className="text-xs text-[#64748B]">Collector must weigh on calibrated scale and attach serialized tamper tag</p>
          </div>
        </div>

        {readyToCollect.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No pending collections currently en-route. Check accepted dispatches above.
          </div>
        ) : (
          <div className="space-y-3">
            {readyToCollect.map((p) => (
              <div key={p.id} className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#15803D]">{p.requestNumber}</span>
                    <span className="font-semibold text-[#17231C]">{p.userFullName}</span>
                    <span className="text-[#64748B]">· {p.categoryName}</span>
                  </div>
                  <p className="text-[#17231C] mt-1">{p.itemDescription}</p>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {p.pickupAddress}, {p.pickupCity} · Est: {p.estimatedWeightKg} kg
                  </div>
                  <div className="text-[11px] text-teal-800 font-medium mt-1">
                    Assigned Agent: {p.assignment?.assignedAgentName} ({p.assignment?.vehicleRegistration})
                  </div>
                </div>

                <button
                  onClick={() => onOpenCollectWeight(p)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Record Actual Weight</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: Completed Historical Collections */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#17231C]">
          Submitted & Verified Collections ({completedCollections.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#64748B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Req Number</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Actual Weight</th>
                <th className="py-2.5 px-3">Seal Tag #</th>
                <th className="py-2.5 px-3">QA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {completedCollections.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#15803D]">{p.requestNumber}</td>
                  <td className="py-2.5 px-3 text-[#17231C]">{p.userFullName}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{p.categoryName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231C] tabular-nums">
                    {p.collectionRecord?.actualWeightKg} kg
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B]">
                    {p.collectionRecord?.sealTagNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    {p.weightVerification ? (
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        QA Verified ({p.weightVerification.verifiedWeightKg}kg)
                      </span>
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Awaiting Admin QA
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
