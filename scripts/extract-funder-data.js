const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(
  __dirname,
  '../../../../overleaf_projects/orcid-audit-2025/output/funder_adoption_enhanced.csv'
);
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../public/data/orcid/funder-adoption.json'
);

/**
 * Parse a single CSV line, respecting quoted fields that may contain commas.
 */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim() !== '');

  // First line is the header; parse to get column indices
  const headerFields = parseCsvLine(lines[0]);
  const col = {};
  headerFields.forEach((name, i) => {
    col[name] = i;
  });

  console.log('Detected columns:', headerFields.join(', '));

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);

    const research_pool = parseFloat(fields[col['research_pool']]);
    if (isNaN(research_pool) || research_pool <= 100) {
      continue;
    }

    const orcid_researchers = parseFloat(fields[col['orcid_researchers']]);
    const percentage_orcid = parseFloat(fields[col['percentage_orcid']]);
    const orcid_completeness = parseFloat(fields[col['orcid_completeness']]);

    results.push({
      funder: fields[col['funder']],
      country: fields[col['country']],
      income_group: fields[col['income_group']],
      region: fields[col['region']],
      research_pool,
      orcid_researchers,
      percentage_orcid: Math.round(percentage_orcid * 100) / 100,
      orcid_completeness: Math.round(orcid_completeness * 100) / 100,
    });
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(
    `Wrote ${results.length} funders (research_pool > 100) to ${OUTPUT_PATH}`
  );
}

main();
