# SEC Disclosure Trend Analyzer

**Educational and research use only.** Data and AI classifications may contain errors or omissions and carry no guarantee of accuracy, completeness or reliability. Do not rely on this information for financial, investment, commercial, legal or other decisions. Consult original SEC filings and qualified professionals. Independent project; not affiliated with or endorsed by the SEC.

A public, static research dashboard for a fixed sample of **114 Exhibit 10 attachments**, from **19 issuers** and **77 filings** in **2021, 2023 and 2025**.

[Open the dashboard](https://nealdongre-code.github.io/sec-disclosure-trend-analyzer/)

## Features

Industry, filing-year, filing-form and primary-category filters; clickable composition charts; source search and pagination; AI classification reasons and interpretation notes; original EDGAR links; filtered CSV downloads that include the research notice; and the complete metadata research release.

## Scope and limitations

This is a purposive feasibility sample, not an industry census. It includes plans, award forms, amendments, addenda, restatements and bundled documents. Attachment counts are not counts of new deals or unique underlying agreements. No 2022 or 2024 data is present. Healthcare/2021/8-K and energy/2025/8-K are unfilled combinations.

AI classifications are provisional and have not been independently accuracy-validated. The data contains 106 substantive primary labels and eight intentional Other labels. Six records have medium-confidence judgments. Source-version and filing/acceptance-date differences are flagged in record details and metadata. Read the on-page methodology before interpreting the results.

## Architecture and retention

Plain HTML, CSS and JavaScript; no build step or backend. Visitor queries filter the prepared metadata locally. No ChatGPT login, AI API calls, tracking, visitor registration or live SEC scraping is required. Only metadata, classifications, short paraphrased reasons and SEC links are hosted; full contract texts are not retained in this repository.

`data/dataset.json` is the frozen research metadata release dated November 4, 2026. `downloads/research-release.zip` includes the research methodology, data and disclaimers. No automatic refresh is configured.

## Run locally

Run `python3 -m http.server 4173` from this directory, then open `http://127.0.0.1:4173/`. Use a web server rather than opening the HTML as a file so the browser can load the metadata.

## Publish

GitHub Pages publishes the repository's `main` branch from `/ (root)`. `.nojekyll` disables Jekyll processing. All assets use relative URLs so the site works under a project path. No custom domain or paid service is required.
