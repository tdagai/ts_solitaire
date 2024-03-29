const assert = require("assert");
const { it, describe } = require("mocha");
const { RANK, SUIT } = require("../constants.ts");
const { createCard,
  isBlack,
  isRed,
  isAlternateColor,
  isSameSuit,
  isInSequence,
  canBePlacedOnBottom,
  canBePlacedOnFoundation,
  shuffleDeck,
  fromStockpileToWaste,
  prepareToDisplayCard,
  refillStockpile,
  moveToFoundation,
} = require("../helpers.ts");
const sinon = require("sinon");

describe('Helper Function Tests', () => {
  describe('Rank & Suit Tests', () => {
    it('should find that a Spade and a Club are black', () => {
      const c6s = createCard(RANK.RANK_6, SUIT.SPADE);
      const ckc = createCard(RANK.RANK_K, SUIT.CLUB);

      assert.equal(isBlack(c6s), true);
      assert.equal(isBlack(ckc), true);
    });
    it('should find that a Diamond and a Heart are red', () => {
      const c6d = createCard(RANK.RANK_6, SUIT.DIAMOND);
      const cah = createCard(RANK.RANK_A, SUIT.HEART);

      assert.equal(isRed(c6d), true);
      assert.equal(isRed(cah), true);
    });
    it('should find that a Spade and a Club are not red', () => {
      const c6s = createCard(RANK.RANK_6, SUIT.SPADE);
      const ckc = createCard(RANK.RANK_K, SUIT.CLUB);

      assert.notEqual(isRed(c6s), true);
      assert.notEqual(isRed(ckc), true);
    });
    it('should find that a Diamond and a Heart are not black', () => {
      const c6d = createCard(RANK.RANK_6, SUIT.DIAMOND);
      const cah = createCard(RANK.RANK_A, SUIT.HEART);

      assert.notEqual(isBlack(c6d), true);
      assert.notEqual(isBlack(cah), true);
    });

    it('should find that a Spade and a Heart ARE NOT the same color', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c2h = createCard(RANK.RANK_2, SUIT.HEART);

      assert.equal(isAlternateColor(c7s, c2h), true);
    });
    it('should find that a Spade and a Club ARE the same color', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c2c = createCard(RANK.RANK_2, SUIT.CLUB);

      assert.equal(isAlternateColor(c7s, c2c), false);
    });

    it('should find that two cards have the same suit', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c2s = createCard(RANK.RANK_2, SUIT.SPADE);

      assert.equal(isSameSuit(c7s, c2s), true);
    });
    it('should find that two cards don\'t have the same suit', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c2d = createCard(RANK.RANK_2, SUIT.DIAMOND);

      assert.notEqual(isSameSuit(c7s, c2d), true);
    });

    it('should find that two cards are in a sequence, no matter the suit', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c8s = createCard(RANK.RANK_8, SUIT.SPADE);
      const c8c = createCard(RANK.RANK_8, SUIT.CLUB);
      const c8h = createCard(RANK.RANK_8, SUIT.HEART);

      assert.equal(isInSequence(c7s, c8s), true);
      assert.equal(isInSequence(c7s, c8c), true);
      assert.equal(isInSequence(c7s, c8h), true);
    });

    it('should be able to tell if cards can be placed on top of one another\n\t(A card can be placed on another if they are in sequence and have alternate colors)', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c6d = createCard(RANK.RANK_6, SUIT.DIAMOND);

      assert.equal(canBePlacedOnBottom(c7s, c6d), true);
    });
    it('should not be able to place cards from the same suit on top of one another', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c6s = createCard(RANK.RANK_6, SUIT.SPADE);

      assert.notEqual(canBePlacedOnBottom(c7s, c6s), true);
    });
    it('should not be able to place cards that are not sequential on top of one another, no matter the suit', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c10c = createCard(RANK.RANK_10, SUIT.CLUB);
      const cAh = createCard(RANK.RANK_A, SUIT.HEART);
      const c5d = createCard(RANK.RANK_5, SUIT.DIAMOND);

      assert.notEqual(canBePlacedOnBottom(c7s, c10c), true);
      assert.notEqual(canBePlacedOnBottom(c7s, cAh), true);
      assert.notEqual(canBePlacedOnBottom(c7s, c5d), true);
    });

    it('should be able to be placed on a foundation\n\t(A card can be placed on foundation if it is in sequence and has the same suit)', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c8s = createCard(RANK.RANK_8, SUIT.SPADE);

      assert.equal(canBePlacedOnFoundation(c8s, c7s), true);
    });
    it('should not be able to be placed on a foundation if both cards have different suits,\n\teven if they are sequential', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c8c = createCard(RANK.RANK_8, SUIT.CLUB);

      assert.notEqual(canBePlacedOnFoundation(c8c, c7s), true);
    });
    it('should not be able to be placed on a foundation if both cards are not sequential,\n\teven if they share the same suit', () => {
      const c7s = createCard(RANK.RANK_7, SUIT.SPADE);
      const c4s = createCard(RANK.RANK_4, SUIT.SPADE);

      assert.notEqual(canBePlacedOnFoundation(c7s, c4s), true);
    });
  });

  describe('Deck Helpers Tests', () => {
    const deck = [
      { rank: RANK.RANK_10, suit: SUIT.CLUB },
      { rank: RANK.RANK_7, suit: SUIT.DIAMOND },
      { rank: RANK.RANK_A, suit: SUIT.SPADE },
      { rank: RANK.RANK_3, suit: SUIT.CLUB },
      { rank: RANK.RANK_10, suit: SUIT.HEART },
    ];

    it('should prepare the deck for display', () => {
      const referenceDeck = ['10♣', '7♦', 'A♠', '3♣', '10♥'];
      const displayReadyDeck = [];
      deck.forEach((card, i) => displayReadyDeck[i] = prepareToDisplayCard(card));
      assert.deepEqual(referenceDeck, displayReadyDeck);
    });
    it('should shuffle the deck', () => {
      const rearrangedDeck = shuffleDeck(deck);
      assert.notDeepEqual(rearrangedDeck, deck);
    });
  });

  describe('Game Functions', () => {
    const referenceDeck = [
      { rank: RANK.RANK_10, suit: SUIT.CLUB, isVisible: false },
      { rank: RANK.RANK_7, suit: SUIT.DIAMOND, isVisible: false },
      { rank: RANK.RANK_A, suit: SUIT.SPADE, isVisible: false },
      { rank: RANK.RANK_3, suit: SUIT.CLUB, isVisible: false },
      { rank: RANK.RANK_10, suit: SUIT.HEART, isVisible: false },
    ];

    it('should move a card from the stockpile to the waste', () => {
      const testDeck = referenceDeck.slice();
      const waste = [];
      for (let i = 0; i < referenceDeck.length; i++) {
        fromStockpileToWaste(testDeck, waste);
      }
      assert.deepEqual(waste, referenceDeck.reverse());
      assert.ok(waste[0].isVisible)
    });
    it('should refill the stockpile to be the same order it was before and make sure the waste is empty', () => {
      let mockGameState = {
        stockpile: referenceDeck.slice(),
        waste: [],
      };
      while (mockGameState.stockpile.length) {
        fromStockpileToWaste(mockGameState.stockpile, mockGameState.waste);
      }
      mockGameState = refillStockpile(mockGameState.stockpile, mockGameState.waste);
      assert.deepEqual(mockGameState.stockpile, referenceDeck);
      assert.deepEqual(mockGameState.waste, []);
      assert.equal(mockGameState.stockpile[0].isVisible, false);
    });
    describe('moveToFoundation', () => {
      let stub;
      beforeEach(() => {
        stub = sinon.stub(console, 'warn');
      });
      afterEach(() => {
        stub.restore();
      })
      it('should move an Ace from the waste to the first available foundation', () => {
        let mockGameState = {
          foundations: {
            foundation1: [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }],
            foundation2: [{ rank: RANK.RANK_A, suit: SUIT.CLUB }],
            foundation3: [],
            foundation4: [],
          },
          waste: [
            { rank: RANK.RANK_A, suit: SUIT.SPADE },
            { rank: RANK.RANK_4, suit: SUIT.CLUB },
            { rank: RANK.RANK_2, suit: SUIT.HEART },
          ]
        };

        const stateAfterMoving = moveToFoundation(mockGameState.waste, mockGameState.foundations);
        mockGameState.waste = stateAfterMoving.cardPile;
        mockGameState.foundations = stateAfterMoving.foundations;
        assert.deepEqual(
          mockGameState.foundations.foundation1,
          [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation2,
          [{ rank: RANK.RANK_A, suit: SUIT.CLUB }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation3,
          [{ rank: RANK.RANK_A, suit: SUIT.SPADE }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation4,
          []
        );
        assert.equal(mockGameState.waste.length, 2);
        assert.equal(stub.calledOnce, false);
      });
      it('should move a card from a pile to a foundation that matches it\'s suit', () => {
        let mockGameState = {
          foundations: {
            foundation1: [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }],
            foundation2: [{ rank: RANK.RANK_A, suit: SUIT.CLUB }],
            foundation3: [],
            foundation4: [],
          },
          waste: [
            { rank: RANK.RANK_2, suit: SUIT.CLUB },
            { rank: RANK.RANK_4, suit: SUIT.CLUB },
            { rank: RANK.RANK_2, suit: SUIT.HEART },
          ]
        };

        const stateAfterMoving = moveToFoundation(mockGameState.waste, mockGameState.foundations);
        mockGameState.waste = stateAfterMoving.cardPile;
        mockGameState.foundations = stateAfterMoving.foundations;
        assert.deepEqual(
          mockGameState.foundations.foundation1,
          [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation2,
          [
            { rank: RANK.RANK_2, suit: SUIT.CLUB },
            { rank: RANK.RANK_A, suit: SUIT.CLUB },
          ]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation3,
          []
        );
        assert.deepEqual(
          mockGameState.foundations.foundation4,
          []
        );
        assert.equal(mockGameState.waste.length, 2);
        assert.equal(stub.calledOnce, false);
      });
      it('should not allow a non-sequential card to be moved from the waste to a foundation\n\t  and should issue a warning instead', () => {
        let mockGameState = {
          foundations: {
            foundation1: [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }],
            foundation2: [],
            foundation3: [
              { rank: RANK.RANK_2, suit: SUIT.HEART },
              { rank: RANK.RANK_A, suit: SUIT.HEART }
            ],
            foundation4: [],
          },
          waste: [
            { rank: RANK.RANK_5, suit: SUIT.HEART },
            { rank: RANK.RANK_4, suit: SUIT.CLUB },
            { rank: RANK.RANK_2, suit: SUIT.HEART },
          ]
        };

        const stateAfterMoving = moveToFoundation(mockGameState.waste, mockGameState.foundations);
        mockGameState.waste = stateAfterMoving.cardPile;
        mockGameState.foundations = stateAfterMoving.foundations;

        assert.deepEqual(
          mockGameState.foundations.foundation1,
          [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation2,
          []
        );
        assert.deepEqual(
          mockGameState.foundations.foundation3,
          [
            { rank: RANK.RANK_2, suit: SUIT.HEART },
            { rank: RANK.RANK_A, suit: SUIT.HEART }
          ]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation4,
          []
        );
        assert.equal(mockGameState.waste.length, 3);
        assert.equal(stub.calledOnce, true);
      });
      it('should throw a warning if the user tries to move a card from an empty wastes', () => {
        let mockGameState = {
          foundations: {
            foundation1: [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }],
            foundation2: [],
            foundation3: [
              { rank: RANK.RANK_2, suit: SUIT.HEART },
              { rank: RANK.RANK_A, suit: SUIT.HEART }
            ],
            foundation4: [],
          },
          waste: []
        };

        const stateAfterMoving = moveToFoundation(mockGameState.waste, mockGameState.foundations);
        mockGameState.waste = stateAfterMoving.cardPile;
        mockGameState.foundations = stateAfterMoving.foundations;

        assert.deepEqual(
          mockGameState.foundations.foundation1,
          [{ rank: RANK.RANK_A, suit: SUIT.DIAMOND }]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation2,
          []
        );
        assert.deepEqual(
          mockGameState.foundations.foundation3,
          [
            { rank: RANK.RANK_2, suit: SUIT.HEART },
            { rank: RANK.RANK_A, suit: SUIT.HEART }
          ]
        );
        assert.deepEqual(
          mockGameState.foundations.foundation4,
          []
        );
        assert.equal(mockGameState.waste.length, 0);
        assert.equal(stub.calledOnce, true);
      });
    });
  });
});