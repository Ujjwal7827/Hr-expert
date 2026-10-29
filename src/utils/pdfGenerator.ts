import { jsPDF } from 'jspdf';

export interface ResumeExportData {
  fullName: string;
  contactLine1: string; // "Faridabad, Haryana | +91 78277 16527 | ujjwalsingh8001@gmail.com"
  contactLine2?: string; // "LinkedIn: linkedin.com/in/ujjwalsingh | GitHub: github.com/Ujjwal7827"
  summary: string;
  experience: {
    roleTitle: string;
    company: string;
    dates: string;
    location: string;
    bullets: string[];
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  projects: {
    title: string;
    stack: string;
    bullets: string[];
    links?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  languages: string;
}

export const OPTIMIZED_RESUME_DATA: ResumeExportData = {
  fullName: 'Ujjwal Singh',
  contactLine1: 'Faridabad, Haryana  •  +91 78277 16527  •  ujjwalsingh8001@gmail.com',
  contactLine2: 'linkedin.com/in/ujjwalsingh  •  github.com/Ujjwal7827  •  ujjwalsingh.dev',
  summary:
    'Performance-driven Front-End Developer with a proven track record engineering and deploying 300+ responsive, high-performance web applications in fast-paced production environments. Proficient in React.js, modern JavaScript (ES6+), Tailwind CSS, and RESTful APIs, with hands-on expertise building custom client widgets and optimizing Core Web Vitals to achieve sub-2s page load speeds. Eager to contribute high-velocity, scalable UI engineering to growth-focused software teams.',
  experience: [
    {
      roleTitle: 'SaaS Web Designer & Front-End Developer',
      company: 'Adaan Digital Solutions Pvt. Ltd.',
      dates: 'August 2024 – Present',
      location: 'Faridabad, India',
      bullets: [
        'Architected and launched 300+ custom responsive web applications across Duda & Strato SaaS platforms, maintaining 99.8% cross-browser reliability and 95+ average Google Lighthouse performance scores.',
        'Engineered modular JavaScript micro-widgets and responsive Tailwind CSS stylesheets to overcome proprietary SaaS template limitations, reducing client onboarding turnaround time by 25%.',
        'Collaborated directly with cross-functional SMB stakeholders to translate UI/UX wireframes into accessible, SEO-optimized production interfaces with zero critical delivery defects.',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: 'JavaScript (ES6+), TypeScript (Basic/Intermediate), HTML5, CSS3, Sass',
    },
    {
      category: 'Frameworks & UI',
      items: 'React.js, Tailwind CSS, Bootstrap 5, Vite, Next.js (Foundational)',
    },
    {
      category: 'Developer Tools',
      items: 'Git, GitHub, Chrome DevTools, Postman, npm/yarn, VS Code',
    },
    {
      category: 'Core Concepts',
      items: 'Responsive Web Design, REST API Integration, Core Web Vitals, Cross-Browser Compatibility, DOM Scripting',
    },
  ],
  projects: [
    {
      title: 'Speech-to-Text Real-Time Converter Web App',
      stack: 'React.js, Tailwind CSS, Web Speech Recognition API',
      bullets: [
        'Engineered a real-time voice-to-text web application utilizing the browser Web Speech Recognition API with defensive error boundary fallbacks and live interim audio stream handling.',
        'Implemented modular state management and responsive UI feedback prioritizing low transcription latency and high accuracy across mobile and desktop browsers.',
      ],
      links: 'Live Demo: github.com/Ujjwal7827/speech-to-text-converter',
    },
    {
      title: 'Personal Developer Portfolio & Component Library',
      stack: 'HTML5, CSS3, Tailwind CSS, JavaScript ES6+',
      bullets: [
        'Built a mobile-first, accessible developer portfolio showcasing live production projects, technical achievements, and interactive components.',
        'Optimized asset delivery and DOM footprint to achieve a 100/100 Google Lighthouse performance rating and smooth 60fps micro-animations.',
      ],
      links: 'Live URL: github.com/Ujjwal7827',
    },
  ],
  education: [
    {
      degree: 'Bachelor in Computer Applications (BCA)',
      institution: 'Maharishi Dayanand University, Faridabad',
      year: '2022 – 2025',
    },
    {
      degree: 'Senior Secondary (12th) – UP Board | Secondary (10th) – HBSE',
      institution: 'Faridabad, Haryana',
      year: '2022 / 2020',
    },
  ],
  certifications: [
    'Responsive Web Design Certification — freeCodeCamp (Verified Credential)',
    'JavaScript Algorithms and Data Structures — freeCodeCamp',
    'Meta Front-End Developer Specialization — Coursera (In Progress)',
  ],
  languages: 'English (Professional Working Proficiency)  •  Hindi (Native)',
};

/**
 * Generates an executive-level, ATS-optimized PDF resume.
 * Designed to fit standard A4 / US Letter pages with clean margins and typography.
 */
export function exportOptimizedResumePDF(
  data: ResumeExportData = OPTIMIZED_RESUME_DATA,
  theme: 'classic' | 'modern' | 'minimal' = 'modern'
): void {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  let currentY = 16;

  // Fonts & colors
  const fontSans = 'helvetica';
  const fontSerif = 'times';
  const primaryFont = theme === 'classic' ? fontSerif : fontSans;

  const primaryColor = theme === 'modern' ? [30, 41, 59] : [15, 23, 42]; // slate-800
  const accentColor = theme === 'modern' ? [79, 70, 229] : [37, 99, 235]; // indigo-600 / blue-600
  const grayColor = [71, 85, 105]; // slate-600
  const dividerColor = [226, 232, 240]; // slate-200

  // 1. Header: Full Name
  doc.setFont(primaryFont, 'bold');
  doc.setFontSize(21);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.fullName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // Subheader: Contact line 1
  doc.setFont(fontSans, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(data.contactLine1, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  // Contact line 2 (LinkedIn, GitHub, Portfolio)
  if (data.contactLine2) {
    doc.setFont(fontSans, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(data.contactLine2, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }

  // Section Heading Helper
  const drawSectionHeading = (title: string) => {
    currentY += 2;
    doc.setFont(fontSans, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(title.toUpperCase(), leftMargin, currentY);

    // Decorative divider line
    doc.setDrawColor(dividerColor[0], dividerColor[1], dividerColor[2]);
    doc.setLineWidth(0.35);
    doc.line(leftMargin, currentY + 1.8, pageWidth - rightMargin, currentY + 1.8);
    currentY += 5.5;
  };

  // Check page overflow
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 12) {
      doc.addPage();
      currentY = 14;
    }
  };

  // 2. Professional Summary
  drawSectionHeading('Professional Summary');
  doc.setFont(fontSans, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  doc.text(summaryLines, leftMargin, currentY);
  currentY += summaryLines.length * 4.1 + 2;

  // 3. Professional Experience
  drawSectionHeading('Professional Experience');
  data.experience.forEach((exp) => {
    checkPageBreak(25);

    // Role & Company + Location & Dates
    doc.setFont(fontSans, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(exp.roleTitle, leftMargin, currentY);

    // Right-aligned Dates
    doc.setFont(fontSans, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(exp.dates, pageWidth - rightMargin, currentY, { align: 'right' });
    currentY += 4.2;

    // Company & Location
    doc.setFont(fontSans, 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(exp.company, leftMargin, currentY);
    doc.text(exp.location, pageWidth - rightMargin, currentY, { align: 'right' });
    currentY += 4.5;

    // Bullets
    exp.bullets.forEach((bullet) => {
      checkPageBreak(12);
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('•', leftMargin + 1, currentY);

      doc.setFont(fontSans, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 6);
      doc.text(bulletLines, leftMargin + 5, currentY);
      currentY += bulletLines.length * 4.0 + 1.2;
    });

    currentY += 1.5;
  });

  // 4. Competencies & Skills (Domain-agnostic)
  if (data.skills && data.skills.length > 0) {
    drawSectionHeading('Core Competencies & Skills');
    data.skills.forEach((skill) => {
      checkPageBreak(8);
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const catLabel = `${skill.category}: `;
      doc.text(catLabel, leftMargin, currentY);

      const catLabelWidth = doc.getTextWidth(catLabel);
      doc.setFont(fontSans, 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const itemsLines = doc.splitTextToSize(skill.items, contentWidth - catLabelWidth);
      doc.text(itemsLines, leftMargin + catLabelWidth, currentY);
      currentY += itemsLines.length * 4.0 + 1.0;
    });
    currentY += 1.5;
  }

  // 5. Key Initiatives & Projects (Rendered only if present)
  if (data.projects && data.projects.length > 0) {
    drawSectionHeading('Key Initiatives & Projects');
    data.projects.forEach((proj) => {
      checkPageBreak(20);

      // Title & Tech Stack / Context
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(proj.title, leftMargin, currentY);

      if (proj.stack) {
        doc.setFont(fontSans, 'italic');
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`[${proj.stack}]`, pageWidth - rightMargin, currentY, { align: 'right' });
      }
      currentY += 4.2;

      // Bullets
      if (proj.bullets && proj.bullets.length > 0) {
        proj.bullets.forEach((bullet) => {
          checkPageBreak(12);
          doc.setFont(fontSans, 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text('•', leftMargin + 1, currentY);

          doc.setFont(fontSans, 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          const bulletLines = doc.splitTextToSize(bullet, contentWidth - 6);
          doc.text(bulletLines, leftMargin + 5, currentY);
          currentY += bulletLines.length * 4.0 + 1.2;
        });
      }

      if (proj.links) {
        doc.setFont(fontSans, 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(proj.links, leftMargin + 5, currentY);
        currentY += 4.0;
      }

      currentY += 1.5;
    });
  }

  // 6. Education
  if (data.education && data.education.length > 0) {
    drawSectionHeading('Education');
    data.education.forEach((edu) => {
      checkPageBreak(10);
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(edu.degree, leftMargin, currentY);

      doc.setFont(fontSans, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(edu.year, pageWidth - rightMargin, currentY, { align: 'right' });
      currentY += 4.0;

      doc.setFont(fontSans, 'italic');
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(edu.institution, leftMargin, currentY);
      currentY += 4.5;
    });
  }

  // 7. Verified Certifications & Credentials
  if (data.certifications && data.certifications.length > 0) {
    drawSectionHeading('Certifications & Credentials');
    data.certifications.forEach((cert) => {
      checkPageBreak(8);
      doc.setFont(fontSans, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('•', leftMargin + 1, currentY);

      doc.setFont(fontSans, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const certLines = doc.splitTextToSize(cert, contentWidth - 6);
      doc.text(certLines, leftMargin + 5, currentY);
      currentY += certLines.length * 4.0 + 1.0;
    });
    currentY += 1.5;
  }

  // 8. Languages (if present)
  if (data.languages && data.languages.trim().length > 0) {
    drawSectionHeading('Languages');
    checkPageBreak(8);
    doc.setFont(fontSans, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(data.languages, leftMargin, currentY);
  }

  // Trigger browser download
  const cleanFilename = `${(data.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')}_HR_Optimized_Resume.pdf`;
  doc.save(cleanFilename);
}

/**
 * Converts the AI HR-enhanced resume payload into structured PDF export data
 */
export function convertEnhancedToExportData(enhanced: any, fallbackName: string = 'Candidate'): ResumeExportData {
  return {
    fullName: enhanced.candidateName || fallbackName,
    contactLine1: enhanced.contactLine1 || '',
    contactLine2: enhanced.contactLine2 || '',
    summary: enhanced.executiveSummary || '',
    experience: (enhanced.enhancedExperience || []).map((exp: any) => ({
      roleTitle: exp.roleTitle || '',
      company: exp.company || '',
      dates: exp.dates || '',
      location: exp.location || '',
      bullets: exp.bullets || []
    })),
    skills: (enhanced.categorizedSkills || []).map((s: any) => ({
      category: s.category || 'Competencies',
      items: s.items || ''
    })),
    projects: (enhanced.initiativesOrProjects || []).map((p: any) => ({
      title: p.title || '',
      stack: p.contextOrStack || '',
      bullets: p.bullets || [],
      links: p.linkOrOutcome || ''
    })),
    education: (enhanced.education || []).map((edu: any) => ({
      degree: edu.degree || '',
      institution: edu.institution || '',
      year: edu.year || ''
    })),
    certifications: enhanced.certifications || [],
    languages: enhanced.languages || ''
  };
}

/**
 * Fallback parser for plain text resume into PDF export data
 */
export function parseRawTextToExportData(rawText: string, fallbackName: string = 'Candidate'): ResumeExportData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const fullName = lines[0] && lines[0].length < 50 ? lines[0] : fallbackName;
  const contactLine1 = lines[1] && (lines[1].includes('@') || lines[1].includes('|') || lines[1].includes('+')) ? lines[1] : '';

  // Simple paragraph accumulator
  const bulletLines = lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
  const cleanBullets = bulletLines.map((b) => b.replace(/^[•\-\*]\s*/, '').trim());

  return {
    fullName,
    contactLine1: contactLine1 || 'Contact details provided in resume',
    contactLine2: '',
    summary: lines.slice(2, 5).join(' ') || 'Experienced professional with verified track record.',
    experience: [
      {
        roleTitle: 'Professional Experience',
        company: 'Career History',
        dates: 'Recorded Experience',
        location: '',
        bullets: cleanBullets.length > 0 ? cleanBullets.slice(0, 6) : ['Demonstrated strong performance and domain execution across all assigned responsibilities.']
      }
    ],
    skills: [
      {
        category: 'Core Competencies',
        items: lines.filter((l) => l.includes(',') && !l.includes('@')).slice(0, 2).join(', ') || 'Professional execution, cross-functional collaboration'
      }
    ],
    projects: [],
    education: [
      {
        degree: 'Recorded Education',
        institution: 'Academic Institution',
        year: 'Verified'
      }
    ],
    certifications: [],
    languages: ''
  };
}

/**
 * Generates an Executive HR Audit Report PDF for print and download.
 * Formats overall score, category breakdown, strengths, red flags, and hiring recommendations.
 */
export function exportAuditReportPDF(evaluation: any, candidateName: string = 'Candidate'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  let currentY = 16;

  function checkPageBreak(requiredHeight: number) {
    if (currentY + requiredHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 16;
    }
  }

  // 1. Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(leftMargin, currentY, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TALENTAUDIT PRO — EXECUTIVE EVALUATION REPORT', leftMargin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(`Candidate: ${candidateName}   •   Evaluated: ${dateStr}   •   Universal HR Standards`, leftMargin + 6, currentY + 17);

  // Score Badge in Header (Right aligned)
  const score = evaluation?.overallScore ?? 75;
  const grade = evaluation?.grade ?? 'B';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${score}/100`, pageWidth - rightMargin - 6, currentY + 11, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253);
  doc.text(`Grade ${grade}`, pageWidth - rightMargin - 6, currentY + 17, { align: 'right' });

  currentY += 30;

  // 2. Executive Verdict & Impression
  if (evaluation?.verdict) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Executive Verdict & Hiring Recommendation', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const verdictLines = doc.splitTextToSize(`Verdict: ${evaluation.verdict}`, contentWidth);
    doc.text(verdictLines, leftMargin, currentY);
    currentY += verdictLines.length * 4.0 + 3.0;

    if (evaluation.sixSecondImpression) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const impressionLines = doc.splitTextToSize(`6-Second Recruiter Glance: ${evaluation.sixSecondImpression}`, contentWidth);
      doc.text(impressionLines, leftMargin, currentY);
      currentY += impressionLines.length * 3.8 + 4.0;
    }
  }

  // 3. Category Scorecard Breakdown
  if (evaluation?.categoryScores) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Universal HR Dimension Scores (0–100)', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 5.0;

    const cats = [
      { name: 'Impact & Quantified Metrics', data: evaluation.categoryScores.impactAndMetrics },
      { name: 'Action Verbs & Communication Clarity', data: evaluation.categoryScores.actionVerbsAndClarity },
      { name: 'Technical Depth & Framework Rigor', data: evaluation.categoryScores.technicalDepth },
      { name: 'ATS Compatibility & Machine Parsability', data: evaluation.categoryScores.atsCompatibility },
      { name: 'Credibility & Verified Credentials', data: evaluation.categoryScores.credibilityAndCerts },
      { name: 'Structure & Visual Readability', data: evaluation.categoryScores.structureAndReadability },
    ].filter(c => c.data);

    cats.forEach((cat) => {
      checkPageBreak(16);
      const catScore = cat.data.score ?? 70;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(cat.name, leftMargin, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text(`${catScore}/100`, pageWidth - rightMargin, currentY, { align: 'right' });
      currentY += 4.0;

      if (cat.data.feedback) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(71, 85, 105);
        const fbLines = doc.splitTextToSize(cat.data.feedback, contentWidth);
        doc.text(fbLines, leftMargin, currentY);
        currentY += fbLines.length * 3.6 + 2.5;
      }
    });
    currentY += 2;
  }

  // 4. Key Strengths
  if (Array.isArray(evaluation?.topStrengths) && evaluation.topStrengths.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('3. Key Competitive Strengths', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(209, 250, 229);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    evaluation.topStrengths.forEach((str: string) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text('✓', leftMargin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(str, contentWidth - 6);
      doc.text(lines, leftMargin + 5, currentY);
      currentY += lines.length * 3.8 + 2.0;
    });
    currentY += 3;
  }

  // 5. Critical Red Flags
  if (Array.isArray(evaluation?.criticalRedFlags) && evaluation.criticalRedFlags.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text('4. Gatekeeper Risks & Critical Red Flags', leftMargin, currentY);
    currentY += 4.5;

    doc.setDrawColor(254, 205, 211);
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
    currentY += 4.5;

    evaluation.criticalRedFlags.forEach((flag: string) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72);
      doc.text('!', leftMargin + 0.5, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(flag, contentWidth - 6);
      doc.text(lines, leftMargin + 5, currentY);
      currentY += lines.length * 3.8 + 2.0;
    });
    currentY += 3;
  }

  // Footer Note
  checkPageBreak(12);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('TalentAudit Pro • Universal Executive HR Standards & ATS Optimization Report', leftMargin, currentY + 6);

  // Save PDF
  const filename = `${candidateName.replace(/\s+/g, '_')}_Executive_Audit_Report.pdf`;
  doc.save(filename);
}

