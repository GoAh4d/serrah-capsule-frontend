import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  Footer, TabStopType, TabStopPosition, PageNumberElement
} from 'docx';

// ── DESIGN SYSTEM ─────────────────────────────────
const C = {
  brand:      '1D9E75',
  brandDark:  '155f46',
  navy:       '0D1829',
  white:      'FFFFFF',
  rowAlt:     'F0FAF6',
  rowWhite:   'FFFFFF',
  success:    '1D9E75',
  warning:    'D97706',
  error:      'DC2626',
  skipped:    '6B7280',
  border:     'D1D5DB',
  labelBg:    'F3F4F6',
  black:      '111827',
  headerBg:   '0D1829',
};

const W = 9360; // content width in DXA (US Letter, 0.75" margins)

const border = { style: BorderStyle.SINGLE, size: 1, color: C.border };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top:    { style: BorderStyle.NONE, size: 0, color: C.white },
  bottom: { style: BorderStyle.NONE, size: 0, color: C.white },
  left:   { style: BorderStyle.NONE, size: 0, color: C.white },
  right:  { style: BorderStyle.NONE, size: 0, color: C.white },
};

function cell(children, opts = {}) {
  return new TableCell({
    borders: opts.noBorder ? noBorders : borders,
    width: { size: opts.width || W, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: opts.span,
    children: Array.isArray(children) ? children : [children],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after || 0 },
    border: opts.underline ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.brand, space: 4 } } : undefined,
    children: [new TextRun({
      text,
      bold: opts.bold,
      size: opts.size || 20,
      color: opts.color || C.black,
      font: 'Arial',
    })]
  });
}

function spacer(before = 160) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [new TextRun('')] });
}

