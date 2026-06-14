const fs = require('fs');

const file = 'c:/projects/jay-subhdra/admin-frontend/src/components/categories-content.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add toast import
if (!content.includes('import { useToast }')) {
    content = content.replace('import { useState, useEffect } from "react"', 'import { useState, useEffect } from "react"\nimport { useToast } from "@/hooks/use-toast"');
}

// 2. Add state inside component
const stateLogic = `
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>({
    categoryTitle: '',
    slug: '',
    parentCategory: '',
    description: '',
    status: 'Publish',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    imageFile: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      categoryTitle: '',
      slug: '',
      parentCategory: '',
      description: '',
      status: 'Publish',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      imageFile: null
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleEdit = (category: any) => {
    setFormData({
      categoryTitle: category.title || '',
      slug: category.slug || '',
      parentCategory: category.parent || '',
      description: category.description || '',
      status: category.status || 'Publish',
      meta_title: category.meta_title || '',
      meta_description: category.meta_desc || '',
      meta_keywords: category.meta_keywords || '',
      imageFile: null
    });
    setIsEditing(true);
    setSelectedId(category.id);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(\`/api/admin/ecommerce/categories/delete/\${id}\`);
      const result = await res.json();
      if (result.success) {
        toast({ title: "Success", description: "Category deleted successfully" });
        setData(prev => prev.filter(c => c.id !== id));
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete category", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile' && formData[key] !== null) {
          fd.append(key, formData[key]);
        }
      });
      if (formData.imageFile) {
        fd.append('categoryImage', formData.imageFile);
      }

      const url = isEditing 
        ? \`/api/admin/ecommerce/categories/update/\${selectedId}\`
        : '/api/admin/ecommerce/categories/save';

      const res = await fetch(url, {
        method: 'POST',
        body: fd
      });
      
      const result = await res.json();
      if (result.success) {
        toast({ title: "Success", description: \`Category \${isEditing ? 'updated' : 'created'} successfully\` });
        setSheetOpen(false);
        resetForm();
        // Trigger a re-fetch
        const fetchRes = await fetch('/api/admin/ecommerce/categories/data');
        const fetchResult = await fetchRes.json();
        if (fetchResult.data) {
          setData(fetchResult.data.map((item: any) => ({ id: item.id, title: item.categories, slug: item.slug, products: item.total_products, earning: 0, status: item.status, image: item.cat_image })));
        }
      } else {
        toast({ title: "Error", description: result.error || "Failed to save category", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
`;

content = content.replace('const [sheetOpen, setSheetOpen] = React.useState(false);', 'const [sheetOpen, setSheetOpen] = React.useState(false);\n' + stateLogic);

// 3. Fix Add button reset
content = content.replace('<Button className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>', '<Button className="gap-2" onClick={resetForm}><Plus className="h-4 w-4" /> Add Category</Button>');
content = content.replace('<SheetTitle>Add Category</SheetTitle>', '<SheetTitle>{isEditing ? "Edit Category" : "Add Category"}</SheetTitle>');

// 4. Connect form inputs
content = content.replace('<form className="space-y-6">', '<form className="space-y-6" onSubmit={handleSubmit}>');

// Title input
content = content.replace('<Input id="title" placeholder="Enter category title" />', '<Input id="title" placeholder="Enter category title" value={formData.categoryTitle} onChange={e => setFormData({...formData, categoryTitle: e.target.value})} required />');

// Slug input
content = content.replace('<Input id="slug" placeholder="enter-category-slug" />', '<Input id="slug" placeholder="enter-category-slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />');

// Description input
content = content.replace('<Textarea id="description" placeholder="Write category description..." className="min-h-[100px]" />', '<Textarea id="description" placeholder="Write category description..." className="min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />');

// Status Select
content = content.replace(
    '<Select>', 
    '<Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>'
);

// We need to apply this selectively to the Parent and Status selects. 
// It's safer to just replace them manually.
// File Upload
content = content.replace('<input id="dropzone-file" type="file" className="hidden" />', '<input id="dropzone-file" type="file" className="hidden" onChange={e => setFormData({...formData, imageFile: e.target.files ? e.target.files[0] : null})} />');

// Meta Tags
content = content.replace('<Input id="meta-title" placeholder="SEO Title" />', '<Input id="meta-title" placeholder="SEO Title" value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} />');
content = content.replace('<Textarea id="meta-desc" placeholder="SEO Description" className="min-h-[80px]" />', '<Textarea id="meta-desc" placeholder="SEO Description" className="min-h-[80px]" value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} />');
content = content.replace('<Input id="meta-keywords" placeholder="keyword1, keyword2" />', '<Input id="meta-keywords" placeholder="keyword1, keyword2" value={formData.meta_keywords} onChange={e => setFormData({...formData, meta_keywords: e.target.value})} />');

// Submit button
content = content.replace('<Button type="submit">Add Category</Button>', '<Button type="submit" disabled={submitting}>{submitting ? "Saving..." : (isEditing ? "Save Changes" : "Add Category")}</Button>');

// 5. Connect Action Dropdowns
const actionDropdowns = `
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(cat)}>
                        <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => handleDelete(cat.id)}>
                        <Trash className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
`;
content = content.replace(/<DropdownMenuItem className="gap-2 cursor-pointer">[\s\S]*?<Trash className="h-4 w-4" \/> Delete\s*<\/DropdownMenuItem>/m, actionDropdowns);

fs.writeFileSync(file, content);
console.log('Successfully updated Categories form component!');
