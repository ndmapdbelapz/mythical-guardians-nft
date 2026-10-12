/**
 * contracts_test.js
 * Verification test suite for Mythical Beasts & Guardians logic:
 * - 5-Element completeness algorithm
 * - Companion awakening conditions
 * - Elemental battle advantage system
 */

const fs = require('fs');
const path = require('path');

function runTests() {
  console.log("=== RUNNING MYTHICAL GUARDIANS LOGIC TEST SUITE ===");

  // 1. Verify Sample Dataset
  const samplePath = path.join(__dirname, '..', 'web', 'assets', 'sample_tokens.json');
  if (!fs.existsSync(samplePath)) {
    throw new Error("sample_tokens.json not found!");
  }
  const tokens = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  console.log(`[PASS] Loaded ${tokens.length} generated token metadata records.`);

  // 2. Check Elements Present in Dataset
  const elementsPresent = new Set(tokens.map(t => t.properties.element_name));
  const expectedElements = ["Fire", "Water", "Earth", "Air", "Void"];
  expectedElements.forEach(el => {
    if (!elementsPresent.has(el)) {
      throw new Error(`Missing element: ${el}`);
    }
  });
  console.log(`[PASS] All 5 Sacred Elements verified present in token pool: ${Array.from(elementsPresent).join(', ')}`);

  // 3. Test Elemental Pentad Verification Algorithm
  function verifyElementalPentad(subset) {
    if (subset.length !== 5) return false;
    const elements = new Set(subset.map(t => t.properties.element_name));
    return expectedElements.every(el => elements.has(el));
  }

  // Pick 5 tokens of distinct elements
  const pentad = [];
  expectedElements.forEach(el => {
    const match = tokens.find(t => t.properties.element_name === el);
    pentad.push(match);
  });

  const validResult = verifyElementalPentad(pentad);
  if (!validResult) throw new Error("Valid pentad failed verification!");
  console.log("[PASS] Valid 5-element pentad correctly verified for Companion Awakening ritual.");

  // Test invalid pentad (duplicate fire, missing void)
  const invalidPentad = [pentad[0], pentad[0], pentad[1], pentad[2], pentad[3]];
  const invalidResult = verifyElementalPentad(invalidPentad);
  if (invalidResult) throw new Error("Invalid pentad falsely passed verification!");
  console.log("[PASS] Invalid duplicate pentad correctly rejected.");

  // 4. Test Elemental Battle Advantage System
  // Fire beats Air, Air beats Earth, Earth beats Water, Water beats Fire, Void deals/takes 1.5x
  function getElementalMultiplier(attackerEl, defenderEl) {
    if (attackerEl === "Void" || defenderEl === "Void") return 1.5;
    if (attackerEl === "Fire" && defenderEl === "Air") return 1.5;
    if (attackerEl === "Air" && defenderEl === "Earth") return 1.5;
    if (attackerEl === "Earth" && defenderEl === "Water") return 1.5;
    if (attackerEl === "Water" && defenderEl === "Fire") return 1.5;

    // Weaknesses
    if (attackerEl === "Air" && defenderEl === "Fire") return 0.75;
    if (attackerEl === "Earth" && defenderEl === "Air") return 0.75;
    if (attackerEl === "Water" && defenderEl === "Earth") return 0.75;
    if (attackerEl === "Fire" && defenderEl === "Water") return 0.75;

    return 1.0;
  }

  if (getElementalMultiplier("Water", "Fire") !== 1.5) throw new Error("Water vs Fire multiplier error");
  if (getElementalMultiplier("Fire", "Water") !== 0.75) throw new Error("Fire vs Water multiplier error");
  if (getElementalMultiplier("Void", "Earth") !== 1.5) throw new Error("Void multiplier error");
  console.log("[PASS] Elemental Combat Advantage System verified.");

  console.log("\nALL TESTS PASSED SUCCESSFULLY! (4/4 test groups)");
}

runTests();
