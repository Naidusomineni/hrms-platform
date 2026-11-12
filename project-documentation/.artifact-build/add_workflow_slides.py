from copy import copy
from pathlib import Path
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt

ROOT = Path(r'C:\Users\bapan\Downloads\hrms-platform-main\hrms-platform-main')
SOURCE = ROOT / 'project-documentation/deliverables/HRMS_Project_Analysis_Presentation_Reviewed.pptx'
OUT = ROOT / 'project-documentation/deliverables/HRMS_Project_Analysis_Presentation_Flows.pptx'

prs = Presentation(str(SOURCE))
SW, SH = prs.slide_width, prs.slide_height
NAVY=RGBColor(16,42,58); TEAL=RGBColor(8,126,139); INK=RGBColor(20,33,43)
MUTED=RGBColor(82,101,117); LIGHT=RGBColor(245,248,250); WHITE=RGBColor(255,255,255)
PALE=RGBColor(229,243,243); BORDER=RGBColor(217,226,232)

def textbox(slide,x,y,w,h,text,size,color=INK,bold=False,align=PP_ALIGN.LEFT):
    box=slide.shapes.add_textbox(x,y,w,h)
    tf=box.text_frame; tf.clear(); tf.word_wrap=True
    tf.margin_left=Inches(.04); tf.margin_right=Inches(.04)
    tf.margin_top=Inches(.02); tf.margin_bottom=Inches(.02)
    p=tf.paragraphs[0]; p.text=text; p.alignment=align
    p.font.name='Arial'; p.font.size=Pt(size); p.font.bold=bold; p.font.color.rgb=color
    return box

def add_flow_slide(title, category, flow_rows, footer):
    slide=prs.slides.add_slide(prs.slide_layouts[5])
    bg=slide.background.fill; bg.solid(); bg.fore_color.rgb=LIGHT
    rail=slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,0,0,Inches(.16),SH)
    rail.fill.solid(); rail.fill.fore_color.rgb=TEAL; rail.line.fill.background()
    textbox(slide,Inches(.68),Inches(.32),Inches(7.2),Inches(.24),category.upper(),13,TEAL,True)
    textbox(slide,Inches(.68),Inches(.62),Inches(12.0),Inches(.62),title,30,NAVY,True)
    rule=slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,Inches(.68),Inches(1.33),Inches(12.0),Inches(.012))
    rule.fill.solid(); rule.fill.fore_color.rgb=BORDER; rule.line.fill.background()
    xs=[Inches(.72)+i*Inches(2.48) for i in range(5)]
    ys=[Inches(2.18), Inches(4.58)]
    for row_idx,(label,steps) in enumerate(flow_rows):
        y=ys[row_idx]
        textbox(slide,Inches(.72),y-Inches(.38),Inches(11.8),Inches(.27),label.upper(),13,TEAL,True)
        for i,step in enumerate(steps):
            x=xs[i]; w=Inches(2.14); h=Inches(.94)
            node=slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,x,y,w,h)
            node.fill.solid(); node.fill.fore_color.rgb=PALE if i in (0,4) else WHITE
            node.line.color.rgb=BORDER; node.line.width=Pt(1.1)
            tf=node.text_frame; tf.clear(); tf.word_wrap=True
            tf.margin_left=Inches(.10); tf.margin_right=Inches(.10)
            tf.margin_top=Inches(.08); tf.margin_bottom=Inches(.04)
            tf.vertical_anchor=MSO_ANCHOR.MIDDLE
            p=tf.paragraphs[0]; p.text=step; p.alignment=PP_ALIGN.CENTER
            p.font.name='Arial'; p.font.size=Pt(13); p.font.bold=True; p.font.color.rgb=INK
            if i<4:
                arrow_x=x+w+Inches(.14)
                conn=slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,x+w+Inches(.025),y+Inches(.47),arrow_x,y+Inches(.47))
                conn.line.color.rgb=TEAL; conn.line.width=Pt(1.7); conn.line.end_arrowhead=True
                tip=slide.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE,arrow_x-Inches(.07),y+Inches(.39),Inches(.14),Inches(.16))
                tip.rotation=90; tip.fill.solid(); tip.fill.fore_color.rgb=TEAL; tip.line.fill.background()
    textbox(slide,Inches(.72),Inches(6.35),Inches(11.9),Inches(.44),footer,12,MUTED,False)
    textbox(slide,Inches(.68),Inches(7.10),Inches(9.6),Inches(.18),'HRMS Platform  |  Repository analysis  |  UI examples are repository screenshots',9,MUTED)
    textbox(slide,Inches(12.05),Inches(7.06),Inches(.42),Inches(.22),f'{len(prs.slides):02d}',11,TEAL,True,PP_ALIGN.RIGHT)
    return slide

add_flow_slide(
    'Core HR flows connect records to decisions','Flowcharts',[
        ('Attendance and regularization',[
            'Employee or device submits punch','Resolve policy, location and rules',
            'Create or update attendance record','If needed, submit regularization',
            'Review: correct data or reject and notify']),
        ('Leave request and approval',[
            'Employee submits leave application','Validate policy and request details',
            'Create pending leave record','Manager/HR or workflow decision',
            'Update status and balance; notify'])
    ],
    'Attendance records feed reporting and payroll inputs. Approved leave updates a matching balance when found; workflow behavior depends on tenant configuration.'
)
add_flow_slide(
    'Payroll and hiring have distinct review paths','Flowcharts',[
        ('Payroll processing',[
            'Authorized user starts a run','Gather employee and attendance inputs',
            'Calculate draft payroll records','HR adjusts and approves records',
            'Mark paid, export bank batch or payslip']),
        ('Recruitment and interview',[
            'Create job and candidate record','Update stage and scorecards',
            'Schedule session and assign panel','Guest joins with token and signaling',
            'Submit scorecard; convert if approved'])
    ],
    'Payroll formulas, statutory behavior and bank acceptance need owner confirmation. Candidate conversion atomicity and external interview media readiness need review.'
)

prs.save(str(OUT))
print(f'{OUT} | slides={len(prs.slides)}')
