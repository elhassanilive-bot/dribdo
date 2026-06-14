const fs = require('fs');
let str = fs.readFileSync('src/content/helpCenterData.js', 'utf8');

// The original corrupt line 66 has a missing closing quote and brace. 
// We replace the part from id: 'posts-9' until the end of the array `],`
let fixed = str.replace(
  /\{\s*id:\s*'posts-9'[\s\S]*?\],/, 
  "{ id: 'posts-9', question: 'كم عدد التفاعلات المتوفرة في التطبيق؟', answer: 'يدعم دريبدو مجموعة واسعة من التفاعلات تتجاوز الإعجاب التقليدي، وتشمل تفاعلات متنوعة لتناسب طبيعة المحتوى والمشاعر.', keywords: ['عدد التفاعلات', 'تفاعلات متنوعة'] }\n    ],"
);

fs.writeFileSync('src/content/helpCenterData.js', fixed, 'utf8');
console.log('File fixed successfully');
