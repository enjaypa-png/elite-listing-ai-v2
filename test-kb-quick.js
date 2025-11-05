#!/usr/bin/env node
/**
 * Quick test to verify knowledge base loads correctly
 * Run: node test-kb-quick.js
 */

const kb = require('./lib/etsyKnowledgeBase.json');

console.log('═══════════════════════════════════════════════');
console.log('  Knowledge Base Quick Test');
console.log('═══════════════════════════════════════════════\n');

const data = kb.EtsyAlgorithmKnowledgeBase_2025;

if (!data) {
  console.error('❌ ERROR: Could not load knowledge base');
  process.exit(1);
}

console.log('✅ JSON Loaded Successfully\n');

console.log('📊 Statistics:');
console.log(`   Version: ${data.version}`);
console.log(`   Last Updated: ${data.last_updated}`);
console.log(`   Categories: ${data.categories.length}`);
console.log(`   Critical Dos: ${data.critical_dos.length}`);
console.log(`   Critical Don'ts: ${data.critical_donts.length}`);
console.log(`   Priority Focus: ${data['2025_priority_focus'].length}\n`);

// Count total insights
const totalInsights = data.categories.reduce((sum, cat) => sum + cat.insights.length, 0);
console.log(`   Total Insights: ${totalInsights}\n`);

console.log('📁 Categories Preview:');
data.categories.slice(0, 5).forEach((cat, i) => {
  console.log(`   ${i + 1}. ${cat.category}`);
  console.log(`      Impact: ${cat.impact}`);
  console.log(`      Insights: ${cat.insights.length}\n`);
});

console.log('✅ First Do:');
console.log(`   "${data.critical_dos[0]}"\n`);

console.log('❌ First Don\'t:');
console.log(`   "${data.critical_donts[0]}"\n`);

console.log('🎯 First Priority:');
console.log(`   "${data['2025_priority_focus'][0]}"\n`);

console.log('═══════════════════════════════════════════════');
console.log('✅ All tests passed! Knowledge base is valid.');
console.log('═══════════════════════════════════════════════');
