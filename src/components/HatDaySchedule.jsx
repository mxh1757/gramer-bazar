import React from "react";
import { Sun, Calendar, MapPin } from "lucide-react";
import { DAY_NAMES_BN } from "@/lib/locations";
import { cn } from "@/lib/utils";

export default function HatDaySchedule({ hatDays, locationLabel }) {
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Sun className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Hat Day Schedule</h3>
          <p className="text-xs text-slate-500">{locationLabel || "Your area"}</p>
        </div>
      </div>

      {hatDays.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No hat days listed here yet
        </div>
      ) : (
        <div className="space-y-2">
          {hatDays.map((hd, i) => {
            const isToday = hd.day_of_week === dayName;
            return (
              <div
                key={hd.id || i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition",
                  isToday ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200"
                )}
              >
                <div className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0",
                  isToday ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                )}>
                  <Sun className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-bold uppercase">{hd.day_of_week?.slice(0, 3)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-900 truncate">{hd.name}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{[hd.union, hd.upazila].filter(Boolean).join(", ")}</span>
                  </div>
                  {hd.specialty && <p className="text-xs text-emerald-600 font-medium mt-0.5 truncate">{hd.specialty}</p>}
                </div>
                {isToday && (
                  <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase shrink-0">Today</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}