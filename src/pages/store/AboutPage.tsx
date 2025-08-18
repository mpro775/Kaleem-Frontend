// src/pages/AboutPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { 
  Box, Paper, Typography,  Button, 
  Chip, Avatar, Skeleton, useTheme,
  IconButton, Card, CardContent, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { 
  Phone, LocationOn, Schedule, Description, 
  Policy, ArrowBack, Storefront, Public,
  LocalShipping, Autorenew, Star, Email
} from "@mui/icons-material";
import type { MerchantInfo } from "../../types/merchant";
import type { WorkingHour } from "../../types/workingHour";
import type { Address } from "../../types/shared";

export default function AboutPage() {
  const theme = useTheme();
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/store/${slugOrId}`)
      .then(res => {
        setMerchant(res.data.merchant);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugOrId]);

  if (loading) return <LoadingSkeleton />;

  if (!merchant) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh',
      textAlign: 'center'
    }}>
      <Typography variant="h5" color="error">
        تعذر تحميل معلومات المتجر
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      maxWidth: 'lg', 
      mx: 'auto', 
      py: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack sx={{ mr: 1 }} />
          العودة
        </IconButton>
        
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          p: { xs: 3, md: 5 },
          mb: 4,
          position: 'relative'
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%)',
          }} />
          
          <Box sx={{ 
            position: 'relative',
            zIndex: 2,
            textAlign: 'center'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 3
            }}>
              {merchant.logoUrl ? (
                <Avatar 
                  src={merchant.logoUrl} 
                  alt={merchant.name} 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }} 
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    bgcolor: 'white',
                    color: theme.palette.primary.main
                  }}
                >
                  <Storefront sx={{ fontSize: 60 }} />
                </Avatar>
              )}
            </Box>
            
            <Typography variant="h3" fontWeight="bold" sx={{ 
              mb: 2, 
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              {merchant.name}
            </Typography>
            
            <Typography variant="h6" sx={{ 
              opacity: 0.9, 
              maxWidth: 800, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}>
              {merchant.businessDescription || "متجرك الإلكتروني الموثوق لتجربة تسوق استثنائية"}
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* معلومات التواصل وساعات العمل */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 4, 
        mb: 4 
      }}>
        {/* معلومات التواصل */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0 // يمنع تجاوز الحاوية
        }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 'bold',
                color: theme.palette.primary.main
              }}>
                <Phone sx={{ mr: 1 }} />
                معلومات التواصل
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="رقم الهاتف" 
                    secondary={merchant.phone || "غير متوفر"} 
                    secondaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                  />
                </ListItem>
                
                {merchant.addresses?.length > 0 && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="العنوان" 
                      secondary={
                        <Box>
                          {merchant.addresses.map((a: Address, idx: number) => (
                            <Typography key={idx} sx={{ mb: 0.5 }}>
                              {a.street}, {a.city}, {a.state}
                            </Typography>
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="البريد الإلكتروني" 
                    secondary={merchant.email || "info@store.com"} 
                    secondaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Public color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="الموقع الإلكتروني" 
                    secondary={merchant.storefrontUrl || "www.example.com"} 
                    secondaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
        
        {/* ساعات العمل */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0 // يمنع تجاوز الحاوية
        }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 'bold',
                color: theme.palette.primary.main
              }}>
                <Schedule sx={{ mr: 1 }} />
                ساعات العمل
              </Typography>
              
              {(merchant.workingHours || []).length > 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  {merchant.workingHours.map((h: WorkingHour, idx: number) => (
                    <Box key={idx} sx={{ 
                      width: { xs: '100%', sm: 'calc(50% - 8px)' },
                      minWidth: 0
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 2
                      }}>
                        <Typography fontWeight="bold">{h.day}:</Typography>
                        <Chip 
                          label={`${h.openTime} - ${h.closeTime}`} 
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  لم يتم تحديد ساعات العمل
                </Typography>
              )}
              
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: theme.palette.warning.light,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Star sx={{ color: theme.palette.warning.dark, mr: 1 }} />
                <Typography>
                  المتجر مغلق أيام العطل الرسمية
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* سياسات المتجر */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}>
              <Policy sx={{ mr: 1 }} />
              سياسات المتجر
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3
            }}>
              {/* سياسة الاستبدال */}
              <Box sx={{ 
                flex: 1, 
                backgroundColor: theme.palette.grey[50], 
                borderRadius: 3, 
                p: 3, 
                height: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}>
                  <Autorenew sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">سياسة الاستبدال</Typography>
                </Box>
                <Typography>
                  {merchant.exchangePolicy || "يمكنك استبدال المنتجات خلال 7 أيام من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية مع الاحتفاظ بالفاتورة."}
                </Typography>
              </Box>
              
              {/* سياسة الشحن */}
              <Box sx={{ 
                flex: 1, 
                backgroundColor: theme.palette.grey[50], 
                borderRadius: 3, 
                p: 3, 
                height: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}>
                  <LocalShipping sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">سياسة الشحن</Typography>
                </Box>
                <Typography>
                  {merchant.shippingPolicy || "نقدم خدمة الشحن لجميع أنحاء المملكة خلال 2-5 أيام عمل. الشحن مجاني للطلبات فوق 200 ر.س."}
                </Typography>
              </Box>
              
              {/* سياسة الاسترجاع */}
              <Box sx={{ 
                flex: 1, 
                backgroundColor: theme.palette.grey[50], 
                borderRadius: 3, 
                p: 3, 
                height: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: theme.palette.primary.main
                }}>
                  <Description sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">سياسة الاسترجاع</Typography>
                </Box>
                <Typography>
                  {merchant.returnPolicy || "يمكنك إرجاع المنتجات خلال 14 يومًا من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية مع الاحتفاظ بالفاتورة."}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* لماذا نختارنا؟ */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}>
              <Star sx={{ mr: 1 }} />
              لماذا تختار متجرنا؟
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 3
            }}>
              {[
                { 
                  icon: <Star sx={{ color: theme.palette.warning.main, fontSize: 40 }} />,
                  title: "جودة عالية",
                  desc: "منتجاتنا مختارة بعناية لتلبي أعلى معايير الجودة"
                },
                { 
                  icon: <LocalShipping sx={{ color: theme.palette.success.main, fontSize: 40 }} />,
                  title: "شحن سريع",
                  desc: "توصيل سريع لجميع أنحاء المملكة خلال 2-5 أيام عمل"
                },
                { 
                  icon: <Phone sx={{ color: theme.palette.info.main, fontSize: 40 }} />,
                  title: "دعم فني",
                  desc: "فريق دعم متاح على مدار الساعة لمساعدتك في أي استفسار"
                },
                { 
                  icon: <Autorenew sx={{ color: theme.palette.secondary.main, fontSize: 40 }} />,
                  title: "ضمان الاستبدال",
                  desc: "ضمان استبدال أو إرجاع المنتج خلال 14 يومًا"
                }
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' },
                  minWidth: 0,
                  textAlign: 'center', 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {item.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            px: 6, 
            py: 1.5, 
            borderRadius: 2, 
            fontWeight: 'bold',
            fontSize: 18
          }}
          onClick={() => navigate(`/store/${slugOrId}`)}
        >
          تصفح منتجاتنا
        </Button>
      </Box>
    </Box>
  );
}

const LoadingSkeleton = () => (
  <Box sx={{ 
    maxWidth: 'lg', 
    mx: 'auto', 
    py: 4,
    px: { xs: 2, sm: 3, md: 4 }
  }}>
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3, mb: 4 }} />
    </Box>
    
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 4, 
      mb: 4 
    }}>
      <Skeleton variant="rectangular" height={300} sx={{ flex: 1, borderRadius: 3 }} />
      <Skeleton variant="rectangular" height={300} sx={{ flex: 1, borderRadius: 3 }} />
    </Box>
    
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 4 }} />
    
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap',
      gap: 3,
      mb: 4
    }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton 
          key={i} 
          variant="rectangular" 
          height={200} 
          sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' },
            borderRadius: 3 
          }} 
        />
      ))}
    </Box>
    
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Skeleton variant="rectangular" width={200} height={50} sx={{ borderRadius: 2, mx: 'auto' }} />
    </Box>
  </Box>
);