const fs = require('fs');

const file = 'c:/projects/jay-subhdra/admin-frontend/src/components/categories-content.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { useToast } from "@/hooks/use-toast"', '');
content = content.replace('const { toast } = useToast();', '');

// Replace toast({ title: "Success", description: "..." }) with alert("...")
content = content.replace(/toast\(\{\s*title:\s*"Success",\s*description:\s*`([^`]+)`\s*\}\)/g, 'alert(`$1`)');
content = content.replace(/toast\(\{\s*title:\s*"Success",\s*description:\s*"([^"]+)"\s*\}\)/g, 'alert("$1")');

// Error toasts
content = content.replace(/toast\(\{\s*title:\s*"Error",\s*description:\s*(result\.error \|\| "[^"]+"),\s*variant:\s*"destructive"\s*\}\)/g, 'alert($1)');
content = content.replace(/toast\(\{\s*title:\s*"Error",\s*description:\s*"([^"]+)",\s*variant:\s*"destructive"\s*\}\)/g, 'alert("$1")');

fs.writeFileSync(file, content);
console.log('Replaced toast with alert!');
