// src/features/leads/ui/LeadsTable.tsx
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  } from "@mui/material";
  import type { Lead, LeadField } from "../types";
  
  function cellValue(lead: Lead, field: LeadField): string {
    const src = lead.data || {};
    // للحقل المحدّد (غير custom) استخدم المفتاح المباشر
    if (field.fieldType !== "custom") {
      const v = src[field.fieldType];
      if (typeof v === "string" || typeof v === "number") return String(v);
    }
    // للحقل custom جرّب label ثم key
    const try1 = src[field.label];
    if (typeof try1 === "string" || typeof try1 === "number") return String(try1);
    const try2 = src[field.key];
    if (typeof try2 === "string" || typeof try2 === "number") return String(try2);
    return "-";
  }
  
  export default function LeadsTable({ leads, fields }: { leads: Lead[]; fields: LeadField[] }) {
    return (
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Session ID</TableCell>
              {fields.map((f) => (
                <TableCell key={f.key}>{f.label || f.fieldType}</TableCell>
              ))}
              <TableCell>التاريخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>{lead.sessionId}</TableCell>
                {fields.map((f) => (
                  <TableCell key={f.key}>{cellValue(lead, f)}</TableCell>
                ))}
                <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  