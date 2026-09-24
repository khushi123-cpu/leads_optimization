import * as XLSX from 'xlsx';
import { Lead, RescueStatus } from '../types/crm';
import { calculateHoursDifference } from './analytics';

const FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Ananya', 'Rohan', 'Vikram', 'Pooja', 'Deepak', 'Neha', 'Sanjay', 'Kavita', 'Arjun', 'Meera', 'Rajesh', 'Shweta', 'Aditya', 'Divya', 'Gaurav', 'Sunita'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Reddy', 'Chopra', 'Nair', 'Mehta', 'Iyer', 'Kapoor', 'Das', 'Bhatia', 'Joshi', 'Mukherjee', 'Bose'];
const CHILD_NAMES = ['Aarav', 'Diya', 'Vivaan', 'Ishaan', 'Anvi', 'Kabir', 'Riya', 'Reyansh', 'Saanvi', 'Aryan', 'Myra', 'Kian', 'Avani', 'Advait', 'Ira'];
const GRADES = ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Coding for Kids'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseBooleanValue(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'y' || s === 'joined' || s === 'completed' || s === 'converted';
  }
  return false;
}

function parseDateValue(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'number') {
    // Excel serial date to JS Date
    try {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed) {
        const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, Math.floor(parsed.S)));
        return d.toISOString();
      }
    } catch {
      // fallback
    }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return String(val);
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]+/g, '');
}

