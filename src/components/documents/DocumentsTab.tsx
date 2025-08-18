import { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
} from "../../api/documentsApi";

const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];
const MAX_SIZE_MB = 5;
const MAX_FILES = 5;
export interface Doc {
  _id: string;
  filename: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  fileType?: string;
}
export default function DocumentsTab({ merchantId }: { merchantId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments(merchantId)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [merchantId]);

  const handleDelete = async (docId: string) => {
    await deleteDocument(merchantId, docId);
    setDocs((prev) => prev.filter((d) => d._id !== docId));
    enqueueSnackbar("تم حذف الوثيقة بنجاح", { variant: "success" });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (docs.length >= MAX_FILES)
      return enqueueSnackbar(`الحد الأقصى ${MAX_FILES} ملفات فقط`, {
        variant: "warning",
      });
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ACCEPTED_EXTENSIONS.includes(ext))
      return enqueueSnackbar("نوع الملف غير مدعوم", { variant: "error" });
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return enqueueSnackbar(`الحجم الأقصى ${MAX_SIZE_MB} ميجا`, {
        variant: "error",
      });
    setUploading(true);
    await uploadDocument(merchantId, file);
    // بعد الرفع مباشرةً حدث القائمة:
    fetchDocuments(merchantId).then(setDocs);
    setUploading(false);
    enqueueSnackbar("تم رفع الوثيقة بنجاح", { variant: "success" });
  };

  if (loading) return <LinearProgress />;
  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        component="label"
        disabled={uploading || docs.length >= MAX_FILES}
      >
        رفع وثيقة
        <input
          hidden
          type="file"
          onChange={handleUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
      </Button>
      <Typography variant="caption" color="text.secondary" ml={2}>
        يسمح فقط بـ PDF, Word, Excel | الحجم الأقصى 5 ميجا | بحد أقصى 5 ملفات
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>اسم الملف</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>تاريخ الرفع</TableCell>
            <TableCell>إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {docs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                لا توجد وثائق بعد
              </TableCell>
            </TableRow>
          ) : (
            docs.map((d) => (
              <TableRow key={d._id}>
                <TableCell>{d.filename}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {d.status === "completed" && (
                    <IconButton
                      component="a"
                      href={`/api/merchants/${merchantId}/documents/${d._id}`}
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDelete(d._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
