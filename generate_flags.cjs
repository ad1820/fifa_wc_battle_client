const fs = require('fs');

fetch('https://restcountries.com/v3.1/all')
  .then(r => r.json())
  .then(d => {
    const map = {};
    d.forEach(c => {
      map[c.name.common] = c.flag;
      if (c.name.common === 'United States') map['USA'] = c.flag;
      if (c.name.common === 'United Kingdom') {
        map['England'] = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
        map['Scotland'] = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
        map['Wales'] = '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
        map['Northern Ireland'] = '🇬🇧';
      }
      if (c.name.common === 'South Korea') map['Korea Republic'] = c.flag;
    });
    
    // Some football specific overrides
    map['England'] = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    map['Scotland'] = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
    map['Wales'] = '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
    map['DR Congo'] = '🇨🇩';
    map['Cape Verde'] = '🇨🇻';
    map['Curacao'] = '🇨🇼';
    map['Curaçao'] = '🇨🇼';
    map['Czech Republic'] = '🇨🇿';
    map['South Korea'] = '🇰🇷';
    map['Ivory Coast'] = '🇨🇮';
    map['Republic of Ireland'] = '🇮🇪';
    
    fs.mkdirSync('src/utils', { recursive: true });
    fs.writeFileSync('src/utils/countryEmoji.js', 
`export const countryEmojiMap = ${JSON.stringify(map, null, 2)};

export const getCountryEmoji = (name) => {
    if (!name) return '🌍';
    return countryEmojiMap[name] || '🌍';
};
`);
    console.log('Done');
  })
  .catch(console.error);
