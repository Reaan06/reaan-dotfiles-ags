const fs = require('fs');
const path = require('path');

const serviceDir = './service';
const files = fs.readdirSync(serviceDir);

files.forEach(file => {
    if (file.endsWith('.ts')) {
        const filePath = path.join(serviceDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Correcting Mpris import specifically
        if (content.includes('import { Mpris } from "gnim/service";')) {
            content = content.replace(
                'import { Mpris } from "gnim/service";',
                'import Mpris from "gi://AstalMpris";'
            );
            fs.writeFileSync(filePath, content);
            console.log(`Fixed Mpris import in ${file}`);
        }
    }
});
