import bcrypt from "bcryptjs";
import { ADMIN_SECTION_KEYS, BCRYPT_ROUNDS, ROLES } from "../../lib/constants/auth";
import type { SeedDb } from "./db";

export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@rooq.local";
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

/**
 * Section permissions, the protected superadmin/admin/user roles and the
 * first staff account. The password is only set when the account is created —
 * reruns never overwrite a changed password.
 */
export async function seedAuth(db: SeedDb) {
  const permissions = await Promise.all(
    ADMIN_SECTION_KEYS.map((name) => db.permission.upsert({ where: { name }, update: {}, create: { name } })),
  );
  const all = permissions.map(({ id }) => ({ id }));

  const [superadmin, admin] = await Promise.all([
    db.role.upsert({
      where: { name: ROLES.superadmin },
      update: { isSystem: true, permissions: { set: all } },
      create: { name: ROLES.superadmin, description: "Full access", isSystem: true, permissions: { connect: all } },
    }),
    db.role.upsert({
      where: { name: ROLES.admin },
      update: { isSystem: true },
      create: { name: ROLES.admin, description: "Store staff", isSystem: true, permissions: { connect: all } },
    }),
    db.role.upsert({
      where: { name: ROLES.customer },
      update: { isSystem: true },
      create: { name: ROLES.customer, description: "Shopper account", isSystem: true },
    }),
  ]);

  const user = await db.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: { roleId: superadmin.id, isActive: true },
    create: {
      name: "Rooq Admin",
      email: SEED_ADMIN_EMAIL,
      password: await bcrypt.hash(SEED_ADMIN_PASSWORD, BCRYPT_ROUNDS),
      emailVerifiedAt: new Date(),
      roleId: superadmin.id,
    },
    select: { id: true, email: true },
  });

  return { adminRoleId: admin.id, superadminRoleId: superadmin.id, admin: user };
}
