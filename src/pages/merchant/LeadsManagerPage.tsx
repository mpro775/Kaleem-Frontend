import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

type FieldType = "name" | "email" | "phone" | "address" | "custom";

interface LeadField {
  key: string;
  fieldType: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
}

interface Lead {
  _id: string;
  sessionId: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export default function LeadsManagerPage() {
  const [leadsEnabled, setLeadsEnabled] = useState(true);
  const [leadsFormFields, setLeadsFormFields] = useState<LeadField[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? null;
  useEffect(() => {
    setLoading(true);

    // فرضاً لديك merchantId من السياق أو اليوزر الحالي

    // جلب إعدادات الحقول
    axiosInstance.get(`/merchants/${merchantId}`).then((res) => {
      setLeadsFormFields(res.data.leadsSettings || []);
    });

    // جلب قائمة الـ leads
    axiosInstance
      .get(`/merchants/${merchantId}/leads`)
      .then((res) => setLeads(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const addField = () => {
    setLeadsFormFields((prev) => [
      ...prev,
      {
        key: uuidv4(),
        fieldType: "custom",
        label: "",
        placeholder: "",
        required: false,
      },
    ]);
  };
  const handleSaveFields = async () => {
    if (!merchantId) return;
    await axiosInstance.patch(`/merchants/${merchantId}/leads-settings`, {
      settings: leadsFormFields,
    });
    // أضف تنبيه بالنجاح إن رغبت
  };
  const updateField = (key: string, patch: Partial<LeadField>) => {
    setLeadsFormFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  };

  const removeField = (key: string) => {
    setLeadsFormFields((prev) => prev.filter((f) => f.key !== key));
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        إدارة إعدادات الـ Leads
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={leadsEnabled}
              onChange={(_, v) => setLeadsEnabled(v)}
            />
          }
          label="تفعيل نموذج Leads"
        />
      </Paper>

      {leadsEnabled && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            إعداد الحقول
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {leadsFormFields.map((field) => (
            <Box
              key={field.key}
              sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-end" }}
            >
              <FormControlLabel
                control={
                  <Select
                    value={field.fieldType}
                    onChange={(e) =>
                      updateField(field.key, {
                        fieldType: e.target.value as FieldType,
                      })
                    }
                  >
                    {(
                      [
                        "name",
                        "email",
                        "phone",
                        "address",
                        "custom",
                      ] as FieldType[]
                    ).map((ft) => (
                      <MenuItem key={ft} value={ft}>
                        {ft}
                      </MenuItem>
                    ))}
                  </Select>
                }
                label="نوع الحقل"
              />
              <TextField
                label="Label"
                value={field.label}
                onChange={(e) =>
                  updateField(field.key, { label: e.target.value })
                }
              />
              <TextField
                label="Placeholder"
                value={field.placeholder}
                onChange={(e) =>
                  updateField(field.key, { placeholder: e.target.value })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={field.required}
                    onChange={(_, v) => updateField(field.key, { required: v })}
                  />
                }
                label="إجباري"
              />
              <Tooltip title="حذف الحقل">
                <IconButton onClick={() => removeField(field.key)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} onClick={addField}>
            إضافة حقل جديد
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveFields}
            sx={{ mt: 2 }}
          >
            حفظ التعديلات
          </Button>
        </Paper>
      )}

      {/* جدول عرض البيانات */}
      <Typography variant="h5" gutterBottom>
        قائمة الـ Leads
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                {leadsFormFields.map((field) => (
                  <TableCell key={field.key}>
                    {field.label || field.fieldType}
                  </TableCell>
                ))}
                <TableCell>التاريخ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>{lead.sessionId}</TableCell>
                  {leadsFormFields.map((field) => (
                    <TableCell key={field.key}>
                      {(() => {
                        const val =
                          lead.data[field.fieldType] ??
                          lead.data[field.label] ??
                          "-";
                        return typeof val === "string" ||
                          typeof val === "number"
                          ? val
                          : "-";
                      })()}
                    </TableCell>
                  ))}
                  <TableCell>
                    {new Date(lead.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
