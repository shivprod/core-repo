(function () {
  "use strict";

  const INK = "oklch(0.24 0.012 70)";
  const INK2 = "oklch(0.46 0.008 70)";
  const QUIET = "oklch(0.62 0.006 70)";
  const CONF = "oklch(0.52 0.09 165)";
  const CONF_INK = "oklch(0.42 0.07 165)";
  const ATTN = "oklch(0.58 0.11 65)";
  const ATTN_INK = "oklch(0.55 0.11 65)";
  const WARN = "oklch(0.50 0.13 30)";
  const PRED = "oklch(0.52 0.09 265)";
  const PRED_INK = "oklch(0.45 0.09 265)";
  const REFUND = "oklch(0.52 0.09 205)";
  const REFUND_INK = "oklch(0.45 0.09 205)";
  const INCOME = "oklch(0.48 0.09 150)";
  const FADE_RAIL = "oklch(0.80 0.02 165)";
  const NONE_RAIL = "oklch(0.85 0.006 70)";
  const MONO = "'IBM Plex Mono',monospace";
  const SANS = "'Archivo',sans-serif";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inr(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  const TXNS = [
    { id: "swiggy", name: "Swiggy", amt: "₹1,249", cat: "Food & Dining", state: "confirmed", meta: "1:42 PM · SMS + Gmail", recurring: false,
      detail: { merchant: "Swiggy", category: "Food & Dining", stateLabel: "Confirmed — two sources agree", confidence: "High", reason: "SMS and Gmail agree on amount, time and account", bars: 3,
        meta: "7 Sep · 1:42 PM\nHDFC · ****4821 · UPI",
        rawLabel: "Raw · HDFC-BK · 7 Sep 1:42 PM",
        raw: "Rs.1249.00 debited from a/c **4821 on 07-09-26 to SWIGGY via UPI. Ref 628401993412.",
        rows: [
          { label: "Amount", value: "₹1,249", src: "✓ HDFC SMS", ok: true },
          { label: "Time", value: "1:42 PM", src: "✓ HDFC SMS", ok: true },
          { label: "Merchant", value: "Swiggy", src: "✓ Gmail", ok: true },
          { label: "Items", value: "3 items · ₹89 delivery", src: "✓ Gmail", ok: true },
          { label: "Category", value: "Food & Dining", src: "✎ You · 7 Sep", user: true }
        ] } },
    { id: "cult", name: "Cult.fit", amt: "₹1,499", cat: "Uncategorised", state: "uncategorised", meta: "6:04 AM · SMS + Gmail", recurring: true,
      detail: { merchant: "Cult.fit", category: "Uncategorised", stateLabel: "Confirmed — but not categorised", confidence: "High", reason: "Both sources agree. We just don't know how you file it.", bars: 3,
        meta: "3 Sep · 6:04 AM\nICICI · ****9042 · UPI",
        rawLabel: "Raw · ICICIB · 3 Sep 6:04 AM",
        raw: "Rs.1499.00 debited from a/c **9042 on 03-09-26 to CULTFIT via UPI. Ref 662019884120.",
        rows: [
          { label: "Amount", value: "₹1,499", src: "✓ ICICI SMS", ok: true },
          { label: "Merchant", value: "Cult.fit", src: "✓ Gmail", ok: true },
          { label: "Plan", value: "Elite · monthly", src: "✓ Gmail", ok: true },
          { label: "Category", value: "Uncategorised", src: "— needs you", attn: true }
        ] } },
    { id: "netflix", name: "Netflix", amt: "₹649", cat: "Subscriptions", state: "confirmed", meta: "2 Sep · autopay · SMS + Gmail", recurring: true,
      detail: { merchant: "Netflix", category: "Subscriptions", stateLabel: "Confirmed — autopay under mandate", confidence: "High", reason: "Mandate SMS, debit SMS and Gmail receipt all agree", bars: 3,
        meta: "2 Sep · 12:04 AM\nHDFC · ****4821 · UPI AutoPay",
        rawLabel: "Raw · HDFC-BK · 2 Sep 12:04 AM",
        raw: "Rs.649.00 debited from a/c **4821 towards UPI-Mandate NETFLIX. UMN 8841ax… Ref 771002884190.",
        rows: [
          { label: "Amount", value: "₹649", src: "✓ HDFC SMS", ok: true },
          { label: "Mandate", value: "UPI AutoPay · monthly", src: "✓ Mandate SMS", ok: true },
          { label: "Merchant", value: "Netflix", src: "✓ Gmail", ok: true },
          { label: "Category", value: "Subscriptions", src: "✎ You · 12 Mar", user: true }
        ] } },
    { id: "bigbasket", name: "BigBasket", amt: "₹2,145", cat: "Groceries", state: "duplicate", meta: "4 Sep · charged twice", recurring: false,
      detail: { merchant: "BigBasket", category: "Groceries", stateLabel: "Two alerts, one charge", confidence: "High", reason: "Identical reference number on both SMS — the bank alerted twice", bars: 3,
        meta: "4 Sep · 7:12 AM\nHDFC · ****4821 · UPI",
        rawLabel: "Raw · HDFC-BK · 4 Sep 7:12 AM (×2)",
        raw: "Rs.2145.00 debited from a/c **4821 on 04-09-26 to BIGBASKET via UPI. Ref 774920118.",
        rows: [
          { label: "Amount", value: "₹2,145", src: "✓ HDFC SMS", ok: true },
          { label: "Duplicate alert", value: "Same ref 774920118", src: "⚠ 2 messages", attn: true },
          { label: "Merchant", value: "BigBasket", src: "✓ Gmail", ok: true },
          { label: "Receipt total", value: "₹2,145 · one order", src: "✓ Gmail", ok: true }
        ] } },
    { id: "myntra", name: "Myntra", amt: "₹2,340", cat: "Shopping", state: "contested", meta: "28 Aug · sources disagree", recurring: false,
      detail: { merchant: "Myntra", category: "Shopping", stateLabel: "Contested — sources disagree", confidence: "Medium", reason: "SMS says ₹2,340, receipt says ₹2,290. The ₹50 gap is unexplained.", bars: 2,
        meta: "28 Aug · 9:20 PM\nHDFC · ****4821 · Card",
        rawLabel: "Raw · HDFC-BK · 28 Aug 9:20 PM",
        raw: "Rs.2340.00 spent on HDFC Card **4821 at MYNTRA on 28-08-26. Not you? Call 18002586161.",
        rows: [
          { label: "Amount debited", value: "₹2,340", src: "✓ HDFC SMS", ok: true },
          { label: "Order total", value: "₹2,290", src: "✓ Gmail", ok: true },
          { label: "Gap", value: "₹50 unexplained", src: "⚠ needs you", attn: true },
          { label: "Merchant", value: "Myntra", src: "✓ Gmail", ok: true }
        ] } },
    { id: "uber", name: "Uber", amt: "₹312", cat: "Transport", state: "inferred", meta: "Guessed from handle · seen 4×", recurring: false,
      detail: { merchant: "Uber", category: "Transport", stateLabel: "Inferred — merchant is a guess", confidence: "Low", reason: "Merchant guessed from UPI handle. No receipt arrived.", bars: 1,
        meta: "6 Sep · 8:15 AM\nHDFC · ****4821 · UPI",
        rawLabel: "Raw · HDFC-BK · 6 Sep 8:15 AM",
        raw: "Rs.312.00 debited from a/c **4821 on 06-09-26 to uberindiasystems@axis via UPI. Ref 661209884001.",
        rows: [
          { label: "Amount", value: "₹312", src: "✓ HDFC SMS", ok: true },
          { label: "Merchant", value: "Uber", src: "~ inferred", attn: true, dashed: true },
          { label: "Category", value: "Transport", src: "~ inferred", attn: true, dashed: true },
          { label: "Receipt", value: "None found", src: "— missing", quiet: true }
        ] } },
    { id: "kirana", name: "q4bx@ybl", amt: "₹1,800", cat: "Unexplained", state: "unexplained", meta: "11:08 AM · no evidence", recurring: false,
      detail: { merchant: "q4bx@ybl", category: "Unexplained", stateLabel: "Unexplained — no evidence found", confidence: "Low", reason: "A UPI handle with no receipt, no merchant name and no history label.", bars: 1,
        meta: "7 Sep · 11:08 AM\nHDFC · ****4821 · UPI",
        rawLabel: "Raw · HDFC-BK · 7 Sep 11:08 AM",
        raw: "Rs.1800.00 debited from a/c **4821 on 07-09-26 to q4bx@ybl via UPI. Ref 771204998231.",
        rows: [
          { label: "Amount", value: "₹1,800", src: "✓ HDFC SMS", ok: true },
          { label: "Counterparty", value: "q4bx@ybl", src: "✓ HDFC SMS", ok: true },
          { label: "Merchant", value: "Unknown", src: "— no evidence", quiet: true },
          { label: "History", value: "4 similar charges", src: "~ pattern", attn: true, dashed: true }
        ] } },
    { id: "salary", name: "Salary · Zeta Labs", amt: "+₹1,84,000", cat: "Income", state: "income", meta: "1 Sep · SMS + payslip", recurring: true,
      detail: { merchant: "Zeta Labs Pvt Ltd", category: "Income", stateLabel: "Confirmed — credit and payslip agree", confidence: "High", reason: "Credit SMS matches the net figure on your Gmail payslip", bars: 3,
        meta: "1 Sep · 6:02 AM\nHDFC · ****4821 · NEFT",
        rawLabel: "Raw · HDFC-BK · 1 Sep 6:02 AM",
        raw: "Rs.184000.00 credited to a/c **4821 on 01-09-26 by NEFT from ZETA LABS PVT LTD. Ref N884201993.",
        rows: [
          { label: "Amount", value: "+₹1,84,000", src: "✓ HDFC SMS", ok: true },
          { label: "Payer", value: "Zeta Labs Pvt Ltd", src: "✓ HDFC SMS", ok: true },
          { label: "Gross", value: "₹2,41,667", src: "✓ Gmail payslip", ok: true },
          { label: "Deductions", value: "₹57,667 · TDS + PF", src: "✓ Gmail payslip", ok: true }
        ] } },
    { id: "airtel", name: "Airtel Fibre", amt: "₹1,120", cat: "Utilities", state: "confirmed", meta: "5 Sep · SMS + Gmail", recurring: true,
      detail: { merchant: "Airtel Fibre", category: "Utilities", stateLabel: "Confirmed — two sources agree", confidence: "High", reason: "Debit SMS matches the Airtel invoice in Gmail", bars: 3,
        meta: "5 Sep · 10:31 AM\nICICI · ****9042 · UPI",
        rawLabel: "Raw · ICICIB · 5 Sep 10:31 AM",
        raw: "Rs.1120.00 debited from a/c **9042 on 05-09-26 to AIRTEL via UPI. Ref 662019001284.",
        rows: [
          { label: "Amount", value: "₹1,120", src: "✓ ICICI SMS", ok: true },
          { label: "Merchant", value: "Airtel Fibre", src: "✓ Gmail", ok: true },
          { label: "Period", value: "Aug billing · 300 Mbps", src: "✓ Gmail", ok: true },
          { label: "Category", value: "Utilities", src: "✎ You · 14 Apr", user: true }
        ] } },
    { id: "bluetokai", name: "Blue Tokai", amt: "₹480", cat: "Food & Dining", state: "single", meta: "SMS only · no receipt", recurring: false,
      detail: { merchant: "Blue Tokai", category: "Food & Dining", stateLabel: "Reconstructed — one source", confidence: "Medium", reason: "Bank SMS only. No receipt arrived, so we can't see line items.", bars: 2,
        meta: "6 Sep · 9:47 AM\nHDFC · ****4821 · Card",
        rawLabel: "Raw · HDFC-BK · 6 Sep 9:47 AM",
        raw: "Rs.480.00 spent on HDFC Card **4821 at BLUE TOKAI COFFEE on 06-09-26.",
        rows: [
          { label: "Amount", value: "₹480", src: "✓ HDFC SMS", ok: true },
          { label: "Merchant", value: "Blue Tokai", src: "✓ HDFC SMS", ok: true },
          { label: "Items", value: "Unknown", src: "— no receipt", quiet: true },
          { label: "Category", value: "Food & Dining", src: "~ inferred", attn: true, dashed: true }
        ] } }
  ];

  const REVIEW_DEFS = [
    { id: "bigbasket", kind: "duplicate", accent: WARN,
      why: "BigBasket charged ₹2,145 twice on 4 Sep — but only once for real.",
      rawLabel: "Raw · HDFC-BK · both messages",
      raw: "Rs.2145.00 debited … Ref 774920118  (07:12:04)\nRs.2145.00 debited … Ref 774920118  (07:12:04)",
      primary: "Merge into one", secondary: "Keep both",
      consequence: "Merging removes ₹2,145 from September's total.",
      apply: false },
    { id: "kirana", kind: "unknown", accent: ATTN_INK,
      why: "We couldn't tell what this was — no receipt ever matched.",
      rawLabel: "Raw · HDFC-BK",
      raw: "Rs.1800.00 debited from a/c **4821 on 07-09-26 to q4bx@ybl via UPI. Ref 771204998231.",
      primary: "Yes, that's it", secondary: "No, it's…",
      consequence: "Future charges to this handle will be labelled the same.",
      apply: true, applyLabel: "Apply to all 4 charges to this handle" },
    { id: "myntra", kind: "contested", accent: WARN,
      why: "Your bank and Myntra disagree by ₹50.",
      rawLabel: "Raw · Gmail · 28 Aug",
      raw: "Order #MY7742019 — items ₹2,290, shipping ₹50, total ₹2,340. Paid via HDFC Card **4821.",
      primary: "Keep ₹2,340", secondary: "Use ₹2,290",
      consequence: "We'll record ₹2,290 as items and ₹50 as shipping.",
      apply: false },
    { id: "cult", kind: "uncategorised", accent: ATTN_INK,
      why: "We know what this is. We don't know how you think about it.",
      rawLabel: "Raw · Gmail · 3 Sep",
      raw: "Cult.fit Elite membership renewed — ₹1,499 for 3 Sep to 2 Oct. Auto-renews monthly.",
      primary: "Health & Fitness", secondary: "Subscriptions",
      consequence: "Applies to this and future Cult.fit charges.",
      apply: true, applyLabel: "Apply to all 3 past Cult.fit charges" }
  ];

  const SCAN_LINES = [
    "Reading messages from HDFC-BK, ICICIB, SBIUPI…",
    "243 financial messages found · matching against Gmail…",
    "187 matched to a receipt · upgrading to Confirmed…",
    "Detecting recurring payments · 24 patterns, 7 mandates…",
    "32 need reconciliation · 4 worth your time now"
  ];

  const NETFLIX_HISTORY = [
    { date: "2 Sep", src: "✓ SMS · ✓ Gmail", amt: "₹649" },
    { date: "3 Aug", src: "✓ SMS · ✓ Gmail", amt: "₹649" },
    { date: "2 Jul", src: "✓ SMS · ✓ Gmail", amt: "₹649" },
    { date: "4 Jun", src: "✓ SMS · ✓ Gmail", amt: "₹649" },
    { date: "2 May", src: "✓ SMS", amt: "₹649" },
    { date: "3 Apr", src: "✓ SMS · ✓ Gmail", amt: "₹649" }
  ];

  function initialState() {
    return {
      screen: "welcome",
      sms: false,
      gmail: false,
      tab: "ledger",
      detail: null,
      commitOpen: false,
      refundOpen: false,
      insightOpen: false,
      sheet: null,
      toast: null,
      reconStage: 0,
      applyAll: true,
      resolved: [],
      cultCategory: null,
      spotify: "pending",
      scanFound: 0,
      scanStep: 0
    };
  }

  class Trace {
    constructor(root) {
      this.root = root;
      this.state = initialState();
      this.filter = "all";
      this.handlers = [];
      root.addEventListener("click", (e) => this.onClick(e));
      this.render();
    }

    // -- state plumbing --------------------------------------------------

    setState(update) {
      const patch = typeof update === "function" ? update(this.state) : update;
      this.state = Object.assign({}, this.state, patch);
      this.render();
    }

    forceUpdate() {
      this.render();
    }

    act(fn) {
      this.handlers.push(fn);
      return this.handlers.length - 1;
    }

    onClick(e) {
      const el = e.target.closest("[data-h]");
      if (!el) return;
      const fn = this.handlers[Number(el.getAttribute("data-h"))];
      if (fn) fn();
    }

    // -- behaviour (ported from the prototype's logic) --------------------

    stopScan() {
      clearInterval(this.scanI);
      clearInterval(this.lineI);
    }

    startScan() {
      this.setState({ screen: "scan", scanFound: 0, scanStep: 0 });
      this.stopScan();
      this.scanI = setInterval(() => {
        this.setState((s) => {
          const n = s.scanFound + 6;
          if (n >= 243) {
            this.stopScan();
            setTimeout(() => this.setState({ screen: "scanDone" }), 700);
            return { scanFound: 243 };
          }
          return { scanFound: n };
        });
      }, 55);
      this.lineI = setInterval(() => {
        this.setState((s) => ({ scanStep: Math.min(SCAN_LINES.length - 1, s.scanStep + 1) }));
      }, 560);
    }

    toast(title, body) {
      clearTimeout(this.toastT);
      this.setState({ toast: { title, body } });
      this.toastT = setTimeout(() => this.setState({ toast: null }), 3400);
    }

    stepRecon() {
      this.setState((s) => {
        if (s.reconStage >= 4) return {};
        this.reconT = setTimeout(() => this.stepRecon(), 620);
        return { reconStage: s.reconStage + 1 };
      });
    }

    openDetail(id) {
      clearTimeout(this.reconT);
      this.setState({ detail: id, reconStage: 0 });
    }

    resolve(id, title, body) {
      this.setState((s) => ({ resolved: s.resolved.includes(id) ? s.resolved : s.resolved.concat([id]) }));
      this.toast(title, body);
    }

    activeReviews() {
      return REVIEW_DEFS.filter((r) => !this.state.resolved.includes(r.id));
    }

    reset() {
      this.stopScan();
      clearTimeout(this.reconT);
      this.filter = "all";
      this.setState(initialState());
    }

    // -- derived view model (ported from renderVals()) --------------------

    computeVals() {
      const s = this.state;
      const resolvedCount = s.resolved.length;
      const coverage = 88 + resolvedCount * 3;
      const queue = this.activeReviews();
      const rvDef = queue[0] || REVIEW_DEFS[0];
      const mergedBB = s.resolved.includes("bigbasket");

      const spent = mergedBB ? 42180 - 2145 : 42180;
      const spentLabel = inr(spent);
      const unknownShare = Math.max(0, 12 - resolvedCount * 3);
      const singleShare = 8;
      const confirmedShare = 100 - unknownShare - singleShare;

      const railFor = (st) => ({
        confirmed: CONF, income: INCOME, single: FADE_RAIL, inferred: ATTN,
        contested: WARN, duplicate: WARN, unexplained: NONE_RAIL, uncategorised: ATTN
      }[st] || NONE_RAIL);

      const visible = TXNS.filter((t) => {
        if (s.tab !== "ledger") return true;
        if (this.filter === "unproven") {
          return ["single", "inferred", "contested", "duplicate", "unexplained", "uncategorised"].includes(t.state) && !s.resolved.includes(t.id);
        }
        if (this.filter === "recurring") return t.recurring;
        return true;
      });

      const feed = visible.map((t) => {
        const resolvedHere = s.resolved.includes(t.id);
        let st = t.state, meta = t.meta, name = t.name, amt = t.amt;
        if (t.id === "cult" && s.cultCategory) { st = "confirmed"; meta = s.cultCategory + " · SMS + Gmail"; }
        if (t.id === "kirana" && resolvedHere) { st = "confirmed"; name = "Local kirana"; meta = "You labelled this · 4 charges"; }
        if (t.id === "myntra" && resolvedHere) { st = "confirmed"; meta = "₹2,290 items + ₹50 shipping"; }
        if (t.id === "bigbasket" && resolvedHere) { st = "confirmed"; meta = "Merged · duplicate alert removed"; }
        const mono = st === "unexplained";
        return {
          id: t.id, name, amt, meta,
          rail: railFor(st),
          nameFont: mono ? MONO : SANS,
          nameSize: mono ? "12.5px" : "14px",
          nameColor: st === "inferred" ? INK2 : INK,
          nameRule: st === "inferred" ? "1px dashed oklch(0.70 0.02 70)" : "none",
          metaColor: st === "contested" || st === "duplicate" ? WARN : (st === "uncategorised" ? ATTN_INK : QUIET),
          amtColor: st === "income" ? INCOME : (st === "unexplained" ? INK2 : INK),
          onOpen: () => this.openDetail(t.id)
        };
      });

      const dtSrc = TXNS.find((t) => t.id === s.detail);
      let dt = null;
      if (dtSrc) {
        const d = dtSrc.detail;
        const cat = dtSrc.id === "cult" && s.cultCategory ? s.cultCategory : d.category;
        dt = {
          amount: dtSrc.amt, merchant: d.merchant, category: cat,
          stateLabel: d.stateLabel, meta: d.meta, raw: d.raw, rawLabel: d.rawLabel,
          confidence: d.confidence, reason: d.reason,
          stateColor: dtSrc.state === "confirmed" || dtSrc.state === "income" ? CONF_INK : (dtSrc.state === "contested" || dtSrc.state === "duplicate" ? WARN : ATTN_INK),
          bar1: d.bars >= 1 ? (d.bars === 3 ? CONF : d.bars === 2 ? ATTN : WARN) : "oklch(0.90 0.006 80)",
          bar2: d.bars >= 2 ? (d.bars === 3 ? CONF : ATTN) : "oklch(0.90 0.006 80)",
          bar3: d.bars >= 3 ? CONF : "oklch(0.90 0.006 80)",
          rows: d.rows.map((r) => ({
            label: r.label,
            value: r.id === "cult" ? cat : r.value,
            src: r.src,
            valueColor: r.dashed || r.quiet ? INK2 : INK,
            valueRule: r.dashed ? "1px dashed oklch(0.70 0.02 70)" : "none",
            srcColor: r.ok ? CONF_INK : (r.attn ? ATTN_INK : (r.user ? INK : QUIET))
          }))
        };
      }

      const commitments = [
        { date: "12 Sep", name: "Netflix", note: "autopay · mandate active", amt: "₹649", dateColor: QUIET, nameColor: INK, noteColor: PRED_INK, amtRule: "none", onOpen: () => this.setState({ commitOpen: true }) },
        { date: "15 Sep", name: "Rent · Kotak SI", note: "standing instruction", amt: "₹28,000", dateColor: QUIET, nameColor: INK, noteColor: PRED_INK, amtRule: "none", onOpen: () => this.toast("Standing instruction", "₹28,000 monthly since Apr 2024. Detected from 17 debit SMS.") },
        { date: "18 Sep", name: "Adobe CC", note: "price rise · ₹1,699 → ₹1,999", amt: "₹1,999", dateColor: ATTN_INK, nameColor: INK, noteColor: ATTN_INK, amtRule: "none", onOpen: () => this.toast("Price rise ahead", "Adobe's email of 21 Aug announced ₹1,999 from 18 Sep. Your mandate allows up to ₹2,500.") },
        { date: "22 Sep", name: "Cult.fit", note: "auto-renews monthly", amt: "₹1,499", dateColor: QUIET, nameColor: INK, noteColor: PRED_INK, amtRule: "none", onOpen: () => this.toast("Cult.fit", "Renews 22 Sep. Cancel in the Cult.fit app — we can't do it for you.") },
        { date: "28 Sep", name: "Airtel Fibre", note: "varies ₹799–1,120", amt: "₹1,120", dateColor: QUIET, nameColor: INK, noteColor: QUIET, amtRule: "1px dashed oklch(0.70 0.02 70)", onOpen: () => this.toast("Varying amount", "Six months range ₹799–1,120. We show the range, not a false average.") }
      ];

      let sheetTitle = "", sheetOptions = [], sheetFoot = "";
      if (s.sheet === "category") {
        const target = dtSrc ? dtSrc.detail.merchant : "this merchant";
        sheetTitle = "Change category";
        sheetFoot = "Your choice becomes the authoritative source for this field — automation won't overwrite it.";
        sheetOptions = [
          { label: "Just this one", note: "1 txn", onPick: () => { this.setState({ sheet: null }); this.toast("Category changed", "This charge only. " + target + "'s other charges are untouched."); } },
          { label: "All " + target + " charges", note: "past + future", onPick: () => { this.setState({ sheet: null, cultCategory: dtSrc && dtSrc.id === "cult" ? "Health & Fitness" : null }); this.toast("Applied to all", target + " charges recategorised. Provenance on those fields is now ✎ You."); } },
          { label: "All future " + target + " charges", note: "rule", onPick: () => { this.setState({ sheet: null }); this.toast("Rule created", "Future " + target + " charges will use this category. History unchanged."); } }
        ];
      }

      return {
        isWelcome: s.screen === "welcome", isTrust: s.screen === "trust", isSources: s.screen === "sources",
        isSmsPerm: s.screen === "smsPerm", isGmailPerm: s.screen === "gmailPerm",
        isScan: s.screen === "scan", isScanDone: s.screen === "scanDone", isApp: s.screen === "app",
        tabLedger: s.screen === "app" && s.tab === "ledger",
        tabReview: s.screen === "app" && s.tab === "review",
        tabCommit: s.screen === "app" && s.tab === "commitments",

        goTrust: () => this.setState({ screen: "trust" }),
        goSources: () => this.setState({ screen: "sources" }),
        askSms: () => { if (!s.sms) this.setState({ screen: "smsPerm" }); },
        askGmail: () => { if (!s.gmail) this.setState({ screen: "gmailPerm" }); },
        grantSms: () => this.setState({ sms: true, screen: "sources" }),
        denySms: () => { this.setState({ screen: "sources" }); this.toast("SMS not connected", "Gmail alone still gives you a working ledger — coverage will read 71%."); },
        grantGmail: () => this.setState({ gmail: true, screen: "sources" }),
        denyGmail: () => { this.setState({ screen: "sources" }); this.toast("Gmail not connected", "Without receipts, merchants and line items stay inferred."); },
        smsStatus: s.sms ? "connected · 1,402 msgs" : "not connected",
        smsStatusColor: s.sms ? CONF_INK : QUIET,
        gmailStatus: s.gmail ? "connected · 312 receipts" : "not connected",
        gmailStatusColor: s.gmail ? CONF_INK : QUIET,
        anySource: s.sms || s.gmail,
        scanCta: s.sms && s.gmail ? "Scan both sources" : "Scan what I've connected",
        startScan: () => this.startScan(),

        scanFound: s.scanFound, scanTotal: 243,
        scanW: Math.round((s.scanFound / 243) * 100) + "%",
        scanLine: SCAN_LINES[s.scanStep],
        scanRows: [
          { name: "Swiggy", nameFont: SANS, nameSize: "14px", amt: "₹1,249", rail: CONF, note: "✓ SMS ✓ Gmail · confirmed", noteColor: CONF_INK, noteAnim: "none", amtColor: INK },
          { name: "Blue Tokai", nameFont: SANS, nameSize: "14px", amt: "₹480", rail: FADE_RAIL, note: "searching Gmail for a receipt…", noteColor: QUIET, noteAnim: "tBreathe 1.8s ease-in-out infinite", amtColor: INK },
          { name: "Netflix", nameFont: SANS, nameSize: "14px", amt: "₹649", rail: PRED, note: "recurring pattern forming · 6 charges", noteColor: PRED_INK, noteAnim: "tBreathe 2s ease-in-out infinite", amtColor: INK },
          { name: "BigBasket", nameFont: SANS, nameSize: "14px", amt: "₹2,145", rail: WARN, note: "duplicate alert · same reference", noteColor: WARN, noteAnim: "none", amtColor: INK },
          { name: "Myntra", nameFont: SANS, nameSize: "14px", amt: "+₹2,290", rail: REFUND, note: "refund thread opened · expected 18 Sep", noteColor: REFUND_INK, noteAnim: "none", amtColor: REFUND_INK },
          { name: "q4bx@ybl", nameFont: MONO, nameSize: "12.5px", amt: "₹1,800", rail: NONE_RAIL, note: "sent to review · couldn't identify", noteColor: ATTN_INK, noteAnim: "none", amtColor: INK2 }
        ],
        enterApp: () => this.setState({ screen: "app", tab: "review" }),

        coverage, coverBorder: coverage >= 94 ? CONF : ATTN, coverInk: coverage >= 94 ? CONF_INK : ATTN_INK,
        spentLabel,
        barConfirmed: confirmedShare + "%", barSingle: singleShare + "%", barUnknown: unknownShare + "%",
        provenanceLine: inr(spent * confirmedShare / 100) + " confirmed · " + inr(spent * singleShare / 100) + " single-source · " + inr(spent * unknownShare / 100) + " unexplained",

        queueCount: queue.length, hasQueue: queue.length > 0, queueClear: queue.length === 0,
        queueHeadline: queue.length ? rvDef.why : "",
        queueSub: queue.length + " of 32 items are worth your time — the rest are low-value gaps",
        queueCta: "Review " + queue.length + (queue.length === 1 ? " item" : " items"),
        reviewPos: queue.length ? (REVIEW_DEFS.length - queue.length + 1) + " of " + REVIEW_DEFS.length : "done",
        learnedLine: "You taught us 4 things. Next month we'll ask about " + Math.max(1, 4 - resolvedCount) + ".",

        rv: {
          accent: rvDef.accent, why: rvDef.why, raw: rvDef.raw, rawLabel: rvDef.rawLabel,
          primary: rvDef.primary, secondary: rvDef.secondary, consequence: rvDef.consequence,
          isDuplicate: rvDef.kind === "duplicate", isUnknown: rvDef.kind === "unknown",
          isContested: rvDef.kind === "contested", isUncategorised: rvDef.kind === "uncategorised",
          hasApplyAll: !!rvDef.apply, applyLabel: rvDef.applyLabel || ""
        },
        applyBorder: s.applyAll ? INK : "oklch(0.85 0.006 80)",
        applyBg: s.applyAll ? "oklch(0.90 0.02 165)" : "transparent",
        applyMark: s.applyAll ? "✓" : "",
        toggleApplyAll: () => this.setState((p) => ({ applyAll: !p.applyAll })),
        acceptReview: () => {
          const k = rvDef.kind;
          if (k === "duplicate") this.resolve("bigbasket", "Merged into one charge", "₹2,145 removed from September. The second SMS is kept as evidence of the bank's error.");
          else if (k === "unknown") this.resolve("kirana", "Labelled Local kirana", (s.applyAll ? "Applied to all 4 charges. " : "") + "Future charges to q4bx@ybl will be labelled the same.");
          else if (k === "contested") this.resolve("myntra", "Kept ₹2,340", "₹2,290 recorded as items, ₹50 as shipping. Both sources retained.");
          else { this.setState({ cultCategory: "Health & Fitness" }); this.resolve("cult", "Filed under Health & Fitness", "Applied to 3 past charges. This field is now ✎ You — automation won't overwrite it."); }
        },
        rejectReview: () => {
          const k = rvDef.kind;
          if (k === "duplicate") this.resolve("bigbasket", "Kept both charges", "We'll stop flagging identical references for BigBasket.");
          else if (k === "unknown") { this.setState({ sheet: null }); this.toast("Tell us what it is", "In the real product this opens a search across your Gmail around 7 Sep, 11:08 AM."); }
          else if (k === "contested") this.resolve("myntra", "Using ₹2,290", "September's total drops ₹50. The ₹50 stays visible as unexplained.");
          else { this.setState({ cultCategory: "Subscriptions" }); this.resolve("cult", "Filed under Subscriptions", "Applied to 3 past charges. Cult.fit joins your ₹41,196 committed monthly."); }
        },
        skipReview: () => this.toast("Skipped", "It stays in the queue. We won't ask again this week."),

        feed, feedEmpty: feed.length === 0,
        setFilterAll: () => { this.filter = "all"; this.forceUpdate(); },
        setFilterUnproven: () => { this.filter = "unproven"; this.forceUpdate(); },
        setFilterRecurring: () => { this.filter = "recurring"; this.forceUpdate(); },
        chipAllInk: !this.filter || this.filter === "all" ? "oklch(0.985 0.005 85)" : INK2,
        chipAllBg: !this.filter || this.filter === "all" ? INK : "transparent",
        chipAllBorder: !this.filter || this.filter === "all" ? INK : "oklch(0.85 0.006 80)",
        chipUnInk: this.filter === "unproven" ? "oklch(0.985 0.005 85)" : INK2,
        chipUnBg: this.filter === "unproven" ? INK : "transparent",
        chipUnBorder: this.filter === "unproven" ? INK : "oklch(0.85 0.006 80)",
        chipReInk: this.filter === "recurring" ? "oklch(0.985 0.005 85)" : INK2,
        chipReBg: this.filter === "recurring" ? INK : "transparent",
        chipReBorder: this.filter === "recurring" ? INK : "oklch(0.85 0.006 80)",

        detailOpen: !!dtSrc, dt,
        closeDetail: () => { clearTimeout(this.reconT); this.setState({ detail: null, reconStage: 0 }); },
        reconOpen: s.reconStage > 0,
        recon2: s.reconStage >= 2, recon3: s.reconStage >= 3, recon4: s.reconStage >= 4,
        reconChevron: s.reconStage > 0 ? "Hide ↑" : "Show ↓",
        toggleRecon: () => {
          clearTimeout(this.reconT);
          if (s.reconStage > 0) this.setState({ reconStage: 0 });
          else { this.setState({ reconStage: 1 }); this.reconT = setTimeout(() => this.stepRecon(), 620); }
        },

        commitments, netflixHistory: NETFLIX_HISTORY,
        commitOpen: s.commitOpen, closeCommit: () => this.setState({ commitOpen: false }),
        refundOpen: s.refundOpen, openRefund: () => this.setState({ refundOpen: true }), closeRefund: () => this.setState({ refundOpen: false }),
        insightOpen: s.insightOpen, openInsight: () => this.setState({ insightOpen: true }), closeInsight: () => this.setState({ insightOpen: false }),
        muteInsight: () => { this.setState({ insightOpen: false }); this.toast("Muted", "We won't raise Food & Dining again this quarter."); },
        spotifyPending: s.spotify === "pending",
        confirmSpotify: () => { this.setState({ spotify: "yes" }); this.toast("Spotify confirmed", "₹119 added to your committed total — now ₹41,315."); },
        dismissSpotify: () => { this.setState({ spotify: "no" }); this.toast("Not recurring", "We'll stop treating ₹119 charges as a pattern."); },

        goLedger: () => this.setState({ tab: "ledger" }),
        goReview: () => this.setState({ tab: "review", applyAll: true }),
        goCommit: () => this.setState({ tab: "commitments" }),
        navLedger: s.tab === "ledger" ? INK : "oklch(0.78 0.006 80)",
        navReview: s.tab === "review" ? INK : "oklch(0.78 0.006 80)",
        navCommit: s.tab === "commitments" ? INK : "oklch(0.78 0.006 80)",

        sheetOpen: !!s.sheet, sheetTitle, sheetOptions, sheetFoot,
        openCategorySheet: () => this.setState({ sheet: "category" }),
        closeSheet: () => this.setState({ sheet: null }),
        showToastChase: () => this.toast("Evidence summary copied", "Order ID, charge SMS, refund email and the 12-day delay — ready to paste into Myntra support."),

        toastOpen: !!s.toast,
        toastTitle: s.toast ? s.toast.title : "",
        toastBody: s.toast ? s.toast.body : "",

        reset: () => this.reset()
      };
    }

    // -- render -------------------------------------------------------------

    render() {
      this.handlers = [];
      const V = this.computeVals();
      this.root.innerHTML =
        '<div class="page">' +
          this.sidebar(V) +
          '<div class="phone">' +
            '<div class="statusbar"><div>9:41</div><div>▮▮▮ ▪</div></div>' +
            this.renderScreen(V) +
            this.renderOverlays(V) +
          '</div>' +
        '</div>';
    }

    h(fn) {
      return this.act(fn);
    }

    sidebar(V) {
      return `
        <div style="display:flex; flex-direction:column; gap:16px; max-width:300px; padding-top:16px">
          <div style="font-family:'Newsreader',serif; font-size:31px; line-height:1.1; color:${INK}">Trace</div>
          <div style="font-family:${MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}; line-height:1.8">Interactive prototype<br>September 2026 · INR</div>
          <div style="font-family:${SANS}; font-size:13.5px; line-height:1.6; color:${INK2}; text-wrap:pretty">Everything is live. Connect a source, watch the scan, then work the review queue — the coverage figure and badge respond to what you resolve.</div>
          <div style="border-top:1px solid oklch(0.87 0.006 80); padding-top:14px; display:flex; flex-direction:column; gap:9px">
            <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Try in order</div>
            <div style="font-family:${SANS}; font-size:12.5px; line-height:1.75; color:oklch(0.40 0.008 70)">1 · Connect SMS, then Gmail<br>2 · Tap Swiggy → <span style="font-family:${MONO}; font-size:11px">How we built this</span><br>3 · Work the 4 review items<br>4 · Commitments → Netflix<br>5 · Ledger → the amber insight</div>
          </div>
          <div style="border-top:1px solid oklch(0.87 0.006 80); padding-top:14px; font-family:${MONO}; font-size:10px; color:${QUIET}; line-height:1.7">Coverage ${V.coverage}%<br>Review queue ${V.queueCount}</div>
          <div data-h="${this.h(V.reset)}" class="restart-btn" style="font-family:${MONO}; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:${INK2}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:9px 12px; text-align:center; cursor:pointer">Restart prototype</div>
        </div>`;
    }

    renderScreen(V) {
      if (V.isWelcome) return this.welcomeScreen(V);
      if (V.isTrust) return this.trustScreen(V);
      if (V.isSources) return this.sourcesScreen(V);
      if (V.isSmsPerm) return this.smsPermScreen(V);
      if (V.isGmailPerm) return this.gmailPermScreen(V);
      if (V.isScan) return this.scanScreen(V);
      if (V.isScanDone) return this.scanDoneScreen(V);
      if (V.isApp) return this.appScreen(V);
      return "";
    }

    renderOverlays(V) {
      let out = "";
      if (V.detailOpen) out += this.detailScreen(V);
      if (V.commitOpen) out += this.commitScreen(V);
      if (V.refundOpen) out += this.refundScreen(V);
      if (V.insightOpen) out += this.insightScreen(V);
      if (V.sheetOpen) out += this.sheetScreen(V);
      if (V.toastOpen) out += this.toastScreen(V);
      return out;
    }

    welcomeScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; padding:0 26px 26px; animation:tScreen 0.35s ease-out both">
          <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:center; gap:22px">
            <div style="font-family:${MONO}; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:${QUIET}">Trace</div>
            <div style="font-family:'Newsreader',serif; font-size:38px; line-height:1.12; color:${INK}; letter-spacing:-0.01em">Your bank already tells you everything. It just tells you badly.</div>
            <div style="display:flex; flex-direction:column; gap:10px; padding:18px 0; border-top:1px solid oklch(0.90 0.006 80); border-bottom:1px solid oklch(0.90 0.006 80)">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase; color:oklch(0.65 0.006 70)">What HDFC sent you</div>
              <div style="font-family:${MONO}; font-size:11px; line-height:1.6; color:oklch(0.50 0.008 70)">Rs.1249.00 debited from a/c **4821 on 07-09-26 to SWIGGY via UPI. Ref 628401993412.</div>
              <div style="font-family:${MONO}; font-size:14px; color:${ATTN}; padding:2px 0">↓</div>
              <div style="display:flex; align-items:center; gap:12px">
                <div style="width:2px; align-self:stretch; background:${CONF}"></div>
                <div style="flex:1"><div style="font-family:${SANS}; font-size:15px; font-weight:500; color:${INK}">Swiggy · 3 items</div><div style="font-family:${MONO}; font-size:9.5px; color:${CONF_INK}">Food &amp; Dining · SMS + Gmail receipt</div></div>
                <div style="font-family:${SANS}; font-size:17px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">₹1,249</div>
              </div>
            </div>
            <div style="font-family:${SANS}; font-size:14px; line-height:1.6; color:${INK2}; text-wrap:pretty">We read your bank SMS and email receipts, rebuild what each charge actually was, and show you where every figure came from.</div>
          </div>
          <div data-h="${this.h(V.goTrust)}" style="font-family:${SANS}; font-size:14px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:4px; padding:15px; text-align:center; cursor:pointer">Show me</div>
        </div>`;
    }

    trustScreen(V) {
      const rows = [
        ["Messages are read on your phone", "Parsing happens on-device. Raw SMS never leaves it.", CONF],
        ["Only bank senders, only receipts", "HDFC-BK, ICICIB and similar. Personal messages are skipped.", CONF],
        ["No credentials, no money movement", "We can't log into your bank and we can't send a rupee.", CONF],
        ["Delete everything, in two taps", "Sources → Delete all data. Immediate, irreversible, no retention plea.", INK]
      ];
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; padding:0 26px 26px; animation:tScreen 0.35s ease-out both">
          <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:center; gap:20px">
            <div style="font-family:'Newsreader',serif; font-size:31px; line-height:1.15; color:${INK}">Before you give us anything</div>
            <div style="display:flex; flex-direction:column; gap:16px">
              ${rows.map(([title, body, bar]) => `
                <div style="display:flex; gap:13px"><div style="width:2px; background:${bar}; flex-shrink:0"></div><div><div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${INK}">${title}</div><div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.55">${body}</div></div></div>
              `).join("")}
            </div>
          </div>
          <div data-h="${this.h(V.goSources)}" style="font-family:${SANS}; font-size:14px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:4px; padding:15px; text-align:center; cursor:pointer">Understood</div>
        </div>`;
    }

    sourcesScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; padding:0 26px 26px; animation:tScreen 0.35s ease-out both">
          <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:center; gap:20px">
            <div style="font-family:'Newsreader',serif; font-size:31px; line-height:1.15; color:${INK}">Start with one source</div>
            <div style="font-family:${SANS}; font-size:13.5px; line-height:1.6; color:${INK2}">SMS gives us amounts and timing. Gmail gives us merchants and line items. Either one alone works — together they corroborate each other.</div>
            <div data-h="${this.h(V.askSms)}" class="source-card" style="border:1px solid oklch(0.85 0.006 80); border-radius:5px; padding:17px; display:flex; flex-direction:column; gap:7px; cursor:pointer">
              <div style="display:flex; align-items:center; justify-content:space-between"><div style="font-family:${SANS}; font-size:14.5px; font-weight:500; color:${INK}">Bank SMS</div><div style="font-family:${MONO}; font-size:10px; color:${V.smsStatusColor}">${V.smsStatus}</div></div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.55 0.006 70); line-height:1.55">On-device · no login · instant · ~60% of transactions</div>
            </div>
            <div data-h="${this.h(V.askGmail)}" class="source-card" style="border:1px solid oklch(0.85 0.006 80); border-radius:5px; padding:17px; display:flex; flex-direction:column; gap:7px; cursor:pointer">
              <div style="display:flex; align-items:center; justify-content:space-between"><div style="font-family:${SANS}; font-size:14.5px; font-weight:500; color:${INK}">Gmail receipts</div><div style="font-family:${MONO}; font-size:10px; color:${V.gmailStatusColor}">${V.gmailStatus}</div></div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.55 0.006 70); line-height:1.55">Read-only · receipt senders only · merchants and line items</div>
            </div>
          </div>
          ${V.anySource ? `<div data-h="${this.h(V.startScan)}" style="font-family:${SANS}; font-size:14px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:4px; padding:15px; text-align:center; cursor:pointer; animation:tRow 0.3s ease-out both">${esc(V.scanCta)}</div>` : ""}
        </div>`;
    }

    smsPermScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:flex-end; animation:tScreen 0.3s ease-out both">
          <div style="padding:26px; display:flex; flex-direction:column; gap:14px">
            <div style="font-family:'Newsreader',serif; font-size:27px; line-height:1.18; color:${INK}">We'll read messages from bank senders only</div>
            <div style="font-family:${SANS}; font-size:13.5px; line-height:1.6; color:${INK2}">HDFC-BK, ICICIB, SBIUPI and similar. Personal messages are never read and nothing is uploaded — parsing happens on this phone.</div>
          </div>
          <div style="background:oklch(0.955 0.008 85); border-top:1px solid oklch(0.88 0.006 80); padding:22px; display:flex; flex-direction:column; gap:16px">
            <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:oklch(0.65 0.006 70)">Android system dialog</div>
            <div style="font-family:${SANS}; font-size:15px; color:${INK}; line-height:1.45">Allow <span style="font-weight:600">Trace</span> to send and view SMS messages?</div>
            <div style="display:flex; gap:9px">
              <div data-h="${this.h(V.denySms)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:13px; text-align:center; cursor:pointer">Deny</div>
              <div data-h="${this.h(V.grantSms)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:13px; text-align:center; cursor:pointer">Allow</div>
            </div>
          </div>
        </div>`;
    }

    gmailPermScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:flex-end; animation:tScreen 0.3s ease-out both">
          <div style="padding:26px; display:flex; flex-direction:column; gap:14px">
            <div style="font-family:'Newsreader',serif; font-size:27px; line-height:1.18; color:${INK}">Read-only, receipts only</div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.7; border-left:2px solid oklch(0.88 0.006 80); padding-left:13px">gmail.readonly<br>query: from:(swiggy OR myntra OR netflix …)<br>subject:(receipt OR invoice OR refund)</div>
            <div style="font-family:${SANS}; font-size:13px; line-height:1.6; color:${INK2}">We don't read personal mail. You can see the exact query above, and revoke it from your Google account at any time.</div>
          </div>
          <div style="background:oklch(0.955 0.008 85); border-top:1px solid oklch(0.88 0.006 80); padding:22px; display:flex; flex-direction:column; gap:16px">
            <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:oklch(0.65 0.006 70)">Google account</div>
            <div style="font-family:${SANS}; font-size:15px; color:${INK}; line-height:1.45">Trace wants to view your email messages and settings</div>
            <div style="display:flex; gap:9px">
              <div data-h="${this.h(V.denyGmail)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:13px; text-align:center; cursor:pointer">Cancel</div>
              <div data-h="${this.h(V.grantGmail)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:13px; text-align:center; cursor:pointer">Allow</div>
            </div>
          </div>
        </div>`;
    }

    scanScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; animation:tScreen 0.35s ease-out both">
          <div style="padding:22px 22px 18px; display:flex; flex-direction:column; gap:13px; border-bottom:1px solid oklch(0.90 0.006 80); flex-shrink:0">
            <div style="font-family:'Newsreader',serif; font-size:27px; line-height:1.15; color:${INK}">Rebuilding your ledger</div>
            <div style="display:flex; align-items:baseline; gap:9px">
              <div style="font-family:'Newsreader',serif; font-size:42px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">${V.scanFound}</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70)">of ${V.scanTotal} messages read</div>
            </div>
            <div style="height:3px; background:oklch(0.90 0.006 80); border-radius:2px; overflow:hidden; position:relative">
              <div style="height:100%; background:${INK}; width:${V.scanW}; transition:width 0.2s linear"></div>
              <div style="position:absolute; inset:0; width:26%; background:linear-gradient(90deg,transparent,oklch(0.99 0.004 85 / 0.8),transparent); animation:tSweep 2.1s linear infinite"></div>
            </div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6; min-height:34px">${esc(V.scanLine)}</div>
          </div>
          <div style="flex:1; min-height:0; overflow-y:auto; padding:14px 22px">
            <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}; padding-bottom:8px">Arriving</div>
            ${V.scanRows.map((r) => `
              <div style="display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid oklch(0.92 0.005 80); animation:tRow 0.4s ease-out both">
                <div style="width:2px; align-self:stretch; background:${r.rail}"></div>
                <div style="flex:1; min-width:0">
                  <div style="font-family:${r.nameFont}; font-size:${r.nameSize}; font-weight:500; color:${INK}">${esc(r.name)}</div>
                  <div style="font-family:${MONO}; font-size:9.5px; color:${r.noteColor}; animation:${r.noteAnim}">${esc(r.note)}</div>
                </div>
                <div style="font-family:${SANS}; font-size:15.5px; font-weight:500; color:${r.amtColor}; font-variant-numeric:tabular-nums">${esc(r.amt)}</div>
              </div>
            `).join("")}
          </div>
        </div>`;
    }

    scanDoneScreen(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; animation:tScreen 0.35s ease-out both">
          <div style="flex:1; min-height:0; overflow-y:auto; padding:20px 26px 20px; display:flex; flex-direction:column; gap:20px">
            <div style="font-family:'Newsreader',serif; font-size:30px; line-height:1.15; color:${INK}">Six months, rebuilt</div>
            <div style="display:flex; flex-direction:column">
              <div style="display:flex; align-items:baseline; justify-content:space-between; padding:13px 0; border-bottom:1px solid oklch(0.91 0.005 80)">
                <div style="font-family:'Newsreader',serif; font-size:30px; color:${INK}; font-variant-numeric:tabular-nums">243</div>
                <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); text-align:right">financial messages<br>found</div>
              </div>
              <div style="display:flex; align-items:baseline; justify-content:space-between; padding:13px 0; border-bottom:1px solid oklch(0.91 0.005 80)">
                <div style="font-family:'Newsreader',serif; font-size:30px; color:${CONF_INK}; font-variant-numeric:tabular-nums">187</div>
                <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); text-align:right">confidently identified<br>SMS and receipt agree</div>
              </div>
              <div style="display:flex; align-items:baseline; justify-content:space-between; padding:13px 0; border-bottom:1px solid oklch(0.91 0.005 80)">
                <div style="font-family:'Newsreader',serif; font-size:30px; color:${ATTN_INK}; font-variant-numeric:tabular-nums">32</div>
                <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); text-align:right">need reconciliation<br>4 worth your time now</div>
              </div>
              <div style="display:flex; align-items:baseline; justify-content:space-between; padding:13px 0">
                <div style="font-family:'Newsreader',serif; font-size:30px; color:${PRED_INK}; font-variant-numeric:tabular-nums">24</div>
                <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); text-align:right">recurring payments<br>₹41,196 committed monthly</div>
              </div>
            </div>
            <div style="border-left:2px solid ${ATTN}; padding-left:14px; display:flex; flex-direction:column; gap:6px">
              <div style="font-family:'Newsreader',serif; font-size:19px; line-height:1.3; color:${INK}">Two things we found that you probably didn't know</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.65">BigBasket charged ₹2,145 twice on 4 Sep — same reference.<br>Adobe moves from ₹1,699 to ₹1,999 on 18 Sep.</div>
            </div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.55 0.006 70); line-height:1.65">Complete from 12 March — your phone keeps six months of SMS. Earlier months are partial and marked as such.</div>
          </div>
          <div style="padding:14px 26px 24px; border-top:1px solid oklch(0.88 0.006 80); background:oklch(0.985 0.005 85); flex-shrink:0">
            <div data-h="${this.h(V.enterApp)}" style="font-family:${SANS}; font-size:14px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:4px; padding:15px; text-align:center; cursor:pointer">Review 4 items</div>
          </div>
        </div>`;
    }

    appScreen(V) {
      let body = "";
      if (V.tabLedger) body = this.ledgerTab(V);
      else if (V.tabReview) body = this.reviewTab(V);
      else if (V.tabCommit) body = this.commitTab(V);
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column">
          ${body}
          <div style="display:flex; border-top:1px solid oklch(0.88 0.006 80); background:oklch(0.985 0.005 85); padding:11px 0 19px; flex-shrink:0">
            <div data-h="${this.h(V.goLedger)}" style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer">
              <div style="width:16px; height:2px; background:${V.navLedger}"></div>
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:${V.navLedger}">Ledger</div>
            </div>
            <div data-h="${this.h(V.goReview)}" style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer; position:relative">
              <div style="width:16px; height:2px; background:${V.navReview}"></div>
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:${V.navReview}">Review</div>
              ${V.hasQueue ? `<div style="position:absolute; top:-5px; right:30px; min-width:15px; height:15px; border-radius:100px; background:${ATTN}; color:oklch(0.99 0.004 85); font-family:${MONO}; font-size:9px; display:flex; align-items:center; justify-content:center">${V.queueCount}</div>` : ""}
            </div>
            <div data-h="${this.h(V.goCommit)}" style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer">
              <div style="width:16px; height:2px; background:${V.navCommit}"></div>
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:${V.navCommit}">Commitments</div>
            </div>
          </div>
        </div>`;
    }

    ledgerTab(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; animation:tScreen 0.28s ease-out both">
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 22px 14px; flex-shrink:0">
            <div style="font-family:'Newsreader',serif; font-size:25px; color:${INK}">September</div>
            <div style="display:flex; align-items:center; gap:6px; border:1px solid ${V.coverBorder}; border-radius:100px; padding:4px 10px">
              <div style="width:6px; height:6px; border-radius:50%; background:${V.coverBorder}"></div>
              <div style="font-family:${MONO}; font-size:10px; color:${V.coverInk}">${V.coverage}% covered</div>
            </div>
          </div>
          <div style="flex:1; min-height:0; overflow-y:auto">
            <div style="padding:0 22px 18px; display:flex; flex-direction:column; gap:8px; border-bottom:1px solid oklch(0.90 0.006 80)">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Spent so far</div>
              <div style="font-family:'Newsreader',serif; font-size:50px; line-height:0.95; color:${INK}; font-variant-numeric:tabular-nums; letter-spacing:-0.02em">${V.spentLabel}</div>
              <div style="display:flex; gap:2px; height:4px; border-radius:2px; overflow:hidden">
                <div style="width:${V.barConfirmed}; background:${CONF}"></div>
                <div style="width:${V.barSingle}; background:${ATTN}"></div>
                <div style="width:${V.barUnknown}; background:oklch(0.85 0.006 70)"></div>
              </div>
              <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.6">${esc(V.provenanceLine)}</div>
            </div>

            ${V.hasQueue ? `
              <div style="padding:17px 22px; display:flex; flex-direction:column; gap:12px; border-bottom:1px solid oklch(0.90 0.006 80); background:oklch(0.963 0.008 85)">
                <div style="display:flex; align-items:center; justify-content:space-between">
                  <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Needs you</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.985 0.005 85); background:${ATTN}; border-radius:100px; padding:2px 8px">${V.queueCount}</div>
                </div>
                <div style="border-left:2px solid ${ATTN}; padding-left:14px; display:flex; flex-direction:column; gap:5px">
                  <div style="font-family:'Newsreader',serif; font-size:18.5px; color:${INK}; line-height:1.28">${esc(V.queueHeadline)}</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70)">${esc(V.queueSub)}</div>
                </div>
                <div data-h="${this.h(V.goReview)}" style="font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:12px; text-align:center; cursor:pointer">${esc(V.queueCta)}</div>
              </div>` : ""}

            ${V.queueClear ? `
              <div style="padding:17px 22px; display:flex; flex-direction:column; gap:6px; border-bottom:1px solid oklch(0.90 0.006 80); background:oklch(0.963 0.008 85)">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${CONF_INK}">All clear</div>
                <div style="font-family:'Newsreader',serif; font-size:19px; color:${INK}; line-height:1.28">${V.coverage}% of September is evidence-backed.</div>
                <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70)">We'll bring you the next thing worth checking.</div>
              </div>` : ""}

            <div data-h="${this.h(V.openInsight)}" class="row-hover" style="padding:17px 22px; display:flex; flex-direction:column; gap:6px; border-bottom:1px solid oklch(0.90 0.006 80); cursor:pointer">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${ATTN_INK}">Worth a look</div>
              <div style="border-left:2px solid ${ATTN}; padding-left:14px; display:flex; flex-direction:column; gap:5px">
                <div style="font-family:'Newsreader',serif; font-size:18.5px; color:${INK}; line-height:1.28">Food delivery is ₹4,220 above your usual month</div>
                <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70)">₹8,420 vs ₹4,200 typical · 12 orders vs usual 6</div>
              </div>
            </div>

            <div style="padding:17px 22px; display:flex; flex-direction:column; gap:11px; border-bottom:1px solid oklch(0.90 0.006 80)">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Likely next · 30 days</div>
              <div style="display:flex; align-items:baseline; justify-content:space-between">
                <div style="font-family:'Newsreader',serif; font-size:29px; color:${INK}; font-variant-numeric:tabular-nums">₹41,196</div>
                <div style="font-family:${MONO}; font-size:10px; color:${PRED_INK}; text-align:right; line-height:1.5">committed<br>7 autopays</div>
              </div>
            </div>

            <div style="padding:14px 22px 20px">
              <div style="display:flex; gap:6px; padding-bottom:12px; flex-wrap:wrap">
                <div data-h="${this.h(V.setFilterAll)}" style="font-family:${MONO}; font-size:10.5px; color:${V.chipAllInk}; background:${V.chipAllBg}; border:1px solid ${V.chipAllBorder}; border-radius:100px; padding:6px 12px; cursor:pointer">All</div>
                <div data-h="${this.h(V.setFilterUnproven)}" style="font-family:${MONO}; font-size:10.5px; color:${V.chipUnInk}; background:${V.chipUnBg}; border:1px solid ${V.chipUnBorder}; border-radius:100px; padding:6px 12px; cursor:pointer">Unproven only</div>
                <div data-h="${this.h(V.setFilterRecurring)}" style="font-family:${MONO}; font-size:10.5px; color:${V.chipReInk}; background:${V.chipReBg}; border:1px solid ${V.chipReBorder}; border-radius:100px; padding:6px 12px; cursor:pointer">Recurring</div>
              </div>

              ${V.feed.map((t) => `
                <div data-h="${this.h(t.onOpen)}" class="row-hover" style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid oklch(0.92 0.005 80); cursor:pointer; animation:tRow 0.3s ease-out both">
                  <div style="width:2px; align-self:stretch; background:${t.rail}"></div>
                  <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:2px">
                    <div style="font-family:${t.nameFont}; font-size:${t.nameSize}; font-weight:500; color:${t.nameColor}; border-bottom:${t.nameRule}; align-self:flex-start">${esc(t.name)}</div>
                    <div style="font-family:${MONO}; font-size:9.5px; color:${t.metaColor}">${esc(t.meta)}</div>
                  </div>
                  <div style="font-family:${SANS}; font-size:16px; font-weight:500; color:${t.amtColor}; font-variant-numeric:tabular-nums">${esc(t.amt)}</div>
                </div>
              `).join("")}

              ${V.feedEmpty ? `
                <div style="padding:26px 0; display:flex; flex-direction:column; gap:6px">
                  <div style="font-family:'Newsreader',serif; font-size:19px; color:${INK}">Nothing unproven left</div>
                  <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">Every September transaction now has evidence behind it.</div>
                </div>` : ""}
            </div>
          </div>
        </div>`;
    }

    reviewTab(V) {
      const rv = V.rv;
      let card = "";
      if (rv.isDuplicate) {
        card = `
          <div style="display:flex; flex-direction:column; gap:11px; padding:16px 0; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80)">
            <div style="display:flex; align-items:baseline; justify-content:space-between">
              <div style="font-family:'Newsreader',serif; font-size:34px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">₹2,145</div>
              <div style="font-family:${MONO}; font-size:10px; color:${WARN}">charged twice</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:1px">
              <div style="display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid oklch(0.93 0.005 80)">
                <div style="font-family:${MONO}; font-size:10px; color:${QUIET}; width:62px">4 Sep 7:12</div>
                <div style="flex:1; font-family:${MONO}; font-size:10px; color:${INK2}">Ref 774920118</div>
                <div style="font-family:${MONO}; font-size:10px; color:${CONF_INK}">✓ SMS</div>
              </div>
              <div style="display:flex; align-items:center; gap:10px; padding:9px 0">
                <div style="font-family:${MONO}; font-size:10px; color:${QUIET}; width:62px">4 Sep 7:12</div>
                <div style="flex:1; font-family:${MONO}; font-size:10px; color:${WARN}">Ref 774920118</div>
                <div style="font-family:${MONO}; font-size:10px; color:${CONF_INK}">✓ SMS</div>
              </div>
            </div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">Same reference number, same second, one Gmail receipt for ₹2,145. The bank sent the alert twice — your money left once.</div>
          </div>`;
      } else if (rv.isContested) {
        card = `
          <div style="display:flex; flex-direction:column; gap:12px; padding:16px 0; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80)">
            <div style="display:flex; gap:14px">
              <div style="flex:1; display:flex; flex-direction:column; gap:4px">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">HDFC SMS</div>
                <div style="font-family:'Newsreader',serif; font-size:28px; color:${INK}; font-variant-numeric:tabular-nums">₹2,340</div>
                <div style="font-family:${MONO}; font-size:9.5px; color:oklch(0.52 0.006 70)">amount actually debited</div>
              </div>
              <div style="width:1px; background:oklch(0.90 0.006 80)"></div>
              <div style="flex:1; display:flex; flex-direction:column; gap:4px">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">Gmail receipt</div>
                <div style="font-family:'Newsreader',serif; font-size:28px; color:${INK2}; font-variant-numeric:tabular-nums">₹2,290</div>
                <div style="font-family:${MONO}; font-size:9.5px; color:oklch(0.52 0.006 70)">order total, pre-shipping</div>
              </div>
            </div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">The ₹50 gap matches Myntra's shipping line. We'd keep ₹2,340 as the charge and record ₹50 as shipping.</div>
          </div>`;
      } else if (rv.isUnknown) {
        card = `
          <div style="display:flex; flex-direction:column; gap:7px; padding:16px 0; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80)">
            <div style="font-family:'Newsreader',serif; font-size:40px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">₹1,800</div>
            <div style="font-family:${MONO}; font-size:11px; color:${INK2}">q4bx@ybl</div>
            <div style="font-family:${MONO}; font-size:10.5px; color:${QUIET}; line-height:1.65">7 Sep · 11:08 AM<br>HDFC · ****4821 · UPI</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px">
            <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Our best guess</div>
            <div style="display:flex; align-items:baseline; gap:10px">
              <div style="font-family:'Newsreader',serif; font-size:23px; color:${INK}">Local kirana</div>
              <div style="display:flex; gap:2px; margin-bottom:4px"><div style="width:12px; height:4px; background:${ATTN}"></div><div style="width:12px; height:4px; background:oklch(0.90 0.006 80)"></div><div style="width:12px; height:4px; background:oklch(0.90 0.006 80)"></div></div>
            </div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">You've paid this handle 4 times — ₹1,600 to ₹2,100, always a weekday morning. No receipt ever arrives.</div>
          </div>`;
      } else if (rv.isUncategorised) {
        card = `
          <div style="display:flex; flex-direction:column; gap:7px; padding:16px 0; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80)">
            <div style="font-family:'Newsreader',serif; font-size:40px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">₹1,499</div>
            <div style="font-family:${SANS}; font-size:16px; font-weight:500; color:${INK}">Cult.fit</div>
            <div style="font-family:${MONO}; font-size:10.5px; color:${QUIET}; line-height:1.65">3 Sep · 6:04 AM · ICICI ****9042<br>✓ SMS · ✓ Gmail receipt</div>
          </div>
          <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">We know exactly what this is and what it cost. We don't know how you think about it — gym is Health for some people and Subscriptions for others.</div>`;
      }

      const applyAllBlock = rv.hasApplyAll ? `
        <div data-h="${this.h(V.toggleApplyAll)}" style="display:flex; align-items:center; gap:9px; padding:11px 13px; border:1px solid ${V.applyBorder}; border-radius:4px; cursor:pointer">
          <div style="width:13px; height:13px; border:1px solid ${V.applyBorder}; border-radius:2px; display:flex; align-items:center; justify-content:center; font-family:${MONO}; font-size:9px; color:${INK}; background:${V.applyBg}">${V.applyMark}</div>
          <div style="font-family:${SANS}; font-size:12.5px; color:${INK}">${esc(rv.applyLabel)}</div>
        </div>` : "";

      const body = V.queueClear ? `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; justify-content:center; padding:26px; gap:12px; animation:tScreen 0.35s ease-out both">
          <div style="font-family:'Newsreader',serif; font-size:34px; line-height:1.15; color:${INK}">All clear.</div>
          <div style="font-family:${SANS}; font-size:14px; line-height:1.6; color:${INK2}">${V.coverage}% of September is evidence-backed — up from 88% when you started. We'll bring you the next thing worth checking.</div>
          <div style="font-family:${MONO}; font-size:10.5px; color:${CONF_INK}; line-height:1.7; border-top:1px solid oklch(0.90 0.006 80); padding-top:14px">${esc(V.learnedLine)}</div>
        </div>` : `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column">
          <div style="flex:1; min-height:0; overflow-y:auto; padding:20px 22px; display:flex; flex-direction:column; gap:15px">
            <div style="border-left:2px solid ${rv.accent}; padding-left:14px; display:flex; flex-direction:column; gap:5px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${rv.accent}">Why this is here</div>
              <div style="font-family:'Newsreader',serif; font-size:19.5px; color:${INK}; line-height:1.3">${esc(rv.why)}</div>
            </div>
            ${card}
            <div style="background:oklch(0.963 0.008 85); border:1px solid oklch(0.91 0.005 80); border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:5px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">${esc(rv.rawLabel)}</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:${INK2}; line-height:1.6">${esc(rv.raw)}</div>
            </div>
            ${applyAllBlock}
          </div>
          <div style="padding:13px 22px 22px; border-top:1px solid oklch(0.88 0.006 80); background:oklch(0.985 0.005 85); display:flex; flex-direction:column; gap:8px; flex-shrink:0">
            <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); text-align:center; line-height:1.5">${esc(rv.consequence)}</div>
            <div style="display:flex; gap:8px">
              <div data-h="${this.h(V.acceptReview)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:13px; text-align:center; cursor:pointer">${esc(rv.primary)}</div>
              <div data-h="${this.h(V.rejectReview)}" style="flex:1; font-family:${SANS}; font-size:13px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:13px; text-align:center; cursor:pointer">${esc(rv.secondary)}</div>
            </div>
            <div data-h="${this.h(V.skipReview)}" style="font-family:${MONO}; font-size:10.5px; color:${QUIET}; text-align:center; cursor:pointer; padding-top:2px">Skip for now</div>
          </div>
        </div>`;

      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; animation:tScreen 0.28s ease-out both">
          <div style="padding:8px 22px 14px; display:flex; align-items:baseline; justify-content:space-between; border-bottom:1px solid oklch(0.90 0.006 80); flex-shrink:0">
            <div style="font-family:'Newsreader',serif; font-size:25px; color:${INK}">Review</div>
            <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70)">${esc(V.reviewPos)}</div>
          </div>
          ${body}
        </div>`;
    }

    commitTab(V) {
      return `
        <div style="flex:1; min-height:0; display:flex; flex-direction:column; animation:tScreen 0.28s ease-out both">
          <div style="padding:8px 22px 14px; flex-shrink:0">
            <div style="font-family:'Newsreader',serif; font-size:25px; color:${INK}">Commitments</div>
          </div>
          <div style="flex:1; min-height:0; overflow-y:auto; padding:0 22px 22px">
            <div style="display:flex; flex-direction:column; gap:8px; padding-bottom:18px; border-bottom:1px solid oklch(0.90 0.006 80)">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Committed · next 30 days</div>
              <div style="font-family:'Newsreader',serif; font-size:44px; line-height:0.95; color:${INK}; font-variant-numeric:tabular-nums">₹41,196</div>
              <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.6">24 recurring · 7 on autopay · 1 price rise ahead</div>
            </div>

            <div style="padding:16px 0 10px; font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Forward calendar</div>
            ${V.commitments.map((c) => `
              <div data-h="${this.h(c.onOpen)}" class="row-hover" style="display:flex; align-items:center; gap:11px; padding:12px 0; border-bottom:1px solid oklch(0.92 0.005 80); cursor:pointer">
                <div style="font-family:${MONO}; font-size:10px; color:${c.dateColor}; width:42px">${c.date}</div>
                <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:2px">
                  <div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${c.nameColor}">${esc(c.name)}</div>
                  <div style="font-family:${MONO}; font-size:9.5px; color:${c.noteColor}">${esc(c.note)}</div>
                </div>
                <div style="font-family:${SANS}; font-size:15px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums; border-bottom:${c.amtRule}">${esc(c.amt)}</div>
              </div>
            `).join("")}

            <div style="padding:20px 0 10px; font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Waiting on</div>
            <div data-h="${this.h(V.openRefund)}" style="border-left:2px solid ${REFUND}; padding:2px 0 2px 14px; display:flex; flex-direction:column; gap:5px; cursor:pointer">
              <div style="font-family:'Newsreader',serif; font-size:18px; color:${INK}; line-height:1.3">Myntra owes you ₹2,290</div>
              <div style="font-family:${MONO}; font-size:10px; color:${WARN}; line-height:1.6">Overdue — 12 days. Their email promised 5–7.</div>
            </div>

            ${V.spotifyPending ? `
              <div style="margin-top:20px; padding-top:18px; border-top:1px solid oklch(0.90 0.006 80); display:flex; flex-direction:column; gap:9px">
                <div style="display:flex; align-items:baseline; justify-content:space-between">
                  <div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${INK2}">Spotify — unconfirmed</div>
                  <div style="font-family:${SANS}; font-size:15px; font-weight:500; color:${INK2}; font-variant-numeric:tabular-nums; border-bottom:1px dashed oklch(0.70 0.02 70)">₹119</div>
                </div>
                <div style="font-family:${MONO}; font-size:10px; color:${PRED_INK}; line-height:1.6">Pattern found: 3 charges, ₹119, 14–16th. Excluded from the ₹41,196 until you confirm.</div>
                <div style="display:flex; gap:7px">
                  <div data-h="${this.h(V.confirmSpotify)}" style="font-family:${SANS}; font-size:12px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:8px 13px; cursor:pointer">Yes, recurring</div>
                  <div data-h="${this.h(V.dismissSpotify)}" style="font-family:${SANS}; font-size:12px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:8px 13px; cursor:pointer">No</div>
                </div>
              </div>` : ""}
          </div>
        </div>`;
    }

    detailScreen(V) {
      const dt = V.dt;
      const recon = V.reconOpen ? `
        <div style="display:flex; flex-direction:column; gap:0; padding-top:4px">
          <div style="display:flex; flex-direction:column; gap:8px; animation:tStage 0.4s ease-out both">
            <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:oklch(0.65 0.006 70)">1 · Raw evidence</div>
            <div style="background:oklch(0.99 0.004 85); border:1px solid oklch(0.90 0.006 80); border-radius:4px; padding:11px; display:flex; flex-direction:column; gap:5px">
              <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">SMS · HDFC-BK · 7 Sep 1:42:07 PM</div>
              <div style="font-family:${MONO}; font-size:10px; color:${INK2}; line-height:1.6">Rs.1249.00 debited from a/c **4821 on 07-09-26 to SWIGGY via UPI. Ref 628401993412.</div>
            </div>
            <div style="background:oklch(0.99 0.004 85); border:1px solid oklch(0.90 0.006 80); border-radius:4px; padding:11px; display:flex; flex-direction:column; gap:5px">
              <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">Gmail · no-reply@swiggy.in · 1:42:49 PM</div>
              <div style="font-family:${MONO}; font-size:10px; color:${INK2}; line-height:1.6">Order #SW8842019 delivered — Ghee Roast Dosa ×1, Filter Coffee ×2, Delivery ₹89. Total ₹1,249.</div>
            </div>
          </div>
          ${V.recon2 ? `
            <div style="display:flex; flex-direction:column; gap:8px">
              <div style="width:1px; height:26px; background:${ATTN}; margin:10px 0 4px 13px; animation:tRail 0.35s ease-out both"></div>
              <div style="animation:tStage 0.4s ease-out both; display:flex; flex-direction:column; gap:8px">
                <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:oklch(0.65 0.006 70)">2 · Reconciliation</div>
                <div style="border:1px solid oklch(0.90 0.006 80); border-radius:4px; overflow:hidden">
                  <div style="display:flex; align-items:center; gap:8px; padding:9px 11px; border-bottom:1px solid oklch(0.93 0.005 80)">
                    <svg width="16" height="6" style="overflow:visible; flex-shrink:0"><line x1="0" y1="3" x2="16" y2="3" stroke="${CONF}" stroke-width="1.2" stroke-dasharray="120" style="animation:tLink 1.2s ease-out both"></line></svg>
                    <div style="flex:1; font-family:${MONO}; font-size:10px; color:${CONF_INK}">₹1,249 = ₹1,249 · amounts agree</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px; padding:9px 11px; border-bottom:1px solid oklch(0.93 0.005 80)">
                    <svg width="16" height="6" style="overflow:visible; flex-shrink:0"><line x1="0" y1="3" x2="16" y2="3" stroke="${CONF}" stroke-width="1.2" stroke-dasharray="120" style="animation:tLink 1.2s 0.12s ease-out both"></line></svg>
                    <div style="flex:1; font-family:${MONO}; font-size:10px; color:${CONF_INK}">42 seconds apart · same event</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px; padding:9px 11px; border-bottom:1px solid oklch(0.93 0.005 80)">
                    <svg width="16" height="6" style="overflow:visible; flex-shrink:0"><line x1="0" y1="3" x2="16" y2="3" stroke="${CONF}" stroke-width="1.2" stroke-dasharray="120" style="animation:tLink 1.2s 0.24s ease-out both"></line></svg>
                    <div style="flex:1; font-family:${MONO}; font-size:10px; color:${CONF_INK}">SMS "SWIGGY" ↔ swiggy.in sender</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px; padding:9px 11px">
                    <div style="width:16px; font-family:${MONO}; font-size:10px; color:${QUIET}; flex-shrink:0">→</div>
                    <div style="flex:1; font-family:${MONO}; font-size:10px; color:oklch(0.50 0.008 70); line-height:1.5">Amount and time taken from SMS. Merchant and items taken from Gmail. Each source trusted only for what it's authoritative on.</div>
                  </div>
                </div>
              </div>
            </div>` : ""}
          ${V.recon3 ? `
            <div style="display:flex; flex-direction:column; gap:8px">
              <div style="width:1px; height:26px; background:${CONF}; margin:10px 0 4px 13px; animation:tRail 0.35s ease-out both"></div>
              <div style="animation:tStage 0.4s ease-out both; display:flex; flex-direction:column; gap:8px">
                <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:oklch(0.65 0.006 70)">3 · Canonical transaction</div>
                <div style="background:oklch(0.99 0.004 85); border:1px solid ${CONF}; border-radius:4px; padding:14px; display:flex; align-items:center; gap:12px">
                  <div style="width:2px; align-self:stretch; background:${CONF}"></div>
                  <div style="flex:1; min-width:0">
                    <div style="font-family:${SANS}; font-size:15px; font-weight:500; color:${INK}">Swiggy · 3 items</div>
                    <div style="font-family:${MONO}; font-size:9.5px; color:${CONF_INK}">Food &amp; Dining · confirmed by two sources</div>
                  </div>
                  <div style="font-family:${SANS}; font-size:17px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">₹1,249</div>
                </div>
              </div>
            </div>` : ""}
          ${V.recon4 ? `
            <div style="display:flex; flex-direction:column; gap:8px">
              <div style="width:1px; height:26px; background:${ATTN}; margin:10px 0 4px 13px; animation:tRail 0.35s ease-out both"></div>
              <div style="animation:tStage 0.4s ease-out both; display:flex; flex-direction:column; gap:8px">
                <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:oklch(0.65 0.006 70)">4 · Intelligence</div>
                <div style="border-left:2px solid ${ATTN}; padding-left:13px; display:flex; flex-direction:column; gap:5px">
                  <div style="font-family:'Newsreader',serif; font-size:17.5px; color:${INK}; line-height:1.3">This is your 12th delivery order this month</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.6">₹8,420 on delivery in September vs ₹4,200 typical. ₹1,068 of it was delivery fees alone — recoverable from the line items, not the bank feed.</div>
                </div>
              </div>
            </div>` : ""}
        </div>` : "";

      return `
        <div style="position:absolute; inset:0; background:oklch(0.975 0.007 85); display:flex; flex-direction:column; animation:tScreen 0.3s cubic-bezier(0.2,0.7,0.2,1) both">
          <div class="statusbar"><div>9:41</div><div>▮▮▮ ▪</div></div>
          <div data-h="${this.h(V.closeDetail)}" style="padding:8px 22px 0; font-family:${MONO}; font-size:11px; color:${INK2}; cursor:pointer; flex-shrink:0">← Back</div>
          <div style="flex:1; min-height:0; overflow-y:auto">
            <div style="padding:18px 22px 18px; display:flex; flex-direction:column; gap:8px; border-bottom:1px solid oklch(0.90 0.006 80)">
              <div style="font-family:'Newsreader',serif; font-size:56px; line-height:0.92; color:${INK}; font-variant-numeric:tabular-nums; letter-spacing:-0.025em">${esc(dt.amount)}</div>
              <div style="font-family:'Newsreader',serif; font-size:25px; color:${INK}; line-height:1.1">${esc(dt.merchant)}</div>
              <div style="display:flex; align-items:center; gap:7px; margin-top:2px">
                <div style="width:3px; height:12px; background:${INK}"></div>
                <div style="font-family:${MONO}; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:${INK2}">${esc(dt.category)}</div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:7px; padding-top:9px; border-top:1px solid oklch(0.92 0.005 80)">
                <div style="width:6px; height:6px; border-radius:50%; background:${dt.stateColor}"></div>
                <div style="font-family:${SANS}; font-size:13px; color:${dt.stateColor}">${esc(dt.stateLabel)}</div>
              </div>
              <div style="font-family:${MONO}; font-size:11px; color:oklch(0.52 0.006 70); line-height:1.75; white-space:pre-line">${esc(dt.meta)}</div>
            </div>

            <div style="padding:16px 22px; display:flex; flex-direction:column; gap:11px; background:oklch(0.963 0.008 85)">
              <div style="display:flex; align-items:center; justify-content:space-between">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Evidence</div>
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:${QUIET}">Source</div>
              </div>
              <div style="display:flex; flex-direction:column">
                ${dt.rows.map((e) => `
                  <div style="display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid oklch(0.91 0.005 80)">
                    <div style="display:flex; flex-direction:column; gap:2px; min-width:0">
                      <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">${esc(e.label)}</div>
                      <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${e.valueColor}; border-bottom:${e.valueRule}; align-self:flex-start">${esc(e.value)}</div>
                    </div>
                    <div style="font-family:${MONO}; font-size:10.5px; color:${e.srcColor}; flex-shrink:0">${esc(e.src)}</div>
                  </div>
                `).join("")}
              </div>

              <div style="display:flex; flex-direction:column; gap:6px; padding-top:6px">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Confidence</div>
                <div style="display:flex; align-items:center; gap:10px">
                  <div style="display:flex; gap:2px">
                    <div style="width:16px; height:4px; background:${dt.bar1}"></div>
                    <div style="width:16px; height:4px; background:${dt.bar2}"></div>
                    <div style="width:16px; height:4px; background:${dt.bar3}"></div>
                  </div>
                  <div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${INK}">${esc(dt.confidence)}</div>
                </div>
                <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.55">${esc(dt.reason)}</div>
              </div>

              <div data-h="${this.h(V.toggleRecon)}" class="recon-toggle" style="margin-top:4px; display:flex; align-items:center; justify-content:space-between; border:1px solid oklch(0.85 0.006 80); border-radius:4px; padding:12px 13px; cursor:pointer">
                <div style="font-family:${SANS}; font-size:12.5px; font-weight:500; color:${INK}">How we built this record</div>
                <div style="font-family:${MONO}; font-size:11px; color:oklch(0.55 0.006 70)">${V.reconChevron}</div>
              </div>

              ${recon}

              <div style="background:oklch(0.99 0.004 85); border:1px solid oklch(0.90 0.006 80); border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:6px; margin-top:4px">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">${esc(dt.rawLabel)}</div>
                <div style="font-family:${MONO}; font-size:10.5px; color:${INK2}; line-height:1.6">${esc(dt.raw)}</div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px; padding:13px 22px 22px; border-top:1px solid oklch(0.88 0.006 80); background:oklch(0.985 0.005 85); flex-shrink:0">
            <div data-h="${this.h(V.openCategorySheet)}" style="flex:1; font-family:${SANS}; font-size:12.5px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:12px; text-align:center; cursor:pointer">Change category</div>
            <div style="flex:1; font-family:${SANS}; font-size:12.5px; font-weight:500; color:${WARN}; border:1px solid oklch(0.80 0.04 30); border-radius:3px; padding:12px; text-align:center; cursor:pointer">Not mine</div>
          </div>
        </div>`;
    }

    commitScreen(V) {
      return `
        <div style="position:absolute; inset:0; background:oklch(0.975 0.007 85); display:flex; flex-direction:column; animation:tScreen 0.3s cubic-bezier(0.2,0.7,0.2,1) both">
          <div class="statusbar"><div>9:41</div><div>▮▮▮ ▪</div></div>
          <div data-h="${this.h(V.closeCommit)}" style="padding:8px 22px 0; font-family:${MONO}; font-size:11px; color:${INK2}; cursor:pointer; flex-shrink:0">← Commitments</div>
          <div style="flex:1; min-height:0; overflow-y:auto; padding:18px 22px 22px; display:flex; flex-direction:column; gap:18px">
            <div style="display:flex; flex-direction:column; gap:8px">
              <div style="font-family:'Newsreader',serif; font-size:32px; color:${INK}; line-height:1.1">Netflix</div>
              <div style="display:flex; align-items:center; gap:8px">
                <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${CONF_INK}; border:1px solid ${CONF}; border-radius:2px; padding:2px 6px">Autopay</div>
                <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70)">UPI mandate · monthly</div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:7px; padding:16px 0; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80)">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${PRED_INK}">Predicted next charge</div>
              <div style="display:flex; align-items:baseline; gap:12px">
                <div style="font-family:'Newsreader',serif; font-size:40px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">₹649</div>
                <div style="font-family:${MONO}; font-size:11px; color:${INK2}">on 12 Oct</div>
              </div>
              <div style="display:flex; align-items:center; gap:10px; padding-top:4px">
                <div style="display:flex; gap:2px"><div style="width:15px; height:4px; background:${CONF}"></div><div style="width:15px; height:4px; background:${CONF}"></div><div style="width:15px; height:4px; background:${CONF}"></div></div>
                <div style="font-family:${SANS}; font-size:13px; font-weight:500; color:${INK}">High</div>
              </div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">Mandate is active and the amount hasn't moved in 6 cycles. We'll warn you 2 days before, and immediately if the amount changes.</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Detection basis</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.50 0.008 70); line-height:1.7">6 charges of ₹649, all between the 2nd and 4th.<br>Mandate creation SMS from HDFC-BK on 12 Mar.<br>Gmail receipt from Netflix on every cycle.</div>
              <div style="background:oklch(0.963 0.008 85); border:1px solid oklch(0.91 0.005 80); border-radius:4px; padding:11px; display:flex; flex-direction:column; gap:5px">
                <div style="font-family:${MONO}; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:oklch(0.68 0.006 70)">Mandate evidence · HDFC-BK · 12 Mar</div>
                <div style="font-family:${MONO}; font-size:10px; color:${INK2}; line-height:1.6">UPI-Mandate created for Rs.649.00 in favour of NETFLIX, frequency MONTHLY, valid till 12-03-31. UMN 8841ax…</div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:9px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Charge history</div>
              ${V.netflixHistory.map((hRow) => `
                <div style="display:flex; align-items:center; gap:11px; padding:8px 0; border-bottom:1px solid oklch(0.93 0.005 80)">
                  <div style="font-family:${MONO}; font-size:10px; color:${QUIET}; width:46px">${hRow.date}</div>
                  <div style="flex:1; font-family:${MONO}; font-size:9.5px; color:${CONF_INK}">${hRow.src}</div>
                  <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">${hRow.amt}</div>
                </div>
              `).join("")}
            </div>

            <div style="display:flex; flex-direction:column; gap:7px; border-top:1px solid oklch(0.91 0.005 80); padding-top:16px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">If you want out</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">We can't cancel a UPI mandate for you. Your bank app → UPI Mandates → Netflix → Revoke. We'll notice within a cycle and stop counting it.</div>
            </div>
          </div>
        </div>`;
    }

    refundScreen(V) {
      return `
        <div style="position:absolute; inset:0; background:oklch(0.975 0.007 85); display:flex; flex-direction:column; animation:tScreen 0.3s cubic-bezier(0.2,0.7,0.2,1) both">
          <div class="statusbar"><div>9:41</div><div>▮▮▮ ▪</div></div>
          <div data-h="${this.h(V.closeRefund)}" style="padding:8px 22px 0; font-family:${MONO}; font-size:11px; color:${INK2}; cursor:pointer; flex-shrink:0">← Commitments</div>
          <div style="flex:1; min-height:0; overflow-y:auto; padding:18px 22px 22px; display:flex; flex-direction:column; gap:18px">
            <div style="display:flex; flex-direction:column; gap:7px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${REFUND_INK}">Refund thread</div>
              <div style="font-family:'Newsreader',serif; font-size:44px; line-height:1; color:${INK}; font-variant-numeric:tabular-nums">₹2,290</div>
              <div style="font-family:'Newsreader',serif; font-size:22px; color:${INK}">Myntra</div>
            </div>

            <div style="border-left:2px solid ${WARN}; padding-left:14px; display:flex; flex-direction:column; gap:5px">
              <div style="font-family:'Newsreader',serif; font-size:19px; color:${INK}; line-height:1.3">It's been 12 days. Their email promised 5–7.</div>
              <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.6">Nobody sends a reminder when a refund doesn't arrive. We do.</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0">
              <div style="display:flex; gap:13px">
                <div style="display:flex; flex-direction:column; align-items:center; width:9px"><div style="width:7px; height:7px; border-radius:50%; background:${INK}; margin-top:5px"></div><div style="width:1px; flex:1; background:oklch(0.88 0.006 80)"></div></div>
                <div style="flex:1; padding-bottom:18px; display:flex; flex-direction:column; gap:3px">
                  <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${INK}">Charged ₹2,340</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.55">28 Aug · ✓ HDFC SMS · ✓ Gmail order confirmation</div>
                </div>
              </div>
              <div style="display:flex; gap:13px">
                <div style="display:flex; flex-direction:column; align-items:center; width:9px"><div style="width:7px; height:7px; border-radius:50%; background:${REFUND}; margin-top:5px"></div><div style="width:1px; flex:1; background:oklch(0.88 0.006 80)"></div></div>
                <div style="flex:1; padding-bottom:18px; display:flex; flex-direction:column; gap:3px">
                  <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${INK}">Return picked up</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.55">8 Sep · ✓ Gmail — "refund of ₹2,290 in 5–7 business days"</div>
                </div>
              </div>
              <div style="display:flex; gap:13px">
                <div style="display:flex; flex-direction:column; align-items:center; width:9px"><div style="width:7px; height:7px; border-radius:50%; background:${WARN}; margin-top:5px"></div><div style="width:1px; flex:1; background:oklch(0.92 0.005 80)"></div></div>
                <div style="flex:1; padding-bottom:18px; display:flex; flex-direction:column; gap:3px">
                  <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${WARN}">Expected by 18 Sep — overdue</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.52 0.006 70); line-height:1.55">No matching credit found in any account</div>
                </div>
              </div>
              <div style="display:flex; gap:13px">
                <div style="display:flex; flex-direction:column; align-items:center; width:9px"><div style="width:7px; height:7px; border-radius:50%; border:1.5px solid oklch(0.80 0.006 70); margin-top:5px"></div></div>
                <div style="flex:1; display:flex; flex-direction:column; gap:3px">
                  <div style="font-family:${SANS}; font-size:13.5px; font-weight:500; color:${QUIET}">Credit received</div>
                  <div style="font-family:${MONO}; font-size:10px; color:oklch(0.65 0.006 70)">We'll match it automatically and close this thread</div>
                </div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid oklch(0.91 0.005 80); padding-top:16px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">₹50 unaccounted</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.52 0.006 70); line-height:1.6">You paid ₹2,340; they're refunding ₹2,290. The ₹50 was shipping — non-refundable per their policy email.</div>
            </div>

            <div data-h="${this.h(V.showToastChase)}" style="font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85); background:${INK}; border-radius:3px; padding:13px; text-align:center; cursor:pointer">Copy evidence summary</div>
          </div>
        </div>`;
    }

    insightScreen(V) {
      return `
        <div style="position:absolute; inset:0; background:oklch(0.975 0.007 85); display:flex; flex-direction:column; animation:tScreen 0.3s cubic-bezier(0.2,0.7,0.2,1) both">
          <div class="statusbar"><div>9:41</div><div>▮▮▮ ▪</div></div>
          <div data-h="${this.h(V.closeInsight)}" style="padding:8px 22px 0; font-family:${MONO}; font-size:11px; color:${INK2}; cursor:pointer; flex-shrink:0">← Ledger</div>
          <div style="flex:1; min-height:0; overflow-y:auto; padding:18px 22px 22px; display:flex; flex-direction:column; gap:18px">
            <div style="font-family:'Newsreader',serif; font-size:29px; line-height:1.15; color:${INK}">Food delivery is ₹4,220 above your usual month</div>
            <div style="display:flex; align-items:flex-end; gap:5px; height:84px">
              <div style="flex:1; height:38%; background:${INK2}"></div>
              <div style="flex:1; height:44%; background:${INK2}"></div>
              <div style="flex:1; height:36%; background:${INK2}"></div>
              <div style="flex:1; height:50%; background:${INK2}"></div>
              <div style="flex:1; height:42%; background:${INK2}"></div>
              <div style="flex:1; height:100%; background:${ATTN}"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-family:${MONO}; font-size:9.5px; color:${QUIET}"><div>Apr</div><div>May</div><div>Jun</div><div>Jul</div><div>Aug</div><div style="color:${ATTN_INK}">Sep</div></div>

            <div style="display:flex; flex-direction:column; gap:9px; border-top:1px solid oklch(0.91 0.005 80); border-bottom:1px solid oklch(0.91 0.005 80); padding:16px 0">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">What changed</div>
              <div style="font-family:${MONO}; font-size:10.5px; color:oklch(0.50 0.008 70); line-height:1.75">12 orders, against a usual 6.<br>Average order ₹702 — barely moved from ₹700.<br>₹1,068 of the total was delivery fees.<br>9 of 12 orders were placed after 9 PM.</div>
              <div style="font-family:${MONO}; font-size:10px; color:${CONF_INK}; padding-top:4px">Evidence: 11 of 12 confirmed by receipt · 1 single-source</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:9px">
              <div style="font-family:${MONO}; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:${QUIET}">Biggest contributors</div>
              <div style="display:flex; align-items:center; gap:11px; padding:9px 0; border-bottom:1px solid oklch(0.93 0.005 80)"><div style="flex:1; font-family:${SANS}; font-size:13.5px; color:${INK}">Swiggy · 8 orders</div><div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">₹5,940</div></div>
              <div style="display:flex; align-items:center; gap:11px; padding:9px 0; border-bottom:1px solid oklch(0.93 0.005 80)"><div style="flex:1; font-family:${SANS}; font-size:13.5px; color:${INK}">Zomato · 3 orders</div><div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">₹2,000</div></div>
              <div style="display:flex; align-items:center; gap:11px; padding:9px 0"><div style="flex:1; font-family:${SANS}; font-size:13.5px; color:${INK}">Blue Tokai · 1 order</div><div style="font-family:${SANS}; font-size:14px; font-weight:500; color:${INK}; font-variant-numeric:tabular-nums">₹480</div></div>
            </div>

            <div style="display:flex; gap:8px">
              <div data-h="${this.h(V.closeInsight)}" style="flex:1; font-family:${SANS}; font-size:12.5px; font-weight:500; color:${INK}; border:1px solid oklch(0.82 0.006 80); border-radius:3px; padding:12px; text-align:center; cursor:pointer">Watch this category</div>
              <div data-h="${this.h(V.muteInsight)}" style="flex:1; font-family:${SANS}; font-size:12.5px; font-weight:500; color:${INK2}; border:1px solid oklch(0.85 0.006 80); border-radius:3px; padding:12px; text-align:center; cursor:pointer">Mute</div>
            </div>
          </div>
        </div>`;
    }

    sheetScreen(V) {
      return `
        <div style="position:absolute; inset:0; background:oklch(0.24 0.012 70 / 0.28); display:flex; flex-direction:column; justify-content:flex-end">
          <div data-h="${this.h(V.closeSheet)}" style="flex:1"></div>
          <div style="background:oklch(0.985 0.005 85); border-top:1px solid oklch(0.88 0.006 80); border-radius:16px 16px 0 0; padding:18px 22px 26px; display:flex; flex-direction:column; gap:15px; animation:tSheet 0.28s cubic-bezier(0.2,0.7,0.2,1) both">
            <div style="width:34px; height:3px; border-radius:2px; background:oklch(0.85 0.006 80); align-self:center"></div>
            <div style="font-family:'Newsreader',serif; font-size:22px; color:${INK}">${esc(V.sheetTitle)}</div>
            <div style="display:flex; flex-direction:column; gap:1px">
              ${V.sheetOptions.map((o) => `
                <div data-h="${this.h(o.onPick)}" class="row-hover" style="display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid oklch(0.92 0.005 80); cursor:pointer">
                  <div style="font-family:${SANS}; font-size:13.5px; color:${INK}">${esc(o.label)}</div>
                  <div style="font-family:${MONO}; font-size:10px; color:${QUIET}">${esc(o.note)}</div>
                </div>
              `).join("")}
            </div>
            <div style="font-family:${MONO}; font-size:10px; color:oklch(0.55 0.006 70); line-height:1.6">${esc(V.sheetFoot)}</div>
          </div>
        </div>`;
    }

    toastScreen(V) {
      return `
        <div style="position:absolute; left:18px; right:18px; bottom:88px; background:${INK}; border-radius:5px; padding:13px 15px; display:flex; flex-direction:column; gap:3px; animation:tToast 0.3s ease-out both; box-shadow:0 12px 30px -14px oklch(0.24 0.012 70 / 0.6)">
          <div style="font-family:${SANS}; font-size:13px; font-weight:500; color:oklch(0.985 0.005 85)">${esc(V.toastTitle)}</div>
          <div style="font-family:${MONO}; font-size:10px; color:oklch(0.80 0.01 85); line-height:1.5">${esc(V.toastBody)}</div>
        </div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    new Trace(document.getElementById("app"));
  });
})();
