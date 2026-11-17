"use client";

import React, { useState } from "react";
import {
  Plane,
  Building,
  Car,
  Award,
  Utensils,
  Train,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Luggage,
  Bus,
  MapPin,
  Maximize2,
  X,
  Navigation,
  ArrowRight,
} from "lucide-react";
import { ItineraryItem, Priority, ItemStatus, DisruptionEvent, RecoveryPlan } from "@/types";
import { RouteMap } from "./RouteMap";
import type { SimulatedWeatherImpact } from "@/core/RecoveryEngine";

export interface ItineraryViewProps {
  items: ItineraryItem[];
  activeDisruptedItemIds: string[];
  downstreamItemIds: string[];
  mapComponent?: React.ReactNode;
  tripSource?: string;
  tripDestination?: string;
  activeDisruption?: DisruptionEvent | null;
  selectedRecoveryPlan?: RecoveryPlan | null;
  simulatedImpact?: SimulatedWeatherImpact | null | any;

}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  items,
  activeDisruptedItemIds,
  downstreamItemIds,
  tripSource = "Delhi",
  tripDestination = "Jaipur",
  activeDisruption,
  selectedRecoveryPlan,
  simulatedImpact,
}) => {
  const [expandedCardMapId, setExpandedCardMapId] = useState<string | null>(null);
  const [modalMapItem, setModalMapItem] = useState<ItineraryItem | null>(null);

  const toggleCardMap = (itemId: string) => {
    setExpandedCardMapId((prev) => (prev === itemId ? null : itemId));
  };

  const getTypeIcon = (type: ItineraryItem["type"]) => {
    switch (type) {
      case "FLIGHT":
        return <Plane className="w-4 h-4 text-[#1C6FD9]" />;
      case "HOTEL":
        return <Building className="w-4 h-4 text-[#7E22CE]" />;
      case "TRANSFER":
      case "TAXI":
        return <Car className="w-4 h-4 text-[#047857]" />;
      case "EVENT":
        return <Award className="w-4 h-4 text-[#D97706]" />;
      case "ACTIVITY":
        return <Utensils className="w-4 h-4 text-[#D97706]" />;
      case "TRAIN":
        return <Train className="w-4 h-4 text-[#B45309]" />;
      case "BUS":
        return <Bus className="w-4 h-4 text-[#0284C7]" />;
      default:
        return <HelpCircle className="w-4 h-4 text-[#1C6FD9]" />;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse">
            ★ Critical Anchor
          </span>
        );
      case "HIGH":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/40">
            High Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0]">
            Flexible
          </span>
        );
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case "NORMAL":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#047857] bg-[#E6FBF7] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Confirmed
          </span>
        );
      case "AFFECTED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-[#FFF9E6] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
            <AlertCircle className="w-3 h-3 text-[#F59E0B]" /> Delayed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#C13A1F] bg-[#FFECEC] px-2.5 py-0.5 rounded-full border border-[#FF5A5A]/30">
            <ShieldAlert className="w-3 h-3 text-[#FF5A5A]" /> Cancelled
          </span>
        );
      case "AT_RISK":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-[#FFF9E6] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-[#F59E0B]" /> Buffer Squeezed
          </span>
        );
      case "RECOVERED":
      case "RESCHEDULED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-white bg-[#047857] px-2.5 py-0.5 rounded-full border border-[#065F46] shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> ✓ Recovered & Confirmed
          </span>
        );
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FF] border border-[#74BCFB]/40 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C6FD9]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C6FD9]">
                Deterministic Graph Timeline
              </span>
            </div>
            <h2 className="font-sans text-2xl font-extrabold text-[#0F1B2B] tracking-tight">
              Confirmed Connected Itinerary
            </h2>
            <p className="text-xs text-[#4A5B70] font-medium mt-0.5">
              Every leg carries priority, structured cancellation rules, transfer buffers, and graph dependencies.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5B70] bg-[#F8FBFF] px-3.5 py-1.5 rounded-full border border-[#74BCFB]/30 shadow-2xs self-start sm:self-auto">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Critical Anchor
            <span className="inline-block w-2 h-2 rounded-full bg-[#1C6FD9] ml-2" /> High
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400 ml-2" /> Medium
          </div>
        </div>

        {/* Full-width Timeline Cards */}
        <div className="relative pl-8 sm:pl-10 space-y-4 before:content-[''] before:absolute before:left-4 sm:before:left-5 before:-translate-x-1/2 before:top-4 before:bottom-4 before:w-[2px] before:bg-[#74BCFB]/30">
          {items.length === 0 ? (
            <div className="space-y-4 py-1">
              {[1, 2, 3].map((skeletonIdx) => (
                <div
                  key={skeletonIdx}
                  className="p-5 sm:p-6 rounded-2xl border border-gray-200/70 bg-gradient-to-r from-gray-50/70 via-white to-gray-50/70 animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-44 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-8 w-full bg-gray-100/70 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            items.map((item, index) => {
            const isDirectDisrupted = activeDisruptedItemIds.includes(item.id);
            const isDownstream = downstreamItemIds.includes(item.id);
            const isRecovered = item.status === "RECOVERED" || item.status === "RESCHEDULED";
            const isMapExpanded = expandedCardMapId === item.id;

            const itemSource = item.departureLocation || tripSource || "Delhi";
            const itemDestination = item.arrivalLocation || item.location || tripDestination || "Jaipur";

            return (
              <div key={item.id || index} className="relative group">
                {/* Timeline Node Dot (Mathematically concentric with vertical line) */}
                <div className="absolute -left-8 sm:-left-10 top-5 w-8 sm:w-10 flex items-center justify-center pointer-events-none z-10">
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white ring-2 transition-transform ${
                      isRecovered
                        ? "bg-emerald-500 ring-emerald-300 scale-110"
                        : item.priority === "CRITICAL"
                        ? "bg-amber-500 ring-amber-300 scale-110"
                        : isDirectDisrupted
                        ? "bg-red-500 ring-red-300 scale-110"
                        : isDownstream
                        ? "bg-amber-500 ring-amber-300"
                        : "bg-[#1C6FD9] ring-blue-200"
                    }`}
                  />
                </div>

                {/* Itinerary Leg Card */}
                <div
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    isRecovered
                      ? "bg-gradient-to-r from-emerald-50/50 via-white to-white border-emerald-300 ring-2 ring-emerald-500/15 shadow-sm"
                      : item.priority === "CRITICAL"
                      ? "bg-gradient-to-r from-amber-50/40 via-white to-white border-amber-300 ring-1 ring-amber-300 shadow-sm"
                      : isDirectDisrupted
                      ? "bg-gradient-to-r from-red-50/40 via-white to-white border-red-300 ring-1 ring-red-300 shadow-sm"
                      : isDownstream
                      ? "bg-gradient-to-r from-amber-50/30 via-white to-white border-amber-200 shadow-xs"
                      : "bg-white border-gray-200/90 hover:border-[#74BCFB]/60 shadow-[0_4px_20px_rgba(10,61,115,0.04)] hover:shadow-[0_8px_24px_rgba(10,61,115,0.07)]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0F6FC] border border-[#74BCFB]/30 flex items-center justify-center shadow-xs shrink-0">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-sans font-extrabold text-base sm:text-lg text-[#0F1B2B]">
                            {item.title}
                          </h3>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <span className="text-xs text-[#4A5B70] font-medium">
                          {item.provider}
                          {item.referenceNumber && (
                            <span className="font-mono text-gray-400 ml-1">
                              • Ref: {item.referenceNumber}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                      {getStatusBadge(item.status)}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F0F6FC] text-[#1C6FD9] border border-[#74BCFB]/30">
                        Buffer: {item.bufferMinutes}m
                      </span>

                      {/* View Route Map Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleCardMap(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isMapExpanded
                            ? "bg-[#0F1B2B] text-white"
                            : "bg-[#EAF5FF] hover:bg-[#1C6FD9] text-[#1C6FD9] hover:text-white border border-[#74BCFB]/40"
                        }`}
                        title="Access live route map on this card"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{isMapExpanded ? "Hide Map" : "View Map"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#F8FBFF] p-3 rounded-xl border border-[#74BCFB]/20 space-y-0.5">
                      <span className="text-[#4A5B70] block text-[10px] font-extrabold uppercase tracking-wider">
                        Scheduled Time
                      </span>
                      <span className="font-bold text-[#0F1B2B] text-sm">
                        {item.startTime} &rarr; {item.endTime}
                      </span>
                    </div>

                    <div className="bg-[#F8FBFF] p-3 rounded-xl border border-[#74BCFB]/20 space-y-0.5">
                      <span className="text-[#4A5B70] block text-[10px] font-extrabold uppercase tracking-wider">
                        Location / Station
                      </span>
                      <span className="font-semibold text-[#0F1B2B] truncate block">
                        {item.location || item.arrivalLocation}
                      </span>
                    </div>

                    <div className="bg-[#F8FBFF] p-3 rounded-xl border border-[#74BCFB]/20 space-y-0.5">
                      <span className="text-[#4A5B70] block text-[10px] font-extrabold uppercase tracking-wider">
                        Cost & Policy
                      </span>
                      <span className="font-bold text-[#0F1B2B]">
                        ₹{item.cost.toLocaleString()}{" "}
                        <span className="text-[11px] font-normal text-[#4A5B70]">
                          ({item.cancellationPolicy[0]?.refundPercent || 0}% refundable)
                        </span>
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <div
                      className={`mt-3 pt-2.5 border-t border-dashed text-xs font-semibold flex items-center gap-1.5 ${
                        isRecovered
                          ? "border-emerald-200 text-[#047857]"
                          : "border-red-200 text-[#C13A1F]"
                      }`}
                    >
                      {isRecovered ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                      )}
                      <span>{item.notes}</span>
                    </div>
                  )}

                  {item.metadata?.hasLuggage && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4A5B70]">
                      <Luggage className="w-3.5 h-3.5 text-[#1C6FD9]" />
                      <span>Checked & carry-on luggage attached to this leg</span>
                    </div>
                  )}

                  {/* Interactive Map rendered on that card when toggled */}
                  {isMapExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 bg-[#F8FBFF] p-3 rounded-2xl border border-[#74BCFB]/30">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-xs font-bold text-[#0F1B2B] flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-[#1C6FD9]" />
                            Live Route Corridor: <strong className="text-[#1C6FD9]">{itemSource} &rarr; {itemDestination}</strong>
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#4A5B70]">
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalMapItem(item)}
                            className="text-xs font-bold text-[#1C6FD9] hover:text-[#1558B0] flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-[#74BCFB]/40 transition-all hover:bg-[#EAF5FF] shadow-2xs cursor-pointer"
                            title="Open interactive map in full-screen modal"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Full Screen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedCardMapId(null)}
                            className="text-xs font-bold text-[#4A5B70] hover:text-[#C13A1F] flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-gray-200 transition-all hover:bg-red-50 shadow-2xs cursor-pointer"
                            title="Hide map on card"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-3xl overflow-hidden shadow-xs">
                        <RouteMap
                          source={itemSource}
                          destination={itemDestination}
                          currentTransitType={item.type}
                          activeDisruption={activeDisruption}
                          selectedRecoveryPlan={selectedRecoveryPlan}
                          simulatedImpact={simulatedImpact}
                          height="380px"

                          title={`${item.title} — Live Transit Route Tracing`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Fullscreen Map Modal */}
        {modalMapItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setModalMapItem(null)}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-[0_20px_60px_rgba(10,61,115,0.2)] w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-[#F8FBFF] border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#74BCFB]/40 flex items-center justify-center shadow-xs">
                    {getTypeIcon(modalMapItem.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans font-extrabold text-lg text-[#0F1B2B]">
                        {modalMapItem.title}
                      </h3>
                      <span className="text-[11px] font-bold bg-[#EAF5FF] text-[#1C6FD9] px-2.5 py-0.5 rounded-full border border-[#74BCFB]/40">
                        {modalMapItem.departureLocation || tripSource} &rarr; {modalMapItem.arrivalLocation || modalMapItem.location || tripDestination}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5B70] font-medium mt-0.5">
                      Live interactive transit route tracing & corridor navigation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMapItem(null)}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#4A5B70] hover:bg-red-50 hover:text-red-600 transition-all shadow-xs cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Map View */}
              <div className="p-4 overflow-y-auto flex-1 bg-white">
                <RouteMap
                  source={modalMapItem.departureLocation || tripSource}
                  destination={modalMapItem.arrivalLocation || modalMapItem.location || tripDestination}
                  currentTransitType={modalMapItem.type}
                  activeDisruption={activeDisruption}
                  selectedRecoveryPlan={selectedRecoveryPlan}
                  simulatedImpact={simulatedImpact}
                  height="520px"
                  title={`${modalMapItem.title} — Route Tracing`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
