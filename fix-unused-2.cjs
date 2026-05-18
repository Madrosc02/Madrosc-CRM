const fs = require('fs');

function replaceRegexInFile(file, regex, replace) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replace);
    fs.writeFileSync(file, content);
}

replaceRegexInFile('src/components/analytics/ChurnRiskDashboard.tsx', /import \{ ChurnRiskData, Customer \} from '\.\.\/\.\.\/types';\n/g, '');
replaceRegexInFile('src/components/analytics/ChurnRiskDashboard.tsx', /import \{ Customer \} from '\.\.\/\.\.\/types';\n/g, '');

replaceRegexInFile('src/components/analytics/CustomerSegmentation.tsx', /import \{ Customer, CustomerSegment \} from '\.\.\/\.\.\/types';/g, 'import { Customer } from \'../../types\';');
replaceRegexInFile('src/components/analytics/CustomerSegmentation.tsx', /import \{ CustomerSegment \} from '\.\.\/\.\.\/types';/g, '');

replaceRegexInFile('src/components/LocationInsights.tsx', /import \{ Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Newspaper,  MapPin \} from 'lucide-react';/g, 'import { Cloud, Newspaper, MapPin } from \'lucide-react\';');
replaceRegexInFile('src/components/LocationInsights.tsx', /Sun, /g, '');
replaceRegexInFile('src/components/LocationInsights.tsx', /CloudRain, /g, '');
replaceRegexInFile('src/components/LocationInsights.tsx', /CloudLightning, /g, '');
replaceRegexInFile('src/components/LocationInsights.tsx', /CloudSnow, /g, '');

replaceRegexInFile('src/services/alertService.ts', /sales: Sale\[\],/g, '_sales: Sale[],');
replaceRegexInFile('src/utils/churnPrediction.ts', /sales: Sale\[\],/g, '_sales: Sale[],');
