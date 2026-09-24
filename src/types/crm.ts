export type Geography = 'North America' | 'India' | 'Middle East' | 'UK & Europe' | 'Southeast Asia' | 'Other';
export type LeadSource = 'Meta Ads' | 'Google Search' | 'Referral' | 'Organic / SEO' | 'Inbound WhatsApp' | 'School Partner';
export type RepShift = 'Morning (08:00-16:00)' | 'Evening (16:00-00:00)' | 'Night (00:00-08:00)';

export type RescueStatus = 
  | 'needs_action'     // >48h delay, uncontacted
  | 'slot_preponed'    // Rescheduled to earlier slot (now fresh!)
  | 'reconfirmed'      // Parent confirmed they will attend original slot
  | 'unreachable'      // Follow up failed / no response
  | 'rescheduled_late' // Parent pushed it even later
  | 'unrescued_noshow' // Failed to join
  | 'converted'        // Won enrollment
  | 'on_track';        // <=48h or already joined

export interface Lead {
  lead_id: string;
  lead_source: string;
  geography: string;
  parent_timezone: string;
  created_at: string;           // ISO format YYYY-MM-DDTHH:mm:ss
  demo_scheduled_at: string;     // ISO format YYYY-MM-DDTHH:mm:ss
  rep_assigned: string;
  rep_shift: string;
  follow_up_attempts: number;
  demo_joined: boolean;
  demo_completed: boolean;
  converted: boolean;
  
  // Enriched CRM & customer handling fields
  parent_name?: string;
  student_name?: string;
  student_grade?: string;
  contact_phone?: string;
  contact_email?: string;
  rescue_status?: RescueStatus;
  hours_to_demo?: number;       // (demo_scheduled_at - created_at) in hours
  is_long_wait?: boolean;       // hours_to_demo > 48
  last_activity_note?: string;
  ticket_value?: number;        // Default ₹60,000
}

export interface FunnelSummary {
  totalLeads: number;
  demosScheduled: number;
  demosJoined: number;
  demosCompleted: number;
  converted: number;
  
  // Computed rates
  scheduledRate: number;      // scheduled / total
  joinRate: number;           // joined / scheduled
  completionRate: number;     // completed / joined
  conversionRate: number;     // converted / completed
  overallConversionRate: number; // converted / total
  
  // No-show analysis
  noShows: number;
  joinedToConvertedRate: number;
  expectedLostCustomers: number;
  estimatedLeakageTotal: number;
  estimatedMonthlyLeakage: number;
  
  // 48h Split analysis
  shortWaitCount: number;     // <= 48 hours
  shortWaitJoined: number;
  shortWaitJoinRate: number;
  
  longWaitCount: number;      // > 48 hours
  longWaitJoined: number;
  longWaitJoinRate: number;
  
  attendanceDropPctPoints: number;
  potentialJoinGain: number;
  potentialConversionsGain: number;
  potentialMonthlyGain: number;
  conservativeMonthlyGain: number;
}
