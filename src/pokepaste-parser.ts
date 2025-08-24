import type { PokemonTeam, PokemonTeamMember, ParseResult } from './types.js';

const NATURE_MODIFIERS: Record<string, { plus?: string; minus?: string }> = {
  Hardy: {},
  Lonely: { plus: "attack", minus: "defense" },
  Brave: { plus: "attack", minus: "speed" },
  Adamant: { plus: "attack", minus: "specialAttack" },
  Naughty: { plus: "attack", minus: "specialDefense" },
  Bold: { plus: "defense", minus: "attack" },
  Docile: {},
  Relaxed: { plus: "defense", minus: "speed" },
  Impish: { plus: "defense", minus: "specialAttack" },
  Lax: { plus: "defense", minus: "specialDefense" },
  Timid: { plus: "speed", minus: "attack" },
  Hasty: { plus: "speed", minus: "defense" },
  Serious: {},
  Jolly: { plus: "speed", minus: "specialAttack" },
  Naive: { plus: "speed", minus: "specialDefense" },
  Modest: { plus: "specialAttack", minus: "attack" },
  Mild: { plus: "specialAttack", minus: "defense" },
  Quiet: { plus: "specialAttack", minus: "speed" },
  Bashful: {},
  Rash: { plus: "specialAttack", minus: "specialDefense" },
  Calm: { plus: "specialDefense", minus: "attack" },
  Gentle: { plus: "specialDefense", minus: "defense" },
  Sassy: { plus: "specialDefense", minus: "speed" },
  Careful: { plus: "specialDefense", minus: "specialAttack" },
  Quirky: {},
};

export async function parsePokepasteUrl(url: string): Promise<ParseResult> {
  try {
    const jsonUrl = url.endsWith('/json') ? url : `${url}/json`;
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json() as { paste: string; title?: string; author?: string; notes?: string };
    
    return parsePokepasteText(data.paste, {
      title: data.title,
      author: data.author,
      format: data.notes,
      originalUrl: url
    });
  } catch (error) {
    return {
      success: false,
      error: `解析 URL 失敗: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export function parsePokepasteText(
  pasteText: string, 
  metadata?: { title?: string; author?: string; format?: string; originalUrl?: string }
): ParseResult {
  try {
    const pokemonBlocks = pasteText
      .split(/\r?\n\r?\n/)
      .filter(block => block.trim().length > 0);

    const pokemon: PokemonTeamMember[] = [];

    for (const block of pokemonBlocks) {
      const parsed = parsePokemonBlock(block);
      if (parsed) {
        pokemon.push(parsed);
      }
    }

    if (pokemon.length === 0) {
      return {
        success: false,
        error: '未找到有效的寶可夢資料'
      };
    }

    const team: PokemonTeam = {
      title: metadata?.title,
      author: metadata?.author,
      format: metadata?.format?.replace('Format: ', '') ?? '',
      pokemon,
      metadata: {
        source: 'pokepaste',
        parsedAt: new Date().toISOString(),
        originalUrl: metadata?.originalUrl
      }
    };

    return {
      success: true,
      data: team
    };
  } catch (error) {
    return {
      success: false,
      error: `解析文字失敗: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function parsePokemonBlock(block: string): PokemonTeamMember | null {
  const lines = block.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return null;

  // 檢查是否包含寶可夢名稱
  const firstLine = lines[0];
  if (!firstLine || (!firstLine.includes('@') && !firstLine.match(/^[A-Za-z\-\s\(\)]+$/))) {
    return null;
  }

  const pokemon: Partial<PokemonTeamMember> = {
    level: 50,
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
    stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (i === 0) {
      // 第一行：名稱和道具
      const [nameWithGender, item] = line.split(' @ ');
      if (nameWithGender) {
        let name = nameWithGender.trim();
        if (name.includes('(M)')) {
          pokemon.gender = 'Male';
          name = name.replace(/ \(M\)/, '');
        } else if (name.includes('(F)')) {
          pokemon.gender = 'Female';
          name = name.replace(/ \(F\)/, '');
        }
        pokemon.name = name;
      }
      if (item) {
        pokemon.item = item.trim();
      }
    } else if (line.startsWith('Ability: ')) {
      pokemon.ability = line.replace('Ability: ', '').trim();
    } else if (line.startsWith('Level: ')) {
      pokemon.level = parseInt(line.replace('Level: ', '').trim()) || 50;
    } else if (line.startsWith('Tera Type: ')) {
      pokemon.teraType = line.replace('Tera Type: ', '').trim();
    } else if (line.startsWith('EVs: ')) {
      const evString = line.replace('EVs: ', '').trim();
      const parsedEvs = parseStats(evString);
      Object.assign(pokemon.evs!, parsedEvs);
    } else if (line.startsWith('IVs: ')) {
      const ivString = line.replace('IVs: ', '').trim();
      const parsedIvs = parseStats(ivString);
      Object.assign(pokemon.ivs!, parsedIvs);
    } else if (line.includes(' Nature')) {
      const natureName = line.replace(' Nature', '').trim();
      pokemon.nature = natureName;
    } else if (line.startsWith('- ')) {
      const move = line.replace('- ', '').trim();
      pokemon.moves?.push(move);
    }
  }

  if (!pokemon.name) return null;

  return pokemon as PokemonTeamMember;
}

function parseStats(statString: string): Partial<PokemonTeamMember['evs']> {
  const stats: Partial<PokemonTeamMember['evs']> = {};
  
  const statPairs = statString.split(' / ');
  
  for (const pair of statPairs) {
    const [value, statName] = pair.trim().split(' ');
    const numValue = parseInt(value);
    
    if (!isNaN(numValue) && statName) {
      const key = getStatKey(statName.trim());
      if (key) {
        stats[key] = numValue;
      }
    }
  }
  
  return stats;
}

function getStatKey(statName: string): keyof PokemonTeamMember['evs'] | null {
  switch (statName.toLowerCase()) {
    case 'hp': return 'hp';
    case 'atk': return 'attack';
    case 'def': return 'defense';
    case 'spa': return 'specialAttack';
    case 'spd': return 'specialDefense';
    case 'spe': return 'speed';
    default: return null;
  }
}