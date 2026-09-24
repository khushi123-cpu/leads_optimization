import { FunnelSummary, Lead } from '../types/crm';

export const BENCHMARK_METRICS: FunnelSummary = {
  totalLeads: 5000,
  demosScheduled: 3229,
  demosJoined: 2060,
  demosCompleted: 1786,
  converted: 362,
  
  scheduledRate: (3229 / 5000) * 100, // 64.58%
  joinRate: (2060 / 3229) * 100,      // 63.80%
  completionRate: (1786 / 2060) * 100,// 86.70%
  conversionRate: (362 / 1786) * 100, // 20.27%
  overallConversionRate: (362 / 5000) * 100, // 7.24%
  
  noShows: 3229 - 2060, // 1,169
  joinedToConvertedRate: (362 / 2060) * 100, // 17.57%
  expectedLostCustomers: Math.round(1169 * (362 / 2060)), // 205
  estimatedLeakageTotal: Math.round(1169 * (362 / 2060) * 60000), // ~₹12,324,272 (₹12.3M)
  estimatedMonthlyLeakage: Math.round((1169 * (362 / 2060) * 60000) / 2), // ~₹6.16M / month
  
  shortWaitCount: 3229 - 1285, // 1,944
  shortWaitJoined: Math.round((3229 - 1285) * 0.7495), // ~1,457
  shortWaitJoinRate: 74.95,
  
  longWaitCount: 1285,
  longWaitJoined: Math.round(1285 * 0.4693), // ~603
  longWaitJoinRate: 46.93,
  
  attendanceDropPctPoints: 74.95 - 46.93, // 28.02%
  potentialJoinGain: Math.round(1285 * (0.7495 - 0.4693)), // 360 additional joins
  potentialConversionsGain: Math.round(360 * 0.204), // 73 conversions
  potentialMonthlyGain: Math.round((73 * 60000) / 2), // ₹2.19M ~ ₹2.2M / mo
  conservativeMonthlyGain: Math.round((73 * 60000) / 4), // ₹1.1M / mo
};

export function calculateHoursDifference(createdAt: string, scheduledAt: string): number {
  try {
    const created = new Date(createdAt).getTime();
    const scheduled = new Date(scheduledAt).getTime();
    if (isNaN(created) || isNaN(scheduled)) return 0;
    const diffHours = (scheduled - created) / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10;
  } catch {
    return 0;
  }
}

export function computeFunnelMetrics(leads: Lead[], avgTicketValue: number = 60000): FunnelSummary {
  if (!leads || leads.length === 0) {
    return BENCHMARK_METRICS;
  }

  const totalLeads = leads.length;
  const scheduledLeads = leads.filter(l => Boolean(l.demo_scheduled_at));
  const demosScheduled = scheduledLeads.length;
  const demosJoined = leads.filter(l => l.demo_joined).length;
  const demosCompleted = leads.filter(l => l.demo_completed).length;
  const converted = leads.filter(l => l.converted).length;

  const noShows = Math.max(0, demosScheduled - demosJoined);
  const joinedToConvertedRate = demosJoined > 0 ? (converted / demosJoined) * 100 : 0;
  const expectedLostCustomers = Math.round(noShows * (joinedToConvertedRate / 100));
  const estimatedLeakageTotal = expectedLostCustomers * avgTicketValue;
  // Over a 2-month dataset reference:
  const estimatedMonthlyLeakage = Math.round(estimatedLeakageTotal / 2);

  // Group by wait time:
  let shortWaitCount = 0;
  let shortWaitJoined = 0;
  let longWaitCount = 0;
  let longWaitJoined = 0;

  scheduledLeads.forEach(lead => {
    const hours = lead.hours_to_demo ?? calculateHoursDifference(lead.created_at, lead.demo_scheduled_at);
    if (hours > 48) {
      longWaitCount++;
      if (lead.demo_joined) longWaitJoined++;
    } else {
      shortWaitCount++;
      if (lead.demo_joined) shortWaitJoined++;
    }
  });

  const shortWaitJoinRate = shortWaitCount > 0 ? (shortWaitJoined / shortWaitCount) * 100 : 74.95;
  const longWaitJoinRate = longWaitCount > 0 ? (longWaitJoined / longWaitCount) * 100 : 46.93;
  const attendanceDropPctPoints = Math.max(0, shortWaitJoinRate - longWaitJoinRate);

  const potentialJoinGain = Math.round(longWaitCount * (attendanceDropPctPoints / 100));
  // conversion rate among long wait joiners (approx 20.4% or observed)
  const longWaitConversionRate = longWaitJoined > 0 
    ? (leads.filter(l => (l.hours_to_demo ?? 0) > 48 && l.converted).length / longWaitJoined) 
    : 0.204;
    
  const potentialConversionsGain = Math.round(potentialJoinGain * (longWaitConversionRate || 0.204));
  const potentialMonthlyGain = Math.round((potentialConversionsGain * avgTicketValue) / 2);
  const conservativeMonthlyGain = Math.round(potentialMonthlyGain / 2);

  return {
    totalLeads,
    demosScheduled,
    demosJoined,
    demosCompleted,
    converted,
    scheduledRate: totalLeads > 0 ? (demosScheduled / totalLeads) * 100 : 0,
    joinRate: demosScheduled > 0 ? (demosJoined / demosScheduled) * 100 : 0,
    completionRate: demosJoined > 0 ? (demosCompleted / demosJoined) * 100 : 0,
    conversionRate: demosCompleted > 0 ? (converted / demosCompleted) * 100 : 0,
    overallConversionRate: totalLeads > 0 ? (converted / totalLeads) * 100 : 0,
    noShows,
    joinedToConvertedRate,
    expectedLostCustomers,
    estimatedLeakageTotal,
    estimatedMonthlyLeakage,
    shortWaitCount,
    shortWaitJoined,
    shortWaitJoinRate,
    longWaitCount,
    longWaitJoined,
    longWaitJoinRate,
    attendanceDropPctPoints,
    potentialJoinGain,
    potentialConversionsGain,
    potentialMonthlyGain,
    conservativeMonthlyGain,
  };
}

export function formatINR(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatMillionINR(num: number): string {
  // Common format requested by user: ₹12.3M, ₹6.16M, ₹2.2M
  if (num >= 1000000) {
    return `₹${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}
