import { Lead, RescueStatus } from '../types/crm';
import { calculateHoursDifference } from './analytics';
import defaultCsvRaw from '../data/defaultLeads.csv?raw';

const PARENTS = [
  { p: 'Sanjay Kapoor', c: 'Aarav', g: 'Grade 6', ph: '+91 98201 45812' },
  { p: 'Meera Iyer', c: 'Anvi', g: 'Grade 4', ph: '+91 98450 12398' },
  { p: 'Rajesh Nair', c: 'Ishaan', g: 'Grade 7', ph: '+971 50 123 4567' },
  { p: 'Sneha Reddy', c: 'Diya', g: 'Grade 5', ph: '+91 99882 34561' },
  { p: 'Arjun Das', c: 'Reyansh', g: 'Grade 8', ph: '+1 408 555 0192' },
  { p: 'Kavita Bose', c: 'Myra', g: 'Grade 9', ph: '+44 20 7946 0912' },
  { p: 'Gaurav Bhatia', c: 'Kian', g: 'Grade 6', ph: '+91 98112 77623' },
  { p: 'Shweta Mukherjee', c: 'Saanvi', g: 'Grade 4', ph: '+65 8123 4567' },
  { p: 'Aditya Sen', c: 'Vivaan', g: 'Grade 10', ph: '+91 98765 43210' },
  { p: 'Pooja Chawla', c: 'Riya', g: 'Grade 5', ph: '+1 212 555 0144' },
  { p: 'Deepak Saxena', c: 'Advait', g: 'Grade 7', ph: '+91 98334 56789' },
  { p: 'Sunita Joshi', c: 'Ira', g: 'Grade 8', ph: '+91 98920 11223' },
];

export function generateInitialLeads(): Lead[] {
  try {
    const rawLines = defaultCsvRaw.trim().split('\n');
    if (rawLines.length > 1) {
      const leads: Lead[] = [];
      const headerLine = rawLines[0].toLowerCase();
      const hasHeader = headerLine.includes('lead_id');
      const startIdx = hasHeader ? 1 : 0;

      for (let i = startIdx; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < 5) continue;

        const lead_id = cols[0]?.trim() || `L${100000 + i}`;
        const lead_source = cols[1]?.trim() || 'Meta';
        const geography = cols[2]?.trim() || 'USA';
        const parent_timezone = cols[3]?.trim() || 'America/New_York';
        const created_at = cols[4]?.trim() || '';
        const demo_scheduled_at = cols[5]?.trim() || '';
        const rep_assigned = cols[6]?.trim() || 'AD-01';
        const rep_shift = cols[7]?.trim() || 'US_SHIFT';
        const follow_up_attempts = parseInt(cols[8]?.trim() || '0', 10) || 0;
        const demo_joined = (cols[9]?.trim().toUpperCase() === 'Y' || cols[9]?.trim().toLowerCase() === 'true');
        const demo_completed = (cols[10]?.trim().toUpperCase() === 'Y' || cols[10]?.trim().toLowerCase() === 'true');
        const converted = (cols[11]?.trim().toUpperCase() === 'Y' || cols[11]?.trim().toLowerCase() === 'true');

        let hours_to_demo = 0;
        let is_long_wait = false;
        if (demo_scheduled_at && created_at) {
          hours_to_demo = calculateHoursDifference(created_at, demo_scheduled_at);
          is_long_wait = hours_to_demo > 48;
        }

        let rescue_status: RescueStatus = 'on_track';
        let last_activity_note = 'On track';

        if (converted) {
          rescue_status = 'converted';
          last_activity_note = 'Enrolled & Converted (₹60,000)';
        } else if (demo_joined) {
          rescue_status = 'on_track';
          last_activity_note = demo_completed ? 'Demo completed. Payment link sent.' : 'Demo attended.';
        } else if (demo_scheduled_at) {
          if (is_long_wait) {
            rescue_status = 'needs_action';
            last_activity_note = `🚨 >48h gap (${hours_to_demo}h). High no-show probability. Rescue slot prepone required.`;
          } else {
            rescue_status = 'on_track';
            last_activity_note = `Scheduled within 48h (${hours_to_demo}h wait). Fast turnaround.`;
          }
        } else {
          rescue_status = 'on_track';
          last_activity_note = 'New inquiry received. Demo scheduling pending.';
        }

        const parentInfo = PARENTS[i % PARENTS.length];

        leads.push({
          lead_id,
          lead_source,
          geography,
          parent_timezone,
          created_at,
          demo_scheduled_at,
          rep_assigned,
          rep_shift,
          follow_up_attempts,
          demo_joined,
          demo_completed,
          converted,
          parent_name: parentInfo.p,
          student_name: parentInfo.c,
          student_grade: parentInfo.g,
          contact_phone: parentInfo.ph,
          contact_email: `${lead_id.toLowerCase()}@client.com`,
          rescue_status,
          hours_to_demo,
          is_long_wait,
          ticket_value: 60000,
          last_activity_note
        });
      }

      if (leads.length > 0) {
        return leads;
      }
    }
  } catch (err) {
    console.error('Error parsing default leads dataset:', err);
  }

  return [];
}
