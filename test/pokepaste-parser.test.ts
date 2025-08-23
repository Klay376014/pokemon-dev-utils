import { test, expect, describe } from 'bun:test';
import { parsePokepasteText, parsePokepasteUrl } from '../src/pokepaste-parser';

describe('Pokepaste Parser', () => {
  const samplePokemonText = `Garchomp (M) @ Choice Scarf
Ability: Rough Skin
Level: 50
Tera Type: Ground
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Fire Fang`;

  const sampleTeamText = `Garchomp (M) @ Choice Scarf
Ability: Rough Skin
Level: 50
Tera Type: Ground
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Earthquake
- Dragon Claw
- Stone Edge
- Fire Fang

Rotom-Wash @ Leftovers
Ability: Levitate
Level: 50
Tera Type: Water
EVs: 248 HP / 8 SpA / 252 SpD
Calm Nature
IVs: 0 Atk
- Volt Switch
- Hydro Pump
- Will-O-Wisp
- Pain Split`;

  test('解析單隻寶可夢基本資訊', () => {
    const result = parsePokepasteText(samplePokemonText);
    
    expect(result.success).toBe(true);
    expect(result.data?.pokemon).toHaveLength(1);
    
    const pokemon = result.data!.pokemon[0];
    expect(pokemon.name).toBe('Garchomp');
    expect(pokemon.gender).toBe('Male');
    expect(pokemon.item).toBe('Choice Scarf');
    expect(pokemon.ability).toBe('Rough Skin');
    expect(pokemon.level).toBe(50);
    expect(pokemon.teraType).toBe('Ground');
    expect(pokemon.nature).toBe('Adamant');
  });

  test('解析努力值 (EVs)', () => {
    const result = parsePokepasteText(samplePokemonText);
    const pokemon = result.data!.pokemon[0];
    
    expect(pokemon.evs.hp).toBe(4);
    expect(pokemon.evs.attack).toBe(252);
    expect(pokemon.evs.defense).toBe(0);
    expect(pokemon.evs.specialAttack).toBe(0);
    expect(pokemon.evs.specialDefense).toBe(0);
    expect(pokemon.evs.speed).toBe(252);
  });

  test('解析個體值 (IVs)', () => {
    const result = parsePokepasteText(sampleTeamText);
    const rotom = result.data!.pokemon[1];
    
    expect(rotom.ivs.attack).toBe(0);
    expect(rotom.ivs.hp).toBe(31); // 預設值
  });

  test('解析招式列表', () => {
    const result = parsePokepasteText(samplePokemonText);
    const pokemon = result.data!.pokemon[0];
    
    expect(pokemon.moves).toHaveLength(4);
    expect(pokemon.moves).toContain('Earthquake');
    expect(pokemon.moves).toContain('Dragon Claw');
    expect(pokemon.moves).toContain('Stone Edge');
    expect(pokemon.moves).toContain('Fire Fang');
  });

  test('解析完整隊伍', () => {
    const result = parsePokepasteText(sampleTeamText);
    
    expect(result.success).toBe(true);
    expect(result.data?.pokemon).toHaveLength(2);
    expect(result.data?.pokemon[0].name).toBe('Garchomp');
    expect(result.data?.pokemon[1].name).toBe('Rotom-Wash');
  });

  test('處理空白輸入', () => {
    const result = parsePokepasteText('');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('未找到有效的寶可夢資料');
  });

  test('處理無效格式', () => {
    const result = parsePokepasteText('這不是有效的 pokepaste 格式');
    
    expect(result.success).toBe(false);
  });

  test('元資料設定', () => {
    const result = parsePokepasteText(samplePokemonText, {
      title: '測試隊伍',
      author: '測試玩家',
      originalUrl: 'https://pokepaste.es/test'
    });
    
    expect(result.data?.title).toBe('測試隊伍');
    expect(result.data?.author).toBe('測試玩家');
    expect(result.data?.metadata.originalUrl).toBe('https://pokepaste.es/test');
    expect(result.data?.metadata.source).toBe('pokepaste');
  });
});