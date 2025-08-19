import { useEffect, useMemo, useState } from 'react';
import {
  Box, Stack, Typography, TextField, MenuItem, Button, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

import {
  listInstructions, createInstruction, updateInstruction, removeInstruction,
  toggleActive, getSuggestions, generateFromBadReplies
} from '@/features/mechant/instructions/api';
import type { Instruction } from '@/features/mechant/instructions/type';

export default function InstructionsPage() {
  const [rows, setRows] = useState<Instruction[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [active, setActive] = useState<'all'|'true'|'false'>('all');
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Instruction | null>(null);
  const [text, setText] = useState('');

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ badReply: string; count: number; instruction: string }[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const params = useMemo(() => ({ page: page + 1, limit, active }), [page, limit, active]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listInstructions(params);
      // ملاحظة: findAll عندك يرجع مصفوفة فقط. إن أردت pagination حقيقية، حدث الـ API لإرجاع total.
      setRows(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [params.page, params.limit, params.active]);

  const openNew = () => { setEditRow(null); setText(''); setEditOpen(true); };
  const openEdit = (row: Instruction) => { setEditRow(row); setText(row.instruction); setEditOpen(true); };

  const saveEdit = async () => {
    if (!text.trim()) return;
    if (text.trim().split(/\s+/).length > 15) {
      alert('يجب ألا يزيد التوجيه عن 15 كلمة.'); return;
    }
    if (editRow) await updateInstruction(editRow._id, { instruction: text.trim() });
    else await createInstruction({ instruction: text.trim(), type: 'manual' });
    setEditOpen(false); setText(''); fetchData();
  };

  const del = async (id: string) => { if (confirm('حذف التوجيه؟')) { await removeInstruction(id); fetchData(); } };
  const onToggle = async (row: Instruction) => { await toggleActive(row._id, !row.active); fetchData(); };

  const openSuggest = async () => {
    setSuggestOpen(true);
    const data = await getSuggestions(10);
    setSuggestions(data.items || []);
    setSelected(new Set());
  };
  const togglePick = (i: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i); else n.add(i);
      return n;
    });
  };

  const savePicked = async () => {
    const badReplies = Array.from(selected).map(i => suggestions[i].badReply);
    if (badReplies.length === 0) return;
    await generateFromBadReplies(badReplies);
    setSuggestOpen(false);
    fetchData();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>التوجيهات (Instructions)</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<BoltIcon />} variant="outlined" onClick={openSuggest}>اقتراحات تلقائية</Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>إضافة توجيه</Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} mb={1.5}>
        <TextField size="small" select label="الحالة" value={active} onChange={(e)=>{setActive(e.target.value as 'all' | 'true' | 'false'); setPage(0);}}>
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="true">مفعّل</MenuItem>
          <MenuItem value="false">غير مفعّل</MenuItem>
        </TextField>
        <Chip label={`${rows.length} عنصر`} />
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>النص</TableCell>
            <TableCell>النوع</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell align="center">إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r._id} hover>
              <TableCell sx={{ maxWidth: 600 }}>{r.instruction}</TableCell>
              <TableCell><Chip size="small" label={r.type} /></TableCell>
              <TableCell>
                {r.active ? <Chip size="small" color="success" label="مفعّل" /> : <Chip size="small" color="warning" label="غير مفعّل" />}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="تفعيل/تعطيل">
                  <IconButton onClick={() => onToggle(r)}>{r.active ? <PauseCircleIcon/> : <CheckCircleIcon/>}</IconButton>
                </Tooltip>
                <Tooltip title="تعديل">
                  <IconButton onClick={() => openEdit(r)}><EditIcon/></IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                  <IconButton onClick={() => del(r._id)}><DeleteIcon/></IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, opacity:.7 }}>لا توجد توجيهات</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div" count={rows.length} page={page}
        onPageChange={(_, p)=>setPage(p)} rowsPerPage={limit}
        onRowsPerPageChange={(e)=>{setLimit(parseInt(e.target.value,10)); setPage(0);}}
        rowsPerPageOptions={[10,20,50]}
      />

      {/* مودال إضافة/تعديل */}
      <Dialog open={editOpen} onClose={()=>setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editRow ? 'تعديل توجيه' : 'إضافة توجيه'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth multiline minRows={2} value={text}
            onChange={(e)=>setText(e.target.value)} placeholder="سطر واحد ≤ 15 كلمة"
            helperText="مثال: لا تعد بإرجاع غير قابل للتطبيق أو خصم غير مؤكد."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditOpen(false)}>إلغاء</Button>
          <Button variant="contained" startIcon={<RocketLaunchIcon />} onClick={saveEdit}>حفظ</Button>
        </DialogActions>
      </Dialog>

      {/* مودال الاقتراحات */}
      <Dialog open={suggestOpen} onClose={()=>setSuggestOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>اقتراحات من الردود السلبية</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {suggestions.map((s, i)=>(
              <Stack key={i} direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
                <input type="checkbox" checked={selected.has(i)} onChange={()=>togglePick(i)} />
                <Box sx={{ flex:1 }}>
                  <Typography variant="body2" sx={{ color:'text.secondary' }}>رد سيّئ (x{s.count}): {s.badReply}</Typography>
                  <Typography variant="body1" sx={{ fontWeight:600 }}>{s.instruction}</Typography>
                </Box>
              </Stack>
            ))}
            {suggestions.length === 0 && <Typography sx={{ opacity:.7, py:2 }}>لا توجد اقتراحات حالياً</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSuggestOpen(false)}>إغلاق</Button>
          <Button variant="contained" onClick={savePicked} disabled={selected.size===0}>حفظ المختار</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
