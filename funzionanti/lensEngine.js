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

function calculateEdgeThickness(se, diameter, index) {
  let n = parseFloat(index);
  let t = Math.abs(se) * Math.pow(diameter, 2) / (2000 * (n - 1));
  return (t / 10).toFixed(2);
}

function lensEngine(p) {

  let se_od = p.od_sph + (p.od_cyl / 2);
  let se_os = p.os_sph + (p.os_cyl / 2);
  let se = (se_od + se_os) / 2;

  let framePD = p.A + p.DBL;
  let dec = (framePD / 2) - (p.PD / 2);
  let mbs = p.A + (2 * dec);

  let corridor = baseCorridor(p.height);

  if (p.add >= 1.75) corridor += 1;
  if (se <= -6) corridor -= 2;

  let maxCyl = Math.max(Math.abs(p.od_cyl), Math.abs(p.os_cyl));

  if (maxCyl > 2) corridor -= 1;

  if (isOblique(p.od_axis) || isOblique(p.os_axis)) corridor -= 0.5;

  if (p.prism >= 2) corridor -= 0.5;

  let design = "Sferico";
  if (maxCyl > 2) design = "Atorico";
  else if (Math.abs(se) > 2) design = "Asferico";

  let index = "1.50";
  if (Math.abs(se) > 6) index = "1.67";
  else if (Math.abs(se) > 4) index = "1.60";

  let edgeThickness = calculateEdgeThickness(se, mbs, index);

  let solutions = [
    {
      name: "Premium",
      design: design + " freeform",
      index: index,
      reason: "Massima qualità ottica e minime aberrazioni"
    },
    {
      name: "Qualità/Prezzo",
      design: design,
      index: index === "1.67" ? "1.60" : index,
      reason: "Buon equilibrio tra qualità e spessore"
    },
    {
      name: "Base",
      design: "Sferico",
      index: "1.50",
      reason: "Soluzione economica standard"
    }
  ];

  // logica intelligente
  let recommended = "Qualità/Prezzo";

  if (Math.abs(se) > 6 || maxCyl > 3) {
    recommended = "Premium";
  } else if (Math.abs(se) < 2 && maxCyl < 1) {
    recommended = "Base";
  }

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