from pathlib import Path
import pypdfium2 as pdfium
pdf=Path(r'C:\Users\bapan\Downloads\hrms-platform-main\hrms-platform-main\project-documentation\.artifact-build\docx-render\HRMS_Project_Analysis_Report.pdf')
out=pdf.parent/'word-pages'; out.mkdir(parents=True,exist_ok=True)
doc=pdfium.PdfDocument(pdf)
print('pages',len(doc))
for i in range(len(doc)):
    page=doc[i]; image=page.render(scale=1.5).to_pil(); image.save(out/f'page-{i+1:02}.png')
print('rendered',len(list(out.glob('*.png'))))
