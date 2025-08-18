// src/components/CartDialog.tsx
import { 
  Dialog, DialogTitle, DialogContent, Typography, 
  Box, Button, TextField, Stack, IconButton,
   CircularProgress, useTheme
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import axiosInstance from "../../api/axios";
import type { CustomerInfo } from "../../types/store";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Person } from "@mui/icons-material";

export default function CartDialog({
  open,
  onClose,
  merchantId,
  onOrderSuccess,
}: {
  open: boolean;
  onClose: () => void;
  merchantId: string;
  onOrderSuccess: (orderId: string) => void;
}) {
  const theme = useTheme();
  const { items, clearCart, removeItem, updateQuantity } = useCart();
  // اجلب بيانات العميل من localStorage (لو وجدت)
  const getInitialCustomer = (): CustomerInfo => {
    const data = localStorage.getItem("customerInfo");
    if (data) return JSON.parse(data) as CustomerInfo;
    return { name: "", phone: "", address: "" };
  };

  const [customer, setCustomer] = useState<CustomerInfo>(getInitialCustomer());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: سلة الشراء, 2: تفاصيل الشحن, 3: تأكيد الطلب
  const [errors, setErrors] = useState<Record<string, string>>({});

  // كلما تغيرت بيانات العميل، خزّنها محليًا
  useEffect(() => {
    localStorage.setItem("customerInfo", JSON.stringify(customer));
  }, [customer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customer.name.trim()) {
      newErrors.name = "الرجاء إدخال الاسم";
    }
    
    if (!customer.phone.trim()) {
      newErrors.phone = "الرجاء إدخال رقم الجوال";
    } 
    
    if (!customer.address.trim()) {
      newErrors.address = "الرجاء إدخال العنوان";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
  if (step === 1) {
    setStep(2); // لا تتحقق من الفورم هنا
  } else if (step === 2) {
    if (validateForm()) {
      setStep(3);
    }
  }
};


  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleOrder = async () => {
    setLoading(true);
    const sessionId =
      localStorage.getItem("sessionId") ||
      Math.random().toString(36).substring(2, 12);
    localStorage.setItem("sessionId", sessionId);

    // إرسال الطلب
 const products = items.map((i) => ({
  product: i.product._id,      // صح: المفتاح اسمه product
  name: i.product.name,
  quantity: i.quantity,
  price: i.product.price,
}));

    try {
      const res = await axiosInstance.post("/orders", {
        merchantId,
        sessionId,
        customer,
        products,
      });

      setLoading(false);
      clearCart();
      onOrderSuccess(res.data._id);
      onClose();
      setStep(1); // إعادة الخطوات إلى الحالة الأولية
    } catch (error) {
      setLoading(false);
      console.error("فشل في إرسال الطلب:", error);
    }
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartCheckoutIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            {step === 1 ? "سلة الشراء" : step === 2 ? "بيانات العميل" : "تأكيد الطلب"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* شريط التقدم */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: 3, 
          backgroundColor: theme.palette.grey[100],
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 600, width: '100%' }}>
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: step >= s ? theme.palette.primary.main : 'white',
                  border: `2px solid ${step >= s ? theme.palette.primary.main : theme.palette.grey[400]}`,
                  color: step >= s ? 'white' : theme.palette.grey[400],
                  fontWeight: 'bold',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {step > s ? <CheckCircleIcon fontSize="small" /> : s}
                </Box>
                {s < 3 && (
                  <Box sx={{ 
                    flex: 1, 
                    height: 2, 
                    backgroundColor: step > s ? theme.palette.primary.main : theme.palette.grey[400] 
                  }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        
        {items.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            textAlign: 'center'
          }}>
            <ShoppingCartCheckoutIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>سلة الشراء فارغة</Typography>
            <Typography color="text.secondary">لم تقم بإضافة أي منتجات إلى سلة الشراء بعد</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 3 }} 
              onClick={onClose}
            >
              مواصلة التسوق
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {step === 1 && (
              <>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
                  {items.map(({ product, quantity }) => (
                    <Box key={product._id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: theme.palette.grey[50],
                      '&:hover': { backgroundColor: theme.palette.grey[100] }
                    }}>
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 2, 
                        overflow: 'hidden', 
                        mr: 2,
                        flexShrink: 0
                      }}>
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <Box sx={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: theme.palette.grey[200]
                          }}>
                            <Typography color="text.secondary">لا صورة</Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight="bold" sx={{ mb: 0.5 }}>{product.name}</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 14 }}>{product.description?.substring(0, 50)}...</Typography>
                        <Typography fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                          {product.price?.toFixed(2)} ر.س
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        ml: 2
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (quantity > 1) {
                              updateQuantity(product._id, quantity - 1);
                            } else {
                              removeItem(product._id);
                            }
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        
                        <Typography sx={{ mx: 1 }}>{quantity}</Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(product._id, quantity + 1);
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(product._id);
                        }}
                        sx={{ ml: 2 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 3,
                  p: 2,
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2
                }}>
                  <Typography fontWeight="bold">الإجمالي:</Typography>
                  <Typography fontWeight="bold" fontSize={20} color="primary">
                    {totalAmount.toFixed(2)} ر.س
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                  onClick={handleNextStep}
                  startIcon={<Person />}
                >
                  المتابعة إلى إدخال المعلومات 
                </Button>
              </>
            )}
            
            {step === 2 && (
              <>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                  معلومات العميل
                </Typography>
                
                <Stack spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
                  <TextField
                    label="الاسم بالكامل"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, name: e.target.value }))
                    }
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                  />
                  
                  <TextField
                    label="رقم الجوال"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, phone: e.target.value }))
                    }
                    error={!!errors.phone}
                    helperText={errors.phone}
                    fullWidth
                    inputProps={{ maxLength: 10 }}
                  />
                  
                  <TextField
                    label="العنوان التفصيلي"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, address: e.target.value }))
                    }
                    error={!!errors.address}
                    helperText={errors.address}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                      onClick={handlePrevStep}
                    >
                      رجوع
                    </Button>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                      onClick={handleNextStep}
                      startIcon={<PaymentIcon />}
                    >
                      المتابعة إلى بيانات الطلب
                    </Button>
                  </Box>
                </Stack>
              </>
            )}
            
            {step === 3 && (
              <>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  تأكيد الطلب
                </Typography>
                
                <Box sx={{ 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 3, 
                  p: 3, 
                  mb: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>ملخص الطلب</Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {items.map(({ product, quantity }) => (
                      <Box 
                        key={product._id} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Typography>
                          {product.name} × {quantity}
                        </Typography>
                        <Typography>
                          {(product.price * quantity).toFixed(2)} ر.س
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1
                  }}>
                    <Typography>المجموع الفرعي:</Typography>
                    <Typography>{totalAmount.toFixed(2)} ر.س</Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1
                  }}>
                    <Typography>رسوم الشحن:</Typography>
                    <Typography>0.00 ر.س</Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 2,
                    pt: 2,
                    borderTop: `2px solid ${theme.palette.divider}`
                  }}>
                    <Typography fontWeight="bold">الإجمالي النهائي:</Typography>
                    <Typography fontWeight="bold" fontSize={18} color="primary">
                      {totalAmount.toFixed(2)} ر.س
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 3, 
                  p: 3, 
                  mb: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>معلومات العميل</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography fontWeight="bold">الاسم:</Typography>
                    <Typography>{customer.name}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography fontWeight="bold">رقم الجوال:</Typography>
                    <Typography>{customer.phone}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography fontWeight="bold">العنوان:</Typography>
                    <Typography>{customer.address}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                    onClick={handlePrevStep}
                  >
                    رجوع
                  </Button>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                    disabled={loading}
                    onClick={handleOrder}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  >
                    {loading ? "جاري إتمام الطلب..." : "تأكيد الطلب"}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}