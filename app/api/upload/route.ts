import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { buildUploadFileName, ensureProfileNumber } from '@/lib/profile';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user?.id) {
          throw new Error('Unauthorized');
        }

        const profileNumber = await ensureProfileNumber(session.user.id);
        const fileName = buildUploadFileName(pathname.split('/').pop() || 'upload', profileNumber, clientPayload === 'resume' ? 'resume' : 'avatar');

        return {
          pathname: fileName,
          allowedContentTypes: [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'application/pdf', 
            'text/plain', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            payload: clientPayload,
            profileNumber,
            fileName,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { userId, payload, profileNumber } = tokenPayload ? JSON.parse(tokenPayload) : { userId: null, payload: null, profileNumber: null };
          
          if (!userId) throw new Error('No user id in token');

          if (payload === 'resume') {
            await db.seekerProfile.upsert({
              where: { userId },
              update: { resumeUrl: blob.url },
              create: { userId, resumeUrl: blob.url, targetRoles: [], skills: [] }
            });
          } else if (payload === 'avatar') {
            await db.user.update({
              where: { id: userId },
              data: { image: blob.url },
            });
          }

        } catch (error) {
          import('@/lib/logger').then(({ logger }) => {
            logger.error({ msg: 'Webhook processing error', error });
          });
          throw new Error('Could not update user database');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: 'Vercel Blob Upload Error', error });
    });
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
