const path = require('path');
const fs = require('fs');

let domainMap = new Map();
let universitiesList = [];
let isLoaded = false;

function loadUniversityData() {
  if (isLoaded) return;
  try {
    const dataPath = path.join(__dirname, '../data/world_universities.json');
    if (!fs.existsSync(dataPath)) {
      console.warn('[UniversityService] world_universities.json not found at', dataPath);
      return;
    }
    const raw = fs.readFileSync(dataPath, 'utf8');
    universitiesList = JSON.parse(raw);

    domainMap = new Map();
    for (const uni of universitiesList) {
      if (Array.isArray(uni.domains)) {
        for (const dom of uni.domains) {
          if (dom) {
            const cleanDom = dom.toLowerCase().trim();
            // Don't overwrite if already set by a more specific entry
            if (!domainMap.has(cleanDom)) {
              domainMap.set(cleanDom, uni);
            }
          }
        }
      }
    }
    isLoaded = true;
    console.log(`[UniversityService] Loaded ${universitiesList.length} universities and ${domainMap.size} domains.`);
  } catch (err) {
    console.error('[UniversityService] Failed to load world_universities.json:', err);
  }
}

// Initial load
loadUniversityData();

/**
 * Extract domain from email
 */
function extractDomain(email) {
  if (!email || typeof email !== 'string') return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;
  return parts[1].trim();
}

/**
 * Resolve university from an email or domain string.
 * Handles subdomains, e.g., 'smail.iitm.ac.in' -> 'iitm.ac.in'
 */
function findUniversityByDomain(emailOrDomain) {
  loadUniversityData();
  if (!emailOrDomain) return null;

  let domain = emailOrDomain.includes('@') ? extractDomain(emailOrDomain) : emailOrDomain.toLowerCase().trim();
  if (!domain) return null;

  // 1. Direct match
  if (domainMap.has(domain)) {
    return {
      name: domainMap.get(domain).name,
      country: domainMap.get(domain).country,
      domain: domain,
      web_pages: domainMap.get(domain).web_pages || []
    };
  }

  // 2. Subdomain walk-up: e.g. "smail.iitm.ac.in" -> parts: ["smail", "iitm", "ac", "in"]
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join('.');
    if (domainMap.has(parentDomain)) {
      return {
        name: domainMap.get(parentDomain).name,
        country: domainMap.get(parentDomain).country,
        domain: parentDomain,
        matchedDomain: domain,
        web_pages: domainMap.get(parentDomain).web_pages || []
      };
    }
  }

  // 3. Fallback for academic TLDs if not in database (.edu, .ac.in, .edu.in, .ac.uk, .edu.au)
  const isEduTld = /\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2})$/i.test(domain);
  if (isEduTld) {
    // Attempt formatted name from domain
    const mainPart = parts[0] === 'smail' || parts[0] === 'mail' || parts[0] === 'email' ? parts[1] : parts[0];
    const inferredName = mainPart.toUpperCase() + ' Academic Institution';
    return {
      name: inferredName,
      country: 'Global',
      domain: domain,
      isInferred: true,
      web_pages: [`https://${domain}`]
    };
  }

  return null;
}

/**
 * Search universities by name or domain query (up to limit results)
 */
function searchUniversities(query, limit = 10) {
  loadUniversityData();
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }
  const cleanQ = query.toLowerCase().trim();
  const results = [];

  for (const uni of universitiesList) {
    const nameMatch = uni.name && uni.name.toLowerCase().includes(cleanQ);
    const domainMatch = Array.isArray(uni.domains) && uni.domains.some((d) => d.toLowerCase().includes(cleanQ));
    if (nameMatch || domainMatch) {
      results.push({
        name: uni.name,
        country: uni.country,
        domains: uni.domains,
        primaryDomain: uni.domains?.[0] || null
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

module.exports = {
  findUniversityByDomain,
  searchUniversities,
  extractDomain
};
