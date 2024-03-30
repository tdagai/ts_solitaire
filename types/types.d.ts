import { RANK, SUIT } from '../constants';

type Card = {
  rank: RANK;
  suit: SUIT;
  isVisible: boolean;
};

type Foundations = {
  f1: Card[];
  f2: Card[];
  f3: Card[];
  f4: Card[];
};

type GameMove = 'dr' | 'draw' | 'mv' | 'move' | 'un' | 'undo' | 're' | 'redo';

type GameAction = {
  move: GameMove;
  target: Targets;
  destination: Destinations;
};

type GameState = {
  stockpile: Card[];
  waste: Card[];
  foundations: Foundations;
  piles: Card[][];
  warning: string;
  numMoves: number;
  actions: GameAction[];
}
type Destinations = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'fo' | 'f1' | 'f2' | 'f3' | 'f4';

type Targets = 'wa' | Destinations;

export type {
  Card,
  Foundations,
  GameAction,
  GameState,
  Destinations,
  Targets,
}