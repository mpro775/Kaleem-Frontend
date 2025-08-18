// src/components/ColorPicker.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Popover,
  IconButton,
  Typography,
  InputAdornment
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { SketchPicker, type ColorResult } from 'react-color';
import { useTheme } from '@mui/material/styles';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [color, setColor] = useState(value);
  const [displayColor, setDisplayColor] = useState(value);

  useEffect(() => {
    setColor(value);
    setDisplayColor(value);
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    // نستخدم currentTarget بدلاً من target للوصول إلى العنصر الذي تم تعيين المعالج عليه
    setAnchorEl(event.currentTarget as HTMLDivElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onChange(color);
  };

  const handleChange = (newColor: ColorResult) => {
    setColor(newColor.hex);
    setDisplayColor(newColor.hex);
  };

  const handleChangeComplete = (newColor: ColorResult) => {
    onChange(newColor.hex);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-picker-popover' : undefined;

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={displayColor}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="div" // نحدد صراحة أن هذا عنصر div
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  backgroundColor: color,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: 'pointer'
                }}
                onClick={handleClick}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClick(e)}
                aria-label="اختر لونًا"
              >
                <PaletteIcon />
              </IconButton>
            </InputAdornment>
          ),
          readOnly: true,
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
        sx={{
          '& .MuiInputBase-input': {
            cursor: 'pointer',
          }
        }}
      />

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          اختر لونًا
        </Typography>
        <SketchPicker
          color={color}
          onChange={handleChange}
          onChangeComplete={handleChangeComplete}
          presetColors={[
            '#D84315', '#E65100', '#EF6C00', '#F57C00', '#FF8F00',
            '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7',
            '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784',
            '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F',
            '#7B1FA2', '#8E24AA', '#9C27B0', '#AB47BC', '#BA68C8',
          ]}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" sx={{ mr: 1 }}>
            {color}
          </Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '4px',
              backgroundColor: color,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
}