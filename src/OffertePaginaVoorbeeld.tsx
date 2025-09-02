import React, { useState } from "react";

// ⚠️ Offerte Wizard (incl. btw)
// - Eén vraag per stap, duidelijke taal
// - Terug-knop linksboven + laadbalk
// - Interieur: staat → bijzonderheden → popup upsell interieurcoating
// - Exterieur: Coatingkeuze als één stap (PTFE eerst, Keramisch tweede, Geen derde)
// - PTFE upsell op samenvatting bij totaal ≥ €400 (en Alleen wassen)
// - Samenvatting met **aan/uit** toggles per optie + line-items + kortingen + e‑mail
// - Haal/Breng: stap met twee knoppen; adresvelden op dezelfde stap (vanaf ≥ €450)
// - Robuust: step clamping, defensieve rendering, mini runtime tests

function clampStep(step: number, stepsLen: number): number {
  if (stepsLen <= 0) return 0;
  return Math.max(0, Math.min(step, stepsLen - 1));
}

function progressPct(index: number, len: number): number {
  if (len <= 1) return 100;
  const pct = Math.round((index / (len - 1)) * 100);
  return Math.max(0, Math.min(100, pct));
}

// Mini runtime tests (niet blocking)
(function __runtimeTests() {
  try {
    console.assert(clampStep(1, 3) === 1, "clampStep mid");
    console.assert(clampStep(-2, 3) === 0, "clampStep low");
    console.assert(clampStep(10, 3) === 2, "clampStep high");
    console.assert(clampStep(3, 0) === 0, "clampStep empty");

    console.assert(progressPct(0, 5) === 0, "progress 0%");
    console.assert(progressPct(2, 5) === 50, "progress 50%");
    console.assert(progressPct(4, 5) === 100, "progress 100%");
    console.assert(progressPct(0, 0) === 100, "progress single step");

    // Extra sanity checks
    console.assert(typeof clampStep(0, 1) === 'number', 'clampStep returns number');
    console.assert([0,100].includes(progressPct(0, 1)), 'progressPct edge len<=1');
  } catch (e) {
    console.error("[TEST] runtime tests faalden", e);
  }
})();

export default function OffertePaginaVoorbeeld() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8">
        <CalculatorWizard />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-black/90 text-white grid place-items-center font-bold">SB</div>
          <span className="font-semibold">Shiny Bubble</span>
        </div>
      </div>
    </header>
  );
}

