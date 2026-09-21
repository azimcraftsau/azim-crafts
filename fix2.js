const fs = require('fs');
const path = require('path');
const pFile = 'c:/Users/HP/Downloads/vintage/frontend/src/admin/views/AdminProducts.jsx';
let pContent = fs.readFileSync(pFile, 'utf8');
pContent = pContent.replace(
  /^\s*updated = products\.map\(\(p\) => \(p\.id === product\.id \? product : p\)\);/m,
  `  const handleSaveProduct = async (product) => {
    if (product.price < 0 || product.stock < 0) {
      setToast({ message: 'Price and stock cannot be negative', type: 'error' });
      return;
    }
    const isNew = modal === 'add';
    let updated;
    if (isNew) {
      updated = [product, ...products];
    } else {
      updated = products.map((p) => (p.id === product.id ? product : p));`
);
fs.writeFileSync(pFile, pContent, 'utf8');

const cFile = 'c:/Users/HP/Downloads/vintage/frontend/src/admin/views/AdminCoupons.jsx';
let cContent = fs.readFileSync(cFile, 'utf8');
cContent = cContent.replace(
  /^\s*setCoupons\(updated\);/m,
  `  useEffect(() => {
    loadData();
    window.addEventListener('vw_coupons_updated', loadData);
    return () => window.removeEventListener('vw_coupons_updated', loadData);
  }, []);

  const handleSave = async (coupon) => {
    if (coupon.price < 0 || coupon.stock < 0) {
      setToast({ message: 'Price and stock cannot be negative', type: 'error' });
      return;
    }
    const isNew = !coupon.id || typeof coupon.id !== 'number';
    const existing = coupons.find((c) => c.id === coupon.id);
    const updated = existing 
      ? coupons.map((c) => (c.id === coupon.id ? coupon : c)) 
      : [coupon, ...coupons];
    
    setCoupons(updated);`
);
fs.writeFileSync(cFile, cContent, 'utf8');
console.log('Fixed broken files');
