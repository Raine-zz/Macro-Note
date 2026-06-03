# Macro Note — Knowledge Network

Interactive knowledge network for macroeconomics, built as a static website with MathJax-rendered equations. Covers three levels: introductory, intermediate, and advanced macro.

## Website Structure

| Page | Content |
|------|---------|
| `index.html` | Overview, learning pathway, site map |
| `concepts.html` | GDP, inflation, unemployment, national accounts |
| `micro_foundation.html` | Utility, optimization, representative consumer, intertemporal choice |
| `growth.html` | Solow, RCK, OLG, endogenous growth, growth accounting |
| `short_run.html` | IS-LM, IS-LM-PC, DAS-DAD, Phillips Curve, Taylor principle |
| `monetary.html` | New Keynesian, sticky prices (Calvo), NKPC, ZLB, rules vs. discretion |
| `open.html` | Exchange rates, interest parity, Mundell-Fleming, trilemma |
| `labor.html` | DMP search & matching, Beveridge curve, competitive vs frictional labor markets |
| `financial.html` | Financial amplification, collateral constraints, asset pricing, Great Recession |
| `methods.html` | Log-linearization, AR(1), undetermined coefficients, phase diagrams, DP, VFI |

## Local Setup

Open `docs/index.html` in a browser, or serve with any static server:

```bash
python3 -m http.server 8080 --directory docs
```

Then visit `http://localhost:8080`.

## Skills

- `skills/handwriting-ocr/SKILL.md` — OCR pipeline for handwritten economics notes (Mathpix / PaddleOCR / EasyOCR).
  Requires: `MATHPIX_API_KEY` / `MATHPIX_APP_ID` or local OCR engines.

## Sources

- **Primary Macro** (Yunho Cho, Spring 2024): Blanchard, Chapters 1–19
- **Intermediate Macro** (Wei Qiao, 2025): Micro foundations, financial frictions, DMP model
- **Advanced Macro I** (Zijian Wang, Autumn 2024): Solow, RCK, OLG, RBC, New Keynesian

## Author

**Xinyu Zhou** — [GitHub](https://github.com/Raine-zz)
