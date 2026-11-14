import test from "node:test";
import assert from "node:assert/strict";
import { toEthiopianDate, formatDualDate } from "../../packages/media-kit/dist/localization/ethiopian-calendar.js";

test("Ethiopian Dual-Calendar Unit Tests (Built for Ethiopia)", async (t) => {
  await t.test("Converts hackathon date (2026-11-14) to Hidar 5, 2019", () => {
    const eth = toEthiopianDate("2026-11-14T00:00:00Z");
    assert.equal(eth.year, 2019);
    assert.equal(eth.month, 3);
    assert.equal(eth.monthNameAmharic, "ህዳር");
    assert.equal(eth.day, 5);

    const dual = formatDualDate("2026-11-14");
    assert.equal(dual.iso, "2026-11-14");
    assert.equal(dual.ethiopic, "ህዳር 5፣ 2019 ዓ.ም");
    assert.equal(dual.display, "2026-11-14 (ህዳር 5፣ 2019 ዓ.ም)");
  });

  await t.test("Converts Ethiopian New Year (2026-09-11) to Meskerem 1, 2019", () => {
    const eth = toEthiopianDate("2026-09-11T00:00:00Z");
    assert.equal(eth.year, 2019);
    assert.equal(eth.month, 1);
    assert.equal(eth.monthNameAmharic, "መስከረም");
    assert.equal(eth.day, 1);
  });
});
