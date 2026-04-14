// ==============================
// UTILITY
// ==============================

function isOblique(axis) {
  return (axis >= 30 && axis <= 60) || (axis >= 120 && axis <= 150);
}

function baseCorridor(h) {
  if (h <= 16) return 9;
  if (h <= 18) return 10;
  if (h <= 20) return 11;
  if (h <= 22) return 12;
  if (h <= 24) return 13;
  return 14;
}

// ==============================
// SPESSORE
// ==============================

function calculateEdgeThickness(se, diameter, index) {
  let n = parseFloat(index);

  // formula semplificata
  let t = Math.abs(se) * Math.pow(diameter, 2) / (2000 * (n - 1));

  // sicurezza minima
  let thickness = t / 10;

  if (thickness < 1.2) thickness = 1.2;

  return thickness.toFixed(2);
}

// ==============================
// SCONTI
// ==============================

function applyDiscount(price, discounts) {
  let final = price;

  if (discounts.annual) {
    final -= price * (discounts.annual / 100);
  }

  if (discounts.temporary) {
    final -= price * (discounts.temporary / 100);
  }

  return final.toFixed(2);
}

// ==============================
// MOTORE PRINCIPALE
// ==============================

function lensEngine(p) {

  // === equivalente sferico ===
  let se_od = p.od_sph + (p.od_cyl / 2);
  let se_os = p.os_sph + (p.os_cyl / 2);
  let se = (se_od + se_os) / 2;

  // === geometria ===
  let framePD = p.A + p.DBL;
  let dec = (framePD / 2) - (p.PD / 2);
  let mbs = p.A + (2 * dec);

  // === corridoio ===
  let corridor = baseCorridor(p.height);

  if (p.add >= 1.75) corridor += 1;
  if (se <= -6) corridor -= 2;

  // === astigmatismo ===
  let maxCyl = Math.max(Math.abs(p.od_cyl), Math.abs(p.os_cyl));

  if (maxCyl > 2) corridor -= 1;

  // === asse ===
  if (isOblique(p.od_axis) || isOblique(p.os_axis)) {
    corridor -= 0.5;
  }

  // === prisma ===
  if (p.prism >= 2) corridor -= 0.5;

  // ==============================
  // DESIGN LENTE
  // ==============================

  let design = "Sferico";

  if (maxCyl > 2) {
    design = "Atorico";
  } else if (Math.abs(se) > 2) {
    design = "Asferico";
  }

  // ==============================
  // INDICE
  // ==============================

  let index = "1.50";

  if (Math.abs(se) > 6) {
    index = "1.67";
  } else if (Math.abs(se) > 4) {
    index = "1.60";
  }

  // ==============================
  // SPESSORE
  // ==============================

  let edgeThickness = calculateEdgeThickness(se, mbs, index);

  // ==============================
  // SOLUZIONI
  // ==============================

  let solutions = [
    {
      name: "Premium",
      design: design + " freeform",
      index: index,
      reason: "Massima qualità ottica e riduzione aberrazioni"
    },
    {
      name: "Qualità/Prezzo",
      design: design,
      index: index === "1.67" ? "1.60" : index,
      reason: "Equilibrio tra qualità visiva e spessore"
    },
    {
      name: "Base",
      design: "Sferico",
      index: "1.50",
      reason: "Soluzione economica standard"
    }
  ];

  // ==============================
  // SCELTA INTELLIGENTE
  // ==============================

  let recommended = "Qualità/Prezzo";

  if (Math.abs(se) > 6 || maxCyl > 3) {
    recommended = "Premium";
  } else if (Math.abs(se) < 2 && maxCyl < 1) {
    recommended = "Base";
  }

  // ==============================
  // OUTPUT
  // ==============================

  return {
    se: se.toFixed(2),
    decentration: dec.toFixed(1),
    mbs: mbs.toFixed(1),
    corridor: corridor.toFixed(1),
    design,
    index,
    edgeThickness,
    solutions,
    recommended
  };
}