import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from 'file:///C:/Program%20Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import { pathToFileURL } from 'node:url';

const root = 'C:/Users/bapan/Downloads/hrms-platform-main/hrms-platform-main';
const build = path.join(root, 'project-documentation/.artifact-build/pptx');
const finalPath = path.join(root, 'project-documentation/deliverables/HRMS_Project_Analysis_Presentation_Reviewed.pptx');
const skillDir = 'C:/Users/bapan/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/Presentations';
await fs.mkdir(build,{recursive:true});
const ppt = Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#102A3A',teal:'#087E8B',teal2:'#00A89D',ink:'#14212B',muted:'#526575',light:'#F5F8FA',line:'#D9E2E8',white:'#FFFFFF',pale:'#E5F3F3',orange:'#DD8A34',red:'#B63B44'};
const FONT='Arial';
function shape(slide, geometry, x,y,w,h,fill='none',lineFill='none',lw=0,name){return slide.shapes.add({geometry,name,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:lineFill,width:lw}})}
function txt(slide,x,y,w,h,text,size=22,color=C.ink,bold=false,opts={}){
  const s=shape(slide,'textbox',x,y,w,h,'none','none',0,opts.name);
  s.text=text;
  s.text.style={fontSize:size,typeface:FONT,color,bold,alignment:opts.align||'left',verticalAlignment:opts.valign||'top',wrap:'square',autoFit:'shrinkText',insets:opts.insets??0,lineSpacing:opts.lineSpacing||1.08};
  return s;
}
function base(title,section='PROJECT ANALYSIS'){
  const s=ppt.slides.add(); s.background.fill=C.light;
  shape(s,'rect',0,0,16,720,C.teal,'none',0);
  txt(s,64,32,700,20,section.toUpperCase(),13,C.teal,true);
  txt(s,64,60,1140,58,title,42,C.navy,true);
  shape(s,'line',64,128,1152,0,'none',C.line,1);
  txt(s,64,686,920,16,'HRMS Platform  |  Repository analysis  |  UI examples are repository screenshots',12,C.muted,false);
  txt(s,1165,682,48,22,String(ppt.slides.items.length).padStart(2,'0'),14,C.teal,true,{align:'right'});
  return s;
}
function note(slide,source,context='') { slide.speakerNotes.text=`Repository evidence: ${source}${context?`\n${context}`:''}`; }
async function addImage(slide,file,x,y,w,h,alt,fit='contain'){
 const b=await fs.readFile(path.join(root,'docs/screenshots',file));
 slide.images.add({blob:new Uint8Array(b),contentType:'image/png',alt,fit,position:{left:x,top:y,width:w,height:h},geometry:'roundRect',borderRadius:8});
}
function bulletText(slide,x,y,w,items,size=21,color=C.ink,gap=54){
  items.forEach((t,i)=>{shape(slide,'ellipse',x,y+i*gap+8,8,8,C.teal,'none',0);txt(slide,x+22,y+i*gap,w-22,gap-2,t,size,color,false);});
}
function flowRow(slide,y,label,steps){
 txt(slide,70,y-35,1100,26,label,16,C.teal,true);
 const x0=70,w=205,h=92,gap=25;
 steps.forEach((step,i)=>{
  const x=x0+i*(w+gap);
  shape(slide,'roundRect',x,y,w,h,i===0||i===steps.length-1?C.pale:C.white,C.line,1);
  txt(slide,x+10,y+12,w-20,h-24,step,17,C.ink,true,{align:'center',valign:'middle',lineSpacing:1.0});
  if(i<steps.length-1){
   shape(slide,'line',x+w+2,y+h/2,w>0?gap-11:0,0,'none',C.teal,2);
   shape(slide,'triangle',x+w+gap-14,y+h/2-7,14,14,C.teal,'none',0);
  }
 });
}

