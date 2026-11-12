from pathlib import Path
import pypdfium2 as pdfium

root=Path(r'C:\Users\bapan\Downloads\hrms-platform-main\hrms-platform-main\project-documentation\.artifact-build\docx-render')
pdf=pdfium.PdfDocument(root/'HRMS_Project_Analysis_Report_Flows.pdf')
out=root/'word-pages-flows'; out.mkdir(parents=True,exist_ok=True)
for i in range(len(pdf)):
    page=pdf[i]
    bitmap=page.render(scale=1.25)
    bitmap.to_pil().save(out/f'page-{i+1:02d}.png')
print(f'pages={len(pdf)} output={out}')
