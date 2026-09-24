/**
 * One-off DB seed for the mobile-UX audit test accounts (mobaudit01/02/03).
 * Gives each account a fully-populated user row (skips CreateAvatar),
 * bag items, pokedex entries, and a mix of party + box Pokemon so every
 * screen (Bag, Pokedex, PC, Shop, Evolve/Enhance) has real content to test.
 *
 * Run from /home/user/pkmnsol-server:
 *   dotenv -e .env.dev -- ts-node -r tsconfig-paths/register \
 *     /tmp/.../seed-mobile-audit.ts
 */
import { db } from '../lib/db';
import { account, user, userCostume, userItem, userPokedex, userPokemon } from '../lib/schema';
import { eq, and } from 'drizzle-orm';
import { PokemonGender } from '../lib/types';

const USERNAMES = ['mobaudit01', 'mobaudit02', 'mobaudit03'];

// Spawn right next to the safari-zone entrance NPC (43,21) and close to the
// mart/boutique/bike doors on the p001 plaza map, so we don't have to walk
// far to reach any of the audited features.
const MAP = 'p001';
const SPAWN_X = 42;
const SPAWN_Y = 23;

const BAG_ITEMS: { itemId: string; quantity: number; register?: boolean }[] = [
  { itemId: 'safari-ball', quantity: 30 },
  { itemId: 'safari-zone-ticket', quantity: 10 },
  { itemId: 'repel', quantity: 5 },
  { itemId: 'super-repel', quantity: 3 },
  { itemId: 'fire-stone', quantity: 3, register: true },
  { itemId: 'water-stone', quantity: 2 },
  { itemId: 'helix-fossil', quantity: 1 },
  { itemId: 'dome-fossil', quantity: 1 },
  { itemId: 'old-amber', quantity: 1 },
  { itemId: 'normal-candy', quantity: 10 },
  { itemId: 'experience-candy-m', quantity: 5 },
  { itemId: 'nugget', quantity: 3 },
  { itemId: 'pearl', quantity: 4 },
  { itemId: 'ability-capsule', quantity: 2 },
  { itemId: 'bicycle', quantity: 1, register: true },
];

const POKEDEX_ENTRIES = [
  '0001',
  '0002',
  '0004',
  '0007',
  '0025',
  '0037',
  '0129',
  '0133',
  '0152',
  '0155',
  '0158',
  '0252',
];

interface PokeSpec {
  pokedexId: string;
  level: number;
  ability: string;
  partySlot?: number;
  boxNumber?: number;
  gridNumber?: number;
  nickname?: string;
  heldItemId?: string;
  isShiny?: boolean;
}

// 5 in party (one nicknamed, one holding an item, one evolution-eligible,
// one shiny) + 6 spread across box 1 so the PC grid isn't empty either.
const POKEMON: PokeSpec[] = [
  { pokedexId: '0001', level: 16, ability: 'overgrow', partySlot: 0, nickname: 'Buddy' },
  { pokedexId: '0004', level: 20, ability: 'blaze', partySlot: 1, heldItemId: 'oval-stone' },
  { pokedexId: '0007', level: 12, ability: 'torrent', partySlot: 2 },
  { pokedexId: '0025', level: 30, ability: 'static', partySlot: 3, isShiny: true },
  { pokedexId: '0037', level: 18, ability: 'flash-fire', partySlot: 4 },
  { pokedexId: '0129', level: 5, ability: 'swift-swim', boxNumber: 1, gridNumber: 0 },
  { pokedexId: '0133', level: 8, ability: 'run-away', boxNumber: 1, gridNumber: 1 },
  { pokedexId: '0152', level: 5, ability: 'overgrow', boxNumber: 1, gridNumber: 2 },
  { pokedexId: '0155', level: 5, ability: 'blaze', boxNumber: 1, gridNumber: 3 },
  { pokedexId: '0158', level: 5, ability: 'torrent', boxNumber: 1, gridNumber: 4 },
  { pokedexId: '0252', level: 5, ability: 'overgrow', boxNumber: 1, gridNumber: 5 },
];

async function seedAccount(username: string, idx: number) {
  const [acc] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.provider, 'local'), eq(account.providerId, username)));

  if (!acc) {
    console.log(`[skip] account not found: ${username} (register it via the API first)`);
    return;
  }
  const accountId = acc.id;

  const [existingUser] = await db.select().from(user).where(eq(user.accountId, accountId));
  if (existingUser) {
    console.log(`[user] ${username}: already has a user row, leaving it as-is`);
  } else {
    const gender = idx % 2 === 0 ? PokemonGender.MALE : PokemonGender.FEMALE;
    await db.insert(user).values({
      accountId,
      nickname: username,
      money: 20000,
      gender,
      hasStarter: true,
      lastMapId: MAP,
      lastX: SPAWN_X,
      lastY: SPAWN_Y,
    });
    const g = gender === PokemonGender.MALE ? 'm' : 'f';
    await db.insert(userCostume).values(
      ['skin_0', `${g}_hair_0_c0`, `${g}_outfit_0`].map((costumeId) => ({
        accountId,
        costumeId,
        isEquipped: true,
      })),
    );
    console.log(`[user] ${username}: created (accountId=${accountId})`);
  }

  for (const it of BAG_ITEMS) {
    await db
      .insert(userItem)
      .values({ accountId, itemId: it.itemId, quantity: it.quantity, register: !!it.register })
      .onConflictDoUpdate({
        target: [userItem.accountId, userItem.itemId],
        set: { quantity: it.quantity, register: !!it.register },
      });
  }
  console.log(`[items] ${username}: ${BAG_ITEMS.length} item rows upserted`);

  for (const pid of POKEDEX_ENTRIES) {
    await db
      .insert(userPokedex)
      .values({ accountId, pokedexId: pid, caughtCount: 1 })
      .onConflictDoNothing();
  }
  console.log(`[pokedex] ${username}: ${POKEDEX_ENTRIES.length} entries ensured`);

  const existingPokemon = await db
    .select({ id: userPokemon.id })
    .from(userPokemon)
    .where(eq(userPokemon.accountId, accountId));
  if (existingPokemon.length > 0) {
    console.log(`[pokemon] ${username}: already has ${existingPokemon.length} pokemon, skipping`);
  } else {
    for (const p of POKEMON) {
      await db.insert(userPokemon).values({
        accountId,
        pokedexId: p.pokedexId,
        level: p.level,
        exp: 0,
        friendship: 70,
        gender: 1,
        isShiny: !!p.isShiny,
        nickname: p.nickname ?? null,
        tier: null,
        abilityId: p.ability,
        natureId: 'hardy',
        skills: [],
        heldItemId: p.heldItemId ?? null,
        boxNumber: p.boxNumber ?? null,
        gridNumber: p.gridNumber ?? null,
        partySlot: p.partySlot ?? null,
        ballId: 1,
        caughtLocation: MAP,
      });
    }
    console.log(`[pokemon] ${username}: inserted ${POKEMON.length} pokemon`);
  }
}

async function main() {
  for (let i = 0; i < USERNAMES.length; i++) {
    await seedAccount(USERNAMES[i], i);
  }
  console.log('done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
