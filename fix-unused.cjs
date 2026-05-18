const fs = require('fs');

function replaceRegexInFile(file, regex, replace) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replace);
    fs.writeFileSync(file, content);
}

replaceRegexInFile('src/components/analytics/ChurnRiskDashboard.tsx', /import \{ ChurnRiskData, Customer \} from '\.\.\/\.\.\/types';\n/g, '');
replaceRegexInFile('src/components/analytics/CohortAnalysis.tsx', /const isFuture = /g, '// const isFuture = ');
replaceRegexInFile('src/components/analytics/CohortAnalysis.tsx', /const opacity = /g, '// const opacity = ');

replaceRegexInFile('src/components/analytics/CustomerPerformanceDetail.tsx', /<StatCard icon="fa-dollar-sign" label="Total Sales in Period" value=\{\`₹\$\{performanceData.kpis.totalSales.toLocaleString\('en-IN'\)\}\`\} \/>/g, '<StatCard icon="fa-dollar-sign" label="Total Sales in Period" value={`₹${performanceData.kpis.totalSales.toLocaleString(\'en-IN\')}`} gradient="from-green-500 to-emerald-600" />');
replaceRegexInFile('src/components/analytics/CustomerPerformanceDetail.tsx', /<StatCard icon="fa-box" label="Total Orders in Period" value=\{performanceData.kpis.totalOrders.toString\(\)\} \/>/g, '<StatCard icon="fa-box" label="Total Orders in Period" value={performanceData.kpis.totalOrders.toString()} gradient="from-blue-500 to-cyan-600" />');
replaceRegexInFile('src/components/analytics/CustomerPerformanceDetail.tsx', /<StatCard icon="fa-receipt" label="Average Order Value" value=\{\`₹\$\{performanceData.kpis.avgOrderValue.toLocaleString\('en-IN', \{maximumFractionDigits: 0\}\)\}\`\} \/>/g, '<StatCard icon="fa-receipt" label="Average Order Value" value={`₹${performanceData.kpis.avgOrderValue.toLocaleString(\'en-IN\', {maximumFractionDigits: 0})}`} gradient="from-purple-500 to-pink-600" />');

replaceRegexInFile('src/components/analytics/CustomerSegmentation.tsx', /import \{ CustomerSegment \} from '\.\.\/\.\.\/types';/g, '');
replaceRegexInFile('src/components/analytics/CustomerSegmentation.tsx', /import \{ Customer, CustomerSegment \} from '\.\.\/\.\.\/types';/g, 'import { Customer } from \'../../types\';');
replaceRegexInFile('src/components/analytics/SalesForecast.tsx', /import \{ Sale \} from '\.\.\/\.\.\/types';\n/g, '');

replaceRegexInFile('src/components/customer/CustomerOverview.tsx', /const btnPrimary = /g, '// const btnPrimary = ');

replaceRegexInFile('src/components/LocationInsights.tsx', /ExternalLink,/g, '');
replaceRegexInFile('src/components/LocationInsights.tsx', /, ExternalLink/g, '');
replaceRegexInFile('src/components/LocationInsights.tsx', /const getWeatherIcon = /g, '// const getWeatherIcon = ');

replaceRegexInFile('src/services/alertService.ts', /const sales = /g, '// const sales = ');
replaceRegexInFile('src/utils/churnPrediction.ts', /const sales = /g, '// const sales = ');
