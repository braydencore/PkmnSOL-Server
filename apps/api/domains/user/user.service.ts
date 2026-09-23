import { AppError } from '@poposerver/lib/utils/error';
import {
  AppErrorCode,
  AppErrorMessage,
  PokemonGender,
  UserStartLocation,
} from '@poposerver/lib/types';
import { setUserState } from '@poposerver/lib/state';
import { computeSafariTicketState } from '@poposerver/lib/constants/safari-ticket';
import { eq } from 'drizzle-orm';
import { db } from '@poposerver/lib/db';
import { account, userTownMap } from '@poposerver/lib/schema';
import { UserRepository } from './user.repository';
import { CreateUserInput } from './user.schema';

const NICKNAME_MAX_LEN = 20;

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(authId: string, dto: CreateUserInput) {
    const accountId = Number(authId);

    const existing = await this.userRepo.findByAccountId(accountId);
    if (existing) {
      throw new AppError(
        AppErrorMessage.USER_ALREADY_EXISTS,
        409,
        AppErrorCode.USER_ALREADY_EXISTS,
      );
    }

    const genderNum = dto.gender === 'male' ? PokemonGender.MALE : PokemonGender.FEMALE;
    const genderPrefix = dto.gender === 'male' ? 'm' : 'f';

    const costumeIds = [
      dto.costume.skin,
      `${genderPrefix}_${dto.costume.hair}`,
      `${genderPrefix}_${dto.costume.outfit}`,
    ];

    const { map: lastMapId, x, y } = UserStartLocation;

    const baseNickname = await this.deriveNickname(accountId);

    // The nickname is derived, not typed by the player, so there's no form
    // for them to fix a collision on -- silently disambiguate instead of
    // erroring. A collision is essentially impossible for local accounts
    // (usernames are already globally unique), but nicknames used to be
    // freely chosen, so an existing player could already be sitting on a
    // nickname that happens to equal a brand new player's username.
    for (let attempt = 0; attempt < 20; attempt++) {
      const nickname = attempt === 0 ? baseNickname : this.withSuffix(baseNickname, attempt + 1);
      try {
        await this.userRepo.createWithCostumes(
          accountId,
          nickname,
          genderNum,
          lastMapId,
          x,
          y,
          costumeIds,
        );
        return;
      } catch (error: any) {
        if (error.code === '23505') {
          if (error.constraint?.includes('nickname')) continue;
          throw new AppError(
            AppErrorMessage.USER_ALREADY_EXISTS,
            409,
            AppErrorCode.USER_ALREADY_EXISTS,
          );
        }
        throw error;
      }
    }
    throw new AppError(AppErrorMessage.NICKNAME_ALREADY_EXISTS, 409, AppErrorCode.NICKNAME_ALREADY_EXISTS);
  }

  /**
   * Local accounts: the nickname is just the login username (already
   * globally unique, 6-20 lowercase letters/numbers -- fits nickname's
   * constraints as-is). OAuth accounts have no username at all -- the
   * account table doesn't even keep their email past the login exchange --
   * so they fall back to a generic placeholder, which the caller's retry
   * loop disambiguates with a numeric suffix same as any other collision.
   */
  private async deriveNickname(accountId: number): Promise<string> {
    const [row] = await db
      .select({ provider: account.provider, providerId: account.providerId })
      .from(account)
      .where(eq(account.id, accountId))
      .limit(1);

    if (row?.provider === 'local' && row.providerId) {
      return row.providerId.slice(0, NICKNAME_MAX_LEN);
    }

    return 'Trainer';
  }

  private withSuffix(base: string, n: number): string {
    const suffix = String(n);
    return base.slice(0, NICKNAME_MAX_LEN - suffix.length) + suffix;
  }

  async getMyGameData(authId: string) {
    const accountId = Number(authId);
    const result = await this.userRepo.findGameDataByAccountId(accountId);

    if (!result) {
      throw new AppError(AppErrorMessage.USER_NOT_FOUND, 404, AppErrorCode.USER_NOT_FOUND);
    }

    const { equippedCostumes, party, itemSlots, essentialItems, pokedex, pokemonBoxCount } = result;
    const { safariTicketRegenAt, ...profile } = result.profile;
    const safariTicket = computeSafariTicketState(safariTicketRegenAt, new Date());

    const visitedMapRows = await db
      .select({ mapId: userTownMap.mapId })
      .from(userTownMap)
      .where(eq(userTownMap.accountId, accountId));
    const visitedMapIds = visitedMapRows.map((r) => r.mapId);

    const petLeader = party[0] ?? null;

    await setUserState(authId, {
      mapId: profile.lastMapId,
      x: String(profile.lastX),
      y: String(profile.lastY),
      nickname: profile.nickname,
      gender: String(profile.gender),
      costume: JSON.stringify(equippedCostumes),
      socketId: '',
      'pet:pokedexId': petLeader ? String(petLeader.pokedexId) : '',
      'pet:isShiny': petLeader?.isShiny ? '1' : '0',
      createdAt: new Date().toISOString(),
      lastMoveTime: String(Date.now()),
      visitedMaps: JSON.stringify(visitedMapIds),
    });

    return {
      profile,
      equippedCostumes,
      party,
      itemSlots,
      essentialItems,
      pokedex,
      pokemonBoxCount,
      visitedMaps: visitedMapIds,
      safariTicket,
    };
  }
}
