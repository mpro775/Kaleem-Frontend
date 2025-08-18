// components/store/CategoryFilter.tsx
import { Box, Button } from "@mui/material";
import type { Category } from "../../types/Category";
import { useTheme } from "@mui/material/styles";

type Props = {
  categories: Category[];
  activeCategory: string | null;
  onChange: (catId: string | null) => void;
};

export function CategoryFilter({ categories, activeCategory, onChange }: Props) {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        variant={activeCategory ? "outlined" : "contained"}
        onClick={() => onChange(null)}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold',
          justifyContent: 'flex-start',
          backgroundColor: activeCategory ? 'transparent' : theme.palette.primary.main,
          color: activeCategory ? theme.palette.text.primary : 'white',
          '&:hover': {
            backgroundColor: activeCategory ? 'rgba(0, 0, 0, 0.04)' : theme.palette.primary.dark,
          },
          px: 3,
          py: 1.5,
          transition: 'all 0.3s ease'
        }}
      >
        جميع التصنيفات
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat._id}
          variant={activeCategory === cat._id ? "contained" : "outlined"}
          onClick={() => onChange(cat._id)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            justifyContent: 'flex-start',
            backgroundColor: activeCategory === cat._id ? theme.palette.primary.main : 'transparent',
            color: activeCategory === cat._id ? 'white' : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: activeCategory === cat._id ? theme.palette.primary.dark : 'rgba(0, 0, 0, 0.04)',
            },
            px: 3,
            py: 1.5,
            transition: 'all 0.3s ease'
          }}
        >
          {cat.name}
        </Button>
      ))}
    </Box>
  );
}