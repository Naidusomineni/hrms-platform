from pathlib import Path
import pypdfium2 as pdfium

root=Path(r'C:\Users\bapan\Downloads\hrms-platform-main\hrms-platform-main\project-documentation\.artifact-build\pptx')
pdf=pdfium.PdfDocument(root/'HRMS_Project_Analysis_Presentation_Flows_latest.pdf')
out=root/'slides-flows'; out.mkdir(parents=True,exist_ok=True)
for i in range(len(pdf)):
    pdf[i].render(scale=1.15).to_pil().save(out/f'slide-{i+1:02d}.png')
print(f'slides={len(pdf)} output={out}')