export function parseExcelOrCsvFile(file: File): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Workbook contains no sheets.');
        }
        
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('No rows found in the uploaded file.');
        }

        const parsedLeads: Lead[] = rawJson.map((row, idx) => {
          // Normalize row keys
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalizedRow[normalizeKey(k)] = row[k];
          });

          const lead_id = String(
            normalizedRow['leadid'] || 
            normalizedRow['id'] || 
            `LEAD-${10000 + idx}`
          ).trim();

          const lead_source = String(
            normalizedRow['leadsource'] || 
            normalizedRow['source'] || 
            'Meta Ads'
          ).trim();

          const geography = String(
            normalizedRow['geography'] || 
            normalizedRow['geo'] || 
            normalizedRow['region'] || 
            'India'
          ).trim();

          const parent_timezone = String(
            normalizedRow['parenttimezone'] || 
            normalizedRow['timezone'] || 
            'Asia/Kolkata (IST)'
          ).trim();

          const created_at = parseDateValue(
            normalizedRow['createdat'] || 
            normalizedRow['createddate'] || 
            new Date(Date.now() - (3 + (idx % 14)) * 86400000).toISOString()
          );

          const demo_scheduled_at = parseDateValue(
            normalizedRow['demoscheduledat'] || 
            normalizedRow['scheduledat'] || 
            normalizedRow['demodate'] || 
            ''
          );

          const rep_assigned = String(
            normalizedRow['repassigned'] || 
            normalizedRow['rep'] || 
            normalizedRow['salesrep'] || 
            'Ankit Sharma'
          ).trim();

          const rep_shift = String(
            normalizedRow['repshift'] || 
            normalizedRow['shift'] || 
            'Evening (16:00-00:00)'
          ).trim();

          const follow_up_attempts = parseInt(
            normalizedRow['followupattempts'] || 
            normalizedRow['followups'] || 
            '1', 
            10
          ) || 0;

          const demo_joined = parseBooleanValue(
            normalizedRow['demojoined'] || 
            normalizedRow['joined']
          );

          const demo_completed = demo_joined && parseBooleanValue(
            normalizedRow['democompleted'] || 
            normalizedRow['completed']
          );

          const converted = demo_completed && parseBooleanValue(
            normalizedRow['converted'] || 
            normalizedRow['isconverted'] || 
            normalizedRow['sale']
          );

          // Calculate wait time
          const hours_to_demo = demo_scheduled_at && created_at
            ? calculateHoursDifference(created_at, demo_scheduled_at)
            : 0;

          const is_long_wait = hours_to_demo > 48;

          // Customer handling info
          const pFirst = getRandomItem(FIRST_NAMES);
          const pLast = getRandomItem(LAST_NAMES);
          const parent_name = normalizedRow['parentname'] ? String(normalizedRow['parentname']) : `${pFirst} ${pLast}`;
          const student_name = normalizedRow['studentname'] ? String(normalizedRow['studentname']) : getRandomItem(CHILD_NAMES);
          const student_grade = normalizedRow['studentgrade'] ? String(normalizedRow['studentgrade']) : getRandomItem(GRADES);
          const contact_phone = normalizedRow['phone'] ? String(normalizedRow['phone']) : `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
          const contact_email = normalizedRow['email'] ? String(normalizedRow['email']) : `${pFirst.toLowerCase()}.${pLast.toLowerCase()}@example.com`;

          let rescue_status: RescueStatus = 'on_track';
          if (is_long_wait) {
            if (converted) {
              rescue_status = 'on_track';
            } else if (demo_joined) {
              rescue_status = 'on_track';
            } else {
              rescue_status = 'needs_action';
            }
          }

          return {
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
            parent_name,
            student_name,
            student_grade,
            contact_phone,
            contact_email,
            rescue_status,
            hours_to_demo,
            is_long_wait,
            ticket_value: 60000,
            last_activity_note: is_long_wait 
              ? `Scheduled ${hours_to_demo.toFixed(0)}h after inquiry (>48h flag). At risk of demo no-show.` 
              : `Scheduled within ${hours_to_demo.toFixed(0)}h. High freshness.`
          };
        });

        resolve(parsedLeads);
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to parse Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function exportLeadsToExcel(leads: Lead[], filename = 'freshqueue_crm_leads.xlsx') {
  const exportData = leads.map(l => ({
    'lead_id': l.lead_id,
    'lead_source': l.lead_source,
    'geography': l.geography,
    'parent_timezone': l.parent_timezone,
    'created_at': l.created_at,
    'demo_scheduled_at': l.demo_scheduled_at,
    'rep_assigned': l.rep_assigned,
    'rep_shift': l.rep_shift,
    'follow_up_attempts': l.follow_up_attempts,
    'demo_joined': l.demo_joined ? 1 : 0,
    'demo_completed': l.demo_completed ? 1 : 0,
    'converted': l.converted ? 1 : 0,
    'wait_hours': l.hours_to_demo ?? 0,
    'is_long_wait_risk': l.is_long_wait ? 'YES (>48h)' : 'NO (<=48h)',
    'rescue_status': l.rescue_status ?? 'on_track',
    'parent_name': l.parent_name || '',
    'student_name': l.student_name || '',
    'contact_phone': l.contact_phone || '',
    'last_note': l.last_activity_note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads & Demos');
  XLSX.writeFile(workbook, filename);
}

export function downloadSampleExcelTemplate() {
  const sampleRows = [
    {
      lead_id: 'L-5001',
      lead_source: 'Meta Ads',
      geography: 'India',
      parent_timezone: 'Asia/Kolkata (IST)',
      created_at: '2026-09-18T10:00:00',
      demo_scheduled_at: '2026-09-22T18:00:00', // 104 hours (>48h stale!)
      rep_assigned: 'Ananya Verma',
      rep_shift: 'Evening (16:00-00:00)',
      follow_up_attempts: 2,
      demo_joined: 0,
      demo_completed: 0,
      converted: 0
    },
    {
      lead_id: 'L-5002',
      lead_source: 'Google Search',
      geography: 'Middle East',
      parent_timezone: 'Asia/Dubai (GST)',
      created_at: '2026-09-21T09:30:00',
      demo_scheduled_at: '2026-09-22T15:00:00', // 29.5 hours (<=48h fresh!)
      rep_assigned: 'Rahul Nair',
      rep_shift: 'Morning (08:00-16:00)',
      follow_up_attempts: 1,
      demo_joined: 1,
      demo_completed: 1,
      converted: 1
    },
    {
      lead_id: 'L-5003',
      lead_source: 'Referral',
      geography: 'North America',
      parent_timezone: 'America/New_York (EST)',
      created_at: '2026-09-19T14:00:00',
      demo_scheduled_at: '2026-09-23T20:00:00', // 102 hours (>48h stale!)
      rep_assigned: 'Deepak Chopra',
      rep_shift: 'Night (00:00-08:00)',
      follow_up_attempts: 3,
      demo_joined: 0,
      demo_completed: 0,
      converted: 0
    },
    {
      lead_id: 'L-5004',
      lead_source: 'Inbound WhatsApp',
      geography: 'India',
      parent_timezone: 'Asia/Kolkata (IST)',
      created_at: '2026-09-22T11:00:00',
      demo_scheduled_at: '2026-09-23T16:00:00', // 29 hours (fresh!)
      rep_assigned: 'Pooja Iyer',
      rep_shift: 'Morning (08:00-16:00)',
      follow_up_attempts: 1,
      demo_joined: 1,
      demo_completed: 1,
      converted: 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Leads');
  XLSX.writeFile(workbook, 'freshqueue_sample_template.xlsx');
}
