const fs = require('fs');

const updateFile = (file, dummyArrayName, endpoint, dataKey, transformFuncStr) => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add imports
    if (!content.includes('import { useState, useEffect } from "react"')) {
        content = content.replace('import * as React from "react"', 'import * as React from "react"\nimport { useState, useEffect } from "react"\nimport { Skeleton } from "@/components/ui/skeleton"');
    }

    // 2. Remove dummy array
    const dummyRegex = new RegExp(`const ${dummyArrayName} = \\[.*?\\];?\\n`, 's');
    content = content.replace(dummyRegex, '');

    // 3. Inject state and fetch logic
    const fetchLogic = `
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin${endpoint}');
        const result = await response.json();
        if (result.data) {
          setData(${transformFuncStr ? transformFuncStr + '(result.data)' : 'result.data'});
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-[40px] w-[300px]" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
`;

    // Add logic at the start of the component
    const componentName = file.includes('categories') ? 'CategoriesContent' : file.includes('products') ? 'ProductsContent' : 'AttributesContent';
    const compRegex = new RegExp(`export function ${componentName}\\(\\) \\{`);
    content = content.replace(compRegex, `export function ${componentName}() {${fetchLogic}`);

    // Replace usages of the dummy array with `data`
    content = content.replace(new RegExp(`${dummyArrayName}\\.map`, 'g'), 'data.map');

    // Remove any dummy data total lengths
    if (file.includes('categories')) {
        content = content.replace('Showing 1-10 of 50 categories', 'Showing {data.length} categories');
    } else if (file.includes('products')) {
        content = content.replace('Showing 1-10 of 500 products', 'Showing {data.length} products');
        content = content.replace('<p className="text-2xl font-bold">500</p>', '<p className="text-2xl font-bold">{data.length}</p>');
    } else if (file.includes('attributes')) {
        content = content.replace('Showing 1-5 of 24 attributes', 'Showing {data.length} attributes');
    }

    fs.writeFileSync(file, content);
};

// Update Categories
updateFile(
    'c:/projects/jay-subhdra/admin-frontend/src/components/categories-content.tsx', 
    'dummyCategories', 
    '/ecommerce/categories/data',
    'data',
    `d => d.map(item => ({ id: item.id, title: item.categories, slug: item.slug, products: item.total_products, earning: 0, status: item.status }))`
);

// Update Products
updateFile(
    'c:/projects/jay-subhdra/admin-frontend/src/components/products-content.tsx', 
    'dummyProducts', 
    '/ecommerce/products/data',
    'data',
    `d => d.map(item => ({ id: item.id, name: item.product_name, category: item.category, stock: item.qty > 0 ? 'In Stock' : 'Out of Stock', sku: item.sku, price: item.price, qty: item.qty, status: item.status }))`
);

// Update Attributes
updateFile(
    'c:/projects/jay-subhdra/admin-frontend/src/components/attributes-content.tsx', 
    'attributesData', 
    '/ecommerce/attributes/data',
    'data',
    null
);

console.log('Successfully updated Catalog frontend components!');
