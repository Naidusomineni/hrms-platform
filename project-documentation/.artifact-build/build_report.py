from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.section import WD_SECTION
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r'C:\Users\bapan\Downloads\hrms-platform-main\hrms-platform-main')
DOCS = ROOT / 'project-documentation'
OUT = DOCS / 'deliverables' / 'HRMS_Project_Analysis_Report_Flows.docx'
FLOW_DIR = DOCS / '.artifact-build' / 'flows'

order = [
    'PROJECT_OVERVIEW.md','SOFTWARE_REQUIREMENTS_SPECIFICATION.md','SYSTEM_ARCHITECTURE.md',
    'MODULE_WISE_DOCUMENTATION.md','DATABASE_DESIGN.md','API_DOCUMENTATION.md',
    'AUTHENTICATION_AND_AUTHORIZATION.md','USER_WORKFLOWS.md','UI_UX_DOCUMENTATION.md',
    'INSTALLATION_AND_SETUP.md','TESTING_DOCUMENTATION.md','DEPLOYMENT_AND_MAINTENANCE.md',
    'PROJECT_STRUCTURE.md','DOCUMENTATION_INDEX.md'
]

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.72); sec.bottom_margin = Inches(.7)
sec.left_margin = Inches(.78); sec.right_margin = Inches(.78)

styles = doc.styles
styles['Normal'].font.name = 'Aptos'; styles['Normal'].font.size = Pt(9.5); styles['Normal'].font.color.rgb = RGBColor(35,45,58)
styles['Normal'].paragraph_format.space_after = Pt(5)
for nm, size in [('Title',30),('Heading 1',20),('Heading 2',14),('Heading 3',11)]:
    st = styles[nm]; st.font.name = 'Aptos Display'; st.font.size = Pt(size); st.font.bold = True; st.font.color.rgb = RGBColor(0,0,0)
    st.paragraph_format.keep_with_next = True
styles['Heading 1'].paragraph_format.space_before = Pt(14); styles['Heading 1'].paragraph_format.space_after = Pt(6)
styles['Heading 2'].paragraph_format.space_before = Pt(10); styles['Heading 2'].paragraph_format.space_after = Pt(4)
styles['Heading 3'].paragraph_format.space_before = Pt(7); styles['Heading 3'].paragraph_format.space_after = Pt(3)

# Cover page
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(100)
p.alignment = WD_ALIGN_PARAGRAPH.LEFT
r=p.add_run('HRMS Platform'); r.bold=True; r.font.name='Aptos Display'; r.font.size=Pt(31); r.font.color.rgb=RGBColor(0,0,0)
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(18)
r=p.add_run('Project Analysis and Technical Documentation'); r.font.name='Aptos Display'; r.font.size=Pt(18); r.font.color.rgb=RGBColor(0,92,112)
p=doc.add_paragraph('Source-grounded review of the application architecture, implemented modules, APIs, data model, security, user flows, and operations.')
p.paragraph_format.space_after=Pt(24)
p=doc.add_paragraph('Prepared from the repository working tree\n11 November 2026')
for r in p.runs: r.font.size=Pt(11); r.font.color.rgb=RGBColor(80,91,105)
p=doc.add_paragraph('This report compiles the project documentation package. Implementation gaps and items needing owner confirmation are called out where evidence is incomplete.')
p.paragraph_format.space_before=Pt(30)
for r in p.runs: r.italic=True; r.font.size=Pt(9); r.font.color.rgb=RGBColor(85,95,105)
doc.add_page_break()

# Contents page
h=doc.add_paragraph('Contents', style='Heading 1')
contents=[
'Project Overview','Software Requirements Specification','System Architecture','Module Wise Documentation','Database Design','API Documentation','Authentication and Authorization','User Workflows','UI UX Documentation','Installation and Setup','Testing Documentation','Deployment and Maintenance','Project Structure','Documentation Index','Module Flowcharts and Explanations','Project UI Examples'
]
for i,title in enumerate(contents,1):
    p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(.12); p.paragraph_format.space_after=Pt(3)
    rr=p.add_run(f'{i:02d}  {title}'); rr.font.size=Pt(10); rr.font.color.rgb=RGBColor(0,65,82)
doc.add_page_break()

