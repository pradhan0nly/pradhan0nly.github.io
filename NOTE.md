# NOTE

Single source of truth
- Edit only `_data/site.json` to control the visible content for About, Publications, CV, and Hobbies.

Where to edit in `_data/site.json`
- `pages[]`: page content and metadata.
  - `about` page: update `title`, `subtitle`, `profile`, and `content`.
  - `publications` page: update `title`/`description`; the list itself still comes from `_bibliography/papers.bib`.
  - `cv` page: update `title`, `description`, and `cv_pdf` (PDF filename in `assets/pdf/`).
  - `hobbies` page: update `content` (supports Markdown).
- `resume`: CV data used on `/cv/`.

Markdown inside JSON
- `pages[].content` supports Markdown and inline HTML.

Files you should not need to edit
- `_pages/about.md`
- `_pages/publications.md`
- `_pages/cv.md`
- `_pages/hobbies.md`

Publication entries
- To add/edit publications, edit `_bibliography/papers.bib` (this is the only exception to the single JSON file).
