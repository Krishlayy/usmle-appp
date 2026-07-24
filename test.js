const DOMPurify = require('isomorphic-dompurify');
console.log(DOMPurify.sanitize('<span style="background-color: rgb(255, 235, 59);">test</span>', { 
  ADD_ATTR: ['style', 'data-url', 'class', 'target', 'color', 'size', 'face'], 
  ADD_TAGS: ['font'] 
}));