# Inline Markdown formatting
def add_inline(paragraph, text):
    # Flatten links to label; retain bold/italic/code emphasis.
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', text)
    tokens = re.split(r'(\*\*.*?\*\*|`[^`]*`|\*[^*]+\*)', text)
    for token in tokens:
        if not token: continue
        if token.startswith('**') and token.endswith('**'):
            run=paragraph.add_run(token[2:-2]); run.bold=True
        elif token.startswith('`') and token.endswith('`'):
            run=paragraph.add_run(token[1:-1]); run.font.name='Consolas'; run.font.size=Pt(8.2); run.font.color.rgb=RGBColor(0,85,100)
        elif token.startswith('*') and token.endswith('*'):
            run=paragraph.add_run(token[1:-1]); run.italic=True
        else: paragraph.add_run(token)

def cell_fill(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def set_cell_border(cell):
    tc=cell._tc; tcPr=tc.get_or_add_tcPr(); borders=tcPr.first_child_found_in('w:tcBorders')
    if borders is None: borders=OxmlElement('w:tcBorders'); tcPr.append(borders)
    for edge in ('top','left','bottom','right','insideH','insideV'):
        el=OxmlElement('w:'+edge); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'4'); el.set(qn('w:color'),'D9DDE3'); borders.append(el)
def repeat_header(row):
    trPr=row._tr.get_or_add_trPr(); tblHeader=OxmlElement('w:tblHeader'); tblHeader.set(qn('w:val'),'true'); trPr.append(tblHeader)
def add_md_table(rows):
    if not rows: return
    cleaned=[]
    for row in rows:
        vals=[c.strip() for c in row.strip().strip('|').split('|')]
        if vals and all(re.fullmatch(r'\s*:?-{3,}:?\s*',v) for v in vals): continue
        cleaned.append(vals)
    if not cleaned:return
    n=max(map(len,cleaned)); t=doc.add_table(rows=len(cleaned), cols=n); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=True
    t.style='Table Grid'
    for ri,row in enumerate(cleaned):
        for ci in range(n):
            cell=t.cell(ri,ci); cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            cell.text=''; p=cell.paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.paragraph_format.line_spacing=1.0
            add_inline(p,row[ci] if ci<len(row) else '')
            for run in p.runs: run.font.size=Pt(7.5)
            if ri==0:
                cell_fill(cell,'12384A')
                for run in p.runs: run.bold=True; run.font.color.rgb=RGBColor(255,255,255)
            elif ri%2==0: cell_fill(cell,'F2F6F8')
            set_cell_border(cell)
    repeat_header(t.rows[0]); doc.add_paragraph().paragraph_format.space_after=Pt(1)

def add_code_block(lines, is_mermaid=False):
    if is_mermaid:
        return
    for line in lines:
        p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(.16); p.paragraph_format.space_after=Pt(0)
        p.paragraph_format.line_spacing=1.0
        rr=p.add_run(line or ' '); rr.font.name='Consolas'; rr.font.size=Pt(7.4); rr.font.color.rgb=RGBColor(64,77,91)

def convert_markdown(path):
    text=path.read_text(encoding='utf-8-sig')
    lines=text.splitlines(); i=0; in_fence=False; fence=[]; fence_mermaid=False; table=[]
    while i<len(lines):
        line=lines[i]
        if line.startswith('```'):
            if not in_fence:
                if table: add_md_table(table); table=[]
                in_fence=True; fence=[]; fence_mermaid=line.strip().lower().startswith('```mermaid')
            else:
                add_code_block(fence,fence_mermaid); in_fence=False
            i+=1; continue
        if in_fence: fence.append(line); i+=1; continue
        if line.startswith('|'):
            table.append(line); i+=1; continue
        elif table: add_md_table(table); table=[]
        if not line.strip(): i+=1; continue
        if line.startswith('# '):
            # top-level docs start new chapter, skip duplicate index heading at the end only if desired
            title=line[2:].strip()
            if title=='Documentation Index': doc.add_page_break()
            doc.add_paragraph(title,style='Heading 1')
        elif line.startswith('## '): doc.add_paragraph(line[3:].strip(),style='Heading 2')
        elif line.startswith('### '): doc.add_paragraph(line[4:].strip(),style='Heading 3')
        elif re.match(r'^\s*[-*] ',line):
            p=doc.add_paragraph(style='List Bullet'); add_inline(p,re.sub(r'^\s*[-*] ','',line))
        elif re.match(r'^\s*\d+\. ',line):
            match=re.match(r'^\s*(\d+)\. (.*)$',line)
            p=doc.add_paragraph(); add_inline(p,f'{match.group(1)}. {match.group(2)}')
        else:
            p=doc.add_paragraph(); add_inline(p,line)
        i+=1
    if table: add_md_table(table)

for fname in order:
    convert_markdown(DOCS/fname)

