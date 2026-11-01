---
name: pdf-generation-patterns
description: "Generate professional clinical and business PDF documents (prescriptions, medical certificates, patient records, treatment budgets, invoices). Use when implementing PDF export, document generation, print stylesheets, or digital signatures in Next.js, React, and Node.js."
---

# PDF Generation Patterns for Healthcare & Dental Applications

Comprehensive patterns and best practices for generating high-fidelity clinical documents, dental prescriptions, patient anamnesis records, consent forms, and treatment budgets in PDF format using Next.js, React, and Node.js.

---

## 📌 Use this skill when:
- Designing or implementing PDF export for clinical documents (receituários, atestados odontológicos, anamnese, orçamentos e recibos).
- Choosing between client-side generation (`@react-pdf/renderer`) vs server-side generation (Puppeteer, `@react-pdf/renderer` in Node.js, PDFKit).
- Styling A4 printable layouts with header/footer repetition, pagination (`Página X de Y`), and clinical branding (logos, CRO/CRM).
- Implementing digital signatures, QR Codes for document validation, or secure download links.

## ⛔ Do not use this skill when:
- The task is simple browser printing (`window.print()`) with basic HTML/CSS without fixed PDF layout requirements.
- The task is simply reading text from an existing PDF without generating or modifying documents.

---

## 🛠️ Recommended Tech Stack

1. **`@react-pdf/renderer` (Recommended for Fullstack React/Next.js)**:
   - Declarative JSX components (`<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`).
   - Runs seamlessly on both server-side (Node.js API routes) and client-side (web workers or dynamic download).
   - Lightweight, zero headless browser overhead, pixel-accurate vector output.

2. **Puppeteer / Playwright (Alternative for Complex HTML/CSS & Charts)**:
   - Best when rendering existing Tailwind/HTML components directly with complex charts.
   - Requires Chromium/headless browser in server environment.

---

## 📐 Standard Layout Guidelines (Clinical Standard A4)

### 1. Document Anatomy:
- **Header**:
  - Clinic Logo (SVG or PNG 300dpi).
  - Clinic Name, CNPJ/Address, Contact Info.
  - Professional identification (Dentist Name, Specialty, CRO number).
- **Body Content**:
  - Patient data: Name, CPF, Birth Date, Date/Time of emission.
  - Clinical information: Prescription items with posology, procedure descriptions, tooth numbering (FDI system), or financial breakdown.
- **Footer**:
  - Dynamic page numbering (`Página 1 de 2`).
  - Validation token or verification URL with QR Code.
  - Digital signature line or cryptographic certificate timestamp.

### 2. Styling Rules in `@react-pdf/renderer`:
- Use `pt` (points) for font sizes and margins:
  - Page margin: `30pt` to `40pt`.
  - Body text: `10pt` to `11pt` (lineHeight: `1.4`).
  - Headings: `14pt` to `18pt` bold.
  - Disclaimers/Footnotes: `8pt` to `9pt`.
- Register web-safe or custom Google Fonts (e.g., Inter, Roboto) via `Font.register` to prevent character encoding issues with Portuguese accents (ç, ã, é).

---

## 💻 Implementation Blueprint: Clinical Prescription / Receituário

```tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 36,
    color: '#1f2937',
    flexDirection: 'column'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#0284c7',
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0369a1'
  },
  doctorInfo: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  patientBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: '#e2e8f0'
  },
  itemRow: {
    marginBottom: 12,
    paddingLeft: 8
  },
  medicationName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e293b'
  },
  posology: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8'
  }
});

interface PrescriptionProps {
  dentistName: string;
  cro: string;
  patientName: string;
  patientCpf: string;
  items: Array<{ medication: string; instructions: string }>;
  date: string;
}

export const ClinicalPrescriptionPDF = ({
  dentistName,
  cro,
  patientName,
  patientCpf,
  items,
  date
}: PrescriptionProps) => (
  <Document title={`Receituario_${patientName}_${date}`}>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.clinicName}>OdontoSouza Clínica Odontológica</Text>
          <Text style={styles.doctorInfo}>Dr. {dentistName} • CRO: {cro}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Data de Emissão: {date}</Text>
        </View>
      </View>

      {/* Patient Information */}
      <View style={styles.patientBox}>
        <Text><Text style={{ fontWeight: 700 }}>Paciente: </Text>{patientName}</Text>
        <Text style={{ marginTop: 2 }}><Text style={{ fontWeight: 700 }}>CPF: </Text>{patientCpf}</Text>
      </View>

      {/* Prescription Content */}
      <Text style={styles.sectionTitle}>Prescrição Farmacológica</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.medicationName}>{index + 1}. {item.medication}</Text>
          <Text style={styles.posology}>Uso: {item.instructions}</Text>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>OdontoSouza • Documento emitido eletronicamente</Text>
        <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </View>
    </Page>
  </Document>
);
```

---

## ⚡ Next.js Route Handler for Server-Side PDF Stream

```ts
// app/api/prescriptions/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ClinicalPrescriptionPDF } from '@/components/pdf/ClinicalPrescriptionPDF';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 1. Fetch prescription data from database/Supabase with RLS verification
  const data = await getPrescriptionById(params.id);

  // 2. Render to stream
  const stream = await renderToStream(
    <ClinicalPrescriptionPDF
      dentistName={data.dentist.name}
      cro={data.dentist.cro}
      patientName={data.patient.name}
      patientCpf={data.patient.cpf}
      items={data.items}
      date={new Date(data.created_at).toLocaleDateString('pt-BR')}
    />
  );

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="receita-${params.id}.pdf"`,
      'Cache-Control': 'no-store'
    }
  });
}
```

---

## ✅ Best Practice Checklist
- [ ] Use `inline` disposition for direct browser viewing in a modal/tab and `attachment` for instant download.
- [ ] Always validate user authentication and RLS access before streaming patient documents.
- [ ] Ensure all Brazilian Portuguese characters (acentuação) are registered via Unicode-compatible fonts.
- [ ] Include clinic contact, CNPJ, professional registry (CRO), and emission timestamp.
- [ ] Avoid huge uncompressed images in PDF layouts; keep logos under 100KB.
