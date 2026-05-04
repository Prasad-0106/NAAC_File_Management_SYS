const NAAC_CRITERIA = [
  {
    no: '1', title: 'Curricular Aspects', marks: 100,
    subCriteria: [
      { code: '1.1', title: 'Curriculum Design and Development', fields: [
        { name: 'programs_offered', label: 'Programs Offered', type: 'text' },
        { name: 'curriculum_revision_year', label: 'Last Curriculum Revision Year', type: 'number' },
        { name: 'cbcs_implemented', label: 'CBCS Implemented', type: 'radio', options: ['Yes','No'] },
        { name: 'syllabus_gap_analysis', label: 'Syllabus Gap Analysis Done', type: 'radio', options: ['Yes','No'] },
        { name: 'industry_input', label: 'Industry/Stakeholder Input in Curriculum', type: 'radio', options: ['Yes','No','Partial'] },
        { name: 'curriculum_doc_upload', label: 'Upload Curriculum Document', type: 'file' }
      ]},
      { code: '1.2', title: 'Curriculum Planning and Implementation', fields: [
        { name: 'academic_calendar', label: 'Academic Calendar Prepared', type: 'radio', options: ['Yes','No'] },
        { name: 'lesson_plans', label: 'Lesson Plans Maintained', type: 'radio', options: ['Yes','No'] },
        { name: 'slow_learner_program', label: 'Programs for Slow/Advanced Learners', type: 'radio', options: ['Yes','No'] },
        { name: 'ict_usage_percent', label: 'ICT Usage in Teaching (%)', type: 'number' },
        { name: 'academic_calendar_upload', label: 'Upload Academic Calendar', type: 'file' }
      ]},
      { code: '1.3', title: 'Academic Flexibility', fields: [
        { name: 'elective_courses', label: 'Number of Elective Courses Offered', type: 'number' },
        { name: 'value_added_courses', label: 'Number of Value Added Courses', type: 'number' },
        { name: 'interdisciplinary_courses', label: 'Interdisciplinary Courses Available', type: 'radio', options: ['Yes','No'] },
        { name: 'project_based_learning', label: 'Project Based Learning Implemented', type: 'radio', options: ['Yes','No'] },
        { name: 'flexibility_doc', label: 'Upload Supporting Document', type: 'file' }
      ]},
      { code: '1.4', title: 'Curriculum Enrichment', fields: [
        { name: 'add_on_courses', label: 'Add-on Courses Conducted', type: 'number' },
        { name: 'certification_programs', label: 'Certification Programs Offered', type: 'number' },
        { name: 'industry_visits', label: 'Industry Visits Organized', type: 'number' },
        { name: 'guest_lectures', label: 'Guest Lectures Organized', type: 'number' },
        { name: 'enrichment_doc', label: 'Upload Supporting Document', type: 'file' }
      ]},
      { code: '1.5', title: 'Feedback System', fields: [
        { name: 'feedback_from', label: 'Feedback Collected From', type: 'multiselect', options: ['Students','Teachers','Alumni','Employers','Parents'] },
        { name: 'feedback_analysis_done', label: 'Feedback Analyzed and Action Taken', type: 'radio', options: ['Yes','No'] },
        { name: 'feedback_report_upload', label: 'Upload Feedback Report', type: 'file' }
      ]}
    ]
  },
  {
    no: '2', title: 'Teaching-Learning and Evaluation', marks: 350,
    subCriteria: [
      { code: '2.1', title: 'Student Enrolment and Profile', fields: [
        { name: 'total_students', label: 'Total Students Enrolled', type: 'number' },
        { name: 'sc_st_percent', label: 'SC/ST Students (%)', type: 'number' },
        { name: 'obc_percent', label: 'OBC Students (%)', type: 'number' },
        { name: 'female_percent', label: 'Female Students (%)', type: 'number' },
        { name: 'differently_abled', label: 'Differently-Abled Students', type: 'number' },
        { name: 'enrolment_doc', label: 'Upload Enrolment Register', type: 'file' }
      ]},
      { code: '2.2', title: 'Catering to Student Diversity', fields: [
        { name: 'bridge_courses', label: 'Bridge/Remedial Courses Offered', type: 'radio', options: ['Yes','No'] },
        { name: 'advanced_learner_programs', label: 'Programs for Advanced Learners', type: 'radio', options: ['Yes','No'] },
        { name: 'mentoring_system', label: 'Mentoring System in Place', type: 'radio', options: ['Yes','No'] },
        { name: 'mentor_ratio', label: 'Mentor-Mentee Ratio', type: 'text' },
        { name: 'diversity_doc', label: 'Upload Supporting Document', type: 'file' }
      ]},
      { code: '2.3', title: 'Teaching-Learning Process', fields: [
        { name: 'student_centric_methods', label: 'Student-Centric Methods Used', type: 'multiselect', options: ['Experiential Learning','Participative Learning','Problem Solving','Case Studies','Flipped Classroom','Collaborative Learning'] },
        { name: 'ict_tools_used', label: 'ICT Tools Used', type: 'multiselect', options: ['LMS','Smart Board','MOOC','e-Resources','Video Lectures','Simulation'] },
        { name: 'faculty_student_ratio', label: 'Faculty-Student Ratio', type: 'text' },
        { name: 'teaching_doc', label: 'Upload Teaching Plan/Sample', type: 'file' }
      ]},
      { code: '2.4', title: 'Teacher Profile and Quality', fields: [
        { name: 'total_faculty', label: 'Total Faculty', type: 'number' },
        { name: 'phd_faculty', label: 'Faculty with Ph.D.', type: 'number' },
        { name: 'net_set_faculty', label: 'Faculty with NET/SET', type: 'number' },
        { name: 'avg_experience', label: 'Average Teaching Experience (Years)', type: 'number' },
        { name: 'awards_recognition', label: 'Awards/Recognition Received', type: 'text' },
        { name: 'faculty_doc', label: 'Upload Faculty List', type: 'file' }
      ]},
      { code: '2.5', title: 'Evaluation Process and Reforms', fields: [
        { name: 'internal_assessment_percent', label: 'Internal Assessment Weightage (%)', type: 'number' },
        { name: 'continuous_evaluation', label: 'Continuous Evaluation Implemented', type: 'radio', options: ['Yes','No'] },
        { name: 'question_bank', label: 'Question Bank Maintained', type: 'radio', options: ['Yes','No'] },
        { name: 'grievance_redressal', label: 'Grievance Redressal Mechanism', type: 'radio', options: ['Yes','No'] },
        { name: 'evaluation_doc', label: 'Upload Evaluation Policy', type: 'file' }
      ]},
      { code: '2.6', title: 'Student Performance and Learning Outcomes', fields: [
        { name: 'pass_percentage', label: 'Overall Pass Percentage (%)', type: 'number' },
        { name: 'distinction_percent', label: 'Students with Distinction (%)', type: 'number' },
        { name: 'first_class_percent', label: 'Students with First Class (%)', type: 'number' },
        { name: 'pos_cos_defined', label: 'POs and COs Defined', type: 'radio', options: ['Yes','No'] },
        { name: 'attainment_level', label: 'CO Attainment Level', type: 'dropdown', options: ['Level 1','Level 2','Level 3'] },
        { name: 'results_doc', label: 'Upload Results Summary', type: 'file' }
      ]},
      { code: '2.7', title: 'Student Satisfaction Survey', fields: [
        { name: 'sss_conducted', label: 'Student Satisfaction Survey Conducted', type: 'radio', options: ['Yes','No'] },
        { name: 'sss_score', label: 'Student Satisfaction Score (out of 5)', type: 'number' },
        { name: 'sss_participants', label: 'Number of Students Participated', type: 'number' },
        { name: 'sss_doc', label: 'Upload SSS Report', type: 'file' }
      ]}
    ]
  },
  {
    no: '3', title: 'Research, Innovations and Extension', marks: 120,
    subCriteria: [
      { code: '3.1', title: 'Promotion of Research and Facilities', fields: [
        { name: 'research_policy', label: 'Research Policy in Place', type: 'radio', options: ['Yes','No'] },
        { name: 'research_committee', label: 'Research Committee Formed', type: 'radio', options: ['Yes','No'] },
        { name: 'seed_money_provided', label: 'Seed Money Provided to Faculty', type: 'radio', options: ['Yes','No'] },
        { name: 'seed_money_amount', label: 'Total Seed Money (INR)', type: 'number' },
        { name: 'research_doc', label: 'Upload Research Policy Document', type: 'file' }
      ]},
      { code: '3.2', title: 'Resource Mobilization for Research', fields: [
        { name: 'funded_projects', label: 'Number of Funded Projects', type: 'number' },
        { name: 'total_grant_received', label: 'Total Grant Received (INR)', type: 'number' },
        { name: 'funding_agencies', label: 'Funding Agencies', type: 'text' },
        { name: 'projects_doc', label: 'Upload Project Sanction Letters', type: 'file' }
      ]},
      { code: '3.3', title: 'Innovation Ecosystem', fields: [
        { name: 'innovation_cell', label: 'Innovation/Incubation Cell', type: 'radio', options: ['Yes','No'] },
        { name: 'startups_supported', label: 'Startups Supported', type: 'number' },
        { name: 'patents_filed', label: 'Patents Filed', type: 'number' },
        { name: 'patents_granted', label: 'Patents Granted', type: 'number' },
        { name: 'innovation_doc', label: 'Upload Innovation Cell Details', type: 'file' }
      ]},
      { code: '3.4', title: 'Research Publications and Awards', fields: [
        { name: 'journal_publications', label: 'Journal Publications (Last 5 Years)', type: 'number' },
        { name: 'scopus_publications', label: 'Scopus/WoS Indexed Publications', type: 'number' },
        { name: 'books_published', label: 'Books/Book Chapters Published', type: 'number' },
        { name: 'phd_awarded', label: 'Ph.D. Awarded (Guided)', type: 'number' },
        { name: 'publications_doc', label: 'Upload Publication List', type: 'file' }
      ]},
      { code: '3.5', title: 'Consultancy', fields: [
        { name: 'consultancy_policy', label: 'Consultancy Policy Available', type: 'radio', options: ['Yes','No'] },
        { name: 'consultancy_projects', label: 'Number of Consultancy Projects', type: 'number' },
        { name: 'consultancy_revenue', label: 'Revenue from Consultancy (INR)', type: 'number' },
        { name: 'consultancy_doc', label: 'Upload Consultancy Records', type: 'file' }
      ]},
      { code: '3.6', title: 'Extension Activities', fields: [
        { name: 'nss_ncc', label: 'NSS/NCC Units', type: 'radio', options: ['Yes','No'] },
        { name: 'extension_activities_count', label: 'Extension Activities Conducted', type: 'number' },
        { name: 'community_impact', label: 'Community Impact Description', type: 'text' },
        { name: 'awards_extension', label: 'Awards for Extension Activities', type: 'text' },
        { name: 'extension_doc', label: 'Upload Extension Activity Reports', type: 'file' }
      ]},
      { code: '3.7', title: 'Collaboration', fields: [
        { name: 'mou_count', label: 'Number of MoUs Signed', type: 'number' },
        { name: 'international_collaborations', label: 'International Collaborations', type: 'number' },
        { name: 'collaboration_activities', label: 'Activities under Collaborations', type: 'text' },
        { name: 'collaboration_doc', label: 'Upload MoU Documents', type: 'file' }
      ]}
    ]
  },
  {
    no: '4', title: 'Infrastructure and Learning Resources', marks: 100,
    subCriteria: [
      { code: '4.1', title: 'Physical Facilities', fields: [
        { name: 'classrooms', label: 'Number of Classrooms', type: 'number' },
        { name: 'labs', label: 'Number of Laboratories', type: 'number' },
        { name: 'smart_classrooms', label: 'Smart Classrooms Available', type: 'number' },
        { name: 'sports_facilities', label: 'Sports Facilities Available', type: 'radio', options: ['Yes','No'] },
        { name: 'campus_area', label: 'Campus Area (in acres)', type: 'number' },
        { name: 'infra_doc', label: 'Upload Infrastructure Details', type: 'file' }
      ]},
      { code: '4.2', title: 'Library as a Learning Resource', fields: [
        { name: 'total_books', label: 'Total Books in Library', type: 'number' },
        { name: 'journals_subscribed', label: 'Journals Subscribed', type: 'number' },
        { name: 'e_resources', label: 'e-Resources/Digital Library', type: 'radio', options: ['Yes','No'] },
        { name: 'library_automation', label: 'Library Automation Software', type: 'text' },
        { name: 'library_doc', label: 'Upload Library Report', type: 'file' }
      ]},
      { code: '4.3', title: 'IT Infrastructure', fields: [
        { name: 'computers', label: 'Total Computers Available', type: 'number' },
        { name: 'student_computer_ratio', label: 'Student-Computer Ratio', type: 'text' },
        { name: 'internet_speed', label: 'Internet Bandwidth (Mbps)', type: 'number' },
        { name: 'wifi_campus', label: 'Wi-Fi on Campus', type: 'radio', options: ['Yes','No'] },
        { name: 'lms_used', label: 'LMS Platform Used', type: 'text' },
        { name: 'it_doc', label: 'Upload IT Infrastructure Report', type: 'file' }
      ]},
      { code: '4.4', title: 'Maintenance of Campus Infrastructure', fields: [
        { name: 'maintenance_budget', label: 'Annual Maintenance Budget (INR)', type: 'number' },
        { name: 'maintenance_policy', label: 'Maintenance Policy Document', type: 'radio', options: ['Yes','No'] },
        { name: 'green_initiatives', label: 'Green/Sustainable Initiatives', type: 'text' },
        { name: 'maintenance_doc', label: 'Upload Maintenance Records', type: 'file' }
      ]}
    ]
  },
  {
    no: '5', title: 'Student Support and Progression', marks: 130,
    subCriteria: [
      { code: '5.1', title: 'Student Support', fields: [
        { name: 'scholarships_govt', label: 'Government Scholarships Available', type: 'radio', options: ['Yes','No'] },
        { name: 'scholarships_institutional', label: 'Institutional Scholarships Available', type: 'radio', options: ['Yes','No'] },
        { name: 'scholarship_beneficiaries', label: 'Number of Scholarship Beneficiaries', type: 'number' },
        { name: 'career_guidance_cell', label: 'Career Guidance Cell', type: 'radio', options: ['Yes','No'] },
        { name: 'counselling_available', label: 'Counselling Services Available', type: 'radio', options: ['Yes','No'] },
        { name: 'support_doc', label: 'Upload Student Support Records', type: 'file' }
      ]},
      { code: '5.2', title: 'Student Progression', fields: [
        { name: 'higher_studies_percent', label: 'Students Pursuing Higher Studies (%)', type: 'number' },
        { name: 'placement_percent', label: 'Placement Rate (%)', type: 'number' },
        { name: 'avg_salary', label: 'Average Salary Package (INR)', type: 'number' },
        { name: 'competitive_exam_qualified', label: 'Students Qualified in Competitive Exams', type: 'number' },
        { name: 'progression_doc', label: 'Upload Placement/Progression Report', type: 'file' }
      ]},
      { code: '5.3', title: 'Student Participation and Activities', fields: [
        { name: 'cultural_activities', label: 'Cultural/Literary Activities Organized', type: 'number' },
        { name: 'sports_achievements', label: 'Sports Achievements (State/National)', type: 'text' },
        { name: 'student_awards', label: 'Student Awards/Recognition', type: 'text' },
        { name: 'student_council', label: 'Student Council in Place', type: 'radio', options: ['Yes','No'] },
        { name: 'participation_doc', label: 'Upload Activity Reports', type: 'file' }
      ]},
      { code: '5.4', title: 'Alumni Engagement', fields: [
        { name: 'alumni_association', label: 'Alumni Association Registered', type: 'radio', options: ['Yes','No'] },
        { name: 'alumni_contributions', label: 'Alumni Contributions (INR)', type: 'number' },
        { name: 'alumni_meets', label: 'Alumni Meets Organized', type: 'number' },
        { name: 'alumni_doc', label: 'Upload Alumni Records', type: 'file' }
      ]}
    ]
  },
  {
    no: '6', title: 'Governance, Leadership and Management', marks: 100,
    subCriteria: [
      { code: '6.1', title: 'Institutional Vision and Leadership', fields: [
        { name: 'vision_mission_defined', label: 'Vision & Mission Defined', type: 'radio', options: ['Yes','No'] },
        { name: 'decentralized_governance', label: 'Decentralized Governance Structure', type: 'radio', options: ['Yes','No'] },
        { name: 'strategic_plan', label: 'Strategic Plan in Place', type: 'radio', options: ['Yes','No'] },
        { name: 'governance_doc', label: 'Upload Governance Policy', type: 'file' }
      ]},
      { code: '6.2', title: 'Strategy Development and Deployment', fields: [
        { name: 'perspective_plan', label: 'Perspective Plan Prepared', type: 'radio', options: ['Yes','No'] },
        { name: 'erp_implemented', label: 'ERP/MIS System Implemented', type: 'radio', options: ['Yes','No'] },
        { name: 'erp_system_name', label: 'ERP/MIS System Name', type: 'text' },
        { name: 'strategy_doc', label: 'Upload Strategy Documents', type: 'file' }
      ]},
      { code: '6.3', title: 'Faculty Empowerment Strategies', fields: [
        { name: 'appraisal_system', label: 'Performance Appraisal System', type: 'radio', options: ['Yes','No'] },
        { name: 'fdp_programs', label: 'FDP Programs Conducted', type: 'number' },
        { name: 'welfare_schemes', label: 'Faculty Welfare Schemes', type: 'text' },
        { name: 'faculty_empowerment_doc', label: 'Upload FDP/Appraisal Records', type: 'file' }
      ]},
      { code: '6.4', title: 'Financial Management and Resource Mobilization', fields: [
        { name: 'annual_budget', label: 'Annual Budget (INR)', type: 'number' },
        { name: 'audit_done', label: 'Internal/External Audit Conducted', type: 'radio', options: ['Yes','No'] },
        { name: 'resource_mobilization', label: 'Resource Mobilization Activities', type: 'text' },
        { name: 'finance_doc', label: 'Upload Audit Report', type: 'file' }
      ]},
      { code: '6.5', title: 'Internal Quality Assurance System', fields: [
        { name: 'iqac_constituted', label: 'IQAC Constituted', type: 'radio', options: ['Yes','No'] },
        { name: 'aqar_submitted', label: 'AQAR Submitted to NAAC', type: 'radio', options: ['Yes','No'] },
        { name: 'quality_initiatives', label: 'Quality Initiatives Undertaken', type: 'text' },
        { name: 'iqac_meetings', label: 'IQAC Meetings Conducted Per Year', type: 'number' },
        { name: 'iqac_doc', label: 'Upload IQAC Minutes/AQAR', type: 'file' }
      ]}
    ]
  },
  {
    no: '7', title: 'Institutional Values and Best Practices', marks: 100,
    subCriteria: [
      { code: '7.1', title: 'Institutional Values and Social Responsibilities', fields: [
        { name: 'gender_equity_programs', label: 'Gender Equity Programs Conducted', type: 'number' },
        { name: 'environment_initiatives', label: 'Environmental Sustainability Initiatives', type: 'text' },
        { name: 'green_practices', label: 'Green Practices Adopted', type: 'multiselect', options: ['Solar Energy','Rainwater Harvesting','Waste Management','Green Audit','Plastic-Free Campus'] },
        { name: 'disabled_friendly', label: 'Differently-Abled Friendly Infrastructure', type: 'radio', options: ['Yes','No','Partial'] },
        { name: 'human_values_programs', label: 'Human Values/Ethics Programs', type: 'number' },
        { name: 'values_doc', label: 'Upload Supporting Documents', type: 'file' }
      ]},
      { code: '7.2', title: 'Best Practices', fields: [
        { name: 'best_practice_1_title', label: 'Best Practice 1 Title', type: 'text' },
        { name: 'best_practice_1_desc', label: 'Best Practice 1 Description', type: 'text' },
        { name: 'best_practice_2_title', label: 'Best Practice 2 Title', type: 'text' },
        { name: 'best_practice_2_desc', label: 'Best Practice 2 Description', type: 'text' },
        { name: 'best_practices_doc', label: 'Upload Best Practices Document', type: 'file' }
      ]},
      { code: '7.3', title: 'Institutional Distinctiveness', fields: [
        { name: 'distinctiveness_desc', label: 'Institutional Distinctiveness Description', type: 'text' },
        { name: 'unique_features', label: 'Unique Features/Achievements', type: 'text' },
        { name: 'distinctiveness_doc', label: 'Upload Distinctiveness Document', type: 'file' }
      ]}
    ]
  }
];

module.exports = { NAAC_CRITERIA };