# Reader-friendly module flows: images are generated from the documented service paths,
# with outcomes and caveats described directly below each diagram.
def create_flow_image(filename, steps):
    FLOW_DIR.mkdir(parents=True, exist_ok=True)
    width, height = 1800, 475
    im = Image.new('RGB', (width, height), '#F5F8FA')
    draw = ImageDraw.Draw(im)
    regular = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 31)
    bold = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 28)
    count = len(steps); gap = 50; box_w = (width - 100 - gap*(count-1)) // count; box_h = 205; y = 110
    for i, step in enumerate(steps):
        x = 50 + i*(box_w+gap)
        fill = '#FFFFFF' if i not in (0,count-1) else '#E5F3F3'
        draw.rounded_rectangle((x,y,x+box_w,y+box_h), radius=22, fill=fill, outline='#087E8B', width=4)
        draw.ellipse((x+15,y+14,x+62,y+61), fill='#087E8B')
        tag = f'{i+1:02d}'; bb=draw.textbbox((0,0),tag,font=bold)
        draw.text((x+38-(bb[2]-bb[0])/2,y+37-(bb[3]-bb[1])/2-2),tag,font=bold,fill='white')
        words = step.split(); lines=[]; cur=''
        for word in words:
            test=(cur+' '+word).strip()
            if draw.textbbox((0,0),test,font=regular)[2] > box_w-34 and cur:
                lines.append(cur); cur=word
            else: cur=test
        if cur: lines.append(cur)
        line_h=40; text_y=y+(box_h-len(lines)*line_h)//2+8
        for line in lines:
            bb=draw.textbbox((0,0),line,font=regular)
            draw.text((x+(box_w-(bb[2]-bb[0]))/2,text_y),line,font=regular,fill='#14212B')
            text_y+=line_h
        if i < count-1:
            ax=x+box_w+5; ay=y+box_h//2; ex=x+box_w+gap-6
            draw.line((ax,ay,ex,ay),fill='#087E8B',width=5)
            draw.polygon([(ex,ay),(ex-17,ay-11),(ex-17,ay+11)],fill='#087E8B')
    draw.text((50,370),'PROCESS FLOW  |  Outcomes and exceptions are explained in the accompanying text.',font=bold,fill='#526575')
    target=FLOW_DIR/filename; im.save(target); return target

