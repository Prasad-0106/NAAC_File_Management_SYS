export const NAAC_CRITERIA = [
  {
    no: '1', title: 'Curricular Aspects', marks: 100,
    subCriteria: [
      { code: '1.1', title: 'Curriculum Design and Development', fields: [
        { name: 'programs_offered', label: 'Programs Offered', type: 'text', required: true },
        { name: 'curriculum_revision_year', label: 'Last Curriculum Revision Year', type: 'number', required: true },
        { name: 'cbcs_implemented', label: 'CBCS Implemented', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'syllabus_gap_analysis', label: 'Syllabus Gap Analysis Done', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'industry_input', label: 'Industry/Stakeholder Input in Curriculum', type: 'radio', options: ['Yes','No','Partial'], required: true },
        { name: 'curriculum_doc_upload', label: 'Upload Curriculum Document', type: 'file', required: false }
      ]},
      { code: '1.2', title: 'Curriculum Planning and Implementation', fields: [
        { name: 'academic_calendar', label: 'Academic Calendar Prepared', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'lesson_plans', label: 'Lesson Plans Maintained', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'slow_learner_program', label: 'Programs for Slow/Advanced Learners', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'ict_usage_percent', label: 'ICT Usage in Teaching (%)', type: 'number', required: true },
        { name: 'academic_calendar_upload', label: 'Upload Academic Calendar', type: 'file', required: false }
      ]},
      { code: '1.3', title: 'Academic Flexibility', fields: [
        { name: 'elective_courses', label: 'Number of Elective Courses Offered', type: 'number', required: true },
        { name: 'value_added_courses', label: 'Number of Value Added Courses', type: 'number', required: true },
        { name: 'interdisciplinary_courses', label: 'Interdisciplinary Courses Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'project_based_learning', label: 'Project Based Learning Implemented', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'flexibility_doc', label: 'Upload Supporting Document', type: 'file', required: false }
      ]},
      { code: '1.4', title: 'Curriculum Enrichment', fields: [
        { name: 'add_on_courses', label: 'Add-on Courses Conducted', type: 'number', required: true },
        { name: 'certification_programs', label: 'Certification Programs Offered', type: 'number', required: true },
        { name: 'industry_visits', label: 'Industry Visits Organized', type: 'number', required: true },
        { name: 'guest_lectures', label: 'Guest Lectures Organized', type: 'number', required: true },
        { name: 'enrichment_doc', label: 'Upload Supporting Document', type: 'file', required: false }
      ]},
      { code: '1.5', title: 'Feedback System', fields: [
        { name: 'feedback_from', label: 'Feedback Collected From', type: 'multiselect', options: ['Students','Teachers','Alumni','Employers','Parents'], required: true },
        { name: 'feedback_analysis_done', label: 'Feedback Analyzed and Action Taken', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'feedback_report_upload', label: 'Upload Feedback Report', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '2', title: 'Teaching-Learning and Evaluation', marks: 350,
    subCriteria: [
      { code: '2.1', title: 'Student Enrolment and Profile', fields: [
        { name: 'total_students', label: 'Total Students Enrolled', type: 'number', required: true },
        { name: 'sc_st_percent', label: 'SC/ST Students (%)', type: 'number', required: true },
        { name: 'obc_percent', label: 'OBC Students (%)', type: 'number', required: true },
        { name: 'female_percent', label: 'Female Students (%)', type: 'number', required: true },
        { name: 'differently_abled', label: 'Differently-Abled Students', type: 'number', required: false },
        { name: 'enrolment_doc', label: 'Upload Enrolment Register', type: 'file', required: false }
      ]},
      { code: '2.2', title: 'Catering to Student Diversity', fields: [
        { name: 'bridge_courses', label: 'Bridge/Remedial Courses Offered', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'advanced_learner_programs', label: 'Programs for Advanced Learners', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'mentoring_system', label: 'Mentoring System in Place', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'mentor_ratio', label: 'Mentor-Mentee Ratio', type: 'text', required: false },
        { name: 'diversity_doc', label: 'Upload Supporting Document', type: 'file', required: false }
      ]},
      { code: '2.3', title: 'Teaching-Learning Process', fields: [
        { name: 'student_centric_methods', label: 'Student-Centric Methods Used', type: 'multiselect', options: ['Experiential Learning','Participative Learning','Problem Solving','Case Studies','Flipped Classroom','Collaborative Learning'], required: true },
        { name: 'ict_tools_used', label: 'ICT Tools Used', type: 'multiselect', options: ['LMS','Smart Board','MOOC','e-Resources','Video Lectures','Simulation'], required: false },
        { name: 'faculty_student_ratio', label: 'Faculty-Student Ratio', type: 'text', required: true },
        { name: 'teaching_doc', label: 'Upload Teaching Plan/Sample', type: 'file', required: false }
      ]},
      { code: '2.4', title: 'Teacher Profile and Quality', fields: [
        { name: 'total_faculty', label: 'Total Faculty', type: 'number', required: true },
        { name: 'phd_faculty', label: 'Faculty with Ph.D.', type: 'number', required: true },
        { name: 'net_set_faculty', label: 'Faculty with NET/SET', type: 'number', required: false },
        { name: 'avg_experience', label: 'Average Teaching Experience (Years)', type: 'number', required: true },
        { name: 'awards_recognition', label: 'Awards/Recognition Received', type: 'text', required: false },
        { name: 'faculty_doc', label: 'Upload Faculty List', type: 'file', required: false }
      ]},
      { code: '2.5', title: 'Evaluation Process and Reforms', fields: [
        { name: 'internal_assessment_percent', label: 'Internal Assessment Weightage (%)', type: 'number', required: true },
        { name: 'continuous_evaluation', label: 'Continuous Evaluation Implemented', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'question_bank', label: 'Question Bank Maintained', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'grievance_redressal', label: 'Grievance Redressal Mechanism', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'evaluation_doc', label: 'Upload Evaluation Policy', type: 'file', required: false }
      ]},
      { code: '2.6', title: 'Student Performance and Learning Outcomes', fields: [
        { name: 'pass_percentage', label: 'Overall Pass Percentage (%)', type: 'number', required: true },
        { name: 'distinction_percent', label: 'Students with Distinction (%)', type: 'number', required: false },
        { name: 'first_class_percent', label: 'Students with First Class (%)', type: 'number', required: false },
        { name: 'pos_cos_defined', label: 'POs and COs Defined', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'attainment_level', label: 'CO Attainment Level', type: 'dropdown', options: ['Level 1','Level 2','Level 3'], required: true },
        { name: 'results_doc', label: 'Upload Results Summary', type: 'file', required: false }
      ]},
      { code: '2.7', title: 'Student Satisfaction Survey', fields: [
        { name: 'sss_conducted', label: 'Student Satisfaction Survey Conducted', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'sss_score', label: 'Student Satisfaction Score (out of 5)', type: 'number', required: false },
        { name: 'sss_participants', label: 'Number of Students Participated', type: 'number', required: false },
        { name: 'sss_doc', label: 'Upload SSS Report', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '3', title: 'Research, Innovations and Extension', marks: 120,
    subCriteria: [
      { code: '3.1', title: 'Promotion of Research and Facilities', fields: [
        { name: 'research_policy', label: 'Research Policy in Place', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'research_committee', label: 'Research Committee Formed', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'seed_money_provided', label: 'Seed Money Provided to Faculty', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'seed_money_amount', label: 'Total Seed Money (INR)', type: 'number', required: false },
        { name: 'research_doc', label: 'Upload Research Policy Document', type: 'file', required: false }
      ]},
      { code: '3.2', title: 'Resource Mobilization for Research', fields: [
        { name: 'funded_projects', label: 'Number of Funded Projects', type: 'number', required: true },
        { name: 'total_grant_received', label: 'Total Grant Received (INR)', type: 'number', required: false },
        { name: 'funding_agencies', label: 'Funding Agencies', type: 'text', required: false },
        { name: 'projects_doc', label: 'Upload Project Sanction Letters', type: 'file', required: false }
      ]},
      { code: '3.3', title: 'Innovation Ecosystem', fields: [
        { name: 'innovation_cell', label: 'Innovation/Incubation Cell', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'startups_supported', label: 'Startups Supported', type: 'number', required: false },
        { name: 'patents_filed', label: 'Patents Filed', type: 'number', required: false },
        { name: 'patents_granted', label: 'Patents Granted', type: 'number', required: false },
        { name: 'innovation_doc', label: 'Upload Innovation Cell Details', type: 'file', required: false }
      ]},
      { code: '3.4', title: 'Research Publications and Awards', fields: [
        { name: 'journal_publications', label: 'Journal Publications (Last 5 Years)', type: 'number', required: true },
        { name: 'scopus_publications', label: 'Scopus/WoS Indexed Publications', type: 'number', required: false },
        { name: 'books_published', label: 'Books/Book Chapters Published', type: 'number', required: false },
        { name: 'phd_awarded', label: 'Ph.D. Awarded (Guided)', type: 'number', required: false },
        { name: 'publications_doc', label: 'Upload Publication List', type: 'file', required: false }
      ]},
      { code: '3.5', title: 'Consultancy', fields: [
        { name: 'consultancy_policy', label: 'Consultancy Policy Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'consultancy_projects', label: 'Number of Consultancy Projects', type: 'number', required: false },
        { name: 'consultancy_revenue', label: 'Revenue from Consultancy (INR)', type: 'number', required: false },
        { name: 'consultancy_doc', label: 'Upload Consultancy Records', type: 'file', required: false }
      ]},
      { code: '3.6', title: 'Extension Activities', fields: [
        { name: 'nss_ncc', label: 'NSS/NCC Units', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'extension_activities_count', label: 'Extension Activities Conducted', type: 'number', required: true },
        { name: 'community_impact', label: 'Community Impact Description', type: 'text', required: false },
        { name: 'awards_extension', label: 'Awards for Extension Activities', type: 'text', required: false },
        { name: 'extension_doc', label: 'Upload Extension Activity Reports', type: 'file', required: false }
      ]},
      { code: '3.7', title: 'Collaboration', fields: [
        { name: 'mou_count', label: 'Number of MoUs Signed', type: 'number', required: true },
        { name: 'international_collaborations', label: 'International Collaborations', type: 'number', required: false },
        { name: 'collaboration_activities', label: 'Activities under Collaborations', type: 'text', required: false },
        { name: 'collaboration_doc', label: 'Upload MoU Documents', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '4', title: 'Infrastructure and Learning Resources', marks: 100,
    subCriteria: [
      { code: '4.1', title: 'Physical Facilities', fields: [
        { name: 'classrooms', label: 'Number of Classrooms', type: 'number', required: true },
        { name: 'labs', label: 'Number of Laboratories', type: 'number', required: true },
        { name: 'smart_classrooms', label: 'Smart Classrooms Available', type: 'number', required: false },
        { name: 'sports_facilities', label: 'Sports Facilities Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'campus_area', label: 'Campus Area (in acres)', type: 'number', required: true },
        { name: 'infra_doc', label: 'Upload Infrastructure Details', type: 'file', required: false }
      ]},
      { code: '4.2', title: 'Library as a Learning Resource', fields: [
        { name: 'total_books', label: 'Total Books in Library', type: 'number', required: true },
        { name: 'journals_subscribed', label: 'Journals Subscribed', type: 'number', required: false },
        { name: 'e_resources', label: 'e-Resources/Digital Library', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'library_automation', label: 'Library Automation Software', type: 'text', required: false },
        { name: 'library_doc', label: 'Upload Library Report', type: 'file', required: false }
      ]},
      { code: '4.3', title: 'IT Infrastructure', fields: [
        { name: 'computers', label: 'Total Computers Available', type: 'number', required: true },
        { name: 'student_computer_ratio', label: 'Student-Computer Ratio', type: 'text', required: true },
        { name: 'internet_speed', label: 'Internet Bandwidth (Mbps)', type: 'number', required: false },
        { name: 'wifi_campus', label: 'Wi-Fi on Campus', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'lms_used', label: 'LMS Platform Used', type: 'text', required: false },
        { name: 'it_doc', label: 'Upload IT Infrastructure Report', type: 'file', required: false }
      ]},
      { code: '4.4', title: 'Maintenance of Campus Infrastructure', fields: [
        { name: 'maintenance_budget', label: 'Annual Maintenance Budget (INR)', type: 'number', required: false },
        { name: 'maintenance_policy', label: 'Maintenance Policy Document', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'green_initiatives', label: 'Green/Sustainable Initiatives', type: 'text', required: false },
        { name: 'maintenance_doc', label: 'Upload Maintenance Records', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '5', title: 'Student Support and Progression', marks: 130,
    subCriteria: [
      { code: '5.1', title: 'Student Support', fields: [
        { name: 'scholarships_govt', label: 'Government Scholarships Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'scholarships_institutional', label: 'Institutional Scholarships Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'scholarship_beneficiaries', label: 'Number of Scholarship Beneficiaries', type: 'number', required: false },
        { name: 'career_guidance_cell', label: 'Career Guidance Cell', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'counselling_available', label: 'Counselling Services Available', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'support_doc', label: 'Upload Student Support Records', type: 'file', required: false }
      ]},
      { code: '5.2', title: 'Student Progression', fields: [
        { name: 'higher_studies_percent', label: 'Students Pursuing Higher Studies (%)', type: 'number', required: true },
        { name: 'placement_percent', label: 'Placement Rate (%)', type: 'number', required: true },
        { name: 'avg_salary', label: 'Average Salary Package (INR)', type: 'number', required: false },
        { name: 'competitive_exam_qualified', label: 'Students Qualified in Competitive Exams', type: 'number', required: false },
        { name: 'progression_doc', label: 'Upload Placement/Progression Report', type: 'file', required: false }
      ]},
      { code: '5.3', title: 'Student Participation and Activities', fields: [
        { name: 'cultural_activities', label: 'Cultural/Literary Activities Organized', type: 'number', required: false },
        { name: 'sports_achievements', label: 'Sports Achievements (State/National)', type: 'text', required: false },
        { name: 'student_awards', label: 'Student Awards/Recognition', type: 'text', required: false },
        { name: 'student_council', label: 'Student Council in Place', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'participation_doc', label: 'Upload Activity Reports', type: 'file', required: false }
      ]},
      { code: '5.4', title: 'Alumni Engagement', fields: [
        { name: 'alumni_association', label: 'Alumni Association Registered', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'alumni_contributions', label: 'Alumni Contributions (INR)', type: 'number', required: false },
        { name: 'alumni_meets', label: 'Alumni Meets Organized', type: 'number', required: false },
        { name: 'alumni_doc', label: 'Upload Alumni Records', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '6', title: 'Governance, Leadership and Management', marks: 100,
    subCriteria: [
      { code: '6.1', title: 'Institutional Vision and Leadership', fields: [
        { name: 'vision_mission_defined', label: 'Vision & Mission Defined', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'decentralized_governance', label: 'Decentralized Governance Structure', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'strategic_plan', label: 'Strategic Plan in Place', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'governance_doc', label: 'Upload Governance Policy', type: 'file', required: false }
      ]},
      { code: '6.2', title: 'Strategy Development and Deployment', fields: [
        { name: 'perspective_plan', label: 'Perspective Plan Prepared', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'erp_implemented', label: 'ERP/MIS System Implemented', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'erp_system_name', label: 'ERP/MIS System Name', type: 'text', required: false },
        { name: 'strategy_doc', label: 'Upload Strategy Documents', type: 'file', required: false }
      ]},
      { code: '6.3', title: 'Faculty Empowerment Strategies', fields: [
        { name: 'appraisal_system', label: 'Performance Appraisal System', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'fdp_programs', label: 'FDP Programs Conducted', type: 'number', required: true },
        { name: 'welfare_schemes', label: 'Faculty Welfare Schemes', type: 'text', required: false },
        { name: 'faculty_empowerment_doc', label: 'Upload FDP/Appraisal Records', type: 'file', required: false }
      ]},
      { code: '6.4', title: 'Financial Management and Resource Mobilization', fields: [
        { name: 'annual_budget', label: 'Annual Budget (INR)', type: 'number', required: false },
        { name: 'audit_done', label: 'Internal/External Audit Conducted', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'resource_mobilization', label: 'Resource Mobilization Activities', type: 'text', required: false },
        { name: 'finance_doc', label: 'Upload Audit Report', type: 'file', required: false }
      ]},
      { code: '6.5', title: 'Internal Quality Assurance System', fields: [
        { name: 'iqac_constituted', label: 'IQAC Constituted', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'aqar_submitted', label: 'AQAR Submitted to NAAC', type: 'radio', options: ['Yes','No'], required: true },
        { name: 'quality_initiatives', label: 'Quality Initiatives Undertaken', type: 'text', required: false },
        { name: 'iqac_meetings', label: 'IQAC Meetings Conducted Per Year', type: 'number', required: false },
        { name: 'iqac_doc', label: 'Upload IQAC Minutes/AQAR', type: 'file', required: false }
      ]}
    ]
  },
  {
    no: '7', title: 'Institutional Values and Best Practices', marks: 100,
    subCriteria: [
      { code: '7.1', title: 'Institutional Values and Social Responsibilities', fields: [
        { name: 'gender_equity_programs', label: 'Gender Equity Programs Conducted', type: 'number', required: false },
        { name: 'environment_initiatives', label: 'Environmental Sustainability Initiatives', type: 'text', required: false },
        { name: 'green_practices', label: 'Green Practices Adopted', type: 'multiselect', options: ['Solar Energy','Rainwater Harvesting','Waste Management','Green Audit','Plastic-Free Campus'], required: false },
        { name: 'disabled_friendly', label: 'Differently-Abled Friendly Infrastructure', type: 'radio', options: ['Yes','No','Partial'], required: true },
        { name: 'human_values_programs', label: 'Human Values/Ethics Programs', type: 'number', required: false },
        { name: 'values_doc', label: 'Upload Supporting Documents', type: 'file', required: false }
      ]},
      { code: '7.2', title: 'Best Practices', fields: [
        { name: 'best_practice_1_title', label: 'Best Practice 1 Title', type: 'text', required: true },
        { name: 'best_practice_1_desc', label: 'Best Practice 1 Description', type: 'textarea', required: true },
        { name: 'best_practice_2_title', label: 'Best Practice 2 Title', type: 'text', required: false },
        { name: 'best_practice_2_desc', label: 'Best Practice 2 Description', type: 'textarea', required: false },
        { name: 'best_practices_doc', label: 'Upload Best Practices Document', type: 'file', required: false }
      ]},
      { code: '7.3', title: 'Institutional Distinctiveness', fields: [
        { name: 'distinctiveness_desc', label: 'Institutional Distinctiveness Description', type: 'textarea', required: true },
        { name: 'unique_features', label: 'Unique Features/Achievements', type: 'text', required: false },
        { name: 'distinctiveness_doc', label: 'Upload Distinctiveness Document', type: 'file', required: false }
      ]}
    ]
  }
];

export const ACADEMIC_YEARS = ['2019-20','2020-21','2021-22','2022-23','2023-24','2024-25','2025-26','2026-27'];

export const CRITERION_COLORS = {
  '1': '#6366f1', '2': '#0ea5e9', '3': '#10b981',
  '4': '#f59e0b', '5': '#ef4444', '6': '#8b5cf6', '7': '#ec4899'
};

export function calcProgress(criterionNo, subCriterion, savedData) {
  const criterion = NAAC_CRITERIA.find(c => c.no === criterionNo);
  if (!criterion) return 0;
  const sub = criterion.subCriteria.find(s => s.code === subCriterion);
  if (!sub) return 0;
  const requiredFields = sub.fields.filter(f => f.required && f.type !== 'file');
  if (requiredFields.length === 0) return 100;
  const filled = requiredFields.filter(f => savedData?.[f.name] && savedData[f.name] !== '').length;
  return Math.round((filled / requiredFields.length) * 100);
}

export function calcCriterionProgress(criterionNo, allSavedData) {
  const criterion = NAAC_CRITERIA.find(c => c.no === criterionNo);
  if (!criterion) return 0;
  let total = 0, filled = 0;
  criterion.subCriteria.forEach(sub => {
    const requiredFields = sub.fields.filter(f => f.required && f.type !== 'file');
    total += requiredFields.length;
    const subData = allSavedData?.[sub.code] || {};
    filled += requiredFields.filter(f => subData[f.name] && subData[f.name] !== '').length;
  });
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}
