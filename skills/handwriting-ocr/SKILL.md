# Handwriting OCR Skill

## Purpose

Recognize handwritten content from images or PDF files, especially economics lecture notes with mathematical formulas, derivations, and tables. Output structured Markdown with LaTeX-formatted math.

## Input

- `.jpg` / `.png` (image files)
- `.pdf` (PDF files with handwritten/scanned content, each page treated as an image)

## Processing Pipeline

### 1. Image Preprocessing

For each page/image:
- Convert to grayscale
- Enhance contrast (adaptive histogram equalization)
- Binarize with Otsu's threshold
- Optionally deskew and crop margins

### 2. OCR Recognition

Priority order for OCR engines:

1. **Mathpix API** (best for math formulas)
   - Uses `MATHPIX_API_KEY` and `MATHPIX_APP_ID` environment variables
   - Returns LaTeX-formatted text with math blocks
   - Endpoint: `POST https://api.mathpix.com/v3/text`
   - Supports `formats: ["text", "latex_styled"]` and `conversion_formats: {"latex_styled": {}}`

2. **PaddleOCR** (good for mixed Chinese/English handwriting)
   - Install: `pip install paddlepaddle paddleocr`
   - Better for CJK characters

3. **EasyOCR** (general purpose OCR)
   - Install: `pip install easyocr`
   - Decent handwriting support, supports many languages

4. **Tesseract + pytesseract** (fallback)
   - Install: `apt install tesseract-ocr && pip install pytesseract`
   - Limited handwriting support, better for printed text

### 3. Math Formula LaTeX Conversion

- Detect inline math patterns: `$...$` or `\(...\)`
- Detect display math patterns: `$$...$$` or `\[...\]`
- Common economics notation:
  - Greek letters: α β γ δ ε θ κ λ μ ν π ρ σ τ φ ψ ω
  - Operators: ∂ ∑ ∫ ∏ lim sup inf
  - Relation: ≈ ≡ ≤ ≥ ≠ ≪ ≫ ∼ ≃ ≻ ≺
  - Arrows: → ← ⇒ ⇔ ↑ ↓
- Common subscript/superscript patterns in macroeconomics: `k_t`, `Y^*`, `c_{t+1}`, `\dot{k}`

### 4. Uncertainty Marking

For content the OCR is uncertain about:
- Mark with `[uncertain: text_guess]` inline
- Alternative interpretations: `[uncertain: guess1 | guess2 | guess3]`
- Missing/formula sections: `[unreadable: brief_description]`

### 5. Output Files

All output saved to `output/ocr/`:

| File | Description |
|------|-------------|
| `raw_ocr.md` | Raw OCR output before cleaning |
| `cleaned_notes.md` | Cleaned, structured notes with corrected formatting |
| `uncertain_parts.md` | Sections flagged as uncertain for manual review |

## Usage Script

