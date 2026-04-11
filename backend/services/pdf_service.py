import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from backend.models.schemas import AnalysisResponse

def generate_pdf_report(data: AnalysisResponse) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        spaceAfter=15,
        textColor=colors.HexColor('#1E293B')
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=20
    )
    
    heading2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#334155'),
        spaceBefore=15,
        spaceAfter=10
    )

    heading3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#475569'),
        spaceBefore=10,
        spaceAfter=5
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F1F5F9')
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=normal_style,
        leftIndent=15,
        bulletIndent=5
    )

    elements = []

    # --- Header ---
    elements.append(Paragraph("GitMax Risk Analysis Report", title_style))
    date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    elements.append(Paragraph(f"Generated on {date_str}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=15))

    # --- Summary Section ---
    elements.append(Paragraph("Executive Summary", heading2_style))
    
    overall_risk = data.summary.overall_risk
    loss_formatted = f"₹{data.summary.expected_loss:,.2f}"
    confidence_formatted = f"{int(data.summary.confidence * 100)}%"
    
    summary_data = [
        ["Overall Risk Level:", overall_risk],
        ["Expected Financial Exposure:", loss_formatted],
        ["Analysis Confidence:", confidence_formatted]
    ]

    # Risk Color Mapping for text display in Table
    risk_color = colors.HexColor('#E2E8F0') # Default
    if overall_risk.upper() == 'HIGH':
        risk_color = colors.HexColor('#FEF2F2') # Reddish background
    elif overall_risk.upper() == 'MEDIUM':
        risk_color = colors.HexColor('#FFFBEB') # Amberish
    elif overall_risk.upper() == 'LOW':
        risk_color = colors.HexColor('#F0FDF4') # Greenish

    t_summary = Table(summary_data, colWidths=[200, 250])
    t_summary.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748B')), # Lighter labels
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), # Darker values
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (1,0), (1,0), risk_color), # highlight risk level
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8)
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 10))

    if data.summary.recommendation:
        elements.append(Paragraph(data.summary.recommendation, normal_style))
        elements.append(Spacer(1, 15))


    # --- Signals Section ---
    if data.signals:
        elements.append(Paragraph("System Signals", heading2_style))
        signal_data = [["Signal", "Value", "Status"]]
        for sig in data.signals:
            signal_data.append([str(sig.name), str(sig.value), str(sig.status)])
            
        t_signals = Table(signal_data, colWidths=[150, 150, 150])
        t_signals.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1'))
        ]))
        elements.append(t_signals)
        elements.append(Spacer(1, 20))


    # --- File Analysis Section ---
    if data.files:
        elements.append(Paragraph("Detailed File Analysis", heading2_style))
        
        # Sort files by expected cost descending to highlight top risks
        sorted_files = sorted(data.files, key=lambda x: x.expected_cost, reverse=True)
        
        for idx, file in enumerate(sorted_files):
            elements.append(Paragraph(file.name, code_style))
            
            # File stats row
            file_stats = f"<b>Risk:</b> {file.risk_level} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Expected Cost:</b> Rs.{file.expected_cost:,.2f} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Complexity:</b> {file.metrics.complexity}"
            elements.append(Paragraph(file_stats, normal_style))
            elements.append(Spacer(1, 5))

            if file.reasons:
                elements.append(Paragraph("Identified Risks:", heading3_style))
                for reason in file.reasons:
                    elements.append(Paragraph(f"• {reason}", bullet_style))
            
            if file.recommendation:
                elements.append(Spacer(1, 5))
                elements.append(Paragraph(f"<b>Recommendation:</b> {file.recommendation}", normal_style))

            elements.append(Spacer(1, 15))
            if idx < len(sorted_files) - 1:
                elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=15))

    # Build PDF
    doc.build(elements)
    
    # Get bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
