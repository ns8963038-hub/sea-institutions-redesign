/**
 * Hand-built search index for the Ctrl+K command palette.
 * Pages, page sections, institutions and quick actions.
 * Programs are merged in at runtime from programs-data.js.
 */

export const SEARCH_INDEX = [
  // Pages
  { title: 'Home', section: 'Page', url: 'index.html', keywords: 'welcome sea education trust bengaluru bangalore' },
  { title: 'About Us', section: 'Page', url: 'about.html', keywords: 'history trust vision mission leadership story overview' },
  { title: 'Programs', section: 'Page', url: 'programs.html', keywords: 'courses degrees finder search ug pg puc study' },
  { title: 'Our Institutions', section: 'Page', url: 'institutions.html', keywords: 'colleges schools campuses 12 twelve' },
  { title: 'Admissions', section: 'Page', url: 'admissions.html', keywords: 'join enroll procedure eligibility helpline apply steps' },
  { title: 'Apply Online', section: 'Page', url: 'apply.html', keywords: 'application form register enrol admission 2026' },
  { title: 'Placements', section: 'Page', url: 'placements.html', keywords: 'jobs careers recruiters salary internship placement cell' },
  { title: 'Campus Life', section: 'Page', url: 'campus.html', keywords: 'hostel sports facilities infrastructure library labs wifi' },
  { title: 'Gallery', section: 'Page', url: 'gallery.html', keywords: 'photos videos images campus pictures' },
  { title: 'Contact Us', section: 'Page', url: 'contact.html', keywords: 'phone email address map reach enquiry' },

  // Key sections
  { title: 'Vision & Mission', section: 'About', url: 'about.html#vision-mission', keywords: 'values aspire empower learners' },
  { title: 'Leadership Messages', section: 'About', url: 'about.html#leadership', keywords: 'founder chairman director krishnappa manjula viyyanna rao' },
  { title: 'Board of Trustees', section: 'About', url: 'about.html#trustees', keywords: 'secretary ceo management board' },
  { title: 'Our Principals', section: 'About', url: 'about.html#principals', keywords: 'principal heads institutions' },
  { title: 'Admission Timeline', section: 'Admissions', url: 'admissions.html#timeline', keywords: 'four steps process interview documents' },
  { title: 'Financial Aid & Scholarships', section: 'Admissions', url: 'admissions.html#categories', keywords: 'education loan scholarship merit fee' },
  { title: 'Foreign National Admissions', section: 'Admissions', url: 'admissions.html#categories', keywords: 'international students visa documents nri' },
  { title: 'NRI Admissions', section: 'Admissions', url: 'admissions.html#categories', keywords: 'non resident indian management quota' },
  { title: 'Admission Helplines', section: 'Admissions', url: 'admissions.html#helplines', keywords: 'phone numbers call office contact' },
  { title: 'Placement Highlights', section: 'Placements', url: 'placements.html#highlights', keywords: 'recruiters 160 salary hike alumni startups' },
  { title: 'Career Advancement Cell', section: 'Placements', url: 'placements.html#cell', keywords: 'training grooming panel placement team' },
  { title: 'Hostels & Accommodation', section: 'Campus', url: 'campus.html#hostels', keywords: 'rooms boarding anti ragging security cafeteria' },
  { title: 'Sports Facilities', section: 'Campus', url: 'campus.html#sports', keywords: 'indoor outdoor stadium gym cricket basketball' },
  { title: 'Digital Infrastructure', section: 'Campus', url: 'campus.html#digital', keywords: 'wifi app ict laptops firewall digital library' },
  { title: 'Photo Gallery', section: 'Gallery', url: 'gallery.html#photos', keywords: 'pictures campus events' },
  { title: 'Video Gallery', section: 'Gallery', url: 'gallery.html#videos', keywords: 'youtube films campus tour' },
  { title: 'Accreditations & Associations', section: 'Contact', url: 'contact.html#accreditations', keywords: 'vtu aicte rguhs bci ncte karnataka board recognised' },

  // Institutions
  { title: 'SEA College of Engineering & Technology', section: 'Institution', url: 'institutions.html#seacet', keywords: 'seacet be btech engineering vtu 2007' },
  { title: 'SEA College of Management Studies', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'mba mcom management' },
  { title: 'SEA College of Nursing', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'bsc nursing gnm rguhs health' },
  { title: 'SEA Research & Development Center', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'phd research vtu doctoral' },
  { title: 'SEA College of Science, Commerce & Arts', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'degree bcom bba bca bsc ba' },
  { title: 'SEA B.Ed College', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'education teacher training bed' },
  { title: 'SEA College of Law', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'llb ba llb moot court kslu bar council' },
  { title: 'SEA Composite PU College', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'puc pre university science commerce arts' },
  { title: 'SEA Evening College', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'evening bcom ba working students' },
  { title: 'SEA International School', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'icse school montessori' },
  { title: 'SEA Primary & Higher Secondary School', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'state board school sslc' },
  { title: 'SEA Industrial Training Institute', section: 'Institution', url: 'institutions.html#institutions-grid', keywords: 'iti fitter electrician electronics mechanic ncvt' },

  // Quick actions
  { title: 'Call the Admissions Office', section: 'Action', url: 'tel:+917353945999', keywords: 'phone dial helpline 7353945999' },
  { title: 'Email SEA', section: 'Action', url: 'mailto:seaeduinfo@seaedu.ac.in', keywords: 'mail write enquiry' },
  { title: 'Start an Application', section: 'Action', url: 'apply.html', keywords: 'apply now form admission' },
];
