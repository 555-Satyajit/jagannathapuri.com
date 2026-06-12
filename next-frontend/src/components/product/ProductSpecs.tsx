import { Info } from "lucide-react";

interface SpecItem {
  name: string;
  value: string;
}

interface ProductSpecsProps {
  specifications: any;
}

export default function ProductSpecs({ specifications }: ProductSpecsProps) {
  let parsedSpecs: SpecItem[] = [];

  try {
    if (typeof specifications === 'string') {
      parsedSpecs = JSON.parse(specifications);
    } else if (Array.isArray(specifications)) {
      parsedSpecs = specifications;
    }
  } catch (e) {
    console.error("Failed to parse specifications", e);
  }

  if (!parsedSpecs || parsedSpecs.length === 0) return null;

  return (
    <div className="pt-8 border-t border-zinc-100">
      <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-orange-600" />
        Product Details
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {parsedSpecs.map((spec, idx) => (
          <div key={idx} className="flex flex-col p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
              {spec.name}
            </span>
            <span className="text-sm font-semibold text-zinc-900">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
