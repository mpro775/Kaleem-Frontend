// src/features/leads/ui/FieldsEditor.tsx
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Tooltip,
    IconButton,
    Button,
    Stack,
  } from "@mui/material";
  import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
  import type { LeadField, FieldType } from "../types";
  
  const FIELD_TYPES: FieldType[] = ["name", "email", "phone", "address", "custom"];
  
  export default function FieldsEditor({
    fields,
    onAdd,
    onRemove,
    onChange,
    onSave,
    saving,
  }: {
    fields: LeadField[];
    onAdd: () => void;
    onRemove: (key: string) => void;
    onChange: (key: string, patch: Partial<LeadField>) => void;
    onSave: () => void | Promise<void>;
    saving: boolean;
  }) {
    return (
      <>
        {fields.map((field) => (
          <Box
            key={field.key}
            sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-end", flexWrap: "wrap" }}
          >
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>نوع الحقل</InputLabel>
              <Select
                label="نوع الحقل"
                value={field.fieldType}
                onChange={(e) =>
                  onChange(field.key, { fieldType: e.target.value as FieldType })
                }
              >
                {FIELD_TYPES.map((ft) => (
                  <MenuItem key={ft} value={ft}>
                    {ft}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <TextField
              label="Label"
              value={field.label}
              onChange={(e) => onChange(field.key, { label: e.target.value })}
              sx={{ minWidth: 200 }}
            />
  
            <TextField
              label="Placeholder"
              value={field.placeholder}
              onChange={(e) => onChange(field.key, { placeholder: e.target.value })}
              sx={{ minWidth: 220 }}
            />
  
            <FormControlLabel
              control={
                <Switch
                  checked={field.required}
                  onChange={(_, v) => onChange(field.key, { required: v })}
                />
              }
              label="إجباري"
            />
  
            <Tooltip title="حذف الحقل">
              <IconButton color="error" onClick={() => onRemove(field.key)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
  
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button startIcon={<AddIcon />} onClick={onAdd}>
            إضافة حقل جديد
          </Button>
          <Button variant="contained" color="primary" onClick={onSave} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </Stack>
      </>
    );
  }
  