function sectionHeading(num, title) {
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.brand, space: 4 } },
    children: [new TextRun({ text: `${num}  ${title}`, bold: true, size: 26, color: C.brandDark, font: 'Arial' })]
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function deriveDuration(start, end) {
  if (!start || !end) return '—';
  const secs = Math.round((new Date(end) - new Date(start)) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function deriveStatus(stepSummaries, topStatus) {
  if (!stepSummaries || stepSummaries.length === 0) return topStatus;
  const hasError = stepSummaries.some(s => s.status === 'failed' || s.status === 'error');
  const hasWarning = stepSummaries.some(s => s.status === 'warning');
  if (hasError) return 'error';
  if (hasWarning) return 'warning';
  return 'success';
}

// ── REPORT GENERATOR ──────────────────────────────
export async function generateReport(job) {
  const steps = job.step_summaries || [];
  const errors = job.validation_errors || [];
  const roles = job.roles || [];
  const permissions = job.permissions || [];
  const assignments = job.assignments || [];
  const screenshots = job.screenshots || [];

  const derivedStatus = deriveStatus(steps, job.status);
  const completedCount = steps.filter(s => s.status === 'completed').length || (job.status === 'completed_success' ? (roles.length + permissions.length + assignments.length) : 0);
  const warningCount  = steps.filter(s => s.status === 'warning').length;
  const errorCount    = steps.filter(s => s.status === 'failed' || s.status === 'error').length;
  const totalSteps    = steps.length || (roles.length + permissions.length + assignments.length);

  const statusLabel = derivedStatus === 'error' ? 'COMPLETED WITH ERRORS' :
                      derivedStatus === 'warning' ? 'COMPLETED WITH WARNINGS' :
                      job.status === 'validation_failed' ? 'VALIDATION FAILED' :
                      'COMPLETED SUCCESSFULLY';
  const statusColor = derivedStatus === 'error' ? C.error :
                      derivedStatus === 'warning' ? C.warning : C.brand;

  const stepIcon = { completed: '✓', warning: '⚠', failed: '✗', error: '✗', skipped: '—', blocked: '○' };
  const stepColor = { completed: C.success, warning: C.warning, failed: C.error, error: C.error, skipped: C.skipped, blocked: C.skipped };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: W }],
            spacing: { before: 0, after: 0 },
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.border, space: 4 } },
            children: [
              new TextRun({ text: `Serrah Execution Report  ·  Job ${(job.job_id || '').slice(0, 8)}…  ·  ${job.environment_label || '—'}`, size: 16, color: C.skipped, font: 'Arial' }),
              new TextRun({ text: '\t', font: 'Arial' }),
              new TextRun({ text: 'Page ', size: 16, color: C.skipped, font: 'Arial' }),
              new PageNumberElement({ size: 16, color: C.skipped, font: 'Arial' }),
            ]
          })]
        })
      },
      children: [

        // ── COVER BANNER ────────────────────────────
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [W],
          rows: [new TableRow({ children: [cell([
            new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: 'SERRAH', bold: true, size: 52, color: C.white, font: 'Arial' })] }),
            new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: 'Execution Protocol Report', size: 24, color: 'CCFCE8', font: 'Arial' })] }),
            new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: `${job.environment_label || '—'}  ·  ${job.workbook_type || 'SAP SF RBP'}  ·  ${formatDate(job.executedAt || job.created_at)}`, size: 20, color: 'CCFCE8', font: 'Arial' })] }),
          ], { fill: C.headerBg, width: W, noBorder: true })] })]
        }),

        // Status badge
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [W],
          rows: [new TableRow({ children: [cell(
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: [new TextRun({ text: statusLabel, bold: true, size: 22, color: C.white, font: 'Arial' })] }),
            { fill: statusColor, width: W, noBorder: true }
          )] })]
        }),

        spacer(240),

        // ── SECTION 1 — JOB METADATA ────────────────
        sectionHeading('1', 'Job Metadata'),
        spacer(80),
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [2400, W - 2400],
          rows: [
            ['Job ID',          job.job_id || '—'],
            ['Environment',     job.environment_label || '—'],
            ['Source Workbook', job.fileName || '—'],
            ['Config Type',     job.workbook_type || 'SAP SF RBP'],
            ['Submitted',       formatDate(job.created_at)],
            ['Completed',       formatDate(job.executedAt)],
            ['Duration',        deriveDuration(job.created_at, job.executedAt)],
            ['Confidence',      job.confidence != null ? `${Math.round(job.confidence * 100)}%` : '—'],
          ].map(([label, value], i) => new TableRow({ children: [
            cell(p(label, { bold: true, size: 20, color: C.black }), { fill: C.labelBg, width: 2400 }),
            cell(p(value, { size: 20 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W - 2400 }),
          ]}))
        }),

        spacer(240),

        // ── SECTION 2 — EXECUTION SUMMARY ───────────
        sectionHeading('2', 'Execution Summary'),
        spacer(80),
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [W/4, W/4, W/4, W/4],
          rows: [
            new TableRow({ children: [
              cell(p('Total Steps', { bold: true, size: 18, color: C.white, align: AlignmentType.CENTER }), { fill: C.headerBg, width: W/4 }),
              cell(p('Completed',   { bold: true, size: 18, color: C.white, align: AlignmentType.CENTER }), { fill: C.headerBg, width: W/4 }),
              cell(p('Warnings',    { bold: true, size: 18, color: C.white, align: AlignmentType.CENTER }), { fill: C.headerBg, width: W/4 }),
              cell(p('Errors',      { bold: true, size: 18, color: C.white, align: AlignmentType.CENTER }), { fill: C.headerBg, width: W/4 }),
            ]}),
            new TableRow({ children: [
              cell(p(String(totalSteps),    { bold: true, size: 28, align: AlignmentType.CENTER }), { fill: C.rowWhite, width: W/4 }),
              cell(p(String(completedCount),{ bold: true, size: 28, color: C.success, align: AlignmentType.CENTER }), { fill: C.rowWhite, width: W/4 }),
              cell(p(String(warningCount),  { bold: true, size: 28, color: C.warning, align: AlignmentType.CENTER }), { fill: C.rowWhite, width: W/4 }),
              cell(p(String(errorCount),    { bold: true, size: 28, color: errorCount > 0 ? C.error : C.black, align: AlignmentType.CENTER }), { fill: C.rowWhite, width: W/4 }),
            ]}),
          ]
        }),
        spacer(120),
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [W - 1800, 1800],
          rows: [
            ['Roles submitted',       String(roles.length)],
            ['Permissions submitted', String(permissions.length)],
            ['Assignments submitted', String(assignments.length)],
            ['Total rows',            String(roles.length + permissions.length + assignments.length)],
          ].map(([label, value], i) => new TableRow({ children: [
            cell(p(label, { bold: true, size: 20 }), { fill: C.labelBg, width: W - 1800 }),
            cell(p(value, { size: 20, align: AlignmentType.RIGHT }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 1800 }),
          ]}))
        }),

        spacer(240),

        // ── SECTION 3 — STEP LOG ────────────────────
        sectionHeading('3', 'Step Log'),
        ...(warningCount > 0 || errorCount > 0 ? [
          spacer(80),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [W],
            rows: [new TableRow({ children: [cell(
              p(`⚠  ${warningCount} warning(s) and ${errorCount} error(s) detected.`, { size: 18, color: C.black }),
              { fill: 'FEF3C7', width: W }
            )] })]
          }),
        ] : []),
        spacer(80),
        steps.length === 0
          ? new Table({
              width: { size: W, type: WidthType.DXA },
              columnWidths: [W],
              rows: [new TableRow({ children: [cell(p('Step-level data not yet available.', { size: 18, color: C.skipped }), { width: W })] })]
            })
          : new Table({
              width: { size: W, type: WidthType.DXA },
              columnWidths: [600, 4800, 1500, W - 6900],
              rows: [
                new TableRow({ children: [
                  cell(p('#',      { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 600 }),
                  cell(p('Step',   { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 4800 }),
                  cell(p('Status', { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 1500 }),
                  cell(p('Note',   { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W - 6900 }),
                ]}),
                ...steps.map((step, i) => {
                  const icon  = stepIcon[step.status] || '·';
                  const color = stepColor[step.status] || C.black;
                  const fill  = i % 2 === 0 ? C.rowWhite : C.rowAlt;
                  const isHighlight = step.status === 'warning' || step.status === 'failed' || step.status === 'error';
                  return new TableRow({ children: [
                    cell(p(String(step.index ?? i + 1), { size: 18, color: C.skipped }), { fill, width: 600 }),
                    cell(p(step.label || '—', { size: 18, bold: isHighlight }), { fill, width: 4800 }),
                    cell(p(`${icon} ${step.status}`, { size: 18, bold: isHighlight, color }), { fill, width: 1500 }),
                    cell(p(step.error || '—', { size: 18, color: step.error ? C.error : C.skipped }), { fill, width: W - 6900 }),
                  ]});
                }),
              ]
            }),

        spacer(240),

        // ── SECTION 4 — CONFIGURATION DETAILS ───────
        sectionHeading('4', 'Configuration Details'),
        spacer(120),

        // Roles
        ...(roles.length > 0 ? [
          p('Roles', { bold: true, size: 22, color: C.brandDark, before: 80, after: 80 }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [3000, 1800, W - 4800],
            rows: [
              new TableRow({ children: [
                cell(p('Role Name',   { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 3000 }),
                cell(p('Action',      { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 1800 }),
                cell(p('Description', { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W - 4800 }),
              ]}),
              ...roles.map((r, i) => new TableRow({ children: [
                cell(p(r.name || '—',        { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 3000 }),
                cell(p(r.action || '—',      { size: 18, bold: true }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 1800 }),
                cell(p(r.description || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W - 4800 }),
              ]})),
            ]
          }),
          spacer(120),
        ] : []),

        // Permissions
        ...(permissions.length > 0 ? [
          p('Permissions', { bold: true, size: 22, color: C.brandDark, before: 80, after: 80 }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [3000, 3000, W - 6000],
            rows: [
              new TableRow({ children: [
                cell(p('Category',    { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 3000 }),
                cell(p('Permission',  { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 3000 }),
                cell(p('Access Level',{ bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W - 6000 }),
              ]}),
              ...permissions.map((pm, i) => new TableRow({ children: [
                cell(p(pm.category   || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 3000 }),
                cell(p(pm.permission || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 3000 }),
                cell(p(pm.access     || '—', { size: 18, bold: true, color: C.success }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W - 6000 }),
              ]})),
            ]
          }),
          spacer(120),
        ] : []),

        // Assignments
        ...(assignments.length > 0 ? [
          p('Role Assignments', { bold: true, size: 22, color: C.brandDark, before: 80, after: 80 }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [W/3, W/3, W/3],
            rows: [
              new TableRow({ children: [
                cell(p('Role',              { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W/3 }),
                cell(p('Access Population', { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W/3 }),
                cell(p('Target Population', { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W/3 }),
              ]}),
              ...assignments.map((a, i) => new TableRow({ children: [
                cell(p(a.role              || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W/3 }),
                cell(p(a.access_population || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W/3 }),
                cell(p(a.target_population || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W/3 }),
              ]})),
            ]
          }),
        ] : []),

        spacer(240),

        // ── SECTION 5 — SCREENSHOTS (placeholder) ───
        ...(screenshots.length > 0 ? [
          sectionHeading('5', 'Screenshot Evidence'),
          p('Key frames captured during execution.', { size: 18, color: C.skipped, before: 80, after: 80 }),
          ...screenshots.flatMap((sc, i) => {
            const step = steps.find(s => s.index === sc.step);
            const isAlert = step && (step.status === 'warning' || step.status === 'failed');
            return [
              p(`Step ${sc.step} — ${step?.label || ''}${isAlert ? '  ⚠ ' + (step.error || '') : ''}`, {
                bold: true, size: 20, color: isAlert ? C.warning : C.black, before: 120, after: 60
              }),
              new Table({
                width: { size: W, type: WidthType.DXA },
                columnWidths: [W],
                rows: [new TableRow({ children: [cell(
                  p(`[ Screenshot: ${sc.file} ]  ·  Step ${sc.step}  ·  File: ${sc.file}`, { size: 18, color: C.skipped, align: AlignmentType.CENTER }),
                  { fill: C.labelBg, width: W }
                )] })]
              }),
              spacer(80),
            ];
          }),
          spacer(120),
        ] : []),

        // ── SECTION 6 — VALIDATION ──────────────────
        sectionHeading(screenshots.length > 0 ? '6' : '5', 'Validation'),
        spacer(80),
        errors.length === 0
          ? new Table({
              width: { size: W, type: WidthType.DXA },
              columnWidths: [W],
              rows: [new TableRow({ children: [cell(
                p('✓  No validation errors detected. Workbook passed all structural checks.', { size: 18, color: C.success }),
                { fill: 'F0FAF6', width: W }
              )] })]
            })
          : new Table({
              width: { size: W, type: WidthType.DXA },
              columnWidths: [1800, 900, 1800, W - 4500],
              rows: [
                new TableRow({ children: [
                  cell(p('Sheet',   { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 1800 }),
                  cell(p('Row',     { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 900 }),
                  cell(p('Field',   { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: 1800 }),
                  cell(p('Message', { bold: true, size: 18, color: C.white }), { fill: C.headerBg, width: W - 4500 }),
                ]}),
                ...errors.map((e, i) => new TableRow({ children: [
                  cell(p(e.sheet   || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 1800 }),
                  cell(p(String(e.row ?? '—'), { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 900 }),
                  cell(p(e.field   || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: 1800 }),
                  cell(p(e.message || '—', { size: 18 }), { fill: i % 2 === 0 ? C.rowWhite : C.rowAlt, width: W - 4500 }),
                ]})),
              ]
            }),
      ]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}

export function downloadReport(blob, jobId) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `serrah-report-${(jobId || 'job').slice(0, 8)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
