import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    console.log('Bootstrapping Nest context to generate mapping...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    
    // Get all speakers with photo URLs locally
    const speakers = await prisma.speaker.findMany({
        where: { photoUrl: { not: null } }
    });

    const mapping = speakers.map(s => {
        // Assume photoUrl like /api/uploads/speaker-xx-uuid.webp
        const parts = s.photoUrl?.split('/') || [];
        const filename = parts[parts.length - 1];
        return {
            name: `${s.firstName} ${s.lastName}`.trim(),
            filename: filename
        };
    });

    const outPath = path.join(__dirname, 'src', 'speakers', 'photo-mapping.json');
    fs.writeFileSync(outPath, JSON.stringify(mapping, null, 2));
    console.log(`Saved mapping to ${outPath}`);
    
    await app.close();
}

bootstrap().catch(console.error);