// 1 Cover
{
 const s=ppt.slides.add(); s.background.fill=C.navy;
 shape(s,'rect',0,0,18,720,C.teal2,'none',0);
 txt(s,70,86,520,24,'HRMS PLATFORM',16,'#78D4D0',true);
 txt(s,70,146,525,148,'Project Analysis\nand Product Overview',50,C.white,true,{lineSpacing:1.0});
 txt(s,70,324,490,106,'A source-based walkthrough of the product, architecture, modules, user journeys, and implementation findings.',23,'#D6E4EB',false);
 txt(s,70,532,475,56,'Employee experience  ·  HR operations  ·  Tenant administration',17,'#9FB5C2',false);
 shape(s,'roundRect',620,95,590,475,'#F3F6F8','#496675',1);
 await addImage(s,'02_corporate_dashboard.png',632,107,566,451,'HRMS dashboard screenshot showing employee and attendance overview');
 txt(s,632,580,560,30,'Repository UI capture. Dashboard metrics shown are sample screen data.',14,'#C4D3DC',false);
 txt(s,70,674,500,20,'11 November 2026',14,'#9FB5C2',false);
 note(s,'frontend/src/App.tsx; docs/screenshots/02_corporate_dashboard.png','This opening uses an existing repository screenshot. Its displayed values are illustrative screen data, not verified production metrics.');
}
// 2 Scope
{
 const s=base('A broad HR operations platform','PRODUCT SCOPE');
 txt(s,66,155,650,36,'Implemented feature areas',25,C.navy,true);
 const cols=[
  {x:70,title:'PEOPLE',items:'Employees and departments\nProfile and documents\nRecruitment and interviews\nPerformance goals and reviews'},
  {x:465,title:'WORKDAY',items:'Attendance and policies\nLeave and balances\nShift rosters and swaps\nEmployee requests and approvals'},
  {x:860,title:'OPERATIONS',items:'Payroll and expenses\nAssets and offboarding\nHelpdesk and announcements\nReports and workforce intelligence'}
 ];
 for(const c of cols){txt(s,c.x,220,330,26,c.title,16,C.teal,true);txt(s,c.x,260,340,232,c.items,22,C.ink,false,{lineSpacing:1.35});}
 shape(s,'line',70,540,1120,0,'none',C.line,1);
 txt(s,70,566,1090,70,'The interface and API are delivered as one multi-tenant application. Module presence in source does not establish that every workflow is production-complete.',20,C.muted,false);
 note(s,'backend/src/main/java/com/hrms/modules; frontend/src/modules; frontend/src/App.tsx','Module status and boundaries are documented in MODULE_WISE_DOCUMENTATION.md.');
}
// 3 Architecture diagram
{
 const s=base('A modular monolith behind a React SPA','SYSTEM ARCHITECTURE');
 txt(s,70,152,1120,34,'One web client calls a Spring Boot API. Services coordinate domain rules and persistence.',22,C.muted,false);
 const y=280,h=122;
 const nodes=[
  {x:74,w:195,title:'Browser',body:'React 18 SPA\nVite · Redux Toolkit'},
  {x:320,w:205,title:'REST API',body:'Spring MVC\n/api/v1 by default'},
  {x:575,w:236,title:'Application',body:'Security + tenant filters\nDomain services'},
  {x:860,w:190,title:'Persistence',body:'Spring Data JPA\nFlyway migrations'},
  {x:1090,w:130,title:'Data',body:'PostgreSQL\nRedis'}
 ];
 for(const n of nodes){shape(s,'roundRect',n.x,y,n.w,h,C.white,C.line,1);txt(s,n.x+14,y+18,n.w-28,28,n.title,20,C.navy,true,{align:'center'});txt(s,n.x+10,y+58,n.w-20,52,n.body,16,C.muted,false,{align:'center'});}
 for(let i=0;i<nodes.length-1;i++){
  const a=nodes[i],b=nodes[i+1]; shape(s,'line',a.x+a.w+4,y+61,b.x-a.x-a.w-10,0,'none',C.teal,2);
  shape(s,'triangle',b.x-12,y+55,12,12,C.teal,'none',0); // connector marker
 }
 txt(s,82,462,516,68,'External boundaries in code: SMTP email, local upload storage, Redis token blacklist, Prometheus metrics, and interview token/signaling components.',18,C.ink,false);
 txt(s,662,462,530,68,'No confirmed live bank or biometric-vendor client was found. Biometric inputs are exposed through REST and CSV ingestion paths.',18,C.ink,false);
 note(s,'backend/src/main/java/com/hrms/config; security; infrastructure; modules; backend/src/main/resources/application.properties','The default servlet context path is /api, and controllers map under /v1.');
}
// 4 Backend and data
{
 const s=base('Backend modules share a common data layer','BACKEND AND DATA');
 txt(s,70,154,520,34,'Java 21 target · Spring Boot 3.2.3',22,C.teal,true);
 bulletText(s,74,212,528,[
  'Controllers validate requests and define REST routes.',
  'Services coordinate business operations across modules.',
  'Repositories and JPA entities persist domain records.',
  'Flyway scripts V1–V15 evolve the relational schema.'
 ],19,C.ink,72);
 txt(s,670,154,500,34,'Tenant-aware relational model',22,C.teal,true);
 txt(s,670,208,500,110,'Core records include users, employees, departments, attendance, leave, payroll, notifications, audit history, and tenant configuration.',20,C.ink,false);
 txt(s,670,345,500,120,'Domain tables extend into workflow approvals, documents, expenses, interviews, shifts, assets, offboarding, and workforce intelligence.',20,C.ink,false);
 shape(s,'line',670,492,500,0,'none',C.line,1);
 txt(s,670,512,510,100,'Review item: V1 contains MySQL-style index/column alteration syntax while the current runtime configuration targets PostgreSQL.',19,C.red,true);
 note(s,'backend/pom.xml; backend/src/main/resources/db/migration/V1__fix_payroll_columns.sql through V15; entity @Table mappings','The full entity inventory and migration map are in DATABASE_DESIGN.md.');
}
// 5 Roles / authentication with screenshot
{
 const s=base('Access depends on identity, role, and tenant','PEOPLE AND ACCESS');
 txt(s,70,157,500,32,'Visible application roles',22,C.teal,true);
 txt(s,70,205,480,214,'Employee\nManager\nHR\nTenant Admin\nSuper Admin\nIT Admin / IT Support',21,C.ink,false,{lineSpacing:1.3});
 txt(s,70,447,480,112,'The app supports JWT authentication, email verification, password reset, first-login change, and TOTP setup endpoints.',18,C.muted,false);
 shape(s,'roundRect',610,166,590,376,C.white,C.line,1);
 await addImage(s,'01_login_page.png',622,178,566,352,'HRMS sign-in page screenshot');
 txt(s,622,557,560,36,'Sign-in UI from the repository capture set',14,C.muted,false);
 note(s,'backend/src/main/java/com/hrms/config/SecurityConfig.java; modules/auth/AuthController.java; frontend/src/modules/auth/pages/LoginPage.jsx; docs/screenshots/01_login_page.png','Controller-level guards vary by endpoint. Logout-all is currently a success stub; see AUTHENTICATION_AND_AUTHORIZATION.md.');
}
// 6 Employee management UI
{
 const s=base('Employee records anchor daily HR operations','EMPLOYEE EXPERIENCE');
 txt(s,70,160,455,42,'Employee directory and profile management',23,C.navy,true);
 bulletText(s,72,220,470,[
  'Search and browse employee records.',
  'Maintain department and profile details.',
  'Upload profile photos and employee documents.',
  'Connect people data to attendance, leave, payroll, and offboarding.'
 ],19,C.ink,68);
 shape(s,'roundRect',575,154,635,422,C.white,C.line,1);
 await addImage(s,'03_employee_directory.png',587,166,611,398,'HRMS employee directory screenshot');
 txt(s,72,546,450,50,'EmployeeController and EmployeeService provide the backend record paths.',16,C.muted,false);
 note(s,'backend/src/main/java/com/hrms/modules/employee/controller/EmployeeController.java; EmployeeService.java; docs/screenshots/03_employee_directory.png','UI image is a repository screenshot. Confirm ownership guards on ID-based operations.');
}
// 7 Attendance and leave
{
 const s=base('Attendance and leave are connected to approval paths','ATTENDANCE AND LEAVE');
 txt(s,70,154,520,32,'Attendance',22,C.teal,true);
 txt(s,70,198,520,116,'Punches, breaks, biometric/CSV ingestion, geofence checks, regularization, office locations, and configurable policies.',19,C.ink,false);
 txt(s,70,338,520,32,'Leave',22,C.teal,true);
 txt(s,70,381,520,116,'Applications, policy configuration, balance ledgers, accrual scheduling, review, cancellation, and employee notifications.',19,C.ink,false);
 shape(s,'roundRect',650,154,558,208,C.white,C.line,1); await addImage(s,'04_biometric_attendance.png',660,164,538,188,'HRMS attendance screen screenshot');
 shape(s,'roundRect',650,385,558,208,C.white,C.line,1); await addImage(s,'07_leave_management.png',660,395,538,188,'HRMS leave screen screenshot');
 note(s,'modules/attendance/AttendanceController.java; AttendanceService.java; PolicyController.java; modules/leave/LeaveController.java; LeavePolicyController.java; docs/screenshots/04_biometric_attendance.png and 07_leave_management.png','Attendance policies and workflows are configurable in code. Verify the active tenant workflow definitions and business rules.');
}
// 8 Payroll / expense
{
 const s=base('Payroll and expenses share financial workflows','PAYROLL AND EXPENSES');
 txt(s,70,157,510,32,'Payroll operations',22,C.teal,true);
 txt(s,70,202,510,100,'Process, adjust, approve, mark paid, view registers and summaries, and export bank batch data.',19,C.ink,false);
 txt(s,70,332,510,32,'Expense claims',22,C.teal,true);
 txt(s,70,376,510,104,'Submit claims and expose manager and finance review steps. Payroll integration should be verified from the service transaction.',19,C.ink,false);
 shape(s,'roundRect',625,155,583,211,C.white,C.line,1); await addImage(s,'05_payroll_register.png',635,165,563,191,'HRMS payroll register screenshot');
 shape(s,'roundRect',625,390,583,211,C.white,C.line,1); await addImage(s,'08_expense_claims.png',635,400,563,191,'HRMS expense claims screenshot');
 txt(s,70,542,515,49,'Payroll formulas and statutory settings require payroll-owner confirmation.',17,C.red,true);
 note(s,'modules/payroll/PayrollController.java; PayrollService.java; modules/expense/ExpenseController.java; ExpenseServiceImpl.java; screenshots 05 and 08','Screens shown are existing UI captures; values may be sample data.');
}
// 9 Recruiting
{
 const s=base('Recruitment extends into live interview sessions','RECRUITMENT');
 txt(s,70,166,440,32,'Candidate lifecycle surfaces',22,C.teal,true);
 bulletText(s,72,214,450,[
  'Manage jobs and candidate records.',
  'Update applicant stages and scorecards.',
  'Schedule interview sessions and panelists.',
  'Expose candidate guest join and signaling routes.',
  'Convert candidate records into employee onboarding.'
 ],18,C.ink,62);
 shape(s,'roundRect',555,154,655,422,C.white,C.line,1);
 await addImage(s,'06_recruitment_ats.png',567,166,631,398,'HRMS recruitment ATS screenshot');
 txt(s,72,552,450,44,'Verify media provider configuration and conversion atomicity before relying on this flow.',16,C.red,true);
 note(s,'modules/recruitment/RecruitmentController.java; InterviewController.java; RecruitmentService.java; LiveKitTokenService.java; InterviewSignalingService.java; screenshot 06','Guest paths exist in SecurityConfig. External media service readiness is not established by endpoint presence alone.');
}
// 10 Core HR workflows
{
 const s=base('Core HR flows connect records to decisions','MODULE WORKFLOWS');
 flowRow(s,236,'ATTENDANCE AND REGULARIZATION',['Employee or device\nsubmits punch','Resolve policy,\nlocation and rules','Create or update\nattendance record','If needed, submit\nregularization','Review: correct data\nor reject and notify']);
 flowRow(s,445,'LEAVE REQUEST AND APPROVAL',['Employee submits\nleave application','Validate policy and\nrequest details','Create pending\nleave record','Manager/HR or\nworkflow decision','Update status and\nbalance; notify']);
 txt(s,70,565,1128,58,'Attendance records feed reporting and payroll inputs. Approved leave updates a matching balance when found; rejection and cancellation follow configured module behavior.',16,C.muted,false);
 note(s,'modules/attendance/AttendanceController.java; AttendanceService.java; GeofenceValidator; modules/leave/LeaveController.java; LeaveService.java; WorkflowEngineService.java','Regularization workflow activation and leave policy behavior depend on tenant configuration. The detailed Word report explains each step and verification caveat.');
}
// 11 Payroll and recruitment workflows
{
 const s=base('Payroll and hiring have distinct review paths','MODULE WORKFLOWS');
 flowRow(s,236,'PAYROLL PROCESSING',['Authorized user\nstarts a run','Gather employee and\nattendance inputs','Calculate draft\npayroll records','HR adjusts and\napproves records','Mark paid, export\nbank batch or payslip']);
 flowRow(s,445,'RECRUITMENT AND INTERVIEW',['Create job and\ncandidate record','Update stage and\nscorecards','Schedule session\nand assign panel','Guest joins with\ntoken and signaling','Submit scorecard;\nconvert if approved']);
 txt(s,70,565,1128,58,'Payroll formulas, statutory behavior and bank acceptance require owner confirmation. Candidate conversion and external interview media readiness require implementation review.',16,C.muted,false);
 note(s,'modules/payroll/PayrollController.java; PayrollService.java; modules/recruitment/RecruitmentController.java; InterviewController.java; RecruitmentService.java; LiveKitTokenService.java','Flows reflect controller/service surfaces. Conversion atomicity, payroll formulas and external provider readiness are not guaranteed by endpoint presence.');
}
// 12 Platform delivery
{
 const s=base('Container and monitoring assets support deployment','DELIVERY AND OPERATIONS');
 txt(s,72,164,510,32,'Technology foundations',22,C.teal,true);
 txt(s,72,208,510,195,'Frontend: React 18, Vite, TypeScript/JavaScript, Redux Toolkit, Axios, React Router, Tailwind.\n\nBackend: Java 21 target, Spring Boot 3.2.3, Spring Security, JPA, Flyway, PostgreSQL, Redis, SMTP.',18,C.ink,false);
 txt(s,690,164,500,32,'Repository operations assets',22,C.teal,true);
 bulletText(s,692,210,480,[
  'Docker Compose for PostgreSQL, Redis, backend, frontend, Prometheus, Grafana.',
  'Nginx and Vercel deployment configuration.',
  'Actuator health and Prometheus metrics.',
  'JUnit/Spring and Playwright tests plus scripted E2E checks.'
 ],18,C.ink,88);
 shape(s,'line',72,561,1110,0,'none',C.line,1);
 txt(s,72,582,1100,57,'Existing tests were inventoried but not executed during this documentation task. Deployment profiles and CI status need environment confirmation.',17,C.muted,false);
 note(s,'backend/pom.xml; frontend/package.json; docker-compose.yml; infra/; .github/workflows; backend/src/test; frontend/e2e','No tests or builds were run as part of this artifact task.');
}
// 13 Findings
{
 const s=base('Production readiness needs a few focused confirmations','IMPLEMENTATION REVIEW');
 const rows=[
  ['Database','V1 SQL syntax appears MySQL-oriented; reconcile with PostgreSQL migration history.'],
  ['Session security','logout-all has no visible revocation logic; refresh cookie uses secure(false).'],
  ['Tenant boundaries','Confirm tenant and record ownership checks on ID-based self-service endpoints.'],
  ['Business rules','Validate payroll, offboarding and expense-to-payroll behavior with domain owners.'],
  ['External services','Confirm live interview/media setup, file persistence, and Redis fallback behavior.']
 ];
 rows.forEach((r,i)=>{let y=158+i*86;txt(s,75,y,205,28,r[0],19,C.teal,true);txt(s,285,y,885,58,r[1],18,C.ink,false);if(i<rows.length-1)shape(s,'line',75,y+65,1100,0,'none',C.line,1);});
 txt(s,75,612,1090,36,'Evidence is drawn from the checked-out source tree. Treat these items as review questions, not confirmed production incidents.',17,C.muted,false);
 note(s,'project-documentation/DOCUMENTATION_INDEX.md; AUTHENTICATION_AND_AUTHORIZATION.md; DATABASE_DESIGN.md; API_DOCUMENTATION.md','Unresolved questions and evidence are documented in the full analysis package.');
}

// Export slide PNGs for review and editable draft, then run skill finalizer.
for (const [i,s] of ppt.slides.items.entries()){
 const blob=await ppt.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
const draft=path.join(build,'HRMS_Project_Analysis_Presentation.draft.pptx');
await (await PresentationFile.exportPptx(ppt)).save(draft);
const { finalizePresentation }=await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({
 workspaceDir:path.join(root,'project-documentation'),
 candidatePath:draft, finalPath,
 pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],
 requiredNativeTableOwnerSlides:[], fontPolicy:{basis:'design',families:[FONT]},
 verifyArtifactToolImport:true,
 receiptPath:path.join(root,'project-documentation/.artifact-build/HRMS_Project_Analysis_Presentation_Reviewed.validation.json')
});
console.log(JSON.stringify({finalPath,result},null,2));




