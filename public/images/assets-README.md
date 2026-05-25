About assets — instructions for adding HD jewellery photos with models

Goal
- Use high-resolution images of jewellery being worn by models across the About and Gallery pages.
- Files are referenced in config; save images with the exact filenames below to `public/images/about/` or `public/images/gallery/`.

Suggested filenames (place into `public/images/about/`):
- model-hero.jpg          (1200x900 or larger) — hero image with model wearing bridal jewellery
- model-01.jpg            (800x1000 or larger) — heritage / portrait-style
- model-02.jpg            (800x1000 or larger) — craftsmanship close-up with model
- store-model.jpg         (900x700 or larger) — team/store photo with people

Suggested filenames (place into `public/images/gallery/`):
- model-01.jpg
- model-02.jpg
- model-03.jpg
- model-04.jpg
- model-05.jpg
- model-06.jpg

Where to get high-quality, free-to-use images
- Pexels (https://www.pexels.com) — search terms: "jewellery model", "bridal jewellery model", "woman wearing necklace"
- Unsplash (https://unsplash.com) — search terms: "jewellery", "bride jewelry", "model jewelry"

Notes on licensing
- Prefer images with permissive licenses (Unsplash / Pexels allow free use for most projects). Always check the specific image license and attribution requirements.
- For commercial or brand usage, consider purchasing stock photography or commissioning a photographer for exclusivity and higher fidelity.

Quick manual download steps (example using browser):
1. Open Pexels/Unsplash and search the terms above.
2. Choose an image and click "Free Download".
3. Save the file with the exact filename listed above into the corresponding folder.

Optional automated download (requires you to supply URLs)
- If you have direct image URLs, you can run (Windows PowerShell):

```powershell
# example: replace URL and filename
Invoke-WebRequest -Uri "<IMAGE_URL>" -OutFile "public/images/about/model-hero.jpg"
```

Verify
- After placing files, visit `/about` and `/` (home) to confirm images render.

If you'd like, I can:
- Provide a short list of candidate images from Unsplash/Pexels (I can paste direct URLs),
- Or prepare low-res placeholders temporarily while you collect HD assets.
