const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(regex, replacement);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, '..', 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    replaceInFile(filePath, /session\.user\.role !== 'ADMIN'/g, "!['ADMIN', 'SUPERADMIN'].includes(session.user.role)");
    replaceInFile(filePath, /session\.user\?\.role === 'ADMIN'/g, "['ADMIN', 'SUPERADMIN'].includes(session.user?.role)");
    replaceInFile(filePath, /req\.nextauth\.token\?\.role !== 'ADMIN'/g, "!['ADMIN', 'SUPERADMIN'].includes(req.nextauth.token?.role)");
  }
});
console.log("Replacement complete.");