function CalculatorWizard() {
  const VEHICLE_TYPES = [
    "Kleine auto",
    "Grote auto",
    "SUV",
    "Bestelauto",
    "Bestelauto groot",
    "Camper klein",
    "Camper groot",
  ];

  // ====== STATE ======
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0]);
  const [interior, setInterior] = useState<null | boolean>(null);
  const [interiorDetail, setInteriorDetail] = useState<string | null>(null);
  const [interiorExtras, setInteriorExtras] = useState<string[]>([]);
  const [interiorCoating, setInteriorCoating] = useState<boolean>(false);
  const [exterior, setExterior] = useState<null | boolean>(null);
  const [finish, setFinish] = useState<string | null>(null);
  const [coating, setCoating] = useState<string | null>(null); // 'PTFE' | 'KERAMISCH' | null
  const [extraProtect, setExtraProtect] = useState<string[]>([]); // "Velgen coating", "Ruiten coating", "Kunststof buiten coating"
  const [showPopup, setShowPopup] = useState(false); // keramische coating uitleg
  const [showInteriorPopup, setShowInteriorPopup] = useState(false); // interieurcoating upsell
  const [pickupChoice, setPickupChoice] = useState<string | null>(null); // "Ophalen" | "Ophalen+Terugbrengen"
  const [postcode, setPostcode] = useState("");
  const [huisnr, setHuisnr] = useState("");

  // e-mail
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState<null | string>(null);

  // prijzen incl. btw
  const PRICES = {
    interieur: {
      volledig: { 'Kleine auto': 99, 'Grote auto': 119, 'SUV': 139, 'Bestelauto': 99, 'Bestelauto groot': 129, 'Camper klein': 99, 'Camper groot': 99 },
      diepStoelen: 69,
      leer: 69,
      geur: 149,
      interieurCoating: { 'Kleine auto': 49, 'Grote auto': 69, 'SUV': 79, 'Bestelauto': 49, 'Bestelauto groot': 59, 'Camper klein': 49, 'Camper groot': 49 },
      hondenharen: null,
    },
    exterieur: {
      handwas: { 'Kleine auto': 49, 'Grote auto': 59, 'SUV': 69, 'Bestelauto': 69, 'Bestelauto groot': 99, 'Camper klein': 129, 'Camper groot': 149 },
      decon: { 'Kleine auto': 39, 'Grote auto': 49, 'SUV': 59, 'Bestelauto': 59, 'Bestelauto groot': 69, 'Camper klein': 59, 'Camper groot': 79 },
      polish1: { 'Kleine auto': 169, 'Grote auto': 189, 'SUV': 219, 'Bestelauto': 269, 'Bestelauto groot': 299, 'Camper klein': 349, 'Camper groot': 499 },
      polish3: { 'Kleine auto': 449, 'Grote auto': 489, 'SUV': 529, 'Bestelauto': 599, 'Bestelauto groot': 699, 'Camper klein': 679, 'Camper groot': 999 },
      ptfe: { 'Kleine auto': 79, 'Grote auto': 89, 'SUV': 99, 'Bestelauto': 139, 'Bestelauto groot': 189, 'Camper klein': 199, 'Camper groot': 249 },
    },
    coating: {
      ceramic3y: { 'Kleine auto': 499, 'Grote auto': 599, 'SUV': 649, 'Bestelauto': 759, 'Bestelauto groot': 899, 'Camper klein': 999, 'Camper groot': 1299 },
      velgen: 175,
      ruiten: { 'Kleine auto': 179, 'Grote auto': 199, 'SUV': 199, 'Bestelauto': 149, 'Bestelauto groot': 189, 'Camper klein': 189, 'Camper groot': 189 },
      kunststof: { 'Kleine auto': 89, 'Grote auto': 99, 'SUV': 119, 'Bestelauto': 149, 'Bestelauto groot': 189, 'Camper klein': 99, 'Camper groot': 99 },
    },
    extras: {
      velgenReinigen: { 'Kleine auto': 29, 'Grote auto': 29, 'SUV': 29, 'Bestelauto': 29, 'Bestelauto groot': 29, 'Camper klein': 29, 'Camper groot': 29 },
    },
    service: { haulPerKm: 2.85, maxKm: 15 },
  } as const;

  const RULES = {
    bundle20: (hasInterieur: boolean, hasHandwas: boolean) => hasInterieur && hasHandwas,
    ptfe70OffThreshold: 400,
    ptfeOnlyWhenWash: true,
  } as const;

  const autoNext = (fn: (val: any) => void, val: any) => {
    fn(val);
    setTimeout(() => setStep((s) => s + 1), 120);
  };

  const toggleExtra = (opt: string) => {
    setInteriorExtras((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  const toggleProtect = (opt: string) => {
    setExtraProtect((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  const money = (n: number | null) => (n == null ? "n.o.t.k." : `€ ${n.toFixed(2)}`.replace(".", ","));

  // ====== PRICING ======
  type Line = { code: string; label: string; amount: number | null; note?: string; locked?: boolean };

  const buildLines = (): Line[] => {
    const v = vehicle as keyof typeof PRICES.interieur.volledig;
    const L: Line[] = [];

    if (interior) {
      L.push({ code: "INT_FULL", label: "Volledige interieurreiniging", amount: PRICES.interieur.volledig[v] });
      if (interiorExtras.includes("Vlekken uit de stoelen en achterbank")) L.push({ code: "INT_DEEP", label: "Dieptereiniging autostoelen", amount: PRICES.interieur.diepStoelen });
      if (interiorExtras.includes("Leer reinigen en soepel maken")) L.push({ code: "INT_LEER", label: "Leren bekleding reinigen & voeden", amount: PRICES.interieur.leer });
      if (interiorExtras.includes("Geurtjes verwijderen")) L.push({ code: "INT_GEUR", label: "Geurverwijdering / ozon", amount: PRICES.interieur.geur });
      if (interiorExtras.includes("Hondenharen weghalen")) L.push({ code: "INT_HOND", label: "Hondenharen verwijderen", amount: null, note: "n.o.t.k." });
      if (interiorCoating) L.push({ code: "INT_COAT", label: "Interieurcoating", amount: PRICES.interieur.interieurCoating[v] });
    }

    if (exterior) {
      L.push({ code: "EXT_WASH", label: "2-emmer handwas", amount: PRICES.exterieur.handwas[v] });
      if (finish?.includes("1 stap")) {
        L.push({ code: "EXT_DECON", label: "Decontaminatie", amount: PRICES.exterieur.decon[v], locked: true });
        L.push({ code: "EXT_POL1", label: "Polijsten 1 stap", amount: PRICES.exterieur.polish1[v] });
      } else if (finish?.includes("98%")) {
        L.push({ code: "EXT_DECON", label: "Decontaminatie", amount: PRICES.exterieur.decon[v], locked: true });
        L.push({ code: "EXT_POL3", label: "Polijsten 3 stappen", amount: PRICES.exterieur.polish3[v] });
      }

      if (finish === "Alleen wassen" && coating === "PTFE") L.push({ code: "COAT_PTFE", label: "PTFE coating (±6 mnd)", amount: PRICES.exterieur.ptfe[v] });
      if (finish !== "Alleen wassen" && coating === "KERAMISCH") L.push({ code: "COAT_CER", label: "Keramische coating (3 jaar)", amount: PRICES.coating.ceramic3y[v] });
    }

    // Extra coatings (optioneel)
    if (extraProtect.includes("Velgen coating")) {
      L.push({ code: "EXT_WHEELS_CLEAN", label: "Velgen reinigen (ook binnenkant)", amount: PRICES.extras.velgenReinigen[v], locked: true });
      L.push({ code: "COAT_WHEEL", label: "Velgen coating", amount: PRICES.coating.velgen });
    }
    if (extraProtect.includes("Ruiten coating")) {
      L.push({ code: "COAT_GLASS", label: "Ruiten coating", amount: PRICES.coating.ruiten[v] });
    }
    if (extraProtect.includes("Kunststof buiten coating")) {
      L.push({ code: "COAT_TRIM", label: "Kunststof coating buiten", amount: PRICES.coating.kunststof[v] });
    }

    return L;
  };

  const applyDiscounts = (lines: Line[]) => {
    const v = vehicle as keyof typeof PRICES.interieur.volledig;
    const d: Line[] = [];
    const hasInt = !!lines.find((l) => l.code === "INT_FULL");
    const hasWash = !!lines.find((l) => l.code === "EXT_WASH");
    if (RULES.bundle20(hasInt, hasWash)) {
      const int = lines.find((l) => l.code === "INT_FULL")?.amount || 0;
      const wash = lines.find((l) => l.code === "EXT_WASH")?.amount || 0;
      const saving = 0.2 * (int + wash);
      d.push({ code: "DISC_BUNDLE", label: "Bundelkorting (interieur + handwas)", amount: -saving });
    }
    const sub = lines.reduce((a, b) => a + (b.amount || 0), 0);
    const hasPTFE = !!lines.find((l) => l.code === "COAT_PTFE");
    if (hasPTFE && sub >= RULES.ptfe70OffThreshold) {
      const orig = PRICES.exterieur.ptfe[v];
      d.push({ code: "DISC_PTFE70", label: "PTFE aanbieding (70% korting)", amount: -0.7 * orig });
    }
    // Keramische coating gerelateerde kortingen voor extra coatings
    const hasCeramic = coating === 'KERAMISCH';
    if (hasCeramic) {
      // Velgen coating: 25% korting, afronden naar boven heel getal
      const wheel = lines.find(l => l.code === 'COAT_WHEEL');
      if (wheel && typeof wheel.amount === 'number') {
        const base = wheel.amount;
        const final = Math.ceil(base * 0.75);
        d.push({ code: 'DISC_WHEEL25', label: 'Keramisch bundel: velgen coating -25%', amount: final - base });
      }
      // Ruiten coating: 50% korting, afronden naar boven
      const glass = lines.find(l => l.code === 'COAT_GLASS');
      if (glass && typeof glass.amount === 'number') {
        const base = glass.amount;
        const final = Math.ceil(base * 0.5);
        d.push({ code: 'DISC_GLASS50', label: 'Keramisch bundel: ruiten coating -50%', amount: final - base });
      }
      // Kunststof buiten: 50% korting, afronden naar boven
      const trim = lines.find(l => l.code === 'COAT_TRIM');
      if (trim && typeof trim.amount === 'number') {
        const base = trim.amount;
        const final = Math.ceil(base * 0.5);
        d.push({ code: 'DISC_TRIM50', label: 'Keramisch bundel: kunststof coating -50%', amount: final - base });
      }
    }

    return d;
  };

  // ====== SUMMARY TOGGLE LOGIC ======
  const toggleLineInState = (code: string, on: boolean) => {
    switch (code) {
      case "INT_FULL":
        if (!on) { setInterior(false); setInteriorDetail(null); setInteriorExtras([]); setInteriorCoating(false); }
        else { setInterior(true); if (!interiorDetail) setInteriorDetail("Een paar vlekken en kruimels"); }
        break;
      case "INT_DEEP":
        if (on) { if (!interior) setInterior(true); setInteriorExtras((p)=> Array.from(new Set([...p,'Vlekken uit de stoelen en achterbank']))); }
        else { setInteriorExtras((p)=> p.filter(x=> x !== 'Vlekken uit de stoelen en achterbank')); }
        break;
      case "INT_LEER":
        if (on) { if (!interior) setInterior(true); setInteriorExtras((p)=> Array.from(new Set([...p,'Leer reinigen en soepel maken']))); }
        else { setInteriorExtras((p)=> p.filter(x=> x !== 'Leer reinigen en soepel maken')); }
        break;
      case "INT_GEUR":
        if (on) { if (!interior) setInterior(true); setInteriorExtras((p)=> Array.from(new Set([...p,'Geurtjes verwijderen']))); }
        else { setInteriorExtras((p)=> p.filter(x=> x !== 'Geurtjes verwijderen')); }
        break;
      case "INT_HOND":
        if (on) { if (!interior) setInterior(true); setInteriorExtras((p)=> Array.from(new Set([...p,'Hondenharen weghalen']))); }
        else { setInteriorExtras((p)=> p.filter(x=> x !== 'Hondenharen weghalen')); }
        break;
      case "INT_COAT":
        if (on) { if (!interior) setInterior(true); setInteriorCoating(true); } else { setInteriorCoating(false); }
        break;

      case "EXT_WASH":
        if (!on) { setExterior(false); setFinish(null); setCoating(null); }
        else { setExterior(true); if (!finish) setFinish("Alleen wassen"); }
        break;
      case "EXT_POL1":
        if (on) { setExterior(true); setFinish("Wassen + lichte krasjes minder zichtbaar (1 stap polijsten)"); }
        else { setFinish("Alleen wassen"); if (coating === 'KERAMISCH') setCoating(null); }
        break;
      case "EXT_POL3":
        if (on) { setExterior(true); setFinish("Wassen + lichte en diepe krassen verwijderen (≈98% krasvrij)"); }
        else { setFinish("Alleen wassen"); if (coating === 'KERAMISCH') setCoating(null); }
        break;
      case "EXT_DECON":
        // locked bij polijsten – geen toggle
        break;
      case "COAT_PTFE":
        if (on) { if (finish === "Alleen wassen") setCoating("PTFE"); }
        else { if (coating === "PTFE") setCoating(null); }
        break;
      case "COAT_CER":
        if (on) { if (finish !== "Alleen wassen") { if (finish !== "Wassen + lichte en diepe krassen verwijderen (≈98% krasvrij)") setShowPopup(true); setCoating("KERAMISCH"); } }
        else { if (coating === "KERAMISCH") setCoating(null); }
        break;
      case "COAT_WHEEL":
        if (on) { setExtraProtect(p => Array.from(new Set([...p, 'Velgen coating']))); }
        else { setExtraProtect(p => p.filter(x => x !== 'Velgen coating')); }
        break;
      case "COAT_GLASS":
        if (on) { setExtraProtect(p => Array.from(new Set([...p, 'Ruiten coating']))); }
        else { setExtraProtect(p => p.filter(x => x !== 'Ruiten coating')); }
        break;
      case "COAT_TRIM":
        if (on) { setExtraProtect(p => Array.from(new Set([...p, 'Kunststof buiten coating']))); }
        else { setExtraProtect(p => p.filter(x => x !== 'Kunststof buiten coating')); }
        break;
      case "EXT_WHEELS_CLEAN":
        // dependency van velgen coating; locked -> geen toggle
        break;
      default: break;
    }
  };

  // ====== QUOTE TOTALS ======
  function quoteTotals() {
    const lines = buildLines();
    const discounts = applyDiscounts(lines);
    const sub = lines.reduce((a, b) => a + (b.amount || 0), 0);
    const disc = discounts.reduce((a, b) => a + (b.amount || 0), 0);
    const total = sub + disc; // disc is negatief
    return { lines, discounts, sub, disc, total };
  }

  // ====== SUMMARY COMPONENT ======
  function Summary() {
    const v = vehicle as keyof typeof PRICES.interieur.volledig;
    const { lines, discounts, sub, disc, total } = quoteTotals();

    const renderRow = (l: Line) => {
      const checked = true; // lines weerspiegelen huidige selectie
      const disabled = !!l.locked || (l.code.startsWith("INT_") && !interior) || (l.code === "COAT_PTFE" && finish !== "Alleen wassen") || (l.code === "COAT_CER" && finish === "Alleen wassen");
      return (
        <div key={l.code} className="flex items-center justify-between py-2">
          <label className={["flex items-center gap-3", disabled ? "opacity-60" : ""].join(" ")}>
            <input type="checkbox" className="w-4 h-4" checked={checked} disabled={disabled} onChange={(e)=>toggleLineInState(l.code, e.currentTarget.checked)} />
            <span>{l.label}{l.note ? ` – ${l.note}` : ''}</span>
          </label>
          <span className="font-medium">{money(l.amount)}</span>
        </div>
      );
    };

    const renderDisc = (l: Line) => (
      <div key={l.code} className="flex items-center justify-between py-2 text-emerald-700">
        <span>• {l.label}</span>
        <span className="font-medium">{money(l.amount)}</span>
      </div>
    );

    // PTFE Upsell op samenvatting: totaal ≥ 400, Alleen wassen, PTFE niet gekozen
    const canUpsellPTFE = total >= RULES.ptfe70OffThreshold && finish === "Alleen wassen" && coating !== "PTFE";
    const ptfeOrig = PRICES.exterieur.ptfe[v];
    const ptfeNow = (ptfeOrig * 0.3);

    const canEmail = /.+@.+\..+/.test(email.trim());

    const sendEmail = async () => {
      setEmailSending(true); setEmailSent(null);
      try {
        const payload = { naam, email, vehicle, interior, interiorDetail, interiorExtras, interiorCoating, exterior, finish, coating, extraProtect, pickupChoice, postcode, huisnr, lines, discounts, sub, disc, total };
        const res = await fetch('/wp-json/sb-offerte/v1/send-quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Netwerkfout');
        setEmailSent('Je offerte is verzonden. Check je inbox.');
      } catch (e) { setEmailSent('Versturen is niet gelukt. Probeer het later opnieuw.'); }
      finally { setEmailSending(false); }
    };

    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border p-4">
          <h4 className="font-semibold mb-2">Geselecteerde onderdelen</h4>
          {lines.length === 0 && <p className="text-sm text-gray-600">Nog niets geselecteerd.</p>}
          {lines.map(renderRow)}
          {discounts.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <h5 className="font-medium mb-1">Kortingen</h5>
              {discounts.map(renderDisc)}
            </div>
          )}

          {canUpsellPTFE && (
            <div className="mt-3 border-t pt-3">
              <div className="rounded-xl border bg-emerald-50 p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">Aanbieding: PTFE lakbescherming</p>
                  <p className="text-sm text-emerald-800">Je zit boven €{RULES.ptfe70OffThreshold}. PTFE nu voor <strong>€ {ptfeNow.toFixed(2).replace('.', ',')}</strong> (i.p.v. € {ptfeOrig.toFixed(2).replace('.', ',')}).</p>
                </div>
                <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white" onClick={() => setCoating("PTFE")}>Voeg toe</button>
              </div>
            </div>
          )}

          <div className="mt-3 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotaal</span><span className="font-medium">{money(sub)}</span></div>
            <div className="flex justify-between text-emerald-700"><span>Totaal korting</span><span className="font-medium">{money(disc)}</span></div>
            <div className="flex justify-between text-lg font-semibold mt-1"><span>Totaal (incl. btw)</span><span>{money(total)}</span></div>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h4 className="font-semibold mb-2">Offerte mailen</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="rounded-xl border px-3 py-2" placeholder="Je naam" value={naam} onChange={(e)=>setNaam(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" placeholder="E‑mailadres" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <p className="text-xs text-gray-500 mt-1">We mailen je een nette samenvatting met alle gekozen opties en prijzen (incl. btw).</p>
          <div className="mt-3 flex gap-2 items-center">
            <button className={["px-4 py-2 rounded-xl text-white", canEmail ? 'bg-emerald-600' : 'bg-gray-300 cursor-not-allowed'].join(' ')} disabled={!canEmail || emailSending} onClick={sendEmail}>
              {emailSending ? 'Versturen…' : 'Stuur naar mijn e‑mail'}
            </button>
            {emailSent && <span className="text-sm text-gray-600">{emailSent}</span>}
          </div>
        </div>
      </div>
    );
  }

  // ====== DYNAMIC STEPS ======
  const dynSteps = [
    {
      q: "Wat voor voertuig heb je?",
      render: () => (
        <TileGroup value={vehicle} onChange={(v) => autoNext(setVehicle, v)} options={VEHICLE_TYPES} columns={2} />
      ),
    },
    { q: "Wil je dat we de binnenkant schoonmaken?", render: () => <YesNo value={interior} onChange={(v) => autoNext(setInterior, v)} /> },
    ...(interior
      ? [
          {
            q: "Hoe ziet de binnenkant er nu uit?",
            render: () => (
              <RadioGroup value={interiorDetail} onChange={(v) => autoNext(setInteriorDetail, v)} options={["Alleen wat stof en zand", "Een paar vlekken en kruimels", "Heel vies, mag grondig aangepakt worden"]} />
            ),
          },
          {
            q: "Zijn er nog bijzonderheden binnenin? (kies wat van toepassing is)",
            render: () => (
              <div className="grid gap-4">
                <MultiTileGroup values={interiorExtras} onToggle={toggleExtra} options={["Hondenharen weghalen", "Vlekken uit de stoelen en achterbank", "Leer reinigen en soepel maken", "Geurtjes verwijderen"]} />
                <div className="grid gap-2">
                  <button className="w-full text-center px-4 py-3 rounded-xl border bg-white hover:bg-gray-50" onClick={() => setShowInteriorPopup(true)}>
                    {interiorExtras.length > 0 ? "Ga verder" : "Niet van toepassing"}
                  </button>
                </div>
              </div>
            ),
          },
          {
            q: "Wil je extra bescherming toevoegen? (optioneel)",
            render: () => (
              <div className="grid gap-4">
                <MultiTileGroup
                  values={extraProtect}
                  onToggle={toggleProtect}
                  options={["Velgen coating", "Ruiten coating", "Kunststof buiten coating"]}
                />
                <div>
                  <button className="px-4 py-2 rounded-xl border" onClick={() => setStep(s => s + 1)}>
                    {extraProtect.length ? 'Ga verder' : 'Niet van toepassing'}
                  </button>
                </div>
              </div>
            ),
          },
        ]
      : []), // <-- BELANGRIJKE KOMMA: scheidt dit spread-resultaat van de volgende stap
    { q: "Wil je dat we ook de buitenkant schoonmaken?", render: () => <YesNo value={exterior} onChange={(v) => autoNext(setExterior, v)} /> },
    ...(exterior
      ? [
          {
            q: "Wat wil je dat we doen aan de buitenkant?",
            render: () => (
              <RadioGroup value={finish} onChange={(v) => autoNext(setFinish, v)} options={["Alleen wassen", "Wassen + lichte krasjes minder zichtbaar (1 stap polijsten)", "Wassen + lichte en diepe krassen verwijderen (≈98% krasvrij)"]} />
            ),
          },
          {
            q: "Wil je een coating toevoegen? (optioneel)",
            render: () => (
              <CoatingChooser
                finish={finish}
                value={coating}
                onChange={(val) => {
                  if (val === 'KERAMISCH') {
                    if (finish !== "Wassen + lichte en diepe krassen verwijderen (≈98% krasvrij)") {
                      setCoating('KERAMISCH');
                      setShowPopup(true); // blijf op deze stap; ga pas verder na popup-actie
                      return;
                    }
                    return autoNext(setCoating, 'KERAMISCH');
                  }
                  if (val === 'PTFE') return autoNext(setCoating, 'PTFE');
                  // NONE
                  return autoNext(setCoating, null);
                }}
              />
            ),
          },
        ]
      : []),
    ...(() => {
      const { total } = quoteTotals();
      return total >= 450
        ? [
            {
              q: "Wil je gebruikmaken van onze haal- & brengservice?",
              render: () => (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <button className={btnClass(pickupChoice === "Ophalen")} onClick={() => setPickupChoice("Ophalen")}>Haal mijn auto op</button>
                    <button className={btnClass(pickupChoice === "Ophalen+Terugbrengen")} onClick={() => setPickupChoice("Ophalen+Terugbrengen")}>Haal mijn auto op én breng terug</button>
                  </div>
                  {pickupChoice && (
                    <div className="grid gap-2">
                      <input className="w-full rounded-xl border px-3 py-2" placeholder="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                      <input className="w-full rounded-xl border px-3 py-2" placeholder="Huisnummer" value={huisnr} onChange={(e) => setHuisnr(e.target.value)} />
                      <p className="text-sm text-gray-500">We rekenen €{PRICES.service.haulPerKm.toFixed(2)} per km vanaf Gochsestraat 24b, Huissen.</p>
                      <div>
                        <button className="mt-2 px-4 py-2 rounded-xl bg-black text-white" onClick={() => setStep((s) => s + 1)}>Volgende</button>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]
        : [];
    })(),
    { q: "Jouw offerte (prijzen incl. btw)", render: () => <Summary /> },
  ];

  // ====== PROGRESS & RENDER ======
  const safeStep = clampStep(step, dynSteps.length);
  const current = dynSteps[safeStep];
  const pct = progressPct(safeStep, dynSteps.length);

  return (
    <section id="calculator" className="bg-white rounded-3xl shadow-sm border border-black/10 p-6 relative">
      {/* Bovenbalk: Terug + laadbalk */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={safeStep === 0} className={["px-3 py-2 rounded-xl border text-sm", safeStep === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"].join(" ")}>← Terug</button>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-black transition-all" style={{ width: `${pct}%` }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} role="progressbar"/></div>
      </div>

      {current?.q ? (<p className="mb-3 text-gray-700">{current.q}</p>) : (<p className="mb-3 text-gray-700">Bijna klaar…</p>)}
      <div className="mb-5">{current?.render ? current.render() : null}</div>

      {/* Popup: Keramische coating uitleg */}
      {showPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md text-center">
            <h3 className="font-semibold text-lg mb-3">Waarom moet de auto strak zijn voor keramische coating?</h3>
            <p className="text-sm text-gray-600">Een keramische coating sluit de lak af voor jaren. Als er nog krasjes of oneffenheden zichtbaar zijn, dan worden die vastgezet onder de coating. Daarom adviseren we om de auto eerst zo strak mogelijk (≈98% krasvrij) te maken.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl" onClick={() => { setFinish("Wassen + lichte en diepe krassen verwijderen (≈98% krasvrij)"); setShowPopup(false); setStep((s) => s + 1); }}>Oké, voeg krasvrij maken toe</button>
              <button className="px-4 py-2 bg-gray-200 rounded-xl" onClick={() => { if (finish === 'Alleen wassen') setCoating(null); setShowPopup(false); setStep((s) => s + 1); }}>Toch overslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Interieurcoating upsell na bijzonderheden */}
      {showInteriorPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md text-center">
            <h3 className="font-semibold text-lg mb-3">Interieurcoating toevoegen?</h3>
            <p className="text-sm text-gray-600">Houd je interieur langer mooi: bescherming tegen UV, stof en vuil — ongeveer 6 maanden lang.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button className="px-4 py-2 bg-black text-white rounded-xl" onClick={() => { setInteriorCoating(true); setShowInteriorPopup(false); setStep((s) => s + 1); }}>Interieurcoating toevoegen</button>
              <button className="px-4 py-2 bg-gray-200 rounded-xl" onClick={() => { setInteriorCoating(false); setShowInteriorPopup(false); setStep((s) => s + 1); }}>Sla over</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function YesNo({ value, onChange }: { value: any; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <button onClick={() => onChange(true)} className={btnClass(value === true)}>Ja</button>
      <button onClick={() => onChange(false)} className={btnClass(value === false)}>Nee</button>
    </div>
  );
}

function RadioGroup({ value, onChange, options }: { value: string | null; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} className={btnClass(value === opt)}>{opt}</button>
      ))}
    </div>
  );
}

function TileGroup({ value, onChange, options, columns = 3 }: { value: string; onChange: (v: string) => void; options: string[]; columns?: number }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} className={["px-4 py-3 rounded-xl border text-left", value === opt ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"].join(" ")}>{opt}</button>
      ))}
    </div>
  );
}

function MultiTileGroup({ values, onToggle, options, columns = 2 }: { values: string[]; onToggle: (v: string) => void; options: string[]; columns?: number }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} className={["px-4 py-3 rounded-xl border text-left", active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"].join(" ")}>{opt}</button>
        );
      })}
    </div>
  );
}

function CoatingChooser({ finish, value, onChange }: { finish: string | null; value: string | null; onChange: (v: 'PTFE' | 'KERAMISCH' | 'NONE') => void }) {
  const disabledPTFE = finish !== 'Alleen wassen';
  const disabledCER  = false; // klikbaar, zelfs bij 'Alleen wassen' (popup verschijnt)
  return (
    <div className="grid gap-2">
      <button disabled={disabledPTFE} onClick={() => !disabledPTFE && onChange('PTFE')} className={["px-4 py-3 rounded-xl border text-left", value === 'PTFE' ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50", disabledPTFE ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}>
        PTFE (±6 mnd) – lakbescherming
      </button>
      <button disabled={disabledCER} onClick={() => !disabledCER && onChange('KERAMISCH')} className={["px-4 py-3 rounded-xl border text-left", value === 'KERAMISCH' ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50", disabledCER ? 'opacity-50 cursor-not-allowed' : ''].join(' ')}>
        Keramische coating (3 jaar) – met garantie
      </button>
      <button onClick={() => onChange('NONE')} className={["px-4 py-3 rounded-xl border text-left", value == null ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"].join(' ')}>
        Geen coating
      </button>
    </div>
  );
}

function btnClass(active: boolean) {
  return ["w-full text-left px-4 py-3 rounded-xl border", active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"].join(" ");
}

function FAQ() {
  const faqs = [
    { q: "Wanneer is ophalen/brengen beschikbaar?", a: "Vanaf een totaalprijs van €450 of meer." },
    { q: "Wat als mijn auto erg vies is binnen?", a: "Geen zorgen, kies interieur schoonmaken en we stemmen ter plekke af." },
    { q: "Wat is het verschil tussen PTFE en keramische coating?", a: "PTFE beschermt ongeveer 6 maanden. Keramische coating blijft jaren zitten en heeft garantie." },
  ];
  return (
    <section id="faq" className="bg-white rounded-3xl p-6 border border-black/10">
      <h3 className="text-lg font-semibold">Veelgestelde vragen</h3>
      <div className="mt-3 divide-y">
        {faqs.map((f) => (
          <details key={f.q} className="py-3">
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-10 py-10 text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} Shiny Bubble</footer>
  );
}