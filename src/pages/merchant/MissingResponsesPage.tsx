import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import dayjs from "dayjs";
import type { MissingResponse } from "@/features/mechant/MissingResponses/type";
import {
  getMissingResponses,
  resolveMissingResponse,
  bulkResolve,
} from "@/features/mechant/MissingResponses/api";
import { addMissingToKnowledge } from "@/features/mechant/MissingResponses/api";
import AddToKnowledgeDialog from "@/features/mechant/MissingResponses/ui/AddToKnowledgeDialog";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";

export default function MissingResponsesPage() {
  const [rows, setRows] = useState<MissingResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // zero-based للـ TablePagination
  const [limit, setLimit] = useState(20);

  const [resolved, setResolved] = useState<"all" | "true" | "false">("all");
  const [channel, setChannel] = useState<
    "all" | "telegram" | "whatsapp" | "webchat"
  >("all");
  const [type, setType] = useState<
    "all" | "missing_response" | "unavailable_product"
  >("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<MissingResponse | null>(null);
  const params = useMemo(
    () => ({
      page: page + 1,
      limit,
      resolved,
      channel,
      type,
      search: search.trim() || undefined,
    }),
    [page, limit, resolved, channel, type, search]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMissingResponses(params);
      setRows(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [
    params.page,
    params.limit,
    params.resolved,
    params.channel,
    params.type,
    params.search,
  ]);

  const resetFilters = () => {
    setResolved("all");
    setChannel("all");
    setType("all");
    setSearch("");
    setPage(0);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResolveOne = async (id: string) => {
    await resolveMissingResponse(id);
    fetchData();
  };
  const openKnowledge = (row: MissingResponse) => {
    setCurrentRow(row);
    setKnowledgeOpen(true);
  };
  const handleSubmitKnowledge = async (payload: {
    question: string;
    answer: string;
  }) => {
    if (!currentRow) return;
    await addMissingToKnowledge(currentRow._id, payload);
    setKnowledgeOpen(false);
    setCurrentRow(null);
    await fetchData(); // يحدث الجدول ويغيّر الحالة إلى "مُعالج"
  };
  const handleResolveBulk = async () => {
    if (selected.size === 0) return;
    await bulkResolve(Array.from(selected));
    setSelected(new Set());
    fetchData();
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          الرسائل المنسيّة / غير المفهومة
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={resetFilters}
          >
            تصفير الفلاتر
          </Button>
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={handleResolveBulk}
            disabled={selected.size === 0}
          >
            تحديد الكل كمُعالج
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={1.5}>
        <TextField
          size="small"
          placeholder="بحث..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          select
          label="الحالة"
          value={resolved}
          onChange={(e) => {
            setResolved(e.target.value as "all" | "true" | "false");
            setPage(0);
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="false">غير مُعالج</MenuItem>
          <MenuItem value="true">مُعالج</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          label="القناة"
          value={channel}
          onChange={(e) => {
            setChannel(
              e.target.value as "all" | "telegram" | "whatsapp" | "webchat"
            );
            setPage(0);
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="whatsapp">WhatsApp</MenuItem>
          <MenuItem value="telegram">Telegram</MenuItem>
          <MenuItem value="webchat">WebChat</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          label="النوع"
          value={type}
          onChange={(e) => {
            setType(
              e.target.value as
                | "all"
                | "missing_response"
                | "unavailable_product"
            );
            setPage(0);
          }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="missing_response">Missing Response</MenuItem>
          <MenuItem value="unavailable_product">Unavailable Product</MenuItem>
        </TextField>
        <Chip icon={<FilterAltIcon />} label={`${total} نتيجة`} />
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>تحديد</TableCell>
            <TableCell>التاريخ</TableCell>
            <TableCell>القناة</TableCell>
            <TableCell>السؤال</TableCell>
            <TableCell>رد البوت</TableCell>
            <TableCell>تحليل AI</TableCell>
            <TableCell>النوع</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell align="center">إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r._id} hover>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(r._id)}
                  onChange={() => toggleSelect(r._id)}
                />
              </TableCell>
              <TableCell>
                {dayjs(r.createdAt).format("YYYY-MM-DD HH:mm")}
              </TableCell>
              <TableCell>
                <Chip size="small" label={r.channel} />
              </TableCell>
              <TableCell style={{ maxWidth: 280 }}>{r.question}</TableCell>
              <TableCell style={{ maxWidth: 240, color: "#6b7280" }}>
                {r.botReply}
              </TableCell>
              <TableCell style={{ maxWidth: 240 }}>
                <Tooltip title={r.aiAnalysis || ""}>
                  <span>
                    {r.aiAnalysis
                      ? r.aiAnalysis.length > 40
                        ? r.aiAnalysis.slice(0, 40) + "…"
                        : r.aiAnalysis
                      : "-"}
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={
                    r.type === "missing_response" ? "Missing" : "Unavailable"
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {r.resolved ? (
                  <Chip size="small" color="success" label="مُعالج" />
                ) : (
                  <Chip size="small" color="warning" label="غير مُعالج" />
                )}
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" justifyContent="center" spacing={0.5}>
                  {!r.resolved && (
                    <>
                      <Tooltip title="إضافة للمعرفة">
                        <IconButton onClick={() => openKnowledge(r)}>
                          <LibraryAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تحديد كمُعالج">
                        <IconButton onClick={() => handleResolveOne(r._id)}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell
                colSpan={9}
                align="center"
                style={{ padding: 24, opacity: 0.7 }}
              >
                لا توجد بيانات مطابقة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => {
          setLimit(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
      <AddToKnowledgeDialog
        open={knowledgeOpen}
        onClose={() => setKnowledgeOpen(false)}
        initialQuestion={currentRow?.question || ""}
        // غالبًا botReply عبارة "لم أفهم"، لذلك اترك الإجابة فارغة ليدخلها التاجر
        initialAnswer={""}
        onSubmit={handleSubmitKnowledge}
      />
    </Box>
  );
}
