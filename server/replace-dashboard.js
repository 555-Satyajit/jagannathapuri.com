const fs = require('fs');
const file = 'c:/projects/jay-subhdra/admin-frontend/src/components/dashboard-content.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace dummyData with data
content = content.replace(/dummyData/g, 'data');

// Import React and Skeleton
content = content.replace(
    'import { Package, ShoppingCart', 
    'import React, { useState, useEffect } from "react"\nimport { Skeleton } from "@/components/ui/skeleton"\nimport { Package, ShoppingCart'
);

// Remove the const data = { ... }; block
// Note: we replace all text from "const data = {" up to the END of the data object.
content = content.replace(/const data = \{[\s\S]*?\n\};\n\n/, '');

// Add the fetch logic
const componentStart = 'export function DashboardContent() {\n';
const fetchLogic = `export function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard/overview')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        {/* Row 1: Welcome (1), Order Status (1), Stats+Chart (1) */}
        <Skeleton className="col-span-1 h-[250px] rounded-xl" />
        <Skeleton className="col-span-1 h-[250px] rounded-xl" />
        <div className="col-span-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[110px] rounded-xl" />
            <Skeleton className="h-[110px] rounded-xl" />
          </div>
          <Skeleton className="h-[116px] rounded-xl" />
        </div>

        {/* Row 2: Weekly Order + Sales Overview (2), Sales Statistics (1) */}
        <Skeleton className="col-span-1 md:col-span-2 h-[350px] rounded-xl" />
        <Skeleton className="col-span-1 h-[350px] rounded-xl" />

        {/* Row 3: Total Users (1), Top Selling (2) */}
        <Skeleton className="col-span-1 md:col-span-3 xl:col-span-1 h-[400px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-3 xl:col-span-2 h-[400px] rounded-xl" />
      </div>
    );
  }

`;
content = content.replace(componentStart, fetchLogic);

fs.writeFileSync(file, content);
console.log('Updated dashboard-content.tsx');
