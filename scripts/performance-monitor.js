import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceMonitor {
  constructor() {
    this.baseline = this.loadBaseline();
    this.resultsDir = './test-performance';
    
    // إنشاء مجلد النتائج إذا لم يكن موجوداً
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async runTests() {
    console.log('🧪 تشغيل الاختبارات...');
    
    const startTime = Date.now();
    
    try {
      // تشغيل الاختبارات مع تقرير JSON
      const result = execSync('npm run test -- --reporter=json --outputFile=test-results.json', { 
        encoding: 'utf8',
        timeout: 300000 // 5 دقائق timeout
      });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log('✅ تم تشغيل الاختبارات بنجاح');
      
      // تحليل النتائج
      const analysis = this.analyzePerformance(totalTime);
      
      // حفظ النتائج
      this.saveResults(analysis);
      
      // إنشاء التقرير
      this.generateReport(analysis);
      
      // مقارنة مع baseline
      this.compareWithBaseline(analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ خطأ في تشغيل الاختبارات:', error.message);
      
      // محاولة قراءة النتائج الموجودة
      if (fs.existsSync('test-results.json')) {
        const analysis = this.analyzePerformance(Date.now() - startTime);
        this.generateReport(analysis);
        return analysis;
      }
      
      throw error;
    }
  }

  analyzePerformance(totalTime) {
    let testTimes = [];
    
    try {
      if (fs.existsSync('test-results.json')) {
        const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
        
        // استخراج أوقات الاختبارات
        if (results.testResults) {
          results.testResults.forEach(suite => {
            if (suite.assertionResults) {
              suite.assertionResults.forEach(test => {
                if (test.duration) {
                  testTimes.push({
                    name: `${suite.name} > ${test.title}`,
                    duration: test.duration,
                    suite: suite.name,
                    status: test.status
                  });
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ لا يمكن قراءة نتائج الاختبارات:', error.message);
    }
    
    // تحليل الأداء
    const sortedTests = testTimes.sort((a, b) => b.duration - a.duration);
    const slowTests = sortedTests.filter(test => test.duration > 1000);
    const averageTime = testTimes.length > 0 ? 
      testTimes.reduce((sum, test) => sum + test.duration, 0) / testTimes.length : 0;
    
    const analysis = {
      totalTests: testTimes.length,
      totalTime,
      averageTime: Math.round(averageTime),
      slowTestsCount: slowTests.length,
      slowestTests: sortedTests.slice(0, 10),
      testDistribution: this.calculateTestDistribution(testTimes),
      performanceScore: this.calculatePerformanceScore(averageTime, slowTests.length),
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(averageTime, slowTests.length, totalTime)
    };
    
    return analysis;
  }

  calculateTestDistribution(testTimes) {
    const distribution = {
      fast: 0,    // <100ms
      medium: 0,  // 100-500ms
      slow: 0,    // 500-1000ms
      verySlow: 0 // >1000ms
    };
    
    testTimes.forEach(test => {
      if (test.duration < 100) distribution.fast++;
      else if (test.duration < 500) distribution.medium++;
      else if (test.duration < 1000) distribution.slow++;
      else distribution.verySlow++;
    });
    
    return distribution;
  }

  calculatePerformanceScore(averageTime, slowTestsCount) {
    let score = 100;
    
    // خصم نقاط للاختبارات البطيئة
    if (averageTime > 500) score -= 20;
    if (averageTime > 1000) score -= 30;
    
    if (slowTestsCount > 5) score -= 15;
    if (slowTestsCount > 10) score -= 25;
    
    return Math.max(0, score);
  }

  generateRecommendations(averageTime, slowTestsCount, totalTime) {
    const recommendations = [];
    
    if (averageTime > 500) {
      recommendations.push('⚡ متوسط وقت الاختبارات مرتفع (>500ms) - يحتاج تحسين');
    }
    
    if (slowTestsCount > 5) {
      recommendations.push('🐌 عدد الاختبارات البطيئة كبير (>5) - يحتاج تحسين');
    }
    
    if (totalTime > 300000) {
      recommendations.push('⏱️ الوقت الإجمالي طويل (>5 دقائق) - يحتاج تحسين');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ الأداء جيد - لا توجد تحسينات مطلوبة');
    }
    
    return recommendations;
  }

  saveResults(analysis) {
    const filename = `test-performance-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`💾 تم حفظ النتائج في: ${filepath}`);

    // تحديث بيانات لوحة التحكم
    this.updateDashboardData(analysis);
  }

  updateDashboardData(analysis) {
    const dashboardPath = path.join(this.resultsDir, 'dashboard-data.json');
    let data = [];
    try {
      if (fs.existsSync(dashboardPath)) {
        data = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
      }
    } catch {
      data = [];
    }
    data.push({
      timestamp: analysis.timestamp,
      totalTime: analysis.totalTime,
      averageTime: analysis.averageTime,
      performanceScore: analysis.performanceScore
    });
    fs.writeFileSync(dashboardPath, JSON.stringify(data, null, 2));
  }

  generateReport(analysis) {
    const report = this.createMarkdownReport(analysis);
    const filename = `PERFORMANCE_REPORT_${new Date().toISOString().split('T')[0]}.md`;
    const filepath = path.join(this.resultsDir, filename);
    
    fs.writeFileSync(filepath, report);
    console.log(`📊 تم إنشاء تقرير الأداء: ${filepath}`);
    
    // عرض ملخص في Terminal
    this.displaySummary(analysis);
  }

  createMarkdownReport(analysis) {
    const date = new Date().toLocaleDateString('ar-SA');
    
    return `# 📊 تقرير أداء الاختبارات - ${date}

## 📈 الإحصائيات
- **إجمالي الاختبارات:** ${analysis.totalTests}
- **الوقت الإجمالي:** ${analysis.totalTime}ms (${(analysis.totalTime / 1000).toFixed(1)}s)
- **متوسط وقت الاختبار:** ${analysis.averageTime}ms
- **عدد الاختبارات البطيئة:** ${analysis.slowTestsCount}
- **درجة الأداء:** ${analysis.performanceScore}/100

## 📊 توزيع الاختبارات
- ⚡ سريع (<100ms): ${analysis.testDistribution.fast}
- 🟡 متوسط (100-500ms): ${analysis.testDistribution.medium}
- 🟠 بطيء (500-1000ms): ${analysis.testDistribution.slow}
- 🔴 بطيء جداً (>1000ms): ${analysis.testDistribution.verySlow}

## 🐌 أبطأ 10 اختبارات
${analysis.slowestTests.map((test, index) => 
  `${index + 1}. **${test.name}**: ${test.duration}ms`
).join('\n')}

## 🎯 التوصيات
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📅 التاريخ
${analysis.timestamp}

---
*تم إنشاء هذا التقرير بواسطة نظام مراقبة الأداء الآلي* ⚡
`;
  }

  displaySummary(analysis) {
    console.log('\n📊 ملخص الأداء:');
    console.log(`- إجمالي الاختبارات: ${analysis.totalTests}`);
    console.log(`- الوقت الإجمالي: ${(analysis.totalTime / 1000).toFixed(1)}s`);
    console.log(`- متوسط وقت الاختبار: ${analysis.averageTime}ms`);
    console.log(`- الاختبارات البطيئة: ${analysis.slowTestsCount}`);
    console.log(`- درجة الأداء: ${analysis.performanceScore}/100`);
    
    if (analysis.slowestTests.length > 0) {
      console.log('\n🐌 أبطأ الاختبارات:');
      analysis.slowestTests.slice(0, 3).forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name}: ${test.duration}ms`);
      });
    }
    
    console.log('\n🎯 التوصيات:');
    analysis.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }

  compareWithBaseline(analysis) {
    if (!this.baseline) {
      console.log('📝 لا يوجد baseline للمقارنة');
      return;
    }
    
    const timeChange = ((analysis.totalTime - this.baseline.totalTime) / this.baseline.totalTime * 100).toFixed(1);
    const avgTimeChange = ((analysis.averageTime - this.baseline.averageTime) / this.baseline.averageTime * 100).toFixed(1);
    
    console.log('\n📈 مقارنة مع Baseline:');
    console.log(`- الوقت الإجمالي: ${timeChange > 0 ? '+' : ''}${timeChange}%`);
    console.log(`- متوسط الوقت: ${avgTimeChange > 0 ? '+' : ''}${avgTimeChange}%`);
    
    if (parseFloat(timeChange) > 20) {
      console.log('⚠️ تحذير: الأداء تدهور بشكل كبير!');
    } else if (parseFloat(timeChange) < -20) {
      console.log('🎉 ممتاز: الأداء تحسن بشكل كبير!');
    }
  }

  loadBaseline() {
    try {
      const baselinePath = path.join(this.resultsDir, 'baseline.json');
      if (fs.existsSync(baselinePath)) {
        return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ لا يمكن تحميل baseline:', error.message);
    }
    return null;
  }

  setBaseline() {
    this.runTests().then(analysis => {
      const baselinePath = path.join(this.resultsDir, 'baseline.json');
      fs.writeFileSync(baselinePath, JSON.stringify(analysis, null, 2));
      console.log('✅ تم تعيين baseline جديد');
    }).catch(console.error);
  }
}

// تشغيل المراقبة
const monitor = new PerformanceMonitor();

const command = process.argv[2];

if (command === 'baseline') {
  monitor.setBaseline();
} else {
  monitor.runTests().catch(console.error);
}

export default PerformanceMonitor;