flow_specs=[
('Authentication and access', ['Enter credentials','AuthService validates credentials','Issue access token and refresh cookie','JWT filter checks protected API','Refresh or route to sign-in'], 'AuthController delegates login to AuthService; JwtAuthenticationFilter validates bearer tokens on protected requests. Email verification, OTP reset, first-login password change and TOTP setup are separate account paths. Logout-all currently returns success without visible session revocation.', 'AuthController, AuthService, JwtAuthenticationFilter, SecurityConfig'),
('Employee profile and administration', ['HR/Admin creates employee','EmployeeService persists profile','Assign department and related records','Employee views profile or uploads photo','HR updates or soft-deletes record'], 'The employee APIs support administrative CRUD and self-service profile surfaces. Department assignment establishes organizational grouping. Confirm endpoint-level ownership checks before exposing ID-based operations to employees.', 'EmployeeController, EmployeeService, DepartmentService'),
('Attendance and regularization', ['Employee or device submits punch','Resolve policy and location rules','Create or update attendance record','Submit regularization if needed','Manager/HR reviews and corrects or rejects'], 'Punches can come from web/automatic and biometric JSON or CSV paths. Geofence and policy validation may apply. Approved regularization applies corrected punch data; rejection is persisted and the employee is notified. Attendance records are queried for reporting and payroll inputs.', 'AttendanceController, AttendanceService, GeofenceValidator, policy resolver'),
('Leave request and approval', ['Employee submits leave application','Validate policy and request details','Create pending leave record','Manager/HR or workflow decides','Update status, balance if approved, and notify'], 'Workflow completion changes the leave status. On approval, a matching employee leave balance is updated when found; cancellation, policy and balance query endpoints support follow-up. Exact validations depend on configured policies and workflow definitions.', 'LeaveController, LeaveService, WorkflowEngineService, leave balance entities'),
('Employee request and workflow', ['Employee submits supported request','Resolve configured workflow definition','Reviewer records decision and comments','Update request/domain status','Notify employee; delegation may apply'], 'The generic request path supports only request types accepted by EmployeeRequestService. Workflow definitions and approval steps determine review behavior. Delegation records support out-of-office coverage; universal request types and SLA enforcement are not established.', 'EmployeeRequestController, WorkflowController, WorkflowEngineService'),
('Payroll processing', ['Authorized user starts single or batch run','Gather employee and attendance inputs','PayrollService calculates draft records','HR adjusts and approves records','Mark paid, export bank batch, or view payslip'], 'Payroll APIs expose processing, review, adjustment, register, summary, bank-batch export and employee payslip paths. Formula correctness, statutory tax behavior and bank-file acceptance require payroll-owner confirmation; expense integration should be verified transactionally.', 'PayrollController, PayrollService, PayrollSlip'),
('Recruitment and interview', ['Recruiter creates job and candidate','Update stage and scorecards','Schedule interview and assign panelists','Guest joins with token; interview signaling','Submit scorecard and optionally convert candidate'], 'Candidate conversion exists as an endpoint/service path, but atomicity, generated credentials, leave seeding and email behavior need confirmation. Guest join/signaling components are present; endpoint presence alone does not establish a production media provider.', 'RecruitmentController, InterviewController, RecruitmentService, LiveKitTokenService'),
('Expense claim review', ['Employee submits expense claim','Manager review','Finance review','Persist review/status outcome','Payroll reimbursement path where configured'], 'Manager and finance review endpoints are visible. Confirm exact enum/status transitions in ExpenseServiceImpl and whether reimbursement is linked to payroll as one transaction before relying on the end-to-end payment path.', 'ExpenseController, ExpenseServiceImpl, PayrollService'),
('Offboarding and settlement', ['Employee submits separation request','Authorized reviewer evaluates request','Update required clearance records','Calculate and save settlement','Review final status and generated documents'], 'Separation, clearance and settlement operations are implemented. Final employee-status changes and document generation depend on service behavior; verify clearance completeness and legal rules with the domain owner.', 'OffboardingController, OffboardingService, separation/clearance/settlement entities')
]
doc.add_page_break(); doc.add_paragraph('Module Flowcharts and Explanations',style='Heading 1')
p=doc.add_paragraph('These diagrams summarize the implemented request paths. They are based on controller, service and workflow evidence; branch conditions, tenant configuration and business rules can vary by deployment.')
for r in p.runs: r.font.size=Pt(9); r.font.color.rgb=RGBColor(74,86,98)
for idx,(title,steps,explanation,evidence) in enumerate(flow_specs):
    if idx%2==0 and idx>0: doc.add_page_break()
    doc.add_paragraph(title,style='Heading 2')
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after=Pt(3)
    p.add_run().add_picture(str(create_flow_image(f'flow-{idx+1:02d}.png',steps)),width=Inches(6.3))
    p=doc.add_paragraph(explanation); p.paragraph_format.space_after=Pt(3)
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(7)
    rr=p.add_run('Implementation evidence: '); rr.bold=True; rr.font.color.rgb=RGBColor(0,92,112)
    add_inline(p,evidence)

# Actual product screenshots from the repository as a visual appendix.
doc.add_page_break(); doc.add_paragraph('Project UI Examples',style='Heading 1')
p=doc.add_paragraph('The following screenshots are existing repository captures. They illustrate implemented application surfaces and are not newly generated mockups.')
for r in p.runs: r.font.size=Pt(9); r.font.color.rgb=RGBColor(74,86,98)
shots=[
('02_corporate_dashboard.png','Dashboard overview'),
('03_employee_directory.png','Employee directory'),
('04_biometric_attendance.png','Attendance workspace'),
('05_payroll_register.png','Payroll register'),
('06_recruitment_ats.png','Recruitment pipeline'),
('07_leave_management.png','Leave management'),
('08_expense_claims.png','Expense claims')]
for idx,(name,caption) in enumerate(shots):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(6); p.paragraph_format.space_after=Pt(2)
    p.add_run().add_picture(str(ROOT/'docs'/'screenshots'/name),width=Inches(6.25))
    cap=doc.add_paragraph(caption); cap.alignment=WD_ALIGN_PARAGRAPH.CENTER; cap.paragraph_format.space_after=Pt(8)
    for r in cap.runs: r.italic=True; r.font.size=Pt(9); r.font.color.rgb=RGBColor(68,79,89)
    if idx in (1,3,5) and idx != len(shots)-1: doc.add_page_break()

# Page number in footer.
for section in doc.sections:
    footer=section.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    run=footer.add_run('HRMS Platform  |  '); run.font.size=Pt(8); run.font.color.rgb=RGBColor(100,110,120)
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)

OUT.parent.mkdir(parents=True,exist_ok=True)
doc.save(OUT)
print(OUT)