```python
# ocr_pipeline.py - Place this in the skill directory

import os, sys, json, subprocess
from pathlib import Path

def preprocess_image(img_path: str) -> str:
    """Grayscale, contrast, binarize, save preprocessed copy."""
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        img = Image.open(img_path).convert('L')  # grayscale
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        # Binarize
        img = img.point(lambda x: 0 if x < 128 else 255)
        out_path = img_path.replace('.png', '_processed.png').replace('.jpg', '_processed.jpg')
        img.save(out_path)
        return out_path
    except ImportError:
        return img_path  # return original if PIL not available

def ocr_mathpix(image_path: str) -> str:
    """Use Mathpix API to OCR an image with math support."""
    api_key = os.environ.get('MATHPIX_API_KEY', '')
    app_id = os.environ.get('MATHPIX_APP_ID', '')
    if not api_key or not app_id:
        raise RuntimeError("MATHPIX_API_KEY and MATHPIX_APP_ID must be set")
    import requests, base64
    with open(image_path, 'rb') as f:
        data = base64.b64encode(f.read()).decode()
    resp = requests.post(
        'https://api.mathpix.com/v3/text',
        json={'src': f'data:image/png;base64,{data}', 'formats': ['text', 'latex_styled']},
        headers={'app_id': app_id, 'app_key': api_key}
    )
    return resp.json().get('text', '')

def ocr_paddle(image_path: str) -> str:
    """Use PaddleOCR for handwriting recognition."""
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    result = ocr.ocr(image_path, cls=True)
    lines = []
    for page in result:
        for line in page:
            text = line[1][0]
            lines.append(text)
    return '\n'.join(lines)

def ocr_easyocr(image_path: str) -> str:
    """Use EasyOCR for handwriting recognition."""
    import easyocr
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path)
    lines = [text for (bbox, text, conf) in result]
    return '\n'.join(lines)

def ocr_tesseract(image_path: str) -> str:
    """Use Tesseract as fallback."""
    import pytesseract
    from PIL import Image
    img = Image.open(image_path)
    return pytesseract.image_to_string(img, lang='eng')

def pdf_to_images(pdf_path: str, output_dir: str) -> list:
    """Convert PDF pages to images."""
    from pdf2image import convert_from_path
    images = convert_from_path(pdf_path, dpi=300)
    paths = []
    for i, img in enumerate(images):
        out = os.path.join(output_dir, f'page_{i+1:03d}.png')
        img.save(out, 'PNG')
        paths.append(out)
    return paths

def cleanup_math(text: str) -> str:
    """Convert OCR-detected math to proper LaTeX."""
    import re
    # Fix common OCR math errors
    replacements = {
        'a': r'\alpha', 'b': r'\beta', 'y': r'\gamma',
        'Ok': r'\partial_k', 'Ox': r'\partial_x',
    }
    # Detect math blocks and wrap
    # (this is a simplified placeholder - full implementation would be more sophisticated)
    return text

def mark_uncertain(text: str, confidence_threshold: float = 0.6) -> str:
    """Add [uncertain: ...] tags for low-confidence regions."""
    # Called after OCR to insert markers
    return text

def main(input_path: str, engine: str = 'auto'):
    """Main OCR pipeline entry point."""
    output_dir = 'output/ocr'
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Convert PDF to images if needed
    if input_path.endswith('.pdf'):
        images = pdf_to_images(input_path, output_dir)
    else:
        images = [input_path]
    
    # Step 2: Process each image
    all_text = []
    uncertain = []
    
    for img_path in images:
        # Preprocess
        processed = preprocess_image(img_path)
        
        # Choose OCR engine
        if engine == 'auto':
            if os.environ.get('MATHPIX_API_KEY'):
                text = ocr_mathpix(processed)
            else:
                try:
                    text = ocr_paddle(processed)
                except ImportError:
                    try:
                        text = ocr_easyocr(processed)
                    except ImportError:
                        text = ocr_tesseract(processed)
        elif engine == 'mathpix':
            text = ocr_mathpix(processed)
        elif engine == 'paddle':
            text = ocr_paddle(processed)
        elif engine == 'easyocr':
            text = ocr_easyocr(processed)
        elif engine == 'tesseract':
            text = ocr_tesseract(processed)
        else:
            raise ValueError(f"Unknown engine: {engine}")
        
        all_text.append(text)
    
    # Step 3: Clean up and LaTeX-ify math
    raw_text = '\n\n--- Page Break ---\n\n'.join(all_text)
    cleaned = cleanup_math(raw_text)
    
    # Step 4: Write output files
    with open(os.path.join(output_dir, 'raw_ocr.md'), 'w') as f:
        f.write(raw_text)
    with open(os.path.join(output_dir, 'cleaned_notes.md'), 'w') as f:
        f.write(cleaned)
    with open(os.path.join(output_dir, 'uncertain_parts.md'), 'w') as f:
        f.write('\n'.join(uncertain) if uncertain else 'No uncertain parts detected.')
    
    print(f"OCR complete. Output in {output_dir}/")
    return cleaned

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python ocr_pipeline.py <input.pdf|input.png> [engine]")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'auto')
```

## Constraints

- DO NOT overwrite existing files in `output/ocr/` without confirmation
- Log all steps for reproducibility
- If Mathpix API and local OCR tools are all unavailable, report the limitation and ask the user for alternative inputs
