import type { Card, Foundations } from "./types";
import { SUIT, RANK } from "../constants";
declare const _default: {
    createCard: (rank: RANK, suit: SUIT) => Card;
    isBlack: (card: Card) => boolean;
    isRed: (card: Card) => boolean;
    isSameSuit: (first: Card, second: Card) => boolean;
    isAlternateColor: (first: Card, second: Card) => boolean;
    isInSequence: (lower: Card, higher: Card) => boolean;
    canBePlacedOnBottom: (parent: Card, child: Card) => boolean;
    canBePlacedOnFoundation: (parent: Card, child: Card) => boolean;
    prepareToDisplayCard: (card: Card) => string;
    shuffleDeck: (deck: Card[]) => Card[];
    fromStockpileToWaste: (stockpile: Card[], waste: Card[]) => void;
    refillStockpile: (stockpile: Card[], waste: Card[]) => {
        stockpile: Card[];
        waste: Card[];
    };
    moveFromWasteToFoundation: (waste: Card[], foundations: Foundations) => {
        waste: Card[];
        foundations: Foundations;
    };
};
export default _default;
