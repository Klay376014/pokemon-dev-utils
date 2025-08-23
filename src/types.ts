export interface PokemonTeamMember {
  name: string;
  level: number;
  gender?: 'Male' | 'Female';
  ability?: string;
  item?: string;
  nature?: string;
  teraType?: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  moves: string[];
}

export interface PokemonTeam {
  title?: string;
  author?: string;
  notes?: string;
  pokemon: PokemonTeamMember[];
  metadata: {
    source: 'pokepaste';
    parsedAt: string;
    originalUrl?: string;
  };
}

export interface ParseResult {
  success: boolean;
  data?: PokemonTeam;
  error?: string;
}