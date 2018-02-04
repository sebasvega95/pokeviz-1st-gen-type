export interface Pokemon {
  name: string;
  type: Array<string>;
  number: number;
  pokedexEntry: string;
  weigth: number;
  height: number;
  species: string;
}

export interface HierarchicalData {
  name: string;
  value: number;
  children: Array<{
    name: string;
    children: Array<{
      name: string;
      value: number;
      number?: number;
      isPokemon?: boolean;
      isLabel?: boolean;
    }>;
  }>;
}
