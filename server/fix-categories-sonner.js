const fs = require('fs');

const file = 'c:/projects/jay-subhdra/admin-frontend/src/components/categories-content.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Sonner import
if (!content.includes('import { toast, Toaster } from "sonner"')) {
    content = content.replace('import { Skeleton } from "@/components/ui/skeleton"', 'import { Skeleton } from "@/components/ui/skeleton"\nimport { toast, Toaster } from "sonner"');
}

// 2. Replace alerts with Sonner
content = content.replace(/alert\(`([^`]+)`\)/g, 'toast.success(`$1`)');
content = content.replace(/alert\("([^"]+)"\)/g, 'toast.error("$1")'); // assume string quotes are errors
content = content.replace(/alert\((result\.error \|\| "[^"]+")\)/g, 'toast.error($1)');

// 3. Update Image src with fallback
content = content.replace(
    '<img src={`/admin-assets/img/ecommerce-images/${item.image}`} alt={item.title}',
    '<img src={`/uploads/${item.image}`} onError={(e) => { e.currentTarget.src = `/admin-assets/img/ecommerce-images/${item.image}` }} alt={item.title}'
);

// 4. Inject Toaster into the render
if (!content.includes('<Toaster />')) {
    content = content.replace(
        '<div className="flex flex-col gap-6 p-4 md:p-8">',
        '<div className="flex flex-col gap-6 p-4 md:p-8">\n      <Toaster position="top-center" richColors />'
    );
}

fs.writeFileSync(file, content);
console.log('Successfully added Sonner and fixed image fallback!');
