const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/HP/Downloads/vintage/frontend/src/admin/views';
const files = ['AdminProducts.jsx', 'AdminOrders.jsx', 'AdminCoupons.jsx', 'AdminBanners.jsx', 'AdminMessages.jsx', 'AdminUsers.jsx'];

function processFile(fname) {
    const filepath = path.join(dir, fname);
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. Loader2 import
    if (!content.includes('Loader2')) {
        content = content.replace(/(import\s+\{[^}]*)(\}\s+from\s+['"`]lucide-react['"`];)/, '$1, Loader2$2');
    }

    // 2. Add loading state if not exists
    if (!content.includes('const [loading') && !content.includes('const [isLoading')) {
        content = content.replace(/(export\s+function\s+[A-Za-z0-9_]+\([^)]*\)\s*\{)/, '$1\n  const [loading, setLoading] = useState(false);');
    }

    // 3. Insert Loading Spinner BEFORE the final return
    if (!content.includes('Loader2 className="w-8 h-8 animate-spin')) {
        const spinner = `  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (`;
        const lastReturnIdx = content.lastIndexOf('  return (');
        if (lastReturnIdx !== -1) {
            content = content.slice(0, lastReturnIdx) + spinner + content.slice(lastReturnIdx + 11);
        }
    }

    // 4. Replace alerts with setToast
    if (content.includes('alert(')) {
        content = content.replace(/alert\((.*?)\)/g, 'setToast({ message: $1, type: "success" }); setTimeout(() => setToast(null), 3000)');
    }
    
    // ensure toast state
    if (content.includes('setToast(') && !content.includes('const [toast') && !content.includes('function Toast')) {
        content = content.replace(/(export\s+function\s+[A-Za-z0-9_]+\([^)]*\)\s*\{)/, '$1\n  const [toast, setToast] = useState(null);');
        const toastJsx = `
      {toast && (
        <div className={\`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white \${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}\`}>
          {toast.message}
        </div>
      )}
    </div>`;
        const lastDivIdx = content.lastIndexOf('    </div>');
        if (lastDivIdx !== -1) {
            content = content.slice(0, lastDivIdx) + toastJsx + content.slice(lastDivIdx + 10);
        }
    }

    // AdminProducts & AdminCoupons specific logic
    if (['AdminProducts.jsx', 'AdminCoupons.jsx'].includes(fname)) {
        content = content.replace(/type="number"/g, 'type="number" min="0"');
    }

    // Remove dummy fallbacks
    content = content.replace(/\|\|\s*dummyProducts/g, '|| []');
    content = content.replace(/\?\s*data\s*:\s*allProducts/g, '? data : []');

    // Sheilds -> Shields
    if (fname === 'AdminProducts.jsx') {
        content = content.replace(/Sheilds/g, 'Shields');
        content = content.replace(/sheild/g, 'shield');
    }

    fs.writeFileSync(filepath, content, 'utf8');
}

files.forEach(processFile);
console.log("Done");
