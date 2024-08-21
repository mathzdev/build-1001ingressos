import axios from 'axios';
import sharp from 'sharp';

export async function convertImageToBase64(imageUrl: string) {
    const { data: imageData } = await axios<Buffer>({
        url: imageUrl,
        responseType: 'arraybuffer',
    });

    const imageBuffer = await sharp(imageData).png().toBuffer();
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}
