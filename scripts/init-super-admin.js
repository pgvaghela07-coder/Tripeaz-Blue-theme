import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../src/app/models/admin.js";
import Role from "../src/app/models/role.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables from .env.local or .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function loadEnv() {
  try {
    const envFiles = [".env.local", ".env"];
    for (const envFile of envFiles) {
      const envPath = join(rootDir, envFile);
      try {
        const envContent = readFileSync(envPath, "utf-8");
        envContent.split("\n").forEach((line) => {
          const match = line.match(/^([^=:#]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        });
        break;
      } catch (e) {
        // File doesn't exist, continue
      }
    }
  } catch (error) {
    console.error("Error loading .env file:", error);
  }
}

loadEnv();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL not found in environment variables");
  process.exit(1);
}

async function initSuperAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Create roles if they don't exist
    console.log("📝 Creating roles...");
    const roles = [
      {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full access to all features",
        permissions: {
          isSuperAdmin: true,
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: true,
          canPublishBlog: true,
          canViewUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: true,
          canAssignRole: true,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: true,
          canViewBookings: true,
          canManageBookings: true,
          canManageSettings: true,
          canViewAuditLogs: true,
        },
      },
      {
        name: "Admin",
        slug: "admin",
        description: "Administrative access",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: true,
          canPublishBlog: true,
          canViewUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: true,
          canViewBookings: true,
          canManageBookings: true,
          canManageSettings: false,
          canViewAuditLogs: true,
        },
      },
      {
        name: "Editor",
        slug: "editor",
        description: "Content editing access - can create, edit, publish blogs and manage content",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: false,
          canPublishBlog: true,
          canViewUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: true,
          canManageTags: true,
          canManageMedia: true,
          canManageRoutes: true,
          canManageCities: true,
          canManageAirports: true,
          canManageSEO: false,
          canViewBookings: true,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
      {
        name: "Author",
        slug: "author",
        description: "Basic content creation - can create and edit own content only",
        permissions: {
          canViewBlog: true,
          canCreateBlog: true,
          canEditBlog: true,
          canDeleteBlog: false,
          canPublishBlog: false,
          canViewUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: false,
          canManageTags: false,
          canManageMedia: true,
          canManageRoutes: false,
          canManageCities: false,
          canManageAirports: false,
          canManageSEO: false,
          canViewBookings: false,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
      {
        name: "Viewer",
        slug: "viewer",
        description: "Read-only access - can only view content, no editing permissions",
        permissions: {
          canViewBlog: true,
          canCreateBlog: false,
          canEditBlog: false,
          canDeleteBlog: false,
          canPublishBlog: false,
          canViewUsers: true,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canAssignRole: false,
          canManageCategories: false,
          canManageTags: false,
          canManageMedia: false,
          canManageRoutes: false,
          canManageCities: false,
          canManageAirports: false,
          canManageSEO: false,
          canViewBookings: true,
          canManageBookings: false,
          canManageSettings: false,
          canViewAuditLogs: false,
        },
      },
    ];

    for (const roleData of roles) {
      // First check if role exists by slug or name
      let role = await Role.findOne({ 
        $or: [
          { slug: roleData.slug },
          { name: roleData.name }
        ]
      });
      
      if (role) {
        // Update existing role
        role.name = roleData.name;
        role.slug = roleData.slug;
        role.description = roleData.description;
        role.permissions = roleData.permissions;
        role.isActive = true;
        await role.save();
        console.log(`  ✓ Role "${role.name}" updated`);
      } else {
        // Create new role
        try {
          role = await Role.create(roleData);
          console.log(`  ✓ Role "${role.name}" created`);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error - role exists with different field
            console.log(`  ⚠️  Role "${roleData.name}" already exists, skipping...`);
            role = await Role.findOne({ name: roleData.name });
          } else {
            throw error;
          }
        }
      }
    }

    // Get super admin role
    const superAdminRole = await Role.findOne({ slug: "super_admin" });

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ roleSlug: "super_admin" });

    if (existingSuperAdmin) {
      console.log("\n⚠️  Super admin already exists:");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   User Name: ${existingSuperAdmin.userName}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create super admin
    const userName = "Super Admin";
    const email = "admin@gujarattaxi.com";
    const password = "Admin@123";

    console.log("\n👤 Creating super admin...");
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await Admin.create({
      userName,
      email,
      password: hashedPassword,
      role: superAdminRole._id,
      roleSlug: "super_admin",
    });

    console.log("\n✅ Super admin created successfully!");
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   User Name: ${superAdmin.userName}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  Please change the password after first login!");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

initSuperAdmin();

