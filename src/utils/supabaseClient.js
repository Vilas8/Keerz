import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
let isMock = false;

// Seed some initial demo data in LocalStorage if it is empty, 
// so the Analytics Dashboard immediately has interesting statistics.
const seedDemoData = () => {
  const table = 'aviation_leads';
  try {
    const raw = localStorage.getItem(table);
    let parseSucceeded = false;
    let dataLength = 0;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dataLength = parsed.length;
          parseSucceeded = true;
        }
      } catch (parseErr) {
        console.warn('Failed to parse localStorage data, re-seeding demo values.', parseErr);
      }
    }

    if (!parseSucceeded || dataLength === 0) {
      const statesAndCities = [
        { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
        { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore'] },
        { state: 'Telangana', cities: ['Hyderabad', 'Warangal'] },
        { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
        { state: 'Delhi', cities: ['New Delhi', 'Dwarka'] },
        { state: 'Kerala', cities: ['Kochi', 'Trivandrum', 'Calicut'] },
        { state: 'West Bengal', cities: ['Kolkata', 'Siliguri'] },
        { state: 'Uttar Pradesh', cities: ['Lucknow', 'Noida', 'Kanpur'] }
      ];

      const qualifications = ['12th Pass', 'Diploma', 'Graduate', 'Post Graduate'];
      const careers = ['Cabin Crew', 'Air Hostess', 'Ground Staff', 'Airport Operations', 'Customer Service Executive'];
      const timelines = ['Immediately (0-1 Month)', 'Within 3 Months', 'Within 6 Months', 'Within 12 Months', 'Just Exploring'];
      const trainingModes = ['Offline', 'Online', 'Hybrid', 'No Preference'];
      const trainingTopics = [
        'Grooming & Presentation', 'Communication Skills', 'Public Speaking', 
        'Personality Development', 'Interview Preparation', 'Aviation Industry Knowledge', 
        'English Speaking Skills', 'Confidence Building'
      ];
      
      const firstNames = ['Ananya', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Neha', 'Priya', 'Riya', 'Sanjana', 'Tanvi', 'Aaradhya', 'Pooja', 'Shruti', 'Aditi', 'Sneha', 'Deepika', 'Kriti', 'Nisha', 'Aishwarya', 'Kiara'];
      const lastNames = ['Sharma', 'Verma', 'Patel', 'Rao', 'Nair', 'Iyer', 'Sen', 'Gupta', 'Singh', 'Reddy', 'Choudhury', 'Joshi', 'Mehta', 'Das', 'Bose', 'Menon', 'Kulkarni', 'Deshmukh', 'Pillai', 'Kumar'];

      const demoRecords = [];
      const now = new Date();

      for (let i = 0; i < 45; i++) {
        const stateObj = statesAndCities[Math.floor(Math.random() * statesAndCities.length)];
        const city = stateObj.cities[Math.floor(Math.random() * stateObj.cities.length)];
        const state = stateObj.state;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const numTopics = Math.floor(Math.random() * 5) + 3; // 3 to 7 topics
        const selectedTopics = [];
        while (selectedTopics.length < numTopics) {
          const topic = trainingTopics[Math.floor(Math.random() * trainingTopics.length)];
          if (!selectedTopics.includes(topic)) selectedTopics.push(topic);
        }

        const numCareers = Math.floor(Math.random() * 3) + 1; // 1 to 3 careers
        const selectedCareersList = [];
        while (selectedCareersList.length < numCareers) {
          const career = careers[Math.floor(Math.random() * careers.length)];
          if (!selectedCareersList.includes(career)) selectedCareersList.push(career);
        }

        const ageGroup = Math.random() > 0.4 ? (Math.random() > 0.5 ? '21-23' : '18-20') : '24-27';
        const seriousness = Math.floor(Math.random() * 4) + 2; // 2 to 5
        const dateOffsetDays = Math.floor(Math.random() * 30); // up to 30 days ago
        const createdAt = new Date(now.getTime() - dateOffsetDays * 24 * 60 * 60 * 1000).toISOString();

        demoRecords.push({
          id: 'demo-' + Math.random().toString(36).substring(2, 9),
          full_name: `${firstName} ${lastName}`,
          mobile: '98765' + Math.floor(10000 + Math.random() * 90000),
          whatsapp: Math.random() > 0.3 ? '98765' + Math.floor(10000 + Math.random() * 90000) : '',
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          age_group: ageGroup,
          qualification: qualifications[Math.floor(Math.random() * qualifications.length)],
          state: state,
          city: city,
          career_interest: Math.random() > 0.2 ? (Math.random() > 0.3 ? 'Yes' : 'Maybe') : 'Exploring Options',
          selected_careers: selectedCareersList,
          joining_timeline: timelines[Math.floor(Math.random() * timelines.length)],
          training_mode: trainingModes[Math.floor(Math.random() * trainingModes.length)],
          preferred_training_city: city,
          seriousness_score: seriousness,
          selected_training_topics: selectedTopics,
          biggest_challenge: Math.random() > 0.3 ? ['Lack of confidence', 'Communication skills', 'Financial concerns', 'Lack of guidance', 'Interview preparation'][Math.floor(Math.random() * 5)] : '',
          consent: true,
          created_at: createdAt
        });
      }

      localStorage.setItem(table, JSON.stringify(demoRecords));
    }
  } catch (err) {
    console.error('LocalStorage write/read operations are blocked or failed:', err);
  }
};

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL or Anon Key not configured. Using local storage fallback for database operations.');
  isMock = true;
  seedDemoData(); // Load high-quality seed data for analytics showcase
  
  client = {
    from: (tableName) => {
      const table = tableName || 'aviation_leads';
      return {
        insert: async (dataArray) => {
          try {
            let existing = [];
            try {
              const raw = localStorage.getItem(table);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) existing = parsed;
              }
            } catch (e) {
              console.warn('Error reading from localStorage on insert, resetting array', e);
            }

            const toInsert = Array.isArray(dataArray) ? dataArray : [dataArray];
            const newRecords = toInsert.map(item => ({
              id: 'lead-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              created_at: new Date().toISOString(),
              ...item
            }));
            const updated = [...existing, ...newRecords];
            localStorage.setItem(table, JSON.stringify(updated));
            return { data: newRecords, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        select: (columns) => {
          let data = [];
          try {
            const raw = localStorage.getItem(table);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) data = parsed;
            }
          } catch (e) {
            console.error('Error selecting data from localStorage:', e);
          }
          
          const chain = {
            order: (field, { ascending } = { ascending: true }) => {
              const sorted = [...data].sort((a, b) => {
                const valA = a[field] || '';
                const valB = b[field] || '';
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
              });
              
              const innerChain = {
                then: (onfulfilled) => {
                  return Promise.resolve({ data: sorted, error: null }).then(onfulfilled);
                }
              };
              return innerChain;
            },
            then: (onfulfilled) => {
              return Promise.resolve({ data, error: null }).then(onfulfilled);
            }
          };
          return chain;
        }
      };
    }
  };
}

export const supabase = client;
export const isSupabaseMock = isMock;
