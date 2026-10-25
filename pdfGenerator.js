import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LOGO_BASE64 } from '../assets/logoBase64.js';

export const generateProjectSummaryPdf = (group) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 14;

  // --- Header Background Bar ---
  doc.setFillColor(11, 61, 111); // Dronacharya deep navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(234, 179, 8); // Gold
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Embed Logo Image
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', 12, 3, 22, 22);
  } catch (err) {
    console.error('Error adding logo to PDF:', err);
  }

  // Institution Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DRONACHARYA R&D LAB MANAGMENT', (pageWidth / 2) + 8, 11, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Where Electronics Takes Flight • Drone Research, Avionics & Prototyping', (pageWidth / 2) + 8, 17, { align: 'center' });
  
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('CENTRAL HARDWARE INNOVATION LAB • AICTE APPROVED • NAAC ACCREDITED', (pageWidth / 2) + 8, 22, { align: 'center' });

  currentY = 36;

  // Document Title & Stamp
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PROJECT AUDIT & SUMMARY REPORT', 14, currentY);

  // Status Badge
  const isCompleted = group.status === 'completed';
  const isEliminated = group.status === 'eliminated';
  let statusText = 'IN PROGRESS';
  let badgeColor = [2, 132, 199]; // Sky blue

  if (isCompleted) {
    statusText = 'OFFICIALLY COMPLETED';
    badgeColor = [16, 185, 129]; // Emerald green
  } else if (isEliminated) {
    statusText = 'PROJECT ELIMINATED';
    badgeColor = [239, 68, 68]; // Red
  }

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(pageWidth - 62, currentY - 5, 48, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, pageWidth - 38, currentY - 0.5, { align: 'center' });

  currentY += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Ref: DCN/R&D/${group.id.toUpperCase()}  |  Generated: ${new Date().toLocaleString('en-IN')}`, 14, currentY);

  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 6;

  // --- Project Details Box ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'S');

  doc.setTextColor(11, 61, 111);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(group.projectTitle || 'Untitled Project', 18, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Group Name: ${group.groupName}`, 18, currentY + 13);
  doc.text(`Group Leader: ${group.leader.name} (Roll No: ${group.leader.rollNo})`, 18, currentY + 19);
  doc.text(`Email: ${group.leader.email || 'N/A'}  |  Phone: ${group.leader.phone || 'N/A'}`, 18, currentY + 24);

  doc.text(`Project Created: ${group.createdAt || 'N/A'}`, pageWidth - 65, currentY + 13);
  doc.text(`Active Members: ${(group.members || []).length + 1}`, pageWidth - 65, currentY + 19);

  currentY += 34;

  // --- Problem Statement & Application ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. Real-Life Problem Statement Solved:', 14, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const problemLines = doc.splitTextToSize(group.realLifeProblem || 'No problem statement provided.', pageWidth - 28);
  doc.text(problemLines, 14, currentY);
  currentY += problemLines.length * 4.2 + 2;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('2. Real-Life Applications & Societal Value:', 14, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const appLines = doc.splitTextToSize(group.realLifeApplication || 'No applications specified.', pageWidth - 28);
  doc.text(appLines, 14, currentY);
  currentY += appLines.length * 4.2 + 4;

  // --- Team Members Table ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('3. Project Team Roster & Compulsory Roll Numbers:', 14, currentY);
  currentY += 2;

  const teamData = [
    [1, `${group.leader.name} (Leader)`, group.leader.rollNo, 'Team Lead / System Architect'],
    ...(group.members || []).map((m, idx) => [
      idx + 2,
      m.name,
      m.rollNo,
      m.role || 'Hardware / Software Specialist'
    ])
  ];

  doc.autoTable({
    startY: currentY,
    head: [['#', 'Student Full Name', 'Compulsory Roll No.', 'Assigned Role & Responsibilities']],
    body: teamData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [11, 61, 111], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- Components Table ---
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 16;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('4. Components Inventory (Strict R&D Lab Tracking):', 14, currentY);
  currentY += 2;

  const componentRows = (group.components || []).map((c, idx) => [
    idx + 1,
    c.name,
    c.qty,
    c.purpose || c.specs || 'N/A',
    c.status.toUpperCase(),
    c.addedBy || 'Group Team'
  ]);

  doc.autoTable({
    startY: currentY,
    head: [['#', 'Component Description', 'Qty', 'Purpose / Specifications', 'Status', 'Logged By']],
    body: componentRows.length > 0 ? componentRows : [['-', 'No components logged', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      4: {
        fontStyle: 'bold',
        textColor: [0, 100, 0]
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.raw;
        if (val === 'REPLACED') {
          data.cell.styles.textColor = [202, 138, 4]; // Amber
        } else if (val === 'ELIMINATED') {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        } else {
          data.cell.styles.textColor = [22, 101, 52]; // Green
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- Lab Attendance Log Table ---
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('5. R&D Lab Entry & Exit Attendance Logs (Hours Clocked):', 14, currentY);
  currentY += 2;

  const attendanceRows = (group.labAttendance || []).map((att, idx) => [
    idx + 1,
    att.date,
    att.checkInTime || 'N/A',
    att.checkOutTime || 'Session Active',
    att.hours ? `${att.hours} hrs` : '-',
    att.activity || 'Prototyping Session',
    (att.attendedMembers || []).join(', ')
  ]);

  doc.autoTable({
    startY: currentY,
    head: [['#', 'Date', 'Entry Time', 'Exit Time', 'Duration', 'Activity Performed in Lab', 'Present Members']],
    body: attendanceRows.length > 0 ? attendanceRows : [['-', 'No lab sessions logged yet', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- Video Showcase Section ---
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 16;
  }

  if (group.video) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'S');

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`6. Project Showcase Video Demonstration:`, 18, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Title: ${group.video.title || 'Demo Showcase'}  |  Video URL: ${group.video.url || 'Uploaded to Portal Storage'}`, 18, currentY + 10);
    currentY += 20;
  }

  // --- Signatures block ---
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY + 6, pageHeight - 38);
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 8;

  const colWidth = (pageWidth - 28) / 3;

  // Signature 1
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('__________________________', 14 + 10, currentY);
  doc.text(`Group Leader Signature`, 14 + 10, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`${group.leader.name} (${group.leader.rollNo})`, 14 + 10, currentY + 8);

  // Signature 2
  doc.setFont('helvetica', 'bold');
  doc.text('__________________________', 14 + colWidth + 10, currentY);
  doc.text('Faculty Project Guide', 14 + colWidth + 10, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('Prof. R.K. Verma (Verification)', 14 + colWidth + 10, currentY + 8);

  // Signature 3
  doc.setFont('helvetica', 'bold');
  doc.text('__________________________', 14 + (colWidth * 2) + 10, currentY);
  doc.text('Head of Department (HOD)', 14 + (colWidth * 2) + 10, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('Dr. Sandeep (Approval Stamp)', 14 + (colWidth * 2) + 10, currentY + 8);

  // Save the PDF
  const sanitizedTitle = (group.groupName || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Dronacharya_RD_Report_${sanitizedTitle}.pdf`);
};
