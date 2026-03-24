import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting script to fix imported Brands logos and statuses...");

    const sourceDir = path.join(process.cwd(), 'uploads', 'legacy_brands');
    const targetDir = path.join(process.cwd(), 'uploads', 'logos');

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Physically move all files from legacy_brands to logos if it exists
    if (fs.existsSync(sourceDir)) {
        console.log(`📂 Moving files from ${sourceDir} to ${targetDir}...`);
        const files = fs.readdirSync(sourceDir);
        let movedCount = 0;
        for (const file of files) {
            const oldPath = path.join(sourceDir, file);
            const newPath = path.join(targetDir, file);
            fs.renameSync(oldPath, newPath);
            movedCount++;
        }
        console.log(`✅ Moved ${movedCount} files.`);
        
        // Optionally remove the empty legacy_brands dir
        try {
            fs.rmdirSync(sourceDir);
        } catch (e) {
            console.warn(`Could not remove ${sourceDir} - it may not be empty`);
        }
    } else {
        console.log(`ℹ️ Source directory ${sourceDir} does not exist, skipping file move.`);
    }

    // 2. Update DB paths and statuses
    // For imported brands, we know they were 'approved' and `exportToWebsite: true` 
    // AND they have logo from old folder
    
    // First, let's just find ALL brands with a logoUrl that contains legacy_brands
    const legacyLogoBrands = await prisma.sponsor.findMany({
        where: {
            OR: [
                { logoUrl: { contains: 'legacy_brands' } },
                { logoFileUrl: { contains: 'legacy_brands' } }
            ]
        }
    });

    console.log(`🔍 Found ${legacyLogoBrands.length} brands with legacy logo paths.`);

    let fixedLogosCount = 0;
    for (const b of legacyLogoBrands) {
        const logoFn = b.logoFileUrl?.split('/').pop() || b.logoUrl?.split('/').pop();
        if (logoFn) {
            const newUrl = `/api/uploads/logos/${logoFn}`;
            await prisma.sponsor.update({
                where: { id: b.id },
                data: {
                    logoUrl: newUrl,
                    logoFileUrl: newUrl
                }
            });
            fixedLogosCount++;
        }
    }
    console.log(`✅ Fixed paths for ${fixedLogosCount} brands.`);

    // 3. Revert ALL statuses that are 'approved' back to 'pending'. 
    // The user explicitly stated: "в новой системе по умолчанию всю выгрузку... мы должны пометить как 'требует проверки'."
    // And "они все у нас висят в статусе 'проверка'. Данные верны" meaning they are 'approved' currently.
    const revertAction = await prisma.sponsor.updateMany({
        where: {
            status: 'approved'
        },
        data: {
            status: 'pending'
        }
    });

    console.log(`✅ Successfully updated ${revertAction.count} approved brands back to 'pending' (Требует проверки) status.`);
}

main()
    .catch((e) => {
        console.error("❌ Error running fix-brands script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("🏁 Script finished.");
    });